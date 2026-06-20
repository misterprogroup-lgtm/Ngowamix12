import { db } from './db';

type TrackRecommendation = {
  id: string;
  title: string;
  slug: string;
  duration: number;
  audioFile: string;
  playCount: number;
  album: {
    id: string;
    title: string;
    coverImage: string | null;
    genre: string | null;
    artist: { id: string; name: string; slug: string };
  };
  score: number;
  reason: string;
};

export async function getRecommendations(
  userId: string | null,
  limit = 20
): Promise<TrackRecommendation[]> {
  if (!userId) return getPopularTracks(limit);

  const [topGenres, listenedTrackIds, favoriteArtistIds, favoriteGenre] = await Promise.all([
    getUserTopGenres(userId),
    getUserListenedTrackIds(userId),
    getUserFavoriteArtistIds(userId),
    getUserFavoriteGenre(userId),
  ]);

  const seenTrackIds = new Set(listenedTrackIds);
  const recommendations: TrackRecommendation[] = [];
  const usedTrackIds = new Set<string>();

  const addWithDedup = (tracks: TrackRecommendation[]) => {
    for (const t of tracks) {
      if (!usedTrackIds.has(t.id) && !seenTrackIds.has(t.id)) {
        usedTrackIds.add(t.id);
        recommendations.push(t);
      }
    }
  };

  // 1. Content-based: same genre as top listened genres
  if (topGenres.length > 0) {
    const genreTracks = await getTracksByGenres(topGenres, 15, listenedTrackIds);
    addWithDedup(genreTracks.map((t) => ({ ...t, score: 0.9, reason: 'Dans ton genre préféré' })));
  }

  // 2. Collaborative: users who listened to same tracks
  if (listenedTrackIds.length > 0) {
    const collabTracks = await getCollaborativeTracks(userId, listenedTrackIds, 10);
    addWithDedup(collabTracks.map((t) => ({ ...t, score: 0.8, reason: 'Recommandé pour toi' })));
  }

  // 3. Favorite artists' other tracks
  if (favoriteArtistIds.length > 0) {
    const artistTracks = await getTracksByArtists(favoriteArtistIds, 10, listenedTrackIds);
    addWithDedup(artistTracks.map((t) => ({ ...t, score: 0.85, reason: 'De ton artiste favori' })));
  }

  // 4. Same genre as favorite genre
  if (favoriteGenre) {
    const genreTracks2 = await getTracksByGenres([favoriteGenre], 8, listenedTrackIds);
    addWithDedup(genreTracks2.map((t) => ({ ...t, score: 0.75, reason: 'Dans ton style' })));
  }

  // 5. Popular tracks to fill remaining slots
  if (recommendations.length < limit) {
    const popular = await getPopularTracks(limit * 2);
    addWithDedup(popular.map((t) => ({ ...t, score: 0.5, reason: 'Tendances' })));
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getArtistRecommendations(
  userId: string | null,
  limit = 10
): Promise<{ id: string; name: string; slug: string; avatar: string | null; genres: string; score: number; reason: string }[]> {
  if (!userId) return (await getPopularArtists(limit)).map((a) => ({ ...a, score: 0.5, reason: 'Populaire' }));

  const [topGenres, favoriteArtistIds] = await Promise.all([
    getUserTopGenres(userId),
    getUserFavoriteArtistIds(userId),
  ]);

  type ArtistRec = { id: string; name: string; slug: string; avatar: string | null; genres: string; score: number; reason: string };
  const recommendations: ArtistRec[] = [];
  const usedIds = new Set(favoriteArtistIds);

  if (topGenres.length > 0) {
    const artists = await db.artist.findMany({
      where: {
        genres: { in: topGenres },
        id: { notIn: favoriteArtistIds },
        isVerified: true,
        user: { role: { not: 'ADMIN' } },
      },
      take: limit,
      select: { id: true, name: true, slug: true, avatar: true, genres: true },
      orderBy: { albums: { _count: 'desc' } },
    });

    for (const a of artists) {
      if (!usedIds.has(a.id)) {
        usedIds.add(a.id);
        recommendations.push({ ...a, score: 0.8, reason: 'Dans ton genre préféré' });
      }
    }
  }

  if (recommendations.length < limit) {
    const popular = await getPopularArtists(limit);
    for (const a of popular) {
      if (!usedIds.has(a.id)) {
        usedIds.add(a.id);
        recommendations.push({ ...a, score: 0.5, reason: 'Populaire' });
      }
    }
  }

  return recommendations.slice(0, limit);
}

async function getUserTopGenres(userId: string): Promise<string[]> {
  const recentTracks = await db.listenHistory.findMany({
    where: { userId },
    orderBy: { playedAt: 'desc' },
    take: 50,
    include: { track: { include: { album: { select: { genre: true } } } } },
  });

  const genreCount = new Map<string, number>();
  for (const entry of recentTracks) {
    const genre = entry.track.album.genre;
    if (genre) genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
  }

  const favorites = await db.favorite.findMany({
    where: { userId, albumId: { not: null } },
    include: { album: { select: { genre: true } } },
    take: 30,
  });

  for (const fav of favorites) {
    const genre = fav.album?.genre;
    if (genre) genreCount.set(genre, (genreCount.get(genre) || 0) + 2);
  }

  return [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);
}

async function getUserListenedTrackIds(userId: string): Promise<string[]> {
  const history = await db.listenHistory.findMany({
    where: { userId },
    select: { trackId: true },
    distinct: ['trackId'],
    take: 200,
  });
  return history.map((h) => h.trackId);
}

async function getUserFavoriteArtistIds(userId: string): Promise<string[]> {
  const favorites = await db.favorite.findMany({
    where: { userId, artistId: { not: null } },
    select: { artistId: true },
    take: 30,
  });
  const ids = favorites.map((f) => f.artistId!).filter(Boolean);
  return [...new Set(ids)];
}

async function getUserFavoriteGenre(userId: string): Promise<string | null> {
  const favorites = await db.favorite.findMany({
    where: { userId, albumId: { not: null } },
    include: { album: { select: { genre: true } } },
    take: 20,
  });
  const genreCount = new Map<string, number>();
  for (const fav of favorites) {
    const genre = fav.album?.genre;
    if (genre) genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
  }
  return [...genreCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

async function getTracksByGenres(
  genres: string[],
  limit: number,
  excludeTrackIds: string[]
): Promise<TrackRecommendation[]> {
  const tracks = await db.track.findMany({
    where: {
      album: {
        genre: { in: genres },
        artist: { user: { role: { not: 'ADMIN' } } },
      },
      id: { notIn: excludeTrackIds },
    },
    include: {
      album: {
        select: { id: true, title: true, coverImage: true, genre: true, artist: { select: { id: true, name: true, slug: true } } },
      },
    },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  return tracks.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    duration: t.duration,
    audioFile: t.audioFile,
    playCount: t.playCount,
    album: t.album,
    score: 0,
    reason: '',
  }));
}

async function getCollaborativeTracks(
  userId: string,
  listenedTrackIds: string[],
  limit: number
): Promise<TrackRecommendation[]> {
  const similarUsers = await db.listenHistory.findMany({
    where: {
      trackId: { in: listenedTrackIds },
      userId: { not: userId },
    },
    select: { userId: true },
    take: 50,
  });

  const similarUserIds = [...new Set(similarUsers.map((s) => s.userId))];
  if (similarUserIds.length === 0) return [];

  const collabTracks = await db.listenHistory.findMany({
    where: {
      userId: { in: similarUserIds },
      trackId: { notIn: listenedTrackIds },
    },
    include: {
      track: {
        include: {
          album: {
            select: { id: true, title: true, coverImage: true, genre: true, artist: { select: { id: true, name: true, slug: true } } },
          },
        },
      },
    },
    orderBy: { playedAt: 'desc' },
    take: limit * 2,
  });

  const trackScores = new Map<string, { track: TrackRecommendation; count: number }>();
  for (const entry of collabTracks) {
    if (trackScores.has(entry.trackId)) {
      trackScores.get(entry.trackId)!.count++;
    } else {
      trackScores.set(entry.trackId, {
        track: {
          id: entry.track.id,
          title: entry.track.title,
          slug: entry.track.slug,
          duration: entry.track.duration,
          audioFile: entry.track.audioFile,
          playCount: entry.track.playCount,
          album: entry.track.album,
          score: 0,
          reason: '',
        },
        count: 1,
      });
    }
  }

  return [...trackScores.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([_, { track }]) => track);
}

async function getTracksByArtists(
  artistIds: string[],
  limit: number,
  excludeTrackIds: string[]
): Promise<TrackRecommendation[]> {
  const tracks = await db.track.findMany({
    where: {
      album: { artistId: { in: artistIds } },
      id: { notIn: excludeTrackIds },
    },
    include: {
      album: {
        select: { id: true, title: true, coverImage: true, genre: true, artist: { select: { id: true, name: true, slug: true } } },
      },
    },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  return tracks.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    duration: t.duration,
    audioFile: t.audioFile,
    playCount: t.playCount,
    album: t.album,
    score: 0,
    reason: '',
  }));
}

async function getPopularTracks(limit: number): Promise<TrackRecommendation[]> {
  const tracks = await db.track.findMany({
    where: {
      album: { artist: { user: { role: { not: 'ADMIN' } } } },
    },
    include: {
      album: {
        select: { id: true, title: true, coverImage: true, genre: true, artist: { select: { id: true, name: true, slug: true } } },
      },
    },
    orderBy: { playCount: 'desc' },
    take: limit,
  });

  return tracks.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    duration: t.duration,
    audioFile: t.audioFile,
    playCount: t.playCount,
    album: t.album,
    score: 0,
    reason: '',
  }));
}

async function getPopularArtists(limit: number): Promise<Array<{ id: string; name: string; slug: string; avatar: string | null; genres: string }>> {
  return db.artist.findMany({
    where: { user: { role: { not: 'ADMIN' } } },
    select: { id: true, name: true, slug: true, avatar: true, genres: true },
    orderBy: { albums: { _count: 'desc' } },
    take: limit,
  });
}
