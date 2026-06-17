const DB_NAME = 'ngowamix-offline';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

interface OfflineTrack {
  trackId: string;
  title: string;
  trackNumber: number;
  duration: number;
  audioFileBlob: Blob;
  albumId: string;
  albumTitle: string;
  albumCover: string | null;
  artistName: string;
  artistSlug: string;
  downloadedAt: number;
  size: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'trackId' });
        store.createIndex('albumId', 'albumId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineTrack(trackId: string): Promise<OfflineTrack | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(trackId);
    req.onsuccess = () => {
      resolve(req.result || null);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function storeOfflineTrack(
  trackId: string,
  url: string,
  metadata: {
    title: string;
    trackNumber: number;
    duration: number;
    albumId: string;
    albumTitle: string;
    albumCover: string | null;
    artistName: string;
    artistSlug: string;
  }
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Échec du téléchargement');
  const blob = await response.blob();

  const data: OfflineTrack = {
    trackId,
    ...metadata,
    audioFileBlob: blob,
    downloadedAt: Date.now(),
    size: blob.size,
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function removeOfflineTrack(trackId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(trackId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAllOfflineTracks(): Promise<OfflineTrack[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getOfflineAlbums(): Promise<{
  albumId: string;
  albumTitle: string;
  albumCover: string | null;
  artistName: string;
  artistSlug: string;
  trackCount: number;
  totalSize: number;
  downloadedAt: number;
}[]> {
  const tracks = await getAllOfflineTracks();
  const albumMap = new Map<string, {
    albumId: string;
    albumTitle: string;
    albumCover: string | null;
    artistName: string;
    artistSlug: string;
    trackCount: number;
    totalSize: number;
    downloadedAt: number;
  }>();

  for (const t of tracks) {
    const existing = albumMap.get(t.albumId);
    if (existing) {
      existing.trackCount++;
      existing.totalSize += t.size;
      if (t.downloadedAt > existing.downloadedAt) existing.downloadedAt = t.downloadedAt;
    } else {
      albumMap.set(t.albumId, {
        albumId: t.albumId,
        albumTitle: t.albumTitle,
        albumCover: t.albumCover,
        artistName: t.artistName,
        artistSlug: t.artistSlug,
        trackCount: 1,
        totalSize: t.size,
        downloadedAt: t.downloadedAt,
      });
    }
  }

  return Array.from(albumMap.values()).sort((a, b) => b.downloadedAt - a.downloadedAt);
}

export async function isTrackOffline(trackId: string): Promise<boolean> {
  const track = await getOfflineTrack(trackId);
  return track !== null;
}

export async function isAlbumOffline(albumId: string): Promise<boolean> {
  const tracks = await getAllOfflineTracks();
  return tracks.some((t) => t.albumId === albumId);
}

export async function removeOfflineAlbum(albumId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('albumId');
    const req = index.openCursor(IDBKeyRange.only(albumId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineStorageInfo(): Promise<{ used: number; trackCount: number; albumCount: number }> {
  const tracks = await getAllOfflineTracks();
  const uniqueAlbums = new Set(tracks.map((t) => t.albumId));
  return {
    used: tracks.reduce((sum, t) => sum + t.size, 0),
    trackCount: tracks.length,
    albumCount: uniqueAlbums.size,
  };
}

export function getOfflineAudioUrl(track: OfflineTrack): string {
  return URL.createObjectURL(track.audioFileBlob);
}

export function revokeOfflineAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}
