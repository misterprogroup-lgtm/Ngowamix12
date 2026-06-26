'use client';

import { useEffect, useState, useRef } from 'react';
import { Image, Upload, Music, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Album {
  id: string;
  title: string;
  coverImage: string | null;
  artist: { name: string; slug: string };
  _count: { tracks: number };
}

export default function AlbumCoversPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/albums');
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (err) {
      console.error('Fetch albums error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleUpload = async (albumId: string, file: File) => {
    setUploadingId(albumId);
    setSuccessId(null);
    try {
      const fd = new FormData();
      fd.append('albumId', albumId);
      fd.append('image', file);
      const res = await fetch('/api/admin/album-cover', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, coverImage: data.url } : a))
        );
        setSuccessId(albumId);
        setTimeout(() => setSuccessId(null), 2000);
      } else {
        alert(data.error || 'Erreur');
      }
    } catch {
      alert('Erreur réseau');
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Image className="h-6 w-6 text-primary" />
          Pochettes d&apos;albums
        </h1>
        <Input
          placeholder="Rechercher un album ou artiste..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-square bg-surface-hover rounded-xl" />
              <div className="h-4 bg-surface-hover rounded-sm w-3/4" />
              <div className="h-3 bg-surface-hover rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Image className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary">Aucun album trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              uploading={uploadingId === album.id}
              success={successId === album.id}
              onUpload={(file) => handleUpload(album.id, file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlbumCard({
  album,
  uploading,
  success,
  onUpload,
}: {
  album: Album;
  uploading: boolean;
  success: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface hover:bg-surface-hover transition-colors">
      <div className="aspect-square relative">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-hover">
            <Music className="h-12 w-12 text-text-muted opacity-40" />
          </div>
        )}
        {success && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <Check className="h-10 w-10 text-success" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div>
          <p className="text-sm font-medium truncate">{album.title}</p>
          <p className="text-xs text-text-muted truncate">{album.artist.name}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              e.target.value = '';
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          {uploading ? 'Upload...' : album.coverImage ? 'Changer' : 'Ajouter'}
        </Button>
      </div>
    </div>
  );
}
