import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { WalletStatus } from '@/components/WalletStatus';
import { PalpiteCard } from '@/components/PalpiteCard';
import { useX402Fetch } from '@/hooks/useX402Fetch';
import { ENDPOINTS, PRICES } from '@/lib/constants';
import { Zap, AlertCircle } from 'lucide-react';

export default function Palpite() {
  const [contexto, setContexto] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchWithPayment, isReady } = useX402Fetch();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchWithPayment(ENDPOINTS.palpite, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contexto: contexto.trim() || undefined, data }),
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
          <Zap className="h-7 w-7 text-amber-400" /> Palpites do Dia
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gera 3 palpites simultâneos: por contexto, por data e pela energia cósmica do momento. Custa {PRICES.palpite} USDC.
        </p>
      </div>

      <WalletStatus />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="contexto">Contexto (opcional)</Label>
          <Input
            id="contexto"
            placeholder="ex: hoje é meu aniversário, semana de prova…"
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="data">Data de referência</Label>
          <Input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <PaymentBadge price={PRICES.palpite} />
          <Button
            type="submit"
            size="lg"
            variant="gold"
            disabled={!isReady || loading}
            className="min-w-44"
          >
            {loading ? <>Gerando palpites…</> : <><Zap className="h-4 w-4" /> Gerar 3 Palpites</>}
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Principal highlight */}
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Destaque do Dia</p>
              <p className="text-2xl font-bold text-primary">{result.palpite_principal.mensagem}</p>
            </CardContent>
          </Card>

          {/* All 3 palpites */}
          <div className="grid gap-3">
            {result.palpites_do_dia.map((p) => (
              <PalpiteCard
                key={p.id}
                palpite={p}
                isHighlight={p.id === 1}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Data: {result.data}</span>
            <Badge variant="outline">{result.contexto_usado}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
