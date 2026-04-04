import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentBadge } from '@/components/PaymentBadge';
import { WalletStatus } from '@/components/WalletStatus';
import { ResultCard } from '@/components/ResultCard';
import { useX402Fetch } from '@/hooks/useX402Fetch';
import { ENDPOINTS, PRICES } from '@/lib/constants';
import { Sparkles, AlertCircle } from 'lucide-react';

const MODALIDADES = [
  { value: 'auto', label: '✨ Automático (deixa a IA decidir)' },
  { value: 'sonho', label: '🌙 Sonho' },
  { value: 'numero', label: '🔢 Número' },
  { value: 'placa', label: '🚗 Placa' },
  { value: 'cor', label: '🎨 Cor' },
  { value: 'data', label: '📅 Data' },
  { value: 'generalizado', label: '🔮 Generalizado' },
];

export default function Interpretar() {
  const [input, setInput] = useState('');
  const [modalidade, setModalidade] = useState('auto');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchWithPayment, isReady } = useX402Fetch();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body = JSON.stringify({
        input: input.trim(),
        ...(modalidade !== 'auto' && { modalidade }),
      });

      const res = await fetchWithPayment(ENDPOINTS.interpretar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
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
          <span className="text-3xl">🔮</span> Interpretação Mística
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Envie qualquer sinal — sonho, número, cor, frase, placa. A IA encontra o animal.
        </p>
      </div>

      <WalletStatus />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="input">Seu sinal / input</Label>
          <Input
            id="input"
            placeholder="ex: sonhei que estava num rio com cobras…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Modalidade (opcional)</Label>
          <Select value={modalidade} onValueChange={setModalidade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODALIDADES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <PaymentBadge price={PRICES.interpretar} />
          <Button
            type="submit"
            size="lg"
            variant="gold"
            disabled={!isReady || !input.trim() || loading}
            className="min-w-40"
          >
            {loading ? (
              <>Consultando…</>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Consultar Oráculo
              </>
            )}
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
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      )}

      {result && <ResultCard data={result} />}
    </div>
  );
}
