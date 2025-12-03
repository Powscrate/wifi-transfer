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
                    dark: '#000000',
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
                title: "Copied to clipboard!",
                description: "The connection URL has been copied.",
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: "Failed to copy",
                description: "Could not copy URL to clipboard.",
            });
        }
    };

    return (
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="text-center md:text-left">
                <CardTitle className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                    <QrCode className="text-primary"/>
                    Connect Your Mobile
                </CardTitle>
                <CardDescription>
                    Scan this QR code with your phone's camera. Both devices must be on the same Wi-Fi network.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white rounded-lg shadow-md transition-transform hover:scale-105">
                    <canvas ref={canvasRef} className="rounded"/>
                </div>
                <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground mb-2">Or enter this URL in your mobile browser:</p>
                    <div className="flex w-full items-center space-x-2">
                        <Input type="text" value={url} readOnly className="bg-background/70 text-center" />
                        <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy URL">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
