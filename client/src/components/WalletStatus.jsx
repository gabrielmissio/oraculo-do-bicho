import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet } from 'lucide-react';

export function WalletStatus() {
  const { isConnected, address } = useAccount();

  if (isConnected) {
    return (
      <Alert variant="success" className="text-xs">
        <Wallet className="h-3.5 w-3.5" />
        <AlertDescription>
          Carteira conectada:{' '}
          <span className="font-mono font-bold">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
          {' '}— pronto para pagar via x402
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="warning">
      <Wallet className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span>Conecte sua carteira para pagar as consultas via x402 (USDC).</span>
        <ConnectButton />
      </AlertDescription>
    </Alert>
  );
}
