import { Coins, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NETWORK_LABELS, NETWORK } from '@/lib/constants';

export function PaymentBadge({ price, className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="gold" className="gap-1">
        <Coins className="h-3 w-3" />
        {price} USDC
      </Badge>
      <Badge variant="mystic" className="gap-1 text-[10px]">
        <Wifi className="h-2.5 w-2.5" />
        {NETWORK_LABELS[NETWORK] ?? NETWORK}
      </Badge>
    </div>
  );
}
