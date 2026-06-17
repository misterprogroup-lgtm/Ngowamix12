import { AlbumCard } from '@/components/catalog/album-card';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

async function getWeeklyReleases() {
  try {
    const res = await fetch(
      `${process.env.APP_URL || 'http://localhost:3000'}/api/albums?limit=5&sort=newest&period=week`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return data.albums || [];
  } catch {
    return [];
  }
}

export async function WeeklyNewReleases() {
  const albums = await getWeeklyReleases();

  if (albums.length === 0) return null;

  return (
    <section>
      <div className="container mx-auto px-4">
        <HorizontalScroll title="Nouveautés de la semaine" seeAllHref="/explore">
          {albums.map((album: {
            id: string; title: string; slug: string; coverImage: string | null;
            price: number; isPremiumOnly: boolean; type: string;
            artist: { name: string; slug: string; isVerified?: boolean };
          }) => (
            <div key={album.id} className="snap-start shrink-0 w-40">
              <AlbumCard
                id={album.id}
                title={album.title}
                slug={album.slug}
                coverImage={album.coverImage}
                artistName={album.artist.name}
                artistSlug={album.artist.slug}
                price={Number(album.price)}
                isPremiumOnly={album.isPremiumOnly}
                type={album.type as 'ALBUM' | 'SINGLE' | 'EP'}
                isArtistVerified={album.artist.isVerified}
              />
            </div>
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
}
