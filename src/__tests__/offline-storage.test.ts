import { describe, it, expect, beforeEach } from 'vitest';
import {
  storeOfflineTrack,
  getOfflineTrack,
  removeOfflineTrack,
  getAllOfflineTracks,
  getOfflineAlbums,
  isTrackOffline,
  isAlbumOffline,
  removeOfflineAlbum,
  getOfflineStorageInfo,
} from '@/lib/offline-storage';

async function clearDB() {
  const all = await getAllOfflineTracks();
  for (const t of all) {
    await removeOfflineTrack(t.trackId);
  }
}

const MOCK_URL = 'https://example.com/audio.mp3';

function mockFetch(ok = true) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      blob: () => Promise.resolve(new Blob(['fake audio data'], { type: 'audio/mpeg' })),
    } as Response),
  );
}

const TRACK_META = {
  title: 'Track 1',
  trackNumber: 1,
  duration: 180,
  albumId: 'album-1',
  albumTitle: 'Test Album',
  albumCover: 'https://example.com/cover.jpg',
  artistName: 'Test Artist',
  artistSlug: 'test-artist',
};

describe('Offline Storage', () => {
  beforeEach(async () => {
    mockFetch();
    await clearDB();
  });

  describe('storeOfflineTrack', () => {
    it('stores a track and retrieves it', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      const result = await getOfflineTrack('track-1');
      expect(result).not.toBeNull();
      expect(result!.trackId).toBe('track-1');
      expect(result!.title).toBe('Track 1');
      expect(result!.albumTitle).toBe('Test Album');
      expect(result!.size).toBeGreaterThan(0);
    });

    it('overwrites existing track with same ID', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      await storeOfflineTrack('track-1', MOCK_URL, { ...TRACK_META, title: 'Updated' });
      const result = await getOfflineTrack('track-1');
      expect(result!.title).toBe('Updated');
    });

    it('throws if fetch fails', async () => {
      mockFetch(false);
      await expect(
        storeOfflineTrack('track-1', MOCK_URL, TRACK_META),
      ).rejects.toThrow('Échec du téléchargement');
    });
  });

  describe('getOfflineTrack', () => {
    it('returns null for non-existent track', async () => {
      const result = await getOfflineTrack('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('removeOfflineTrack', () => {
    it('removes a stored track', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      await removeOfflineTrack('track-1');
      const result = await getOfflineTrack('track-1');
      expect(result).toBeNull();
    });
  });

  describe('getAllOfflineTracks', () => {
    it('returns all stored tracks', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      await storeOfflineTrack('track-2', MOCK_URL, { ...TRACK_META, title: 'Track 2', trackNumber: 2 });

      const all = await getAllOfflineTracks();
      expect(all).toHaveLength(2);
    });

    it('returns empty array when no tracks stored', async () => {
      const all = await getAllOfflineTracks();
      expect(all).toEqual([]);
    });
  });

  describe('isTrackOffline', () => {
    it('returns true for stored track', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      expect(await isTrackOffline('track-1')).toBe(true);
    });

    it('returns false for non-stored track', async () => {
      expect(await isTrackOffline('track-1')).toBe(false);
    });
  });

  describe('isAlbumOffline', () => {
    it('returns true if at least one track of album is stored', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      expect(await isAlbumOffline('album-1')).toBe(true);
    });

    it('returns false if no tracks of album are stored', async () => {
      expect(await isAlbumOffline('album-1')).toBe(false);
    });
  });

  describe('getOfflineAlbums', () => {
    it('groups tracks by album', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      await storeOfflineTrack('track-2', MOCK_URL, { ...TRACK_META, trackNumber: 2 });
      await storeOfflineTrack('track-3', MOCK_URL, {
        ...TRACK_META,
        albumId: 'album-2',
        albumTitle: 'Second Album',
      });

      const albums = await getOfflineAlbums();
      expect(albums).toHaveLength(2);
      const first = albums.find((a) => a.albumId === 'album-1');
      expect(first).toBeDefined();
      expect(first!.trackCount).toBe(2);
    });
  });

  describe('removeOfflineAlbum', () => {
    it('removes all tracks of an album', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      await storeOfflineTrack('track-2', MOCK_URL, { ...TRACK_META, trackNumber: 2 });
      await storeOfflineTrack('track-3', MOCK_URL, {
        ...TRACK_META, albumId: 'album-2', albumTitle: 'Second',
      });

      await removeOfflineAlbum('album-1');

      const all = await getAllOfflineTracks();
      expect(all).toHaveLength(1);
      expect(all[0].albumId).toBe('album-2');
    });
  });

  describe('getOfflineStorageInfo', () => {
    it('returns accurate stats', async () => {
      await storeOfflineTrack('track-1', MOCK_URL, TRACK_META);
      await storeOfflineTrack('track-2', MOCK_URL, { ...TRACK_META, trackNumber: 2 });

      const info = await getOfflineStorageInfo();
      expect(info.trackCount).toBe(2);
      expect(info.albumCount).toBe(1);
      expect(info.used).toBeGreaterThan(0);
    });
  });
});
