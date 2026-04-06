import { Coins, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NETWORK_LABELS } from '@/lib/constants';
import { useServerInfo } from '@/hooks/useServerInfo';
import { useChainId } from 'wagmi';

export function PaymentBadge({ price, className }) {
  const { networks } = useServerInfo();
  const currentChainId = useChainId();

  // Prefer the network matching the connected wallet chain; fall back to first offered
  const currentNetwork = `eip155:${currentChainId}`;
  const activeNetwork = networks.includes(currentNetwork) ? currentNetwork : networks[0];
  const networkLabel = activeNetwork ? (NETWORK_LABELS[activeNetwork] ?? activeNetwork) : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="gold" className="gap-1">
        <Coins className="h-3 w-3" />
        {price} USDC
      </Badge>
      {networkLabel && (
        <Badge variant="mystic" className="gap-1 text-[10px]">
          <Wifi className="h-2.5 w-2.5" />
          {networkLabel}
        </Badge>
      )}
    </div>
  );
}
