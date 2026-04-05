import { useCallback } from 'react';
import { useAccount, useChainId, useSignTypedData, useSwitchChain } from 'wagmi';
import { TRANSFER_AUTHORIZATION_TYPES } from '@/lib/constants';

/**
 * useX402Fetch
 *
 * Implements the x402 v2 payment protocol for browser clients.
 *
 * Flow:
 *   1. Make the request normally.
 *   2. If the server responds 402, decode the PAYMENT-REQUIRED header.
 *   3. Build + sign an EIP-3009 TransferWithAuthorization via the connected wallet.
 *   4. Encode the PaymentPayload and retry the request with PAYMENT-SIGNATURE.
 *   5. Return the 200 response transparently.
 *
 * No @x402/fetch or @x402/evm client packages needed — this is vanilla wagmi + fetch.
 */
export function useX402Fetch() {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const { switchChainAsync } = useSwitchChain();

  const fetchWithPayment = useCallback(
    async (url, options = {}) => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected. Please connect your wallet to continue.');
      }

      // ── Step 1: initial request (no payment header) ──────────────────────
      const firstResponse = await fetch(url, options);
      if (firstResponse.status !== 402) return firstResponse;

      // ── Step 2: decode PAYMENT-REQUIRED ──────────────────────────────────
      const encoded = firstResponse.headers.get('PAYMENT-REQUIRED');
      if (!encoded) throw new Error('Server returned 402 without a PAYMENT-REQUIRED header.');

      let paymentRequired;
      try {
        paymentRequired = JSON.parse(atob(encoded));
      } catch {
        throw new Error('Malformed PAYMENT-REQUIRED header (base64/JSON error).');
      }

      console.debug('[x402] 402 received | resource:', paymentRequired.resource);
      console.debug('[x402] accepts:', JSON.stringify(paymentRequired.accepts?.map(a => ({ network: a.network, amount: a.amount, asset: a.asset }))));
      console.debug('[x402] wallet chain:', currentChainId);

      // ── Step 3: pick accepted option — prefer current wallet chain ────────
      const allOptions = paymentRequired.accepts?.filter(
        (a) => a.scheme === 'exact' && a.network?.startsWith('eip155:'),
      ) ?? [];
      const accepted =
        allOptions.find((a) => parseInt(a.network.split(':')[1], 10) === currentChainId) ??
        allOptions[0];
      if (!accepted) throw new Error('No EVM-compatible payment option offered by server.');

      const chainId = parseInt(accepted.network.split(':')[1], 10);
      console.debug('[x402] picked network:', accepted.network, '| chainId:', chainId, '| matched current chain:', chainId === currentChainId);

      // ── Step 3b: switch wallet to the required chain if needed ────────────
      if (currentChainId !== chainId) {
        console.debug('[x402] switching chain from', currentChainId, 'to', chainId);
        try {
          await switchChainAsync({ chainId });
        } catch (err) {
          console.error('[x402] chain switch failed:', err.message);
          throw new Error(`Troque sua carteira para a rede correta (chain ID ${chainId}): ${err.message}`);
        }
      }

      const now = Math.floor(Date.now() / 1000);
      const validAfter = now - 1;
      const validBefore = now + (accepted.maxTimeoutSeconds ?? 60);

      // Random 32-byte nonce (EIP-3009 requires it to be unique per authorization)
      const nonceBytes = new Uint8Array(32);
      crypto.getRandomValues(nonceBytes);
      const nonce = ('0x' + Array.from(nonceBytes).map((b) => b.toString(16).padStart(2, '0')).join(''));

      // ── Step 4: sign EIP-3009 TransferWithAuthorization ──────────────────
      const domain = {
        name: accepted.extra?.name ?? 'USDC',
        version: accepted.extra?.version ?? '2',
        chainId,
        verifyingContract: accepted.asset,
      };

      const message = {
        from: address,
        to: accepted.payTo,
        value: BigInt(accepted.amount),
        validAfter: BigInt(validAfter),
        validBefore: BigInt(validBefore),
        nonce,
      };

      let signature;
      try {
        console.debug('[x402] signing | domain:', JSON.stringify(domain), '| value:', accepted.amount, '| to:', accepted.payTo);
        signature = await signTypedDataAsync({
          domain,
          types: TRANSFER_AUTHORIZATION_TYPES,
          primaryType: 'TransferWithAuthorization',
          message,
        });
        console.debug('[x402] signature ok, length:', signature.length);
      } catch (err) {
        console.error('[x402] signing failed:', err.message);
        throw new Error(`Payment signing rejected or failed: ${err.message}`);
      }

      // ── Step 5: build PaymentPayload v2 and encode ────────────────────────
      const paymentPayload = {
        x402Version: 2,
        resource: paymentRequired.resource,
        accepted,
        payload: {
          signature,
          authorization: {
            from: address,
            to: accepted.payTo,
            value: accepted.amount,
            validAfter: String(validAfter),
            validBefore: String(validBefore),
            nonce,
          },
        },
      };

      const paymentSignature = btoa(JSON.stringify(paymentPayload));

      // ── Step 6: retry with PAYMENT-SIGNATURE ─────────────────────────────
      console.debug('[x402] retrying with payment signature...');
      const finalResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'PAYMENT-SIGNATURE': paymentSignature,
        },
      });
      console.debug('[x402] final response status:', finalResponse.status);
      return finalResponse;
    },
    [address, isConnected, signTypedDataAsync, currentChainId, switchChainAsync],
  );

  return {
    fetchWithPayment: isConnected ? fetchWithPayment : null,
    isReady: isConnected,
    address,
  };
}
