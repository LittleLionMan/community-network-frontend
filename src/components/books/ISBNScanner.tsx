'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library';
import { X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function ISBNScanner({ onScan, onClose }: ISBNScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    let controlsStream: MediaStream | null = null;
    const videoElement = videoRef.current;

    const initScanner = async () => {
      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints);
        readerRef.current = reader;

        console.log('Scanner: Requesting camera access...');
        const videoInputDevices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError('Keine Kamera gefunden.');
          return;
        }

        console.log('Scanner: Found cameras:', videoInputDevices.length);

        const backCamera =
          videoInputDevices.find(
            (device: MediaDeviceInfo) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
          ) || videoInputDevices[videoInputDevices.length - 1];

        console.log('Scanner: Using camera:', backCamera.label);
        setIsScanning(true);

        await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoElement!,
          (result, error) => {
            if (result && !hasScannedRef.current) {
              const text = result.getText();
              console.log(
                'Scanner: Detected code:',
                text,
                'Format:',
                result.getBarcodeFormat()
              );

              if (
                text &&
                (text.length === 13 ||
                  text.length === 10 ||
                  text.length === 12 ||
                  text.length === 8)
              ) {
                const cleanedIsbn = text.replace(/[^0-9X]/gi, '').toUpperCase();
                console.log('Scanner: Cleaned ISBN:', cleanedIsbn);

                if (cleanedIsbn.length >= 8) {
                  hasScannedRef.current = true;
                  console.log('Scanner: Valid ISBN found, calling onScan');
                  onScan(cleanedIsbn);
                  if (controlsStream) {
                    controlsStream.getTracks().forEach((track) => track.stop());
                  }
                }
              }
            }

            if (error && !(error instanceof NotFoundException)) {
              console.error('Scanner: Decode error:', error);
            }
          }
        );

        if (videoElement?.srcObject) {
          controlsStream = videoElement.srcObject as MediaStream;
        }

        console.log('Scanner: Started successfully');
      } catch (err) {
        const error = err as Error;
        console.error('Scanner: Init error:', error);

        if (error.name === 'NotAllowedError') {
          setError(
            'Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.'
          );
        } else if (error.name === 'NotFoundError') {
          setError('Keine Kamera gefunden.');
        } else {
          setError('Kamera-Fehler: ' + error.message);
        }
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      console.log('Scanner: Cleanup');
      if (controlsStream) {
        controlsStream.getTracks().forEach((track) => track.stop());
      }
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      readerRef.current = null;
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          autoPlay
          muted
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="h-40 w-80 rounded-lg border-4 border-amber-500 bg-transparent shadow-2xl">
              <div className="absolute -left-2 -top-2 h-8 w-8 border-l-4 border-t-4 border-amber-500"></div>
              <div className="absolute -right-2 -top-2 h-8 w-8 border-r-4 border-t-4 border-amber-500"></div>
              <div className="absolute -bottom-2 -left-2 h-8 w-8 border-b-4 border-l-4 border-amber-500"></div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 border-b-4 border-r-4 border-amber-500"></div>
            </div>
            <div className="mt-4 text-center">
              <p className="rounded-lg bg-black/70 px-4 py-2 text-sm text-white backdrop-blur">
                {isScanning ? (
                  <>
                    <Scan className="mx-auto mb-1 h-5 w-5 animate-pulse" />
                    Halte den Barcode in den Rahmen
                  </>
                ) : (
                  'Initialisiere Kamera...'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute left-4 right-4 top-4 flex justify-between">
          <div className="rounded-lg bg-black/70 px-4 py-2 text-white backdrop-blur">
            <p className="text-sm font-medium">ISBN-Barcode scannen</p>
            <p className="text-xs text-gray-300">Auf der Buchrückseite</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="bg-black/70 text-white backdrop-blur hover:bg-black/90"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-500/95 p-4 text-white shadow-lg backdrop-blur">
            <p className="mb-1 text-sm font-semibold">Scanner-Fehler</p>
            <p className="text-xs">{error}</p>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="mt-3 w-full border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Schließen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
