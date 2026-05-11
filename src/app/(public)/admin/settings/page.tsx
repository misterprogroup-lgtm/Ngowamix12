'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, DollarSign, Download, Palette, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/components/feedback/toast';

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
    premiumPrice: '5000',
    premiumCurrency: 'XOF',
    downloadQuota: '30',
  });

  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.siteConfig) {
          setSettings({
            appName: data.siteConfig.appName || 'Ngowamix',
            siteDescription: data.siteConfig.siteDescription || '',
            supportEmail: data.siteConfig.supportEmail || '',
            premiumPrice: data.siteConfig.premiumPrice?.toString() || '5000',
            premiumCurrency: data.siteConfig.premiumCurrency || 'XOF',
            downloadQuota: data.siteConfig.downloadQuota?.toString() || '30',
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
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
    <div className="container mx-auto px-4 py-8 pb-24">
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

            {(providers.length === 0 ? [{ provider: 'CINETPAY', merchantName: 'CinetPay', description: 'Mobile Money (Wave, Orange Money, MTN, Moov, Free Money) et cartes bancaires', isActive: true, apiKey: '', siteId: '' }] : providers).map((provider) => (
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
                        const newProviders = providers.length === 0
                          ? [{ ...provider, isActive: e.target.checked }]
                          : providers.map((p) => (p.id === provider.id ? { ...p, isActive: e.target.checked } : p));
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
                        const newProviders = providers.length === 0
                          ? [{ ...provider, apiKey: e.target.value }]
                          : providers.map((p) => (p.id === provider.id ? { ...p, apiKey: e.target.value } : p));
                        setProviders(newProviders);
                      }}
                      placeholder="Entrez la clé API CinetPay"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider.id || provider.provider)}
                      className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary"
                    >
                      {showKeys[provider.id || provider.provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="Site ID"
                      type={showKeys[`${provider.id || provider.provider}_site`] ? 'text' : 'password'}
                      value={provider.siteId || ''}
                      onChange={(e) => {
                        const newProviders = providers.length === 0
                          ? [{ ...provider, siteId: e.target.value }]
                          : providers.map((p) => (p.id === provider.id ? { ...p, siteId: e.target.value } : p));
                        setProviders(newProviders);
                      }}
                      placeholder="Entrez le Site ID CinetPay"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(`${provider.id || provider.provider}_site`)}
                      className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary"
                    >
                      {showKeys[`${provider.id || provider.provider}_site`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <h4 className="font-medium text-sm mb-1">Méthodes de paiement acceptées</h4>
              <p className="text-sm text-text-secondary">
                <strong>CinetPay</strong> — Mobile Money (Wave, Orange Money, MTN, Moov, Free Money) et cartes bancaires (Visa, Mastercard)
              </p>
              <p className="text-sm text-text-secondary mt-1">
                <strong>Stripe</strong> — Cartes bancaires internationales (Visa, Mastercard, American Express)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary">Personnalisation visuelle disponible en V2</p>
          </div>
        )}
      </div>
    </div>
  );
}
