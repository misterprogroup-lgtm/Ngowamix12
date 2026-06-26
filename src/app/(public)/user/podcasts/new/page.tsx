'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewPodcastPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-text-muted">
        <p>Connectez-vous pour créer un podcast</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Le titre est requis'); return; }

    setSaving(true);
    setError('');

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    try {
      const res = await fetch('/api/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: title.trim(),
          slug,
          description: description.trim() || null,
          coverImage: coverImage.trim() || null,
          category: category.trim() || null,
          author: author.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la création');

      const data = await res.json();
      router.push(`/user/podcasts/${data.podcast.id}/edit`);
    } catch (err) {
      setError("Erreur lors de la création du podcast");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/user/podcasts" className="text-sm text-text-secondary hover:text-primary transition-colors mb-6 inline-block">
        ← Retour à mes podcasts
      </Link>
      <h1 className="text-2xl font-bold mb-8">Nouveau podcast</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Titre *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du podcast"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du podcast..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Musique, Culture, Société"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auteur</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nom de l'auteur"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL de l&apos;image de couverture</label>
          <Input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" variant="primary" disabled={saving} className="w-full">
          {saving ? 'Création en cours...' : 'Créer le podcast'}
        </Button>
      </form>
    </div>
  );
}
