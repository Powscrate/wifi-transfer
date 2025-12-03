'use client';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type QRCodeDisplayProps = {
    url: string;
};

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (canvasRef.current && url) {
            QRCode.toCanvas(canvasRef.current, url, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#0a192f', // A dark navy blue
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) console.error('QR Code generation failed:', error);
            });
        }
    }, [url]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Copié dans le presse-papiers !",
                description: "L'URL de connexion a été copiée.",
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: "La copie a échoué",
                description: "Impossible de copier l'URL dans le presse-papiers.",
            });
        }
    };

    return (
        <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold flex items-center gap-2 justify-center">
                    <QrCode className="text-primary"/>
                    Connectez votre mobile
                </CardTitle>
                <CardDescription className="text-sm">
                    Scannez ce code QR avec l'appareil photo de votre téléphone.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-md transition-transform hover:scale-105 duration-300">
                    <canvas ref={canvasRef} className="rounded-sm"/>
                </div>
                <div className="w-full text-center">
                    <p className="text-xs text-muted-foreground mb-2">Ou entrez cette URL dans votre navigateur mobile :</p>
                    <div className="flex w-full items-center space-x-2">
                        <Input type="text" value={url} readOnly className="bg-secondary text-center text-sm" />
                        <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy URL">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
