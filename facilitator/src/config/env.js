/**
 * Facilitator config
 *
 * Supported networks are discovered dynamically: any env var matching
 * RPC_<chainId> (e.g. RPC_8453, RPC_84532) registers that network.
 *
 * PRIVATE_KEY is the settlement signer — required for /settle.
 * If omitted, /verify still works but /settle returns 501.
 */

function parseNetworks() {
  const networks = {};
  for (const [key, value] of Object.entries(process.env)) {
    const match = key.match(/^RPC_(\d+)$/);
    if (match && value) {
      networks[`eip155:${match[1]}`] = value;
    }
  }
  return networks;
}

const env = {
  PORT: process.env.PORT || 3002,
  PRIVATE_KEY: process.env.PRIVATE_KEY || null,
  // Map of network → rpcUrl, populated from RPC_<chainId> env vars
  networks: parseNetworks(),
};

if (Object.keys(env.networks).length === 0) {
  console.warn(
    '⚠️  No RPC endpoints configured — set RPC_<chainId> env vars (e.g. RPC_8453=https://mainnet.base.org)',
  );
}

if (!env.PRIVATE_KEY) {
  console.warn('⚠️  PRIVATE_KEY not set — /settle endpoint will be unavailable');
}

export default env;
