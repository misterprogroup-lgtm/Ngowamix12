'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Scan, Search, CheckCircle, XCircle, Ticket, MapPin, Calendar, Clock, Loader2, Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsQR from 'jsqr';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        await video.play();

        setCameraActive(true);
        scanningRef.current = true;
        scanLoop();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        alert('Erreur caméra: ' + msg);
      }
    }
  };

  function scanLoop() {
    if (!scanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestAnimationFrame(scanLoop);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (qr && qr.data) {
      scanningRef.current = false;
      stopCamera();
      setCameraActive(false);
      verifyCode(qr.data);
      return;
    }

    requestAnimationFrame(scanLoop);
  }

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
          <div className="bg-black relative" style={{ minHeight: 256 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-64 object-cover ${cameraActive ? '' : 'hidden'}`}
            />
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-48 h-48 border-2 border-primary/60 rounded-xl" />
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            )}
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-12 w-12 text-white/30" />
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            <div className="p-3 text-center">
              <p className="text-xs text-text-muted">
                {cameraActive ? 'Pointez le QR code dans le cadre' : 'Activez la caméra pour scanner'}
              </p>
            </div>
          </div>
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
