'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function ISBNScanner({ onScan, onClose }: ISBNScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());

        const scanner = new Html5Qrcode('isbn-scanner');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (decodedText.length === 13 || decodedText.length === 10) {
              onScan(decodedText);
              scanner.stop();
            }
          },
          () => {}
        );
      } catch (err) {
        const error = err as Error;
        console.error('Scanner init error:', error);

        if (error.name === 'NotAllowedError') {
          setError('Kamera-Zugriff verweigert.');
        } else if (error.name === 'NotFoundError') {
          setError('Keine Kamera gefunden.');
        } else {
          setError('Fehler: ' + error.message);
        }
      }
    };

    initScanner();

    return () => {
      scannerRef.current?.stop();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="relative h-full w-full">
        <div id="isbn-scanner" className="h-full w-full" />

        <div className="absolute left-4 right-4 top-4 flex justify-between">
          <div className="rounded-lg bg-black/50 px-3 py-2 text-white backdrop-blur">
            <p className="text-sm">ISBN-Barcode scannen</p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-black/50 text-white backdrop-blur hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-500/90 p-4 text-white">
            <p className="mb-2 text-sm font-semibold">Scanner-Fehler</p>
            <p className="text-xs">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
