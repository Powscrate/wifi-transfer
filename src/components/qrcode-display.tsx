'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Check, Copy, QrCode, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type QRCodeDisplayProps = {
  url: string;
};

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 256,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation failed:', error);
        }
      );
    }
  }, [url]);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copié dans le presse-papiers !',
        description: "L'URL de connexion a été copiée.",
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'La copie a échoué',
        description: "Impossible de copier l'URL dans le presse-papiers.",
      });
    }
  };

  return (
    <section className="glass-panel relative overflow-hidden rounded-[28px] p-5 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl"
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-semibold leading-tight tracking-tight">
            Connectez votre mobile
          </h2>
          <p className="text-xs text-muted-foreground">Scannez le code pour ouvrir le hub</p>
        </div>
      </div>

      <div className="relative mt-6 flex justify-center">
        <div
          aria-hidden
          className="absolute inset-x-10 inset-y-2 rounded-[2rem] bg-gradient-to-br from-violet-500/25 via-indigo-500/10 to-cyan-400/30 blur-2xl"
        />
        <div className="relative rounded-2xl bg-white p-3 shadow-[0_18px_45px_-18px_rgba(49,46,129,0.5)] ring-1 ring-black/5 transition-transform duration-500 hover:scale-[1.03]">
          <canvas ref={canvasRef} className="h-auto w-full max-w-[212px] rounded-lg" />
        </div>
      </div>

      <div className="relative mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Adresse de connexion
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Wi-Fi
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 p-1 pl-3 backdrop-blur">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-tight text-muted-foreground">
            {url}
          </span>
          <Button
            size="icon"
            onClick={copyToClipboard}
            aria-label="Copier l'URL"
            className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25 transition-transform hover:scale-105 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <p className="relative mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <Smartphone className="h-3.5 w-3.5" />
        Ou saisissez cette adresse dans le navigateur mobile
      </p>
    </section>
  );
}
