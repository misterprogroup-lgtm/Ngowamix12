import { db } from '../src/lib/db';
import { hashPassword, createToken } from '../src/lib/auth';

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await db.user.upsert({
    where: { email: 'admin@ngowamix.com' },
    update: {},
    create: {
      email: 'admin@ngowamix.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Ngowamix',
      displayName: 'Admin Ngowamix',
      avatar: '/images/avatar-placeholder.svg',
      role: 'ADMIN',
      artist: {
        create: {
          name: 'Admin Ngowamix',
          slug: 'admin-ngowamix',
          genres: '',
          isVerified: true,
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });
  console.log('Created admin user:', admin.email);

  // Also ensure existing admin has a verified artist profile
  const existingArtist = await db.artist.findUnique({ where: { userId: admin.id } });
  if (!existingArtist) {
    await db.artist.create({
      data: {
        userId: admin.id,
        name: 'Admin Ngowamix',
        slug: 'admin-ngowamix',
        genres: '',
        isVerified: true,
        verificationStatus: 'VERIFIED',
      },
    });
    console.log('Created artist profile for admin');
  } else if (!existingArtist.isVerified) {
    await db.artist.update({
      where: { id: existingArtist.id },
      data: { isVerified: true, verificationStatus: 'VERIFIED' },
    });
    console.log('Updated admin artist profile to verified');
  }

  // Create test listener
  const listenerPassword = await hashPassword('test123');
  const listener = await db.user.upsert({
    where: { email: 'test@ngowamix.com' },
    update: {},
    create: {
      email: 'test@ngowamix.com',
      password: listenerPassword,
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      avatar: '/images/avatar-placeholder.svg',
      role: 'LISTENER',
    },
  });
  console.log('Created test user:', listener.email);

   // Create test artist
  const artistUser = await db.user.upsert({
    where: { email: 'artist@ngowamix.com' },
    update: {},
    create: {
      email: 'artist@ngowamix.com',
      password: await hashPassword('artist123'),
      firstName: 'Artiste',
      lastName: 'Test',
      displayName: 'Artiste Test',
      avatar: '/images/artist-avatar.jpg',
      role: 'ARTIST',
      artist: {
        create: {
          name: 'Afro King',
          slug: 'afro-king',
          bio: 'Artiste test pour la plateforme Ngowamix',
          avatar: '/images/artist-avatar.jpg',
          country: "Côte d'Ivoire",
          genres: 'Afrobeats,Amapiano',
          isVerified: true,
        },
      },
    },
    include: { artist: true },
  });
  console.log('Created test artist:', artistUser.artist?.name);

  if (artistUser.artist) {
    // Create test album
    const album = await db.album.upsert({
      where: { artistId_slug: { artistId: artistUser.artist.id, slug: 'album-test' } },
      update: {},
      create: {
        artistId: artistUser.artist.id,
        title: 'Premier Album',
        slug: 'album-test',
        description: 'Un album test pour la plateforme',
        genre: 'Afrobeats',
        country: "Côte d'Ivoire",
        price: 2000,
        releaseDate: new Date(),
        status: 'PUBLISHED',
        totalTracks: 3,
        duration: 600,
      },
    });
    console.log('Created test album:', album.title);

    // Create test tracks
    const tracksData = [
      { title: 'Intro', slug: 'intro', trackNumber: 1, duration: 180, audioFile: '/placeholder/track1.mp3' },
      { title: 'Danse avec moi', slug: 'danse-avec-moi', trackNumber: 2, duration: 210, audioFile: '/placeholder/track2.mp3' },
      { title: 'Africa Rising', slug: 'africa-rising', trackNumber: 3, duration: 210, audioFile: '/placeholder/track3.mp3' },
    ];

    for (const track of tracksData) {
      await db.track.upsert({
        where: { albumId_slug: { albumId: album.id, slug: track.slug } },
        update: {},
        create: {
          albumId: album.id,
          title: track.title,
          slug: track.slug,
          trackNumber: track.trackNumber,
          duration: track.duration,
          audioFile: track.audioFile,
        },
      });
    }
    console.log('Created test tracks');

    // Create sample concerts
    const concertDate1 = new Date();
    concertDate1.setDate(concertDate1.getDate() + 30);

    const concert1 = await db.concert.upsert({
      where: { slug: 'afro-king-live-abidjan' },
      update: { date: concertDate1 },
      create: {
        artistId: artistUser.artist.id,
        title: 'Afro King Live à Abidjan',
        slug: 'afro-king-live-abidjan',
        venue: 'Palais de la Culture',
        city: 'Abidjan',
        country: "Côte d'Ivoire",
        date: concertDate1,
        time: '20:00',
        description: 'Un concert exceptionnel avec Afro King pour une soirée inoubliable de musique Afrobeats et Amapiano.',
        poster: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
        totalTickets: 500,
        availableTickets: 350,
        vipTickets: 50,
        vipAvailableTickets: 30,
        price: 5000,
        vipPrice: 15000,
      },
    });
    console.log('Created concert:', concert1.title);

    const concertDate2 = new Date();
    concertDate2.setDate(concertDate2.getDate() + 60);

    const concert2 = await db.concert.upsert({
      where: { slug: 'festival-ngowamix-dakar' },
      update: { date: concertDate2 },
      create: {
        artistId: artistUser.artist.id,
        title: 'Festival Ngowamix Dakar',
        slug: 'festival-ngowamix-dakar',
        venue: 'Grand Théâtre National',
        city: 'Dakar',
        country: 'Sénégal',
        date: concertDate2,
        time: '19:00',
        description: 'Le plus grand festival de musique africaine de la saison.',
        poster: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
        totalTickets: 1000,
        availableTickets: 750,
        vipTickets: 100,
        vipAvailableTickets: 80,
        price: 8000,
        vipPrice: 25000,
      },
    });
    console.log('Created concert:', concert2.title);

    // Create sample single
    const singleAlbum = await db.album.upsert({
      where: { artistId_slug: { artistId: artistUser.artist.id, slug: 'nouveau-son-single' } },
      update: {},
      create: {
        artistId: artistUser.artist.id,
        title: 'Nouveau Son',
        slug: 'nouveau-son-single',
        type: 'SINGLE',
        description: 'Un nouveau single chaud !',
        genre: 'Afrobeats',
        country: "Côte d'Ivoire",
        price: 0,
        releaseDate: new Date(),
        status: 'PUBLISHED',
        totalTracks: 1,
        duration: 210,
      },
    });
    console.log('Created test single:', singleAlbum.title);
  }

  // Create test label
  const labelUser = await db.user.upsert({
    where: { email: 'label@ngowamix.com' },
    update: {},
    create: {
      email: 'label@ngowamix.com',
      password: await hashPassword('label123'),
      firstName: 'Label',
      lastName: 'Music',
      displayName: 'Afro Music Label',
      avatar: '/images/label-avatar.jpg',
      role: 'LABEL',
      artist: {
        create: {
          name: 'Afro Music Label',
          slug: 'afro-music-label',
          bio: 'Label de musique africaine indépendant',
          avatar: '/images/label-avatar.jpg',
          country: "Côte d'Ivoire",
          genres: 'Afrobeats,Coupé-décalé,Amapiano',
          isVerified: true,
        },
      },
    },
    include: { artist: true },
  });
  console.log('Created test label:', labelUser.artist?.name);

  console.log('Seeding complete!');
  console.log('\nComptes de test:');
  console.log('  Admin:    admin@ngowamix.com / admin123');
  console.log('  User:     test@ngowamix.com / test123');
  console.log('  Artiste:  artist@ngowamix.com / artist123');
  console.log('  Label:    label@ngowamix.com / label123');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
