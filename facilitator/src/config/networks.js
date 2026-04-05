import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import env from './env.js';

/**
 * Builds a minimal viem chain descriptor from a numeric chain ID and RPC URL.
 * We don't need the full named-chain objects — viem only needs id + rpcUrls.
 */
function makeChain(chainId, rpcUrl) {
  return {
    id: chainId,
    name: `eip155-${chainId}`,
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  };
}

const account = (() => {
  if (!env.PRIVATE_KEY) return null;
  try {
    const key = env.PRIVATE_KEY.startsWith('0x') ? env.PRIVATE_KEY : `0x${env.PRIVATE_KEY}`;
    return privateKeyToAccount(/** @type {`0x${string}`} */ (key));
  } catch {
    console.warn('⚠️  PRIVATE_KEY is invalid — /settle endpoint will be unavailable');
    return null;
  }
})();

/**
 * Map of network string → { publicClient, walletClient | null }
 * Built dynamically from configured RPC_* env vars.
 */
const clients = {};

for (const [network, rpcUrl] of Object.entries(env.networks)) {
  const chainId = parseInt(network.split(':')[1], 10);
  const chain = makeChain(chainId, rpcUrl);

  clients[network] = {
    publicClient: createPublicClient({ chain, transport: http(rpcUrl) }),
    walletClient: account
      ? createWalletClient({ account, chain, transport: http(rpcUrl) })
      : null,
  };
}

/** Facilitator's own address, used in /supported signers field */
export const FACILITATOR_ADDRESS = account?.address ?? null;

export default clients;
