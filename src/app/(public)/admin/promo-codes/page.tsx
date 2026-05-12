'use client';

import { useEffect, useState } from 'react';
import { Gift, Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/feedback/toast';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  minAmount: number;
  maxAmount: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoCodesPage() {
  const { addToast } = useToast();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxUses: 0,
    minAmount: 0,
    maxAmount: '',
    expiresAt: '',
  });

  const loadCodes = async () => {
    const res = await fetch('/api/admin/promo-codes');
    if (res.ok) setCodes(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        maxAmount: form.maxAmount ? parseInt(form.maxAmount) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      }),
    });

    if (res.ok) {
      addToast({ title: 'Code promo créé', type: 'success' });
      setShowForm(false);
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 0, minAmount: 0, maxAmount: '', expiresAt: '' });
      loadCodes();
    } else {
      const data = await res.json();
      addToast({ title: data.error || 'Erreur', type: 'error' });
    }
  };

  const handleToggle = async (code: PromoCode) => {
    const res = await fetch('/api/admin/promo-codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: code.id, isActive: !code.isActive }),
    });
    if (res.ok) loadCodes();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/admin/promo-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      addToast({ title: 'Code supprimé', type: 'success' });
      loadCodes();
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          <div className="h-12 bg-surface-hover rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Codes Promo
        </h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Nouveau code
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border p-6 space-y-4 mb-6 max-w-lg">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="EX: PROMO10" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                <option value="PERCENTAGE">Pourcentage</option>
                <option value="FIXED">Montant fixe</option>
              </select>
            </div>
            <Input label="Valeur" type="number" value={form.discountValue.toString()} onChange={(e) => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Utilisations max (0 = illimité)" type="number" value={form.maxUses.toString()} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} />
            <Input label="Montant min (XOF)" type="number" value={form.minAmount.toString()} onChange={(e) => setForm({ ...form, minAmount: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Montant max (XOF)" type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} placeholder="Optionnel" />
            <Input label="Expire le" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" type="submit">Créer</Button>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-w-2xl">
        {codes.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun code promo pour le moment</p>
          </div>
        ) : codes.map((code) => (
          <div key={code.id} className="rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">{code.code}</span>
                <button onClick={() => copyCode(code.code, code.id)} className="p-1 text-text-muted hover:text-text-primary">
                  {copiedId === code.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-text-secondary">
                {code.discountType === 'PERCENTAGE' ? `${code.discountValue}%` : `${code.discountValue} XOF`} de réduction
                {code.maxUses > 0 && ` · ${code.currentUses}/${code.maxUses} utilisations`}
                {code.minAmount > 0 && ` · min ${code.minAmount} XOF`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={code.isActive} onChange={() => handleToggle(code)} className="rounded border-border" />
                <span className="text-sm">{code.isActive ? 'Actif' : 'Inactif'}</span>
              </label>
              <button onClick={() => handleDelete(code.id)} className="p-2 text-error hover:bg-error/10 rounded-lg">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
