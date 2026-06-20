'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Pencil, X, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadthingUpload } from '@/components/ui/uploadthing-upload';
import { useToast } from '@/components/feedback/toast';

interface Ad {
  id: string;
  image: string;
  sponsor: string;
  text: string;
  link: string | null;
  audioFile: string | null;
  placement: 'POPUP' | 'BANNER' | 'SIDEBAR' | 'AUDIO';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const PLACEMENT_LABELS: Record<string, string> = {
  POPUP: 'Popup',
  BANNER: 'Bannière',
  SIDEBAR: 'Sidebar',
  AUDIO: 'Audio',
};

export default function AdminAdsPage() {
  const { addToast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    image: '',
    sponsor: '',
    text: '',
    link: '',
    audioFile: '',
    placement: 'POPUP',
    isActive: true,
    sortOrder: 0,
  });

  const loadAds = async () => {
    const res = await fetch('/api/admin/ads');
    if (res.ok) setAds(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadAds(); }, []);

  const resetForm = () => {
    setForm({ image: '', sponsor: '', text: '', link: '', audioFile: '', placement: 'POPUP', isActive: true, sortOrder: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ad: Ad) => {
    setForm({
      image: ad.image,
      sponsor: ad.sponsor,
      text: ad.text,
      link: ad.link || '',
      audioFile: ad.audioFile || '',
      placement: ad.placement,
      isActive: ad.isActive,
      sortOrder: ad.sortOrder,
    });
    setEditingId(ad.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const res = await fetch(`/api/admin/ads/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addToast({ title: 'Publicité modifiée', type: 'success' });
        resetForm();
        loadAds();
      } else {
        const data = await res.json();
        addToast({ title: data.error || 'Erreur', type: 'error' });
      }
    } else {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addToast({ title: 'Publicité créée', type: 'success' });
        resetForm();
        loadAds();
      } else {
        const data = await res.json();
        addToast({ title: data.error || 'Erreur', type: 'error' });
      }
    }
  };

  const handleToggle = async (ad: Ad) => {
    const res = await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    if (res.ok) loadAds();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      addToast({ title: 'Publicité supprimée', type: 'success' });
      loadAds();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 pb-24">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-10 w-48 bg-surface-hover rounded-sm" />
          <div className="h-12 bg-surface-hover rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Publicités
        </h1>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle pub
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border p-6 space-y-4 mb-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            {form.image && (
              <div className="relative h-32 rounded-lg overflow-hidden bg-surface-hover mb-2">
                <img src={form.image} alt="Aperçu" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="space-y-2">
              <UploadthingUpload
                endpoint="adImage"
                onUploadComplete={(url) => setForm({ ...form, image: url })}
              />
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-text-muted">ou</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Coller une URL d'image..." />
            </div>
          </div>
          {form.placement === 'AUDIO' && (
            <div>
              <label className="block text-sm font-medium mb-1">Fichier audio</label>
              {form.audioFile && (
                <div className="flex items-center gap-2 rounded-lg bg-surface-hover p-2 mb-2">
                  <audio src={form.audioFile} controls className="h-10 flex-1" />
                  <button type="button" onClick={() => setForm({ ...form, audioFile: '' })} className="p-1 text-text-muted hover:text-error">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <UploadthingUpload
                endpoint="adAudio"
                onUploadComplete={(url) => setForm({ ...form, audioFile: url })}
              />
            </div>
          )}
          <Input label="Sponsor" value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} placeholder="Orange Money" />
          <Input label="Texte" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Rechargez facilement..." />
          <Input label="Lien (optionnel)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Emplacement</label>
              <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                <option value="POPUP">Popup</option>
                <option value="BANNER">Bannière</option>
                <option value="SIDEBAR">Sidebar</option>
                <option value="AUDIO">Audio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordre</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded-sm border-border" />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" type="submit">{editingId ? 'Modifier' : 'Créer'}</Button>
            <Button variant="outline" type="button" onClick={resetForm}>Annuler</Button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-w-2xl">
        {ads.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucune publicité pour le moment</p>
          </div>
        ) : ads.map((ad) => (
          <div key={ad.id} className="rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="h-16 w-24 rounded-lg overflow-hidden bg-surface-hover shrink-0">
              <img src={ad.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{ad.sponsor}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary">{PLACEMENT_LABELS[ad.placement]}</span>
              </div>
              <p className="text-sm text-text-secondary truncate">{ad.text}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ad.isActive} onChange={() => handleToggle(ad)} className="rounded-sm border-border" />
                <span className="text-sm">{ad.isActive ? 'Actif' : 'Inactif'}</span>
              </label>
              <button onClick={() => handleEdit(ad)} className="p-2 text-text-muted hover:text-primary rounded-lg">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(ad.id)} className="p-2 text-error hover:bg-error/10 rounded-lg">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
