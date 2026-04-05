import { getAddress, parseSignature } from 'viem';

// EIP-712 typed data for EIP-3009 TransferWithAuthorization
const AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

// Minimal ABI — two overloads of transferWithAuthorization (v/r/s + bytes)
const EIP3009_ABI = [
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

/**
 * Off-chain EIP-3009 verification (pure checks — no RPC simulation).
 *
 * Validates:
 *   1. Timing windows (validAfter / validBefore)
 *   2. Recipient matches paymentRequirements.payTo
 *   3. Amount matches paymentRequirements.amount
 *   4. EIP-712 signature over TransferWithAuthorization
 *
 * @param {object} clients      - Map of network → { publicClient }
 * @param {object} payload      - Full x402 paymentPayload
 * @param {object} requirements - paymentRequirements from the resource server
 * @returns {Promise<{isValid: boolean, invalidReason?: string, payer: string}>}
 */
export async function verifyEip3009(clients, payload, requirements) {
  // x402 v2: network is in payload.accepted.network (not a top-level field)
  const network = payload.accepted?.network ?? payload.network;
  const { payload: inner } = payload;
  const { signature, authorization } = inner;
  const payer = authorization.from;

  console.log('[verify] network=%s payer=%s amount=%s payTo=%s', network, payer, authorization.value, authorization.to);
  console.log('[verify] requirements | asset=%s amount=%s payTo=%s extra=%j', requirements.asset, requirements.amount, requirements.payTo, requirements.extra);
  console.log('[verify] accepted.extra=%j', payload.accepted?.extra);

  const client = clients[network];
  if (!client) {
    return { isValid: false, invalidReason: 'UnsupportedNetwork', payer };
  }

  // ── Timing ────────────────────────────────────────────────────────────────
  const now = Math.floor(Date.now() / 1000);
  if (BigInt(authorization.validBefore) < BigInt(now + 6)) {
    return { isValid: false, invalidReason: 'ErrValidBeforeExpired', payer };
  }
  if (BigInt(authorization.validAfter) > BigInt(now)) {
    return { isValid: false, invalidReason: 'ErrValidAfterInFuture', payer };
  }

  // ── Recipient ─────────────────────────────────────────────────────────────
  if (getAddress(authorization.to) !== getAddress(requirements.payTo)) {
    return { isValid: false, invalidReason: 'ErrRecipientMismatch', payer };
  }

  // ── Amount ────────────────────────────────────────────────────────────────
  if (BigInt(authorization.value) !== BigInt(requirements.amount)) {
    return { isValid: false, invalidReason: 'ErrInvalidAuthorizationValue', payer };
  }

  // ── EIP-712 signature ─────────────────────────────────────────────────────
  const extra = requirements.extra ?? payload.accepted?.extra ?? {};
  if (!extra.name || !extra.version) {
    return { isValid: false, invalidReason: 'ErrMissingEip712Domain', payer };
  }

  const domain = {
    name: extra.name,
    version: extra.version,
    chainId: parseInt(network.split(':')[1], 10),
    verifyingContract: getAddress(requirements.asset),
  };

  const message = {
    from: getAddress(authorization.from),
    to: getAddress(authorization.to),
    value: BigInt(authorization.value),
    validAfter: BigInt(authorization.validAfter),
    validBefore: BigInt(authorization.validBefore),
    nonce: authorization.nonce,
  };

  try {
    const isValid = await client.publicClient.verifyTypedData({
      address: getAddress(authorization.from),
      domain,
      types: AUTHORIZATION_TYPES,
      primaryType: 'TransferWithAuthorization',
      message,
      signature: /** @type {`0x${string}`} */ (signature),
    });

    if (!isValid) {
      console.warn('[verify] ErrInvalidSignature | domain=%j', domain);
      return { isValid: false, invalidReason: 'ErrInvalidSignature', payer };
    }
  } catch (err) {
    console.error('[verify] verifyTypedData threw | domain=%j error=%s', domain, err.message);
    return { isValid: false, invalidReason: 'ErrInvalidSignature', payer };
  }

  return { isValid: true, payer };
}

/**
 * Settles an EIP-3009 payment by executing transferWithAuthorization on-chain.
 *
 * @param {object} clients      - Map of network → { publicClient, walletClient }
 * @param {object} payload      - Full x402 paymentPayload
 * @param {object} requirements - paymentRequirements from the resource server
 * @returns {Promise<{success: boolean, transaction: string, network: string, payer: string, errorReason?: string}>}
 */
export async function settleEip3009(clients, payload, requirements) {
  const network = payload.accepted?.network ?? payload.network;
  const { payload: inner } = payload;
  const { signature, authorization } = inner;
  const payer = authorization.from;

  const client = clients[network];
  if (!client?.walletClient) {
    return {
      success: false,
      transaction: '',
      network,
      payer,
      errorReason: 'SettlementSignerNotConfigured',
    };
  }

  // Lightweight re-verify before spending gas
  const verified = await verifyEip3009(clients, payload, requirements);
  if (!verified.isValid) {
    return { success: false, transaction: '', network, payer, errorReason: verified.invalidReason };
  }

  try {
    const assetAddress = getAddress(requirements.asset);
    const baseArgs = [
      getAddress(authorization.from),
      getAddress(authorization.to),
      BigInt(authorization.value),
      BigInt(authorization.validAfter),
      BigInt(authorization.validBefore),
      /** @type {`0x${string}`} */ (authorization.nonce),
    ];

    // ECDSA signatures are exactly 65 bytes (130 hex chars + "0x" prefix = 132)
    const isECDSA = signature.length === 132;

    let txHash;
    if (isECDSA) {
      const { v, r, s } = parseSignature(/** @type {`0x${string}`} */ (signature));
      txHash = await client.walletClient.writeContract({
        address: assetAddress,
        abi: EIP3009_ABI,
        functionName: 'transferWithAuthorization',
        args: [...baseArgs, v ?? 27n, r, s],
      });
    } else {
      txHash = await client.walletClient.writeContract({
        address: assetAddress,
        abi: EIP3009_ABI,
        functionName: 'transferWithAuthorization',
        args: [...baseArgs, /** @type {`0x${string}`} */ (signature)],
      });
    }

    const receipt = await client.publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status !== 'success') {
      return { success: false, transaction: txHash, network, payer, errorReason: 'ErrTransactionFailed' };
    }

    return { success: true, transaction: txHash, network, payer };
  } catch (err) {
    return {
      success: false,
      transaction: '',
      network,
      payer,
      errorReason: err instanceof Error ? err.message : 'ErrTransactionFailed',
    };
  }
}
