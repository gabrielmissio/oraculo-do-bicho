import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ENDPOINTS } from '@/lib/constants';
import { BookOpen, Search, AlertCircle } from 'lucide-react';

export default function TabelaAnimais() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(ENDPOINTS.tabela)
      .then((r) => r.json())
      .then((d) => setAnimais(d.animais ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = animais.filter(
    (a) =>
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      String(a.id).includes(search),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" /> Tabela dos Bichos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          25 animais oficiais do Jogo do Bicho — grupos, dezenas e significados. Grátis, sem pagamento.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar animal ou grupo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 25 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((animal) => (
              <Card
                key={animal.id}
                className="border-border/60 hover:border-primary/40 transition-colors"
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg">{animal.nome}</p>
                    <Badge variant="secondary" className="text-xs font-mono">
                      G{animal.id}
                    </Badge>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {animal.dezenas.map((d) => (
                      <span
                        key={d}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold"
                      >
                        {String(d).padStart(2, '0')}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{animal.significado}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nenhum animal encontrado para "{search}".</p>
          )}

          <p className="text-xs text-muted-foreground text-right">
            {filtered.length} de {animais.length} animais
          </p>
        </>
      )}
    </div>
  );
}
