import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Music, Repeat2, Heart, UserPlus, Disc3 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Fil d\'actualité',
  description: 'Suivez les dernières activités de vos artistes préférés sur Ngowamix : nouveaux morceaux, albums, et interactions.',
  alternates: { canonical: '/feed' },
};

export const dynamic = 'force-dynamic';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  REPOST_TRACK: <Repeat2 className="h-4 w-4 text-accent" />,
  REPOST_ALBUM: <Repeat2 className="h-4 w-4 text-accent" />,
  NEW_TRACK: <Music className="h-4 w-4 text-primary" />,
  NEW_ALBUM: <Disc3 className="h-4 w-4 text-primary" />,
  FOLLOW_ARTIST: <UserPlus className="h-4 w-4 text-success" />,
  FAVORITE_TRACK: <Heart className="h-4 w-4 text-danger" />,
  FAVORITE_ALBUM: <Heart className="h-4 w-4 text-danger" />,
};

const TYPE_LABELS: Record<string, string> = {
  REPOST_TRACK: 'a repartagé un titre',
  REPOST_ALBUM: 'a repartagé un album',
  NEW_TRACK: 'a publié un nouveau titre',
  NEW_ALBUM: 'a publié un nouvel album',
  FOLLOW_ARTIST: 'suit maintenant',
  FAVORITE_TRACK: 'a aimé un titre',
  FAVORITE_ALBUM: 'a aimé un album',
};

export default async function FeedPage() {
  const user = await getCurrentUser();

  const followedArtistIds = user
    ? (await db.favorite.findMany({
        where: { userId: user.sub, artistId: { not: null } },
        select: { artistId: true },
      })).map((f) => f.artistId).filter(Boolean) as string[]
    : [];

  const followedUserIds = followedArtistIds.length > 0
    ? (await db.artist.findMany({
        where: { id: { in: followedArtistIds } },
        select: { userId: true },
      })).map((a) => a.userId)
    : [];

  const activities = await db.activity.findMany({
    where: followedUserIds.length > 0 ? { userId: { in: followedUserIds } } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
          user: { select: { id: true, displayName: true, avatar: true } },
          track: {
            select: {
              id: true, title: true, slug: true, duration: true,
              album: { select: { slug: true, coverImage: true, artist: { select: { name: true, slug: true } } } },
            },
          },
          album: {
            select: {
              id: true, title: true, slug: true, coverImage: true,
              artist: { select: { name: true, slug: true } },
            },
          },
          artist: {
            select: { id: true, name: true, slug: true, avatar: true },
          },
        },
      });

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Fil d&apos;actualité</h1>

      {!user ? (
        <div className="text-center py-12 text-text-muted">
          <p>Connectez-vous pour voir votre fil d&apos;actualité</p>
          <Link href={ROUTES.LOGIN}>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Connexion</button>
          </Link>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Suivez des artistes pour voir leurs activités ici</p>
          <Link href={ROUTES.EXPLORE}>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Explorer</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-4 rounded-xl border border-border">
              <div className="mt-1 flex-shrink-0">
                {TYPE_ICONS[activity.type] || <Music className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {activity.user.displayName || 'Artiste'}
                  </span>
                  <span className="text-xs text-text-muted">
                    {TYPE_LABELS[activity.type]}
                  </span>
                </div>
                {activity.track && (
                  <Link
                    href={`/album/${activity.track.album.slug}/${activity.track.slug}`}
                    className="block text-sm text-text-secondary hover:text-primary truncate"
                  >
                    {activity.track.title}
                  </Link>
                )}
                {activity.album && (
                  <Link
                    href={`/album/${activity.album.slug}`}
                    className="block text-sm text-text-secondary hover:text-primary truncate"
                  >
                    {activity.album.title}
                  </Link>
                )}
                {activity.artist && (
                  <Link
                    href={`/artist/${activity.artist.slug}`}
                    className="block text-sm text-text-secondary hover:text-primary truncate"
                  >
                    {activity.artist.name}
                  </Link>
                )}
                <p className="text-xs text-text-muted mt-1">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
