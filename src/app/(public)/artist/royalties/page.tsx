'use client';

import { useState, useEffect } from 'react';
import { Wallet, Music, TrendingUp, Download, Loader2, ArrowUpRight, CreditCard, Smartphone, History } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface EarningsData {
  balance: number;
  streamCount: number;
  totalStreamEarnings: number;
  totalPayout?: number;
}

interface PlayHistory {
  id: string;
  amount: number;
  playedAt: string;
  track?: { title?: string; album?: { title?: string; coverImage?: string | null } };
}

interface PayoutRecord {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

export default function ArtistRoyaltiesPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [history, setHistory] = useState<PlayHistory[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('MOBILE_MONEY');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'earnings' | 'history' | 'payouts'>('earnings');

  useEffect(() => {
    Promise.all([
      fetch('/api/royalties?type=my-earnings').then(r => r.json()),
      fetch('/api/royalties?type=history').then(r => r.json()),
      fetch('/api/royalties/payout').then(r => r.json()),
    ]).then(([e, h, p]) => {
      setEarnings(e);
      setHistory(h.plays || []);
      setPayouts(p.payouts || []);
    }).finally(() => setLoading(false));
  }, []);

  const handlePayout = async () => {
    const amount = parseInt(payoutAmount, 10);
    if (!amount || amount <= 0) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/royalties/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: payoutMethod, phone: payoutPhone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPayout(false);
        setPayoutAmount('');
        setPayoutPhone('');
        const [e, p] = await Promise.all([
          fetch('/api/royalties?type=my-earnings').then(r => r.json()),
          fetch('/api/royalties/payout').then(r => r.json()),
        ]);
        setEarnings(e);
        setPayouts(p.payouts || []);
      } else {
        setError(data.error || 'Erreur');
      }
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;

  const tabs = [
    { id: 'earnings' as const, label: 'Gains', icon: TrendingUp },
    { id: 'history' as const, label: 'Historique des streams', icon: Music },
    { id: 'payouts' as const, label: 'Retraits', icon: History },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 rounded-full bg-linear-to-b from-success to-primary" />
        <h1 className="text-2xl font-bold">Royalties & Gains</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">{error}</div>
      )}

      {earnings && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-surface border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
              <Wallet className="h-4 w-4" />Solde disponible
            </div>
            <p className="text-2xl font-bold text-success">{earnings.balance?.toLocaleString()} <span className="text-sm font-normal text-text-muted">FCFA</span></p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
              <Music className="h-4 w-4" />Streams
            </div>
            <p className="text-2xl font-bold">{earnings.streamCount?.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
              <TrendingUp className="h-4 w-4" />Gains streams
            </div>
            <p className="text-2xl font-bold">{earnings.totalStreamEarnings?.toLocaleString()} <span className="text-sm font-normal text-text-muted">FCFA</span></p>
          </div>
          <button
            onClick={() => setShowPayout(true)}
            className="rounded-xl bg-primary text-white p-4 hover:bg-primary-hover transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
              <Download className="h-4 w-4" />Effectuer un retrait
            </div>
            <p className="text-lg font-bold flex items-center gap-1">
              Retirer <ArrowUpRight className="h-4 w-4" />
            </p>
          </button>
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface border border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              tab === t.id ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'earnings' && earnings && (
        <div className="rounded-2xl bg-surface border border-border p-6">
          <h3 className="font-semibold mb-4">Résumé des gains</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-text-secondary">Gains des streams</span>
              <span className="font-semibold">{earnings.totalStreamEarnings?.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-text-secondary">Commissions de parrainage</span>
              <span className="font-semibold">{((earnings.balance || 0) - (earnings.totalStreamEarnings || 0)).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center py-2 text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-success">{earnings.balance?.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="rounded-2xl bg-surface border border-border overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun stream enregistré</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {history.map((play) => (
                <div key={play.id} className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-surface-hover overflow-hidden shrink-0">
                    {play.track?.album?.coverImage ? (
                      <SafeImage src={play.track.album.coverImage} alt="" width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Music className="h-5 w-5 text-text-muted" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{play.track?.title || 'Titre supprimé'}</p>
                    <p className="text-xs text-text-muted">{play.track?.album?.title || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{play.amount} FCFA</p>
                    <p className="text-xs text-text-muted">{new Date(play.playedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'payouts' && (
        <div className="rounded-2xl bg-surface border border-border overflow-hidden">
          {payouts.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun retrait effectué</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{payout.amount.toLocaleString()} FCFA</p>
                    <p className="text-xs text-text-muted">{payout.method} · {new Date(payout.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                    payout.status === 'FAILED' ? 'bg-error/10 text-error' :
                    payout.status === 'PROCESSING' ? 'bg-primary/10 text-primary' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {payout.status === 'COMPLETED' ? 'Effectué' :
                     payout.status === 'FAILED' ? 'Échoué' :
                     payout.status === 'PROCESSING' ? 'En cours' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPayout(false)}>
          <div className="max-w-md w-full rounded-2xl bg-surface p-6 border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Effectuer un retrait</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Montant (FCFA)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="5000 minimum"
                  min="5000"
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Méthode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPayoutMethod('MOBILE_MONEY')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      payoutMethod === 'MOBILE_MONEY' ? 'bg-primary text-white' : 'bg-surface-hover text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />Mobile Money
                  </button>
                  <button
                    onClick={() => setPayoutMethod('BANK')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      payoutMethod === 'BANK' ? 'bg-primary text-white' : 'bg-surface-hover text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />Banque
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Numéro {payoutMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'de compte'}</label>
                <input
                  type="text"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder={payoutMethod === 'MOBILE_MONEY' ? '+225 01 02 03 04 05' : 'Numéro de compte'}
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handlePayout}
                  disabled={!payoutAmount || parseInt(payoutAmount) < 5000 || processing}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
                >
                  {processing ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirmer le retrait'}
                </button>
                <button
                  onClick={() => setShowPayout(false)}
                  className="px-4 py-2.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
