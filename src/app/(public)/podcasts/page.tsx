import { PodcastCard } from '@/components/catalog/podcast-card';

async function getPodcasts() {
  try {
    const res = await fetch(
      `${process.env.APP_URL || 'http://localhost:3000'}/api/podcasts?limit=20`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.podcasts || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Podcasts - Ngowamix',
  description: 'Découvrez des podcasts sur Ngowamix',
  alternates: { canonical: '/podcasts' },
};

export default async function PodcastsPage() {
  const podcasts = await getPodcasts();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
        <h1 className="text-2xl font-bold">Podcasts</h1>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <p className="text-lg">Aucun podcast disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {podcasts.map((podcast: {
            id: string; title: string; slug: string;
            coverImage: string | null; description: string | null;
            author: string | null;
            user: { displayName: string | null; avatar: string | null } | null;
            _count: { episodes: number };
          }) => (
            <PodcastCard
              key={podcast.id}
              id={podcast.id}
              title={podcast.title}
              slug={podcast.slug}
              coverImage={podcast.coverImage}
              description={podcast.description}
              episodeCount={podcast._count.episodes}
              author={podcast.author}
              user={podcast.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
