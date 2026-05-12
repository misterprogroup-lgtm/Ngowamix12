'use client';

import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Users, TrendingUp, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/feedback/toast';

export default function ArtistReferralPage() {
  const { addToast } = useToast();
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/referral')
      .then((r) => r.json())
      .then((data) => {
        setReferral(data);
        setNewCode(data.code || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!newCode.trim() || newCode.length < 3) {
      addToast({ title: 'Le code doit contenir au moins 3 caractères', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/referral', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode.toUpperCase() }),
      });

      if (res.ok) {
        const data = await res.json();
        setReferral({ ...referral, code: data.code });
        addToast({ title: 'Code de parrainage mis à jour', type: 'success' });
      } else {
        const data = await res.json();
        addToast({ title: data.error || 'Erreur', type: 'error' });
      }
    } catch {
      addToast({ title: 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    if (referral?.code) {
      navigator.clipboard.writeText(referral.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Gift className="h-6 w-6 text-primary" />
        Parrainage
      </h1>

      <div className="rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Votre code de parrainage</h2>
        <p className="text-sm text-text-secondary mb-4">
          Partagez ce code avec vos fans. Quand un fan l&apos;utilise lors de son inscription puis s&apos;abonne au Premium, vous gagnez <strong>10%</strong> du montant de son abonnement.
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="MONCODE"
            className="font-mono font-bold text-lg"
          />
          <Button variant="primary" onClick={handleSave} isLoading={saving}>
            Sauvegarder
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={copyCode} className="flex-1">
            {copied ? (
              <><Check className="h-4 w-4 mr-2 text-success" /> Copié !</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copier le code</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const url = `${window.location.origin}/register?ref=${referral?.code}`;
              navigator.clipboard.writeText(url);
              addToast({ title: 'Lien copié !', type: 'success' });
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager le lien
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <Users className="h-4 w-4" />
            Fillesuls parrainés
          </div>
          <p className="text-2xl font-bold">{referral?.usageCount || 0}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <TrendingUp className="h-4 w-4" />
            Gains
          </div>
          <p className="text-2xl font-bold text-success">—</p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-2">Comment ça marche ?</h3>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>Créez votre code de parrainage personnalisé</li>
          <li>Partagez-le avec vos fans (sur vos réseaux, en concert, etc.)</li>
          <li>Vos fans entrent ce code lors de leur inscription</li>
          <li>Quand un fan s&apos;abonne au Premium, vous gagnez 10% du montant</li>
          <li>Les gains sont crédités directement sur votre solde artiste</li>
        </ol>
      </div>
    </div>
  );
}
