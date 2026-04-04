import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { WalletStatus } from '@/components/WalletStatus';
import { useX402Fetch } from '@/hooks/useX402Fetch';
import { ENDPOINTS, PRICES } from '@/lib/constants';
import { Moon, AlertCircle, Sparkles } from 'lucide-react';

export default function Sonho() {
  const [sonho, setSonho] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchWithPayment, isReady } = useX402Fetch();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!sonho.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchWithPayment(ENDPOINTS.sonho, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sonho: sonho.trim(), detalhes: detalhes.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Erro ${res.status}`);
      }

      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="h-7 w-7 text-blue-400" /> Interpretação de Sonhos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Descreva seu sonho e receba uma interpretação onírica mística vinculada ao jogo do bicho.
        </p>
      </div>

      <WalletStatus />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sonho">Descreva seu sonho</Label>
          <Textarea
            id="sonho"
            rows={4}
            placeholder="ex: sonhei que estava num campo aberto e um leão enorme me olhava fixamente…"
            value={sonho}
            onChange={(e) => setSonho(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="detalhes">Detalhes adicionais (opcional)</Label>
          <Input
            id="detalhes"
            placeholder="ex: era de noite, havia uma lua cheia, eu sentia paz…"
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <PaymentBadge price={PRICES.sonho} />
          <Button
            type="submit"
            size="lg"
            variant="gold"
            disabled={!isReady || !sonho.trim() || loading}
            className="min-w-40"
          >
            {loading ? <>Interpretando…</> : <><Moon className="h-4 w-4" /> Interpretar Sonho</>}
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <Skeleton className="h-64 w-full rounded-xl" />}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Símbolo Principal</p>
                  <p className="text-3xl font-bold text-primary">{result.interpretacao_onirica.simbolo_principal}</p>
                </div>
                <Badge variant="outline">{result.interpretacao_onirica.forca_do_sinal}</Badge>
              </div>

              <div>
                <p className="text-sm leading-relaxed">{result.interpretacao_onirica.significado}</p>
              </div>

              <div className="rounded-lg bg-blue-950/30 border border-blue-500/20 px-4 py-3 text-sm">
                🎯 <strong>Ação:</strong> {result.interpretacao_onirica.acao_recomendada}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-center italic">
            {result.mensagem_espiritual}
          </div>
        </div>
      )}
    </div>
  );
}
