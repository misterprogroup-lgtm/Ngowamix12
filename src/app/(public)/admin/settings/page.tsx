'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, DollarSign, Palette, CreditCard, Eye, EyeOff, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/components/feedback/toast';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [settings, setSettings] = useState({
    appName: 'Ngowamix',
    siteDescription: 'La plateforme de streaming musical africain',
    supportEmail: 'support@ngowamix.com',
    premiumPrice: '1500',
    premiumCurrency: 'XOF',
    downloadQuota: '30',
    primaryColor: '#f97316',
    fontFamily: 'Inter',
    customCss: '',
  });

  const [providers, setProviders] = useState<any[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.siteConfig) {
          setSettings({
            appName: data.siteConfig.appName || 'Ngowamix',
            siteDescription: data.siteConfig.siteDescription || '',
            supportEmail: data.siteConfig.supportEmail || '',
            premiumPrice: data.siteConfig.premiumPrice?.toString() || '1500',
            premiumCurrency: data.siteConfig.premiumCurrency || 'XOF',
            downloadQuota: data.siteConfig.downloadQuota?.toString() || '30',
            primaryColor: data.siteConfig.primaryColor || '#f97316',
            fontFamily: data.siteConfig.fontFamily || 'Inter',
            customCss: data.siteConfig.customCss || '',
          });
        }
        setProviders(data.paymentProviders || []);
      })
      .catch(() => addToast({ title: 'Erreur de chargement', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'site', data: settings }),
      });
      if (res.ok) {
        addToast({ title: 'Paramètres sauvegardés', type: 'success' });
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error) {
      addToast({ title: error instanceof Error ? error.message : 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProvider = async (provider: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment-provider', data: provider }),
      });
      if (res.ok) {
        addToast({ title: `${provider.merchantName} mis à jour`, type: 'success' });
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error) {
      addToast({ title: error instanceof Error ? error.message : 'Erreur', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setSending(true);
    setTestStatus(null);
    setTestError('');
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      if (res.ok) {
        setTestStatus('success');
      } else {
        const data = await res.json();
        setTestStatus('error');
        setTestError(data.error || "Échec de l'envoi");
      }
    } catch {
      setTestStatus('error');
      setTestError('Erreur de connexion');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 pb-24">
        <div className="animate-pulse space-y-6 max-w-2xl">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          <div className="h-12 bg-surface-hover rounded" />
          <div className="h-12 bg-surface-hover rounded" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: <Settings className="h-4 w-4" /> },
    { id: 'pricing', label: 'Tarifs', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'payment', label: 'Paiement', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'appearance', label: 'Apparence', icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        Paramètres
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      <div className="max-w-2xl space-y-6">
        {activeTab === 'general' && (
          <>
            <Input
              label="Nom du site"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            />
            <Input
              label="Description du site"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            />
            <Input
              label="Email de support"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
            <div className="rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Test d'envoi d'email
              </h3>
              <p className="text-sm text-text-secondary">
                Envoyez un email de test pour vérifier la configuration Resend.
              </p>
              <div className="flex items-center gap-3">
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  onClick={handleTestEmail}
                  isLoading={sending}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Envoyer
                </Button>
              </div>
              {testStatus && (
                <div className={cn(
                  'flex items-center gap-2 text-sm p-3 rounded-lg',
                  testStatus === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                )}>
                  {testStatus === 'success' ? (
                    <><CheckCircle2 className="h-4 w-4" /> Email envoyé avec succès</>
                  ) : (
                    <><XCircle className="h-4 w-4" /> {testError || "Échec de l'envoi"}</>
                  )}
                </div>
              )}
            </div>
            <Button variant="primary" size="lg" onClick={handleSaveGeneral} isLoading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </>
        )}

        {activeTab === 'pricing' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prix Premium (XOF/mois)"
                type="number"
                value={settings.premiumPrice}
                onChange={(e) => setSettings({ ...settings, premiumPrice: e.target.value })}
                min="0"
              />
              <Input
                label="Devise"
                value={settings.premiumCurrency}
                onChange={(e) => setSettings({ ...settings, premiumCurrency: e.target.value })}
              />
            </div>
            <Input
              label="Quota téléchargements mensuel (Premium)"
              type="number"
              value={settings.downloadQuota}
              onChange={(e) => setSettings({ ...settings, downloadQuota: e.target.value })}
              min="1"
            />
            <div className="rounded-lg border border-border p-4 bg-surface">
              <p className="text-sm text-text-secondary">
                Les modifications de tarifs s&apos;appliqueront aux nouveaux abonnements. Les abonnements existants conservent leur tarif actuel jusqu&apos;au prochain renouvellement.
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={handleSaveGeneral} isLoading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les tarifs
            </Button>
          </>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <p className="text-sm text-text-secondary">
              Configurez vos moyens de paiement. Les clés API sont stockées dans la base de données et utilisées lors des transactions.
            </p>

            {[
              { provider: 'STRIPE', merchantName: 'Stripe', description: 'Cartes bancaires internationales (Visa, Mastercard)', isActive: false, apiKey: '', siteId: '' },
              { provider: 'CINETPAY', merchantName: 'CinetPay', description: 'Mobile Money (Wave, Orange Money, MTN, Moov, Free Money) et cartes bancaires', isActive: false, apiKey: '', siteId: '' },
              { provider: 'PAWAPAY', merchantName: 'PawaPay', description: 'Mobile Money (Wave, Orange Money, MTN, Moov, Free Money)', isActive: false, apiKey: '', siteId: '' },
            ].map((defaultProvider) => {
              const dbProvider = providers.find((p: any) => p.provider === defaultProvider.provider);
              return dbProvider || defaultProvider;
            }).map((provider) => (
              <div key={provider.id || provider.provider} className="rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{provider.merchantName || provider.provider}</h3>
                    <p className="text-sm text-text-secondary">{provider.description}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={provider.isActive}
                      onChange={(e) => {
                        const newProviders = providers.map((p) =>
                          p.provider === provider.provider
                            ? { ...p, isActive: e.target.checked }
                            : p
                        );
                        if (!providers.find((p) => p.provider === provider.provider)) {
                          newProviders.push({ ...provider, isActive: e.target.checked });
                        }
                        setProviders(newProviders);
                      }}
                      className="rounded border-border bg-surface text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Activé</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      label="Clé API"
                      type={showKeys[provider.id || provider.provider] ? 'text' : 'password'}
                      value={provider.apiKey || ''}
                      onChange={(e) => {
                        const newProviders = providers.map((p) =>
                          p.provider === provider.provider
                            ? { ...p, apiKey: e.target.value }
                            : p
                        );
                        if (!providers.find((p) => p.provider === provider.provider)) {
                          newProviders.push({ ...provider, apiKey: e.target.value });
                        }
                        setProviders(newProviders);
                      }}
                      placeholder={`Entrez la clé API ${provider.merchantName || provider.provider}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider.id || provider.provider)}
                      className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary"
                    >
                      {showKeys[provider.id || provider.provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={saving}
                    onClick={() => handleSaveProvider(provider)}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Enregistrer {provider.merchantName || provider.provider}
                  </Button>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-border p-4 bg-surface">
              <h4 className="font-medium text-sm mb-1">Méthode de paiement</h4>
              <p className="text-sm text-text-secondary">
                <strong>PawaPay</strong> — Mobile Money (Wave, Orange Money, MTN, Moov, Free Money)
              </p>
              <p className="text-sm text-text-secondary mt-1">
                <strong>CinetPay</strong> — Mobile Money (Wave, Orange Money, MTN, Moov, Free Money) et cartes bancaires (Visa, Mastercard)
              </p>
              <p className="text-sm text-text-secondary mt-1">
                <strong>Stripe</strong> — Cartes bancaires internationales (Visa, Mastercard, American Express)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <p className="text-sm text-text-secondary">
              Personnalisez l&apos;apparence de votre site.
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Couleur principale</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="h-10 w-16 rounded border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="#f97316"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Police</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              >
                <option value="Inter">Inter</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
                <option value="system-ui">System UI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CSS personnalisé</label>
              <textarea
                value={settings.customCss}
                onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="/* Ajoutez votre CSS ici */"
              />
            </div>

            <Button variant="primary" size="lg" onClick={handleSaveGeneral} isLoading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer l&apos;apparence
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
