import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBalance, useChainId } from 'wagmi';
import { USDC_ADDRESSES } from '@/lib/constants';

/**
 * RainbowKit ConnectButton extended to show USDC balance alongside native token.
 * Replaces the default ConnectButton in the header.
 */
export function CustomConnectButton() {
  const chainId = useChainId();
  const usdcAddress = USDC_ADDRESSES[chainId];

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
            className="flex items-center gap-2"
          >
            {connected ? (
              <>
                {/* Chain picker */}
                <button
                  onClick={openChainModal}
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary/80"
                >
                  {chain.hasIcon && (
                    <div
                      style={{ background: chain.iconBackground }}
                      className="h-4 w-4 overflow-hidden rounded-full"
                    >
                      {chain.iconUrl && (
                        <img
                          src={chain.iconUrl}
                          alt={chain.name}
                          className="h-4 w-4"
                        />
                      )}
                    </div>
                  )}
                  {chain.unsupported ? '⚠️ Rede inválida' : chain.name}
                </button>

                {/* Account + balances button */}
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary/80"
                >
                  <UsdcBalance address={account.address} usdcAddress={usdcAddress} />
                  <span className="text-muted-foreground">|</span>
                  <span>{account.displayBalance ?? '…'}</span>
                  <span className="font-mono">{account.displayName}</span>
                </button>
              </>
            ) : (
              <button
                onClick={openConnectModal}
                type="button"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Conectar carteira
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

/** Inner component so hooks run unconditionally */
function UsdcBalance({ address, usdcAddress }) {
  const { data, isLoading } = useBalance({
    address,
    token: usdcAddress,
    query: { enabled: Boolean(address) && !!usdcAddress },
  });

  if (!usdcAddress) return null;

  const label = isLoading
    ? '… USDC'
    : `${parseFloat(data?.formatted ?? '0').toFixed(2)} USDC`;

  return (
    <span className="font-semibold text-green-600 dark:text-green-400">{label}</span>
  );
}
