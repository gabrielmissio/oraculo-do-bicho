import { Coins, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NETWORK_LABELS } from '@/lib/constants';
import { useServerInfo } from '@/hooks/useServerInfo';

export function PaymentBadge({ price, className }) {
  const { networks } = useServerInfo();

  // Show label for first network; fall back to the raw ID if unknown
  const networkLabel = networks.length > 0
    ? (NETWORK_LABELS[networks[0]] ?? networks[0])
    : null;

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
