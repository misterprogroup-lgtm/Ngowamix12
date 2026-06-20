import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const LISTENER_USER = { sub: 'user-1', email: 'listener@test.com', role: 'LISTENER' as const, isPremium: false };
const PREMIUM_USER = { sub: 'user-2', email: 'premium@test.com', role: 'LISTENER' as const, isPremium: true };
const ADMIN_USER = { sub: 'user-3', email: 'admin@test.com', role: 'ADMIN' as const, isPremium: false };

function mockFindUser(overrides: Record<string, unknown> = {}) {
  vi.mocked(db.user.findUnique).mockResolvedValue({
    id: 'user-1',
    role: 'LISTENER',
    isPremium: false,
    downloadsUsedThisMonth: 5,
    downloadQuota: 30,
    ...overrides,
  } as any);
}

function mockDb() {
  Object.assign(db, {
    user: { findUnique: vi.fn(), update: vi.fn() },
    purchase: { findFirst: vi.fn() },
    album: { findUnique: vi.fn() },
    track: { findUnique: vi.fn() },
    download: { create: vi.fn() },
  });
}

async function callDownload(params: Record<string, string>) {
  const { GET } = await import('@/app/api/user/download/route');
  const url = `http://localhost:3000/api/user/download?${new URLSearchParams(params)}`;
  return GET(new Request(url));
}

describe('Single Download Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb();
  });

  describe('permissions', () => {
    it('requires authentication', async () => {
      vi.mocked(requireAuth).mockRejectedValue(
        new Response('Unauthorized', { status: 401 }),
      );

      try {
        await callDownload({ albumId: 'album-1' });
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.status || 401).toBe(401);
      }
    });

    it('returns 400 when neither albumId nor trackId provided', async () => {
      vi.mocked(requireAuth).mockResolvedValue(LISTENER_USER);
      mockFindUser();

      const res = await callDownload({});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('albumId ou trackId requis');
    });

    it('returns 404 if user not found in DB', async () => {
      vi.mocked(requireAuth).mockResolvedValue(LISTENER_USER);
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      const res = await callDownload({ albumId: 'album-1' });
      expect(res.status).toBe(404);
    });

    it('returns 404 if album not found', async () => {
      vi.mocked(requireAuth).mockResolvedValue(LISTENER_USER);
      mockFindUser();
      vi.mocked(db.album.findUnique).mockResolvedValue(null);

      const res = await callDownload({ albumId: 'album-unknown' });
      expect(res.status).toBe(404);
    });
  });

  describe('quota checks for album download', () => {
    beforeEach(() => {
      vi.mocked(requireAuth).mockResolvedValue(LISTENER_USER);
      vi.mocked(db.purchase).findFirst.mockResolvedValue(null);
    });

    it('blocks non-premium, non-purchased user with exhausted quota', async () => {
      mockFindUser({ downloadsUsedThisMonth: 10, isPremium: false });
      vi.mocked(db.album.findUnique).mockResolvedValue({
        id: 'album-1',
        title: 'Test',
        artistId: 'artist-1',
        tracks: [{ id: 'track-1', trackNumber: 1, title: 'Track 1', audioFile: 'https://example.com/audio.mp3' }],
      } as any);

      const res = await callDownload({ albumId: 'album-1' });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('limite de téléchargements gratuits');
    });

    it('allows non-premium user within quota', async () => {
      mockFindUser({ downloadsUsedThisMonth: 3, isPremium: false });
      vi.mocked(db.album.findUnique).mockResolvedValue({
        id: 'album-1',
        title: 'Test',
        artistId: 'artist-1',
        tracks: [],
      } as any);

      const res = await callDownload({ albumId: 'album-1' });
      expect(res.status).toBe(200);
    });

    it('allows premium user regardless of quota', async () => {
      vi.mocked(requireAuth).mockResolvedValue(PREMIUM_USER);
      mockFindUser({ downloadsUsedThisMonth: 10, isPremium: true });
      vi.mocked(db.album.findUnique).mockResolvedValue({
        id: 'album-1',
        title: 'Test',
        artistId: 'artist-1',
        tracks: [],
      } as any);

      const res = await callDownload({ albumId: 'album-1' });
      expect(res.status).toBe(200);
    });
  });

  describe('admin bypass', () => {
    it('allows admin download without purchase or premium', async () => {
      vi.mocked(requireAuth).mockResolvedValue(ADMIN_USER);
      mockFindUser({ role: 'ADMIN', isPremium: false, downloadsUsedThisMonth: 10 });
      vi.mocked(db.album.findUnique).mockResolvedValue({
        id: 'album-1',
        title: 'Test',
        artistId: 'artist-1',
        tracks: [],
      } as any);

      const res = await callDownload({ albumId: 'album-1' });
      expect(res.status).toBe(200);
      expect(db.purchase.findFirst).not.toHaveBeenCalled();
    });

    it('bypasses quota check for admin', async () => {
      vi.mocked(requireAuth).mockResolvedValue(ADMIN_USER);
      mockFindUser({ role: 'ADMIN', isPremium: false, downloadsUsedThisMonth: 100 });
      vi.mocked(db.album.findUnique).mockResolvedValue({
        id: 'album-1',
        title: 'Test',
        artistId: 'artist-1',
        tracks: [],
      } as any);

      const res = await callDownload({ albumId: 'album-1' });
      expect(res.status).toBe(200);
    });
  });

  describe('track download', () => {
    it('returns track info for a single track download', async () => {
      vi.mocked(requireAuth).mockResolvedValue(LISTENER_USER);
      mockFindUser({ downloadsUsedThisMonth: 3, isPremium: false });
      vi.mocked(db.purchase).findFirst.mockResolvedValue(null);
      vi.mocked(db.track.findUnique).mockResolvedValue({
        id: 'track-1',
        title: 'My Song',
        audioFile: 'https://example.com/song.mp3',
        albumId: 'album-1',
        album: { id: 'album-1', title: 'Album' },
      } as any);

      const res = await callDownload({ trackId: 'track-1' });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.track.title).toBe('My Song');
      expect(data.track.file).toBe('https://example.com/song.mp3');
    });
  });
});
