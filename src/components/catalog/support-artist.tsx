'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface SupportArtistProps {
  artistId: string;
  artistName: string;
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

export function SupportArtist({ artistId, artistName }: SupportArtistProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSupport = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (finalAmount < 100) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          description: `Soutien à ${artistName}`,
          type: 'TIP',
          productId: artistId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="premium" size="lg">
        <Heart className="h-5 w-5 mr-2" />
        Soutenir
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Soutenir ${artistName}`}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Choisissez un montant pour soutenir {artistName}. 95% de votre don lui est reversé.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setAmount(preset); setCustomAmount(''); }}
                className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                  amount === preset && !customAmount
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {preset.toLocaleString()} F
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm text-text-secondary block mb-1">Ou montant personnalisé</label>
            <input
              type="number"
              min={100}
              placeholder="Montant en F CFA"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
              className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary outline-hidden focus:border-primary transition-colors"
            />
          </div>

          <Button
            onClick={handleSupport}
            disabled={loading || (customAmount ? parseInt(customAmount) < 100 : false)}
            variant="premium"
            className="w-full"
          >
            {loading ? 'Redirection...' : `Soutenir — ${((customAmount ? parseInt(customAmount) : amount) || 0).toLocaleString()} F`}
          </Button>
        </div>
      </Modal>
    </>
  );
}
