import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Moon, Coins, BookOpen } from 'lucide-react';
import { PRICES } from '@/lib/constants';

const CARDS = [
  {
    to: '/interpretar',
    icon: '🔮',
    title: 'Interpretar',
    description: 'Qualquer input — sonho, número, cor, placa, frase. A IA encontra o animal.',
    price: PRICES.interpretar,
    color: 'from-mystic-900/40 to-mystic-950/20',
  },
  {
    to: '/sonho',
    icon: '🌙',
    title: 'Sonhos',
    description: 'Interpretação onírica especializada. Seu sonho como sinal espiritual.',
    price: PRICES.sonho,
    color: 'from-blue-900/30 to-mystic-950/20',
  },
  {
    to: '/palpite',
    icon: '⚡',
    title: 'Palpites do Dia',
    description: 'Três palpites simultâneos: por contexto, data e energia cósmica.',
    price: PRICES.palpite,
    color: 'from-amber-900/30 to-mystic-950/20',
  },
  {
    to: '/numerologia',
    icon: '🔢',
    title: 'Numerologia',
    description: 'Análise numerológica de datas, nomes e sequências de números.',
    price: PRICES.numerologia,
    color: 'from-green-900/30 to-mystic-950/20',
  },
  {
    to: '/tabela',
    icon: '📖',
    title: 'Tabela dos Bichos',
    description: 'Os 25 animais oficiais com grupos, dezenas e significados místicos.',
    price: 'Grátis',
    color: 'from-purple-900/30 to-mystic-950/20',
    free: true,
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <div className="text-7xl animate-float">🔮</div>
        <div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
            Oráculo do Bicho
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
            Interpretações místicas do Jogo do Bicho alimentadas por Inteligência Artificial.
            Pague por consulta com USDC via{' '}
            <a href="https://docs.x402.org" target="_blank" rel="noreferrer" className="text-primary underline">
              x402 Protocol
            </a>
            .
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge variant="gold" className="gap-1 text-sm px-3 py-1">
            <Coins className="h-3.5 w-3.5" /> Pague por uso · USDC
          </Badge>
          <Badge variant="mystic" className="gap-1 text-sm px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" /> Powered by LLM
          </Badge>
          <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
            <Moon className="h-3.5 w-3.5" /> 25 Animais Oficiais
          </Badge>
        </div>
        <Button asChild size="xl" variant="gold">
          <Link to="/interpretar">
            <Sparkles className="h-5 w-5" /> Consultar o Oráculo
          </Link>
        </Button>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Consultas disponíveis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card) => (
            <Link key={card.to} to={card.to} className="group">
              <Card className={`h-full bg-gradient-to-br ${card.color} border-border/60 hover:border-primary/40 transition-all duration-300 group-hover:scale-[1.02]`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{card.icon}</span>
                    <Badge
                      variant={card.free ? 'success' : 'gold'}
                      className="text-xs"
                    >
                      {card.free ? '✓ Grátis' : card.price + ' USDC'}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* x402 Protocol info */}
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="font-bold text-primary flex items-center gap-2">
          <Coins className="h-5 w-5" /> Como funciona o pagamento?
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          {[
            { step: '1', text: 'Conecte sua carteira EVM (MetaMask, Coinbase Wallet…)' },
            { step: '2', text: 'Ao consultar, sua carteira pede sua assinatura EIP-3009 (sem gas)' },
            { step: '3', text: 'O servidor valida o pagamento via facilitador e libera a resposta' },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                {step}
              </span>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Rede: Base Sepolia (testnet) · Token: USDC · Protocolo:{' '}
          <a href="https://x402.org" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            x402
          </a>
        </p>
      </section>
    </div>
  );
}
