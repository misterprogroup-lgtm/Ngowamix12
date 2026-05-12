'use client';

import { useState, useRef, useEffect } from 'react';
import { Scan, Search, CheckCircle, XCircle, Ticket, MapPin, Calendar, Clock, Loader2, Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Html5Qrcode } from 'html5-qrcode';

interface TicketResult {
  valid: boolean;
  message?: string;
  error?: string;
  ticket?: {
    id: string;
    type: string;
    price: number;
    status: string;
    recipientEmail: string | null;
    concert: {
      title: string;
      venue: string;
      city: string;
      date: string;
      time: string;
      artist: { name: string };
    };
  };
}

export default function ScannerPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<TicketResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'qr-reader';

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
        scannerRef.current = null;
      }
      setCameraActive(false);
    } else {
      try {
        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            setCameraActive(false);
            verifyCode(decodedText);
          },
          () => {}
        );

        setCameraActive(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        alert('Erreur caméra: ' + msg);
      }
    }
  };

  const verifyCode = async (qrCode: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/tickets/verify?code=${encodeURIComponent(qrCode)}`);
      const data = await res.json();

      if (data.valid && data.ticket?.status === 'PURCHASED') {
        const markRes = await fetch('/api/tickets/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: qrCode }),
        });
        const markData = await markRes.json();
        setResult(markData);
      } else {
        setResult(data);
      }
    } catch {
      setResult({ valid: false, error: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) verifyCode(code.trim());
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Scan className="h-6 w-6 text-accent" />
        Scanner de billets
      </h1>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrer le code QR manuellement"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" variant="primary" isLoading={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Caméra</span>
            <Button
              type="button"
              variant={cameraActive ? 'danger' : 'outline'}
              size="sm"
              onClick={toggleCamera}
            >
              {cameraActive ? (
                <><CameraOff className="h-4 w-4 mr-1" /> Désactiver</>
              ) : (
                <><Camera className="h-4 w-4 mr-1" /> Activer</>
              )}
            </Button>
          </div>
          {cameraActive && (
            <div className="bg-black relative">
              <div id={readerId} className="w-full" style={{ minHeight: 300 }} />
              <div className="p-3 text-center">
                <p className="text-xs text-text-muted">
                  Pointez la caméra vers le QR code
                </p>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {result && !loading && (
          <div className={`rounded-xl border p-6 space-y-4 ${
            result.valid
              ? 'border-success bg-success/5'
              : 'border-error bg-error/5'
          }`}>
            <div className="flex items-center gap-3">
              {result.valid ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle className="h-7 w-7 text-success" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/20">
                  <XCircle className="h-7 w-7 text-error" />
                </div>
              )}
              <div>
                <p className={`font-bold text-lg ${
                  result.valid ? 'text-success' : 'text-error'
                }`}>
                  {result.valid ? 'Billet valide' : 'Billet invalide'}
                </p>
                <p className="text-sm text-text-secondary">
                  {result.message || result.error}
                </p>
              </div>
            </div>

            {result.ticket && (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-text-primary">
                  {result.ticket.concert.title}
                </p>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Ticket className="h-4 w-4" />
                  <span>{result.ticket.type === 'VIP' ? 'VIP' : 'Standard'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="h-4 w-4" />
                  <span>{result.ticket.concert.venue}, {result.ticket.concert.city}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(result.ticket.concert.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="h-4 w-4" />
                  <span>{result.ticket.concert.time}</span>
                </div>
                {result.ticket.recipientEmail && (
                  <p className="text-xs text-text-muted pt-1">
                    Billet de : {result.ticket.recipientEmail}
                  </p>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => { setResult(null); setCode(''); }}
            >
              Scanner un autre billet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
