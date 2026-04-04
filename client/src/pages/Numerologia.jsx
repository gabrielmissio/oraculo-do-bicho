import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PaymentBadge } from '@/components/PaymentBadge';
import { WalletStatus } from '@/components/WalletStatus';
import { useX402Fetch } from '@/hooks/useX402Fetch';
import { ENDPOINTS, PRICES } from '@/lib/constants';
import { Hash, Plus, X, AlertCircle, Sparkles } from 'lucide-react';

export default function Numerologia() {
  const [numeros, setNumeros] = useState([]);
  const [novoNumero, setNovoNumero] = useState('');
  const [nome, setNome] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchWithPayment, isReady } = useX402Fetch();

  function addNumero() {
    const n = parseInt(novoNumero);
    if (!isNaN(n) && n > 0) {
      setNumeros((prev) => [...prev, n]);
      setNovoNumero('');
    }
  }

  function removeNumero(idx) {
    setNumeros((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchWithPayment(ENDPOINTS.numerologia, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeros: numeros.length ? numeros : undefined,
          nome: nome.trim() || undefined,
        }),
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
          <Hash className="h-7 w-7 text-green-400" /> Numerologia
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Insira números e/ou um nome para uma análise numerológica mística personalizada.
        </p>
      </div>

      <WalletStatus />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Numbers input */}
        <div className="space-y-2">
          <Label>Números para análise</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="ex: 7"
              value={novoNumero}
              onChange={(e) => setNovoNumero(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNumero())}
              disabled={loading}
              min={1}
            />
            <Button type="button" variant="secondary" size="icon" onClick={addNumero} disabled={loading}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {numeros.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {numeros.map((n, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pl-3">
                  {n}
                  <button
                    type="button"
                    onClick={() => removeNumero(i)}
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome (opcional)</Label>
          <Input
            id="nome"
            placeholder="ex: Maria, João, seu nome ou um nome especial…"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <PaymentBadge price={PRICES.numerologia} />
          <Button
            type="submit"
            size="lg"
            variant="gold"
            disabled={!isReady || (!numeros.length && !nome.trim()) || loading}
            className="min-w-44"
          >
            {loading ? <>Analisando…</> : <><Sparkles className="h-4 w-4" /> Analisar</>}
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
          <Card className="border-green-500/30 bg-gradient-to-br from-green-950/20 to-card">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">{result.resultado.animal_da_sorte}</CardTitle>
              <p className="text-sm text-muted-foreground">Grupo {result.resultado.grupo}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dezenas */}
              <div className="flex gap-2 flex-wrap">
                {result.resultado.dezenas.map((d) => (
                  <span
                    key={d}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary font-bold text-sm"
                  >
                    {String(d).padStart(2, '0')}
                  </span>
                ))}
              </div>

              {/* Soma numerológica */}
              {result.resultado.soma_numerologica && (
                <>
                  <Separator />
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Soma', value: result.resultado.soma_numerologica.valor },
                      { label: 'Redução', value: result.resultado.soma_numerologica.reducao },
                      { label: 'Animal', value: result.resultado.soma_numerologica.animal_correspondente },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-bold text-primary mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />
              <p className="text-sm leading-relaxed">{result.analise_completa}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
