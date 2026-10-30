'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import QRCodeDisplay from './qrcode-display';
import FileManager from './file-manager';
import { Wifi, Smartphone, Laptop } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type TransferHubProps = {
  serverUrl: string;
};

export default function TransferHub({ serverUrl }: TransferHubProps) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const glassmorphismClass = "bg-card/60 backdrop-blur-sm";

  if (!isClient) {
    return (
      <Card className="w-full max-w-5xl h-[70vh]">
        <CardContent className="p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <Wifi className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                    Wifi Transfer Hub
                </h1>
            </div>
            <Skeleton className="w-full h-[55vh] rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`w-full max-w-5xl shadow-2xl border-none ${glassmorphismClass}`}>
        <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <Wifi className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center md:text-left">
                    Wifi Transfer FILES
                </h1>
            </div>

            {isMobile ? (
                <>
                    <div className="flex items-center justify-center gap-2 text-lg text-secondary-foreground mb-6">
                        <Smartphone className="h-6 w-6"/>
                        <span>Mode Mobile</span>
                    </div>
                    <FileManager />
                </>
            ) : (
                <div className="grid md:grid-cols-5 gap-6 xl:gap-8 items-start">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 text-lg text-secondary-foreground mb-4">
                            <Laptop className="h-6 w-6"/>
                            <span>Bureau</span>
                        </div>
                        <QRCodeDisplay url={serverUrl} />
                    </div>
                    <Separator orientation="vertical" className="hidden md:block h-auto mx-auto" />
                    <div className="md:col-span-2">
                         <div className="flex items-center gap-2 text-lg text-secondary-foreground mb-4">
                            <Smartphone className="h-6 w-6"/>
                            <span>Appareils Connectés</span>
                        </div>
                        <FileManager />
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
