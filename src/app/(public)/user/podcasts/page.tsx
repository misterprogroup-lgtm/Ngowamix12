'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Music, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function UserPodcastsPage() {
  const { user } = useAuthStore();
  const [podcasts, setPodcasts] = useState<{
    id: string; title: string; slug: string; isPublished: boolean;
    _count: { episodes: number }; updatedAt: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/user/podcasts?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPodcasts(data.podcasts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-text-muted">
        <p>Connectez-vous pour gérer vos podcasts</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-linear-to-b from-primary to-accent" />
          <h1 className="text-2xl font-bold">Mes podcasts</h1>
        </div>
        <Link href="/user/podcasts/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau podcast
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-text-muted">Chargement...</p>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-4">Vous n&apos;avez pas encore de podcast</p>
          <Link href="/user/podcasts/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Créer un podcast
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface/50"
            >
              <div>
                <Link href={`/podcasts/${podcast.id}`} className="font-medium text-text-primary hover:text-primary transition-colors">
                  {podcast.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span>{podcast._count.episodes} épisode{podcast._count.episodes > 1 ? 's' : ''}</span>
                  <span className={`px-2 py-0.5 rounded-full ${podcast.isPublished ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'}`}>
                    {podcast.isPublished ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/user/podcasts/${podcast.id}/episodes/new`}>
                  <Button variant="outline" size="sm">
                    + Épisode
                  </Button>
                </Link>
                <Link href={`/user/podcasts/${podcast.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
