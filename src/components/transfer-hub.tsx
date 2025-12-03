'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import QRCodeDisplay from './qrcode-display';
import FileManager from './file-manager';
import { Wifi } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type TransferHubProps = {
  serverUrl: string;
};

export default function TransferHub({ serverUrl }: TransferHubProps) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const glassmorphismClass = "bg-card/30 backdrop-blur-xl border border-white/20 dark:border-black/20 rounded-2xl shadow-lg transition-all duration-300";

  if (!isClient) {
    return (
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-4 mb-8 text-foreground">
          <Wifi className="w-10 h-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
            Wifi Transfer Hub
          </h1>
        </div>
        <Skeleton className={`w-full h-[60vh] ${glassmorphismClass}`} />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-4 mb-8 text-foreground">
        <Wifi className="w-10 h-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
          Wifi Transfer Hub
        </h1>
      </div>
      <div className={`w-full p-4 md:p-8 ${glassmorphismClass}`}>
        {isMobile ? (
          <FileManager />
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <QRCodeDisplay url={serverUrl} />
            <FileManager />
          </div>
        )}
      </div>
    </div>
  );
}
