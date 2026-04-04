// Base API URL — empty string uses Vite's /api proxy (recommended for dev)
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const ENDPOINTS = {
  interpretar: `${API_BASE}/api/interpretar`,
  sonho: `${API_BASE}/api/sonho`,
  palpite: `${API_BASE}/api/palpite`,
  numerologia: `${API_BASE}/api/numerologia`,
  tabela: `${API_BASE}/api/tabela/animais`,
  health: `${API_BASE}/api/health`,
};

// x402 prices (mirror server config — used for UX labels only)
export const PRICES = {
  interpretar: '$0.01',
  sonho: '$0.01',
  palpite: '$0.02',
  numerologia: '$0.01',
};

export const NETWORK = import.meta.env.VITE_X402_NETWORK ?? 'eip155:84532';

export const NETWORK_LABELS = {
  'eip155:84532': 'Base Sepolia (testnet)',
  'eip155:8453': 'Base (mainnet)',
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
