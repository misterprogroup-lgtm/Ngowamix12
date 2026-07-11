import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Music, User } from 'lucide-react';
import { EpisodeList } from '@/components/catalog/episode-list';
import { APP_BASE_URL } from '@/lib/constants';

async function getPodcast(id: string) {
  try {
    const res = await fetch(`${APP_BASE_URL}/api/podcasts/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.podcast;
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const podcast = await getPodcast(id);
  if (!podcast) return { title: 'Podcast non trouvé' };
  return {
    title: podcast.title,
    description: podcast.description?.substring(0, 160) || `Écoutez ${podcast.title} sur Ngowamix`,
    alternates: { canonical: `/podcasts/${id}` },
    openGraph: {
      title: podcast.title,
      description: podcast.description?.substring(0, 160),
      images: podcast.coverImage ? [{ url: podcast.coverImage, width: 600, height: 600 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: podcast.title,
      description: podcast.description?.substring(0, 160),
      images: podcast.coverImage ? [podcast.coverImage] : [],
    },
  };
}

export default async function PodcastDetailPage({ params }: PageProps) {
  const { id } = await params;
  const podcast = await getPodcast(id);

  if (!podcast) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-text-muted">
        <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Podcast non trouvé</p>
        <Link href="/podcasts" className="text-primary hover:underline mt-4 inline-block">
          Voir tous les podcasts
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${APP_BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Podcasts', item: `${APP_BASE_URL}/podcasts` },
              { '@type': 'ListItem', position: 3, name: podcast.title, item: `${APP_BASE_URL}/podcasts/${id}` },
            ],
          }),
        }}
      />
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="w-full md:w-64 shrink-0">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface-hover">
            {podcast.coverImage ? (
              <SafeImage
                src={podcast.coverImage}
                alt={podcast.title}
                fill
                className="object-cover"
                sizes="256px"
                fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-16 w-16" /></div>}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <Music className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-3">{podcast.title}</h1>
          <div className="flex items-center gap-2 text-text-secondary mb-4">
            <User className="h-4 w-4" />
            <span>{podcast.author || podcast.user?.displayName || 'Podcast'}</span>
          </div>
          {podcast.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              {podcast.category}
            </span>
          )}
          {podcast.description && (
            <p className="text-text-secondary leading-relaxed max-w-2xl">
              {podcast.description}
            </p>
          )}
          <p className="text-sm text-text-muted mt-4">
            {podcast.episodes?.length || 0} épisode{(podcast.episodes?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Épisodes</h2>
        <EpisodeList episodes={podcast.episodes || []} />
      </div>
    </div>
  );
}
