import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Sparkles, Moon, Home, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/interpretar', label: 'Interpretar', icon: Sparkles },
  { to: '/sonho', label: 'Sonhos', icon: Moon },
  { to: '/palpite', label: 'Palpites', icon: Sparkles },
  { to: '/numerologia', label: 'Numerologia', icon: Sparkles },
  { to: '/tabela', label: 'Tabela', icon: BookOpen },
];

export function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="text-2xl animate-float">🔮</span>
            <span className="hidden sm:inline">Oráculo do Bicho</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname === to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <ConnectButton
            chainStatus="icon"
            showBalance={{ smallScreen: false, largeScreen: true }}
          />
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                pathname === to
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'text-muted-foreground border-border hover:border-primary/30 hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 container py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>
          🎭 Oráculo do Bicho v3 · Powered by{' '}
          <a href="https://docs.x402.org" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            x402 Protocol
          </a>{' '}
          ·{' '}
          <span className="text-yellow-500/70">⚠️ 100% educacional</span>
        </p>
      </footer>
    </div>
  );
}
