'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Music, Upload, Edit, Trash2, Eye, Ticket, Disc, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { GENRES, COUNTRIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

const releaseTypes = [
  { value: 'ALBUM', label: 'Album' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'EP', label: 'EP' },
];

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'En attente',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
};

const statusVariants: Record<string, 'default' | 'warning' | 'success' | 'error' | 'secondary'> = {
  DRAFT: 'secondary',
  SUBMITTED: 'warning',
  VALIDATED: 'success',
  PUBLISHED: 'success',
  REJECTED: 'error',
};

interface Release {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  price: string;
  coverImage: string | null;
  _count: { tracks: number };
  createdAt: string;
}

interface Concert {
  id: string;
  title: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  time: string;
  price: number;
  vipPrice: number | null;
  totalTickets: number;
  availableTickets: number;
  poster: string | null;
  isActive: boolean;
}

export default function ArtistCatalog() {
  const [activeTab, setActiveTab] = useState<'albums' | 'concerts'>('albums');
  const [releases, setReleases] = useState<Release[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'SINGLE',
    title: '',
    description: '',
    genre: '',
    country: '',
    price: '',
    releaseDate: '',
    isPremiumOnly: false,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [showConcertModal, setShowConcertModal] = useState(false);
  const [concertData, setConcertData] = useState({
    title: '',
    venue: '',
    city: '',
    country: '',
    date: '',
    time: '',
    description: '',
    totalTickets: '',
    price: '',
    vipPrice: '',
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);

  useEffect(() => {
    if (activeTab === 'albums') fetchReleases();
    else fetchConcerts();
  }, [activeTab]);

  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/artist/albums');
      const data = await res.json();
      setReleases(data.albums || []);
    } catch (error) {
      console.error('Fetch releases error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConcerts = async () => {
    try {
      const res = await fetch('/api/artist/concerts');
      const data = await res.json();
      setConcerts(data.concerts || []);
    } catch (error) {
      console.error('Fetch concerts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const fd = new FormData();
      fd.append('type', formData.type);
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('genre', formData.genre);
      fd.append('country', formData.country);
      fd.append('price', formData.price || (formData.type === 'SINGLE' ? '0' : '0'));
      fd.append('releaseDate', formData.releaseDate || new Date().toISOString());
      fd.append('isPremiumOnly', formData.type === 'SINGLE' ? 'false' : formData.isPremiumOnly.toString());
      if (coverFile) fd.append('cover', coverFile);

      const res = await fetch('/api/artist/albums', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setShowCreateModal(false);
      setFormData({ type: 'SINGLE', title: '', description: '', genre: '', country: '', price: '', releaseDate: '', isPremiumOnly: false });
      setCoverFile(null);
      fetchReleases();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateConcert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const fd = new FormData();
      Object.entries(concertData).forEach(([key, value]) => fd.append(key, value));
      if (posterFile) fd.append('poster', posterFile);

      const res = await fetch('/api/artist/concerts', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setShowConcertModal(false);
      setConcertData({ title: '', venue: '', city: '', country: '', date: '', time: '', description: '', totalTickets: '', price: '', vipPrice: '' });
      setPosterFile(null);
      fetchConcerts();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConcert = async (id: string) => {
    if (!confirm('Supprimer ce concert ?')) return;
    try {
      await fetch(`/api/artist/concerts?id=${id}`, { method: 'DELETE' });
      fetchConcerts();
    } catch {}
  };

  const handleDeleteRelease = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/artist/albums?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la suppression');
        return;
      }
      fetchReleases();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-hover rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'SINGLE': return <FileAudio className="h-4 w-4" />;
      case 'EP': return <Disc className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE': return 'Single';
      case 'EP': return 'EP';
      default: return 'Album';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mon catalogue</h1>
        <div className="flex gap-2">
          {activeTab === 'albums' ? (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau titre
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowConcertModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau concert
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'albums' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('albums')}
        >
          <Music className="h-4 w-4 mr-2" />
          Albums & Singles
        </Button>
        <Button
          variant={activeTab === 'concerts' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('concerts')}
        >
          <Ticket className="h-4 w-4 mr-2" />
          Concerts
        </Button>
      </div>

      {activeTab === 'albums' && (
        <>
          {releases.length === 0 ? (
            <div className="text-center py-16">
              <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-medium text-text-secondary mb-2">Aucun album ou single</h2>
              <p className="text-text-muted mb-6">Publiez votre premier single ou album pour commencer</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Publier un single
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {releases.map((release) => (
                <div key={release.id} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {release.coverImage ? (
                      <img src={release.coverImage} alt={release.title} className="h-20 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-surface-hover flex items-center justify-center">
                        <Music className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{release.title}</h3>
                        <Badge variant="secondary" className="shrink-0">
                          {typeIcon(release.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={statusVariants[release.status] || 'default'}>
                          {statusLabels[release.status] || release.status}
                        </Badge>
                        <span className="text-xs text-text-muted">{release._count.tracks} titre{release._count.tracks !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-sm text-accent mt-1">
                        {release.type === 'SINGLE' ? 'Gratuit' : formatPrice(Number(release.price))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Link href={`/album/${release.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    <Link href={`/artist/catalog/${release.id}`}>
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Pistes
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-error/80"
                      onClick={() => handleDeleteRelease(release.id, release.title)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'concerts' && (
        <>
          {concerts.length === 0 ? (
            <div className="text-center py-16">
              <Ticket className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-medium text-text-secondary mb-2">Aucun concert</h2>
              <p className="text-text-muted mb-6">Créez votre premier événement pour vendre des tickets</p>
              <Button variant="primary" onClick={() => setShowConcertModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un concert
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {concerts.map((concert) => (
                <div key={concert.id} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {concert.poster ? (
                      <img src={concert.poster} alt={concert.title} className="h-20 w-20 rounded-lg object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-surface-hover flex items-center justify-center">
                        <Ticket className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{concert.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">{concert.venue}, {concert.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={concert.isActive ? 'success' : 'secondary'}>
                          {concert.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                        <span className="text-xs text-text-muted">{concert.availableTickets} places dispo.</span>
                      </div>
                      <p className="text-sm text-accent mt-1">{concert.price.toLocaleString('fr-FR')} F CFA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Link href={`/tickets/${concert.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteConcert(concert.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Release Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Publier un titre">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Type de release"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={releaseTypes.map((t) => ({ value: t.value, label: t.label }))}
          />

          <Input
            label="Titre"
            placeholder={formData.type === 'SINGLE' ? 'Nom du single' : formData.type === 'EP' ? 'Nom de l\'EP' : 'Nom de l\'album'}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner un genre' },
                ...GENRES.map((g) => ({ value: g, label: g })),
              ]}
            />
            <Select
              label="Pays"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner un pays' },
                ...COUNTRIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          {formData.type !== 'SINGLE' && (
            <Input
              type="number"
              label="Prix (XOF)"
              placeholder="2000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              min="0"
            />
          )}

          {formData.type === 'SINGLE' && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
              Les singles sont gratuits pour le streaming et le téléchargement.
            </div>
          )}

          <Input
            type="date"
            label="Date de sortie"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
          />

          <FileUpload
            label="Cover"
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            onChange={setCoverFile}
          />

          {formData.type !== 'SINGLE' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremiumOnly}
                onChange={(e) => setFormData({ ...formData, isPremiumOnly: e.target.checked })}
                className="rounded border-border bg-surface"
              />
              <span className="text-sm text-text-secondary">Réservé aux abonnés Premium</span>
            </label>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={creating}>
            <Plus className="h-4 w-4 mr-2" />
            Publier {formData.type === 'SINGLE' ? 'le single' : formData.type === 'EP' ? 'l\'EP' : 'l\'album'}
          </Button>
        </form>
      </Modal>

      {/* Create Concert Modal */}
      <Modal isOpen={showConcertModal} onClose={() => setShowConcertModal(false)} title="Créer un concert">
        <form onSubmit={handleCreateConcert} className="space-y-4">
          <Input
            label="Nom du concert"
            placeholder="Ex: Afro King Live à Abidjan"
            value={concertData.title}
            onChange={(e) => setConcertData({ ...concertData, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Description de l'événement..."
            value={concertData.description}
            onChange={(e) => setConcertData({ ...concertData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Lieu"
              placeholder="Ex: Palais de la Culture"
              value={concertData.venue}
              onChange={(e) => setConcertData({ ...concertData, venue: e.target.value })}
              required
            />
            <Input
              label="Ville"
              placeholder="Ex: Abidjan"
              value={concertData.city}
              onChange={(e) => setConcertData({ ...concertData, city: e.target.value })}
              required
            />
          </div>

          <Select
            label="Pays"
            value={concertData.country}
            onChange={(e) => setConcertData({ ...concertData, country: e.target.value })}
            options={[
              { value: '', label: 'Sélectionner un pays' },
              ...COUNTRIES.map((c) => ({ value: c, label: c })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Date"
              value={concertData.date}
              onChange={(e) => setConcertData({ ...concertData, date: e.target.value })}
              required
            />
            <Input
              type="time"
              label="Heure"
              value={concertData.time}
              onChange={(e) => setConcertData({ ...concertData, time: e.target.value })}
              required
            />
          </div>

          <Input
            type="number"
            label="Places totales"
            placeholder="500"
            value={concertData.totalTickets}
            onChange={(e) => setConcertData({ ...concertData, totalTickets: e.target.value })}
            min="1"
            required
          />

          <Input
            type="number"
            label="Prix du ticket standard (XOF)"
            placeholder="5000"
            value={concertData.price}
            onChange={(e) => setConcertData({ ...concertData, price: e.target.value })}
            min="0"
            required
          />

          <Input
            type="number"
            label="Prix VIP (XOF) - optionnel"
            placeholder="15000"
            value={concertData.vipPrice}
            onChange={(e) => setConcertData({ ...concertData, vipPrice: e.target.value })}
            min="0"
          />

          <FileUpload
            label="Affiche du concert"
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            onChange={setPosterFile}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={creating}>
            <Plus className="h-4 w-4 mr-2" />
            Créer le concert
          </Button>
        </form>
      </Modal>
    </div>
  );
}
