import { useAccount, useBalance, useChainId } from 'wagmi';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet } from 'lucide-react';
import { USDC_ADDRESSES } from '@/lib/constants';
import { CustomConnectButton } from '@/components/CustomConnectButton';

export function WalletStatus() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const usdcAddress = USDC_ADDRESSES[chainId];

  const { data: nativeBal, isLoading: nativeLoading, refetch: refetchNative } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });
  const { data: usdcBal, isLoading: usdcLoading, isError: usdcError, refetch: refetchUsdc } = useBalance({
    address,
    token: usdcAddress,
    query: { enabled: Boolean(address) && !!usdcAddress },
  });

  useEffect(() => {
    const handler = () => {
      // Settlement tx needs to be mined before the balance reflects on-chain.
      // Retry at 3s and 8s to catch both fast and slow blocks.
      setTimeout(() => { refetchNative(); refetchUsdc(); }, 3000);
      setTimeout(() => { refetchNative(); refetchUsdc(); }, 8000);
    };
    window.addEventListener('x402:payment-success', handler);
    return () => window.removeEventListener('x402:payment-success', handler);
  }, [refetchNative, refetchUsdc]);

  if (isConnected) {
    return (
      <Alert variant="success" className="text-xs">
        <Wallet className="h-3.5 w-3.5" />
        <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            Carteira:{' '}
            <span className="font-mono font-bold">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
          </span>
          <span className="text-muted-foreground">
            {nativeLoading ? '…' : nativeBal
              ? `${parseFloat(nativeBal.formatted).toFixed(4)} ${nativeBal.symbol}`
              : '—'}
          </span>
          {usdcAddress && (
            <span className="font-semibold text-green-700 dark:text-green-400">
              {usdcLoading
                ? '… USDC'
                : usdcError
                  ? '? USDC'
                  : `${parseFloat(usdcBal?.formatted ?? '0').toFixed(2)} USDC`}
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="warning">
      <Wallet className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span>Conecte sua carteira para pagar as consultas via x402 (USDC).</span>
        <CustomConnectButton />
      </AlertDescription>
    </Alert>
  );
}
