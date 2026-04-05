import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, polygon, polygonAmoy } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Oráculo do Bicho',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  chains: [baseSepolia, base, polygon, polygonAmoy],
  ssr: false,
});
