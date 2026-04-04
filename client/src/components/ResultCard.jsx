import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles, TrendingUp, Clock, Zap } from 'lucide-react';

const CONFIDENCE_CONFIG = {
  alta: { label: '🌕 Alta', class: 'success' },
  media: { label: '🌗 Média', class: 'gold' },
  baixa: { label: '🌑 Baixa', class: 'outline' },
};

const SOURCE_LABEL = {
  llm: '🤖 IA',
  emergencia: '⚡ Emergência',
  emergencia_parse: '⚡ Emergência',
  emergencia_validacao: '⚡ Emergência',
};

export function ResultCard({ data }) {
  if (!data) return null;

  const { interpretacao, sugestoes_aposta, mensagem_orientadora, metadata } = data;
  const conf = CONFIDENCE_CONFIG[interpretacao.confianca] ?? CONFIDENCE_CONFIG.baixa;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Animal hero */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-mystic-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {interpretacao.tipo}
              </p>
              <CardTitle className="text-3xl font-bold text-primary">
                {interpretacao.animal}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-0.5">Grupo {interpretacao.grupo}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={conf.class}>{conf.label}</Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Zap className="h-3 w-3" />
                {SOURCE_LABEL[metadata?.fonte_interpretacao] ?? 'IA'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Dezenas */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Dezenas</p>
            <div className="flex gap-2 flex-wrap">
              {interpretacao.dezenas.map((d) => (
                <span
                  key={d}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary font-bold text-sm"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Justificativa */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Interpretação
            </p>
            <p className="text-sm leading-relaxed">{interpretacao.justificativa}</p>
          </div>

          {interpretacao.curiosidade && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
              {interpretacao.curiosidade}
            </p>
          )}

          {/* Alternativas */}
          {interpretacao.variacoes && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Alternativas:</span>
              {Object.values(interpretacao.variacoes).map((v) => (
                <Badge key={v} variant="secondary" className="text-xs">
                  {v}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sugestões de aposta */}
      {sugestoes_aposta && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Sugestões de aposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Grupo', ...sugestoes_aposta.grupo },
                { label: 'Dezena', ...sugestoes_aposta.dezena },
                { label: 'Milhar', ...sugestoes_aposta.milhar_sugerida },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-lg font-bold text-primary">{s.valor}</p>
                  <p className="text-xs text-green-400 mt-0.5">{s.multiplicador}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem orientadora */}
      {mensagem_orientadora && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-center">
          {mensagem_orientadora}
        </div>
      )}

      {/* Metadata footer */}
      {metadata && (
        <div className="flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metadata.tempo_processamento_ms}ms
          </span>
          <span>{new Date(metadata.timestamp).toLocaleTimeString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
}
