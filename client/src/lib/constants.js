// Base API URL — empty string uses Vite's /api proxy (recommended for dev)
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const ENDPOINTS = {
  interpretar: `${API_BASE}/interpretar`,
  sonho: `${API_BASE}/sonho`,
  palpite: `${API_BASE}/palpite`,
  numerologia: `${API_BASE}/numerologia`,
  tabela: `${API_BASE}/tabela/animais`,
  health: `${API_BASE}/health`,
};

// x402 prices (mirror server config — used for UX labels only)
export const PRICES = {
  interpretar: '$0.10',
  sonho: '$0.10',
  palpite: '$0.25',
  numerologia: '$0.10',
};

export const NETWORK = import.meta.env.VITE_X402_NETWORK ?? 'eip155:84532';

export const NETWORK_LABELS = {
  'eip155:84532': 'Base Sepolia (testnet)',
  'eip155:8453': 'Base (mainnet)',
  'eip155:137': 'Polygon (mainnet)',
  'eip155:80002': 'Polygon Amoy (testnet)',
};

// USDC contract addresses keyed by wagmi chainId
export const USDC_ADDRESSES = {
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  8453:  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base mainnet
  137:   '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon mainnet
  80002: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Polygon Amoy
};

// EIP-3009 typed data — matches what the server's x402 middleware expects
export const TRANSFER_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};
