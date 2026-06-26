'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EpisodeList } from '@/components/catalog/episode-list';

export default function EditPodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [podcastId, setPodcastId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [episodes, setEpisodes] = useState<{
    id: string; title: string; description: string | null;
    audioFile: string; duration: number; episodeNumber: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setPodcastId(id);
      if (!user) return;

      try {
        const res = await fetch(`/api/podcasts/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        const p = data.podcast;
        setTitle(p.title);
        setDescription(p.description || '');
        setCategory(p.category || '');
        setAuthor(p.author || '');
        setCoverImage(p.coverImage || '');
        setIsPublished(p.isPublished);
        setEpisodes(p.episodes || []);
      } catch {
        setError('Podcast non trouvé');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Le titre est requis'); return; }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/podcasts/${podcastId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          coverImage: coverImage.trim() || null,
          category: category.trim() || null,
          author: author.trim() || null,
          isPublished,
        }),
      });

      if (!res.ok) throw new Error('Erreur');
      router.refresh();
    } catch {
      setError('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm("Supprimer cet épisode ?")) return;
    try {
      await fetch(`/api/podcasts/${podcastId}/episodes/${episodeId}`, {
        method: 'DELETE',
      });
      setEpisodes((prev) => prev.filter((e) => e.id !== episodeId));
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-text-muted">Chargement...</div>;
  if (error && !title) return <div className="container mx-auto px-4 py-20 text-center text-text-muted">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/user/podcasts" className="text-sm text-text-secondary hover:text-primary transition-colors mb-6 inline-block">
        ← Retour à mes podcasts
      </Link>
      <h1 className="text-2xl font-bold mb-8">Modifier le podcast</h1>

      <form onSubmit={handleSubmit} className="space-y-6 mb-12">
        <div>
          <label className="block text-sm font-medium mb-2">Titre *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auteur</label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL de l&apos;image</label>
          <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded-sm border-border"
          />
          <span className="text-sm">Publié</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>

      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Épisodes</h2>
          <Link href={`/user/podcasts/${podcastId}/episodes/new`}>
            <Button variant="primary" size="sm">
              + Ajouter un épisode
            </Button>
          </Link>
        </div>
        <EpisodeList episodes={episodes} isAdmin onDelete={handleDeleteEpisode} />
      </div>
    </div>
  );
}
