'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft, Play, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { UploadthingUpload } from '@/components/ui/uploadthing-upload';
import { DirectUpload } from '@/components/ui/direct-upload';
import { formatDuration } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  trackNumber: number;
  duration: number;
  audioFile: string;
  isExplicit: boolean;
  isPremiumOnly: boolean;
}

interface Album {
  id: string;
  title: string;
  coverImage: string | null;
  status: string;
}

export default function AlbumTracksPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  const [tracks, setTracks] = useState<Track[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [trackData, setTrackData] = useState({
    title: '',
    trackNumber: '',
    isExplicit: false,
    isPremiumOnly: false,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbum();
    fetchTracks();
  }, [albumId]);

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`/api/artist/albums/${albumId}`);
      if (res.ok) {
        const data = await res.json();
        setAlbum(data.album);
      }
    } catch (error) {
      console.error('Fetch album error:', error);
    }
  };

  const fetchTracks = async () => {
    try {
      const res = await fetch(`/api/artist/tracks?albumId=${albumId}`);
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Fetch tracks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl && !audioFile) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('albumId', albumId);
      fd.append('title', trackData.title);
      fd.append('trackNumber', trackData.trackNumber || (tracks.length + 1).toString());
      fd.append('isExplicit', trackData.isExplicit.toString());
      fd.append('isPremiumOnly', trackData.isPremiumOnly.toString());
      if (audioUrl) {
        fd.append('audioUrl', audioUrl);
      } else if (audioFile) {
        fd.append('audio', audioFile);
      }

      const res = await fetch('/api/artist/tracks', { method: 'POST', body: fd });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setShowUploadModal(false);
      setTrackData({ title: '', trackNumber: '', isExplicit: false, isPremiumOnly: false });
      setAudioFile(null);
      setAudioUrl(null);
      fetchTracks();
      fetchAlbum();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-32 bg-surface-hover rounded" />
          <div className="h-16 bg-surface-hover rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-hover rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Link href="/artist/catalog" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour au catalogue
      </Link>

      {album && (
        <div className="flex items-center gap-4 mb-8">
          {album.coverImage ? (
            <img src={album.coverImage} alt={album.title} className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-surface-hover flex items-center justify-center">
              <Music className="h-8 w-8 text-text-muted" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{album.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{album.status}</Badge>
              <span className="text-sm text-text-muted">{tracks.length} piste{tracks.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <Button variant="primary" className="ml-auto" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter une piste
          </Button>
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="text-center py-16">
          <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-medium text-text-secondary mb-2">Aucune piste</h2>
          <p className="text-text-muted mb-6">Ajoutez des pistes audio à cet album</p>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter une piste
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div key={track.id} className="flex items-center gap-4 rounded-lg border border-border px-4 py-3 hover:bg-surface-hover transition-colors">
              <span className="text-sm text-text-muted w-8 text-center">{index + 1}</span>
              <Play className="h-4 w-4 text-text-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {track.isExplicit && <Badge variant="error" className="text-xs px-1 py-0">E</Badge>}
                  {track.isPremiumOnly && <Badge variant="premium" className="text-xs px-1 py-0">Premium</Badge>}
                </div>
              </div>
              <span className="text-sm text-text-muted w-10 text-right">
                {formatDuration(track.duration)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Ajouter une piste">
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Titre de la piste"
            placeholder="Nom du titre"
            value={trackData.title}
            onChange={(e) => setTrackData({ ...trackData, title: e.target.value })}
            required
          />

          <Input
            type="number"
            label="Numéro de piste"
            placeholder={String(tracks.length + 1)}
            value={trackData.trackNumber}
            onChange={(e) => setTrackData({ ...trackData, trackNumber: e.target.value })}
            min="1"
          />

          <DirectUpload
            endpoint="audioTrack"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
            label="Sélectionner le fichier audio"
            onUploadComplete={(url) => setAudioUrl(url)}
          />

          {audioUrl && (
            <p className="text-xs text-success">Fichier uploadé avec succès ✓</p>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trackData.isExplicit}
                onChange={(e) => setTrackData({ ...trackData, isExplicit: e.target.checked })}
                className="rounded border-border bg-surface"
              />
              <span className="text-sm text-text-secondary">Contenu explicite</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trackData.isPremiumOnly}
                onChange={(e) => setTrackData({ ...trackData, isPremiumOnly: e.target.checked })}
                className="rounded border-border bg-surface"
              />
              <span className="text-sm text-text-secondary">Réservé aux abonnés Premium</span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter la piste
          </Button>
        </form>
      </Modal>
    </div>
  );
}
