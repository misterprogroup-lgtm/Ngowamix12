'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Wallet, Monitor, Loader2, Check, ExternalLink, Copy } from 'lucide-react';

export default function ArtistServicesPage() {
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'payout' | 'streaming'>('payout');

  const [payoutMethod, setPayoutMethod] = useState('MOBILE_MONEY');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutAccountName, setPayoutAccountName] = useState('');
  const [payoutBankName, setPayoutBankName] = useState('');
  const [payoutBankAccount, setPayoutBankAccount] = useState('');
  const [streamServerUrl, setStreamServerUrl] = useState('');

  useEffect(() => {
    fetch('/api/artist/services')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setPayoutMethod(data.config.payoutMethod || 'MOBILE_MONEY');
          setPayoutPhone(data.config.payoutPhone || '');
          setPayoutAccountName(data.config.payoutAccountName || '');
          setPayoutBankName(data.config.payoutBankName || '');
          setPayoutBankAccount(data.config.payoutBankAccount || '');
          setStreamServerUrl(data.config.streamServerUrl || '');
          setConfig(data.config);
        }
      })
      .catch(() => router.push('/artist/dashboard'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/artist/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutMethod,
          payoutPhone,
          payoutAccountName,
          payoutBankName,
          payoutBankAccount,
          streamServerUrl,
        }),
      });
      if (!res.ok) { setError('Erreur lors de la sauvegarde'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;

  return (
    <div className="container mx-auto py-6 pb-24 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Configuration des services</h1>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface border border-border">
        <button
          onClick={() => setTab('payout')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'payout' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Wallet className="h-4 w-4" />
          Paiements
        </button>
        <button
          onClick={() => setTab('streaming')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'streaming' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Monitor className="h-4 w-4" />
          Streaming
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {tab === 'payout' && (
          <div className="space-y-5 p-6 rounded-2xl bg-surface border border-border">
            <h2 className="font-semibold">Moyen de paiement par défaut</h2>
            <p className="text-sm text-text-secondary -mt-3">
              Ces infos seront pré-remplies lors de vos demandes de retrait.
            </p>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mode de paiement</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('MOBILE_MONEY')}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    payoutMethod === 'MOBILE_MONEY'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('BANK')}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    payoutMethod === 'BANK'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  Virement bancaire
                </button>
              </div>
            </div>

            {payoutMethod === 'MOBILE_MONEY' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                  Numéro mobile Money
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="+225 01 02 03 04 05"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {payoutMethod === 'BANK' && (
              <>
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium mb-1.5">
                    Nom de la banque
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    value={payoutBankName}
                    onChange={(e) => setPayoutBankName(e.target.value)}
                    placeholder="Ex: Société Générale"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="bankAccount" className="block text-sm font-medium mb-1.5">
                    Numéro de compte
                  </label>
                  <input
                    id="bankAccount"
                    type="text"
                    value={payoutBankAccount}
                    onChange={(e) => setPayoutBankAccount(e.target.value)}
                    placeholder="Ex: 12345 67890 12345678901 12"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="accountName" className="block text-sm font-medium mb-1.5">
                Titulaire du compte
              </label>
              <input
                id="accountName"
                type="text"
                value={payoutAccountName}
                onChange={(e) => setPayoutAccountName(e.target.value)}
                placeholder="Nom complet"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {tab === 'streaming' && (
          <div className="space-y-5 p-6 rounded-2xl bg-surface border border-border">
            <h2 className="font-semibold">Streaming vidéo</h2>
            <p className="text-sm text-text-secondary -mt-3">
              Configure ton serveur de diffusion pour la vidéo en direct.
            </p>

            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <h3 className="font-semibold text-sm mb-2">YouTube Live (gratuit, recommandé)</h3>
              <p className="text-sm text-text-secondary mb-3">
                Aucun serveur nécessaire. Tu crées ton live sur YouTube et tu colles le lien dans le formulaire de création de live.
              </p>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Va sur <strong>YouTube Studio → Créer → Passer en direct</strong></li>
                <li>Copie la clé de diffusion</li>
                <li>OBS : Service = <strong>YouTube - RTMPS</strong>, colle la clé</li>
                <li>Colle le lien YouTube dans le live créé sur Ngowamix</li>
              </ol>
              <a
                href="https://www.youtube.com/live_dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium mt-3"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Tableau de bord YouTube Live
              </a>
            </div>

            <div className="p-4 rounded-xl bg-surface-hover border border-border">
              <h3 className="font-semibold text-sm mb-2">Owncast (auto-hébergé)</h3>
              <p className="text-sm text-text-secondary mb-3">
                Option avancée : installe Owncast sur un VPS pour un contrôle total.
              </p>
              <div>
                <label htmlFor="streamServerUrl" className="block text-sm font-medium mb-1.5">
                  URL du serveur
                </label>
                <input
                  id="streamServerUrl"
                  type="url"
                  value={streamServerUrl}
                  onChange={(e) => setStreamServerUrl(e.target.value)}
                  placeholder="https://votre-serveur.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <a
                href="https://owncast.online/docs/quickstart/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium mt-3"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Guide d&apos;installation Owncast
              </a>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-error bg-error/10 px-4 py-2 rounded-xl">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
