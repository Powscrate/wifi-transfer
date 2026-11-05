import { Sparkles, ShieldCheck, Smartphone, Wifi, Zap } from 'lucide-react';
import QRCodeDisplay from './qrcode-display';
import FileManager from './file-manager';
import ThemeToggle from './theme-toggle';

type TransferHubProps = {
  serverUrl: string;
};

export default function TransferHub({ serverUrl }: TransferHubProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Brand bar */}
      <header className="animate-fade-up flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-60 blur-lg" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/25">
              <Wifi className="h-5 w-5 text-white" strokeWidth={2.6} />
            </div>
          </div>
          <div className="leading-tight">
            <p className="font-headline text-[17px] font-bold tracking-tight">WiFi Transfer</p>
            <p className="text-xs text-muted-foreground">Partage local, instantané</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            En ligne sur le réseau local
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section
        className="animate-fade-up mt-12 max-w-2xl sm:mt-16 lg:mt-20"
        style={{ animationDelay: '60ms' }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Peer-to-peer · Sans compte
        </div>

        <h1 className="mt-5 font-headline text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
          Vos fichiers,
          <br />
          <span className="text-gradient">sans le cloud.</span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Scannez le code, glissez vos fichiers et partagez-les instantanément entre vos appareils.
          Tout reste sur votre Wi-Fi.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {[
            { icon: ShieldCheck, label: '100% privé' },
            { icon: Zap, label: 'Transfert instantané' },
            { icon: Wifi, label: 'Aucun câble' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground backdrop-blur lg:hidden">
          <Smartphone className="h-3.5 w-3.5 text-primary" />
          Mode mobile : vos fichiers apparaîtront sur tous les appareils connectés.
        </div>
      </section>

      {/* Connection + transfer panels */}
      <div className="mt-10 grid flex-1 items-start gap-5 lg:mt-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-6">
        <div
          className="animate-fade-up hidden lg:sticky lg:top-6 lg:block"
          style={{ animationDelay: '120ms' }}
        >
          <QRCodeDisplay url={serverUrl} />
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
          <FileManager />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Aucun fichier n&apos;est envoyé sur Internet.
        </p>
        <p className="font-mono text-[11px] tracking-tight text-muted-foreground/80">{serverUrl}</p>
      </footer>
    </div>
  );
}
