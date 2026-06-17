'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [podcastId, setPodcastId] = useState('');
  const [podcastTitle, setPodcastTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState('');
  const [duration, setDuration] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setPodcastId(id);
      try {
        const res = await fetch(`/api/podcasts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPodcastTitle(data.podcast.title);
          setEpisodeNumber(String((data.podcast.episodes?.length || 0) + 1));
        }
      } catch {}
    };
    init();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !audioFile.trim()) {
      setError('Le titre et le fichier audio sont requis');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/podcasts/${podcastId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          audioFile: audioFile.trim(),
          duration: parseInt(duration) || 0,
          episodeNumber: parseInt(episodeNumber) || 1,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création");

      router.push(`/user/podcasts/${podcastId}/edit`);
    } catch (err) {
      setError("Erreur lors de la création de l'épisode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Link href={`/user/podcasts/${podcastId}/edit`} className="text-sm text-text-secondary hover:text-primary transition-colors mb-6 inline-block">
        ← Retour au podcast
      </Link>
      <h1 className="text-2xl font-bold mb-2">Nouvel épisode</h1>
      {podcastTitle && (
        <p className="text-text-muted mb-8">Pour : {podcastTitle}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Titre *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'épisode"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de l'épisode..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL du fichier audio *</label>
          <div className="flex items-center gap-2">
            <Input
              value={audioFile}
              onChange={(e) => setAudioFile(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <p className="text-xs text-text-muted mt-1">
            Utilisez UploadThing ou un hébergement externe pour votre fichier audio
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Durée (secondes)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Numéro d&apos;épisode</label>
            <Input
              type="number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" variant="primary" disabled={saving} className="w-full">
          {saving ? 'Création en cours...' : 'Ajouter l\'épisode'}
        </Button>
      </form>
    </div>
  );
}
