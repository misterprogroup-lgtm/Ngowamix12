import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('Starting activity backfill...');

  const albums = await pool.query(
    `SELECT a.id, a."artistId", ar."userId" FROM "Album" a
     JOIN "Artist" ar ON ar.id = a."artistId"
     WHERE a.status = 'PUBLISHED'`
  );

  let albumCount = 0;
  for (const album of albums.rows) {
    const existing = await pool.query(
      `SELECT id FROM "Activity" WHERE "albumId" = $1 AND type = 'NEW_ALBUM' LIMIT 1`,
      [album.id]
    );
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO "Activity" (id, "userId", type, "albumId", "createdAt")
         VALUES (gen_random_uuid(), $1, 'NEW_ALBUM', $2, NOW())`,
        [album.userId, album.id]
      );
      albumCount++;
    }
  }
  console.log(`Created ${albumCount} NEW_ALBUM activities`);

  const favorites = await pool.query(
    `SELECT "userId", "artistId" FROM "Favorite" WHERE "artistId" IS NOT NULL`
  );

  let followCount = 0;
  for (const fav of favorites.rows) {
    const existing = await pool.query(
      `SELECT id FROM "Activity" WHERE "userId" = $1 AND "artistId" = $2 AND type = 'FOLLOW_ARTIST' LIMIT 1`,
      [fav.userId, fav.artistId]
    );
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO "Activity" (id, "userId", type, "artistId", "createdAt")
         VALUES (gen_random_uuid(), $1, 'FOLLOW_ARTIST', $2, NOW())`,
        [fav.userId, fav.artistId]
      );
      followCount++;
    }
  }
  console.log(`Created ${followCount} FOLLOW_ARTIST activities`);

  const tracks = await pool.query(
    `SELECT t.id, al."artistId", ar."userId" FROM "Track" t
     JOIN "Album" al ON al.id = t."albumId"
     JOIN "Artist" ar ON ar.id = al."artistId"
     WHERE al.status = 'PUBLISHED'`
  );

  let trackCount = 0;
  for (const track of tracks.rows) {
    const existing = await pool.query(
      `SELECT id FROM "Activity" WHERE "trackId" = $1 AND type = 'NEW_TRACK' LIMIT 1`,
      [track.id]
    );
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO "Activity" (id, "userId", type, "trackId", "createdAt")
         VALUES (gen_random_uuid(), $1, 'NEW_TRACK', $2, NOW())`,
        [track.userId, track.id]
      );
      trackCount++;
    }
  }
  console.log(`Created ${trackCount} NEW_TRACK activities`);

  console.log('Backfill complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
