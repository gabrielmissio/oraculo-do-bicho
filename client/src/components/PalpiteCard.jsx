import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const FORCA = {
  alta: { label: '🌕 Alta', class: 'success' },
  media: { label: '🌗 Média', class: 'gold' },
  baixa: { label: '🌑 Baixa', class: 'outline' },
};

export function PalpiteCard({ palpite, isHighlight }) {
  const forca = FORCA[palpite.forca] ?? FORCA.baixa;

  return (
    <Card className={isHighlight ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isHighlight && <span className="text-lg">🎯</span>}
            <div>
              <p className="font-bold text-lg text-primary">{palpite.animal}</p>
              <p className="text-xs text-muted-foreground">Grupo {palpite.grupo}</p>
            </div>
          </div>
          <Badge variant={forca.class}>{forca.label}</Badge>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {palpite.dezenas.map((d) => (
            <span
              key={d}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold"
            >
              {String(d).padStart(2, '0')}
            </span>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{palpite.justificativa}</p>
      </CardContent>
    </Card>
  );
}
