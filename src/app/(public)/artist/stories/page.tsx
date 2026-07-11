'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Eye, Clock, Image, Video, Upload, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  _count: { views: number };
}

export default function ArtistStoriesPage() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/stories/mine');
      const data = await res.json();
      setStories(data.stories || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleFile = async (file: File) => {
    setUploadError('');
    setUploadProgress(0);
    setUploading(true);

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      const result = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', '/api/upload-story');
        xhr.send(formData);
      });

      setMediaUrl(result);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!mediaUrl) return;
    setUploading(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, mediaType, caption: caption || null }),
      });
      if (res.ok) {
        setMediaUrl('');
        setCaption('');
        setShowUpload(false);
        fetchStories();
      } else {
        const data = await res.json();
        setUploadError(data.error || 'Erreur publication');
      }
    } catch {} finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      setStories(prev => prev.filter(s => s.id !== id));
    } catch {}
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const timeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirée';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-28">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Mes stories</h1>
          <p className="text-sm text-text-muted">
            Partagez des moments éphémères avec vos fans — photos et vidéos disparaissent après 24h
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle story
        </Button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="rounded-xl border border-border bg-surface p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Publier une story</h2>
            <button onClick={() => { setShowUpload(false); setMediaUrl(''); setCaption(''); setUploadError(''); }} className="text-text-muted hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          {!mediaUrl ? (
            <div className="space-y-3">
              <div
                className="relative border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => !uploading && inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                {uploading ? (
                  <div className="space-y-3">
                    <Upload className="h-10 w-10 text-primary mx-auto animate-bounce" />
                    <p className="text-sm text-text-secondary">Upload en cours...</p>
                    <div className="w-full bg-surface-hover rounded-full h-2 max-w-xs mx-auto">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-text-muted">{uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 text-text-muted mx-auto" />
                    <p className="text-sm text-text-secondary">Cliquez pour choisir une photo ou vidéo</p>
                    <p className="text-xs text-text-muted">Photos (max 8MB) — Vidéos (max 32MB)</p>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-error flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {uploadError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-hover max-w-md">
                {mediaType === 'VIDEO' ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {mediaType === 'VIDEO' ? (
                  <><Video className="h-3 w-3" /> Vidéo</>
                ) : (
                  <><Image className="h-3 w-3" /> Photo</>
                )}
              </div>
              <input
                type="text"
                placeholder="Ajouter une légende (optionnel)"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={120}
              />
              {uploadError && (
                <p className="text-sm text-error flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {uploadError}
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={handlePublish} disabled={uploading}>
                  {uploading ? 'Publication...' : 'Publier'}
                </Button>
                <Button variant="ghost" onClick={() => { setMediaUrl(''); setUploadError(''); }}>
                  Changer de fichier
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stories list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-hover animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-primary" />
          </div>
          <p className="text-text-secondary mb-2">Aucune story pour le moment</p>
          <p className="text-sm text-text-muted mb-6">
            Publiez votre première story pour apparaître en haut de la page d&apos;accueil
          </p>
          <Button onClick={() => setShowUpload(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une story
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => {
            const expired = isExpired(story.expiresAt);
            return (
              <div
                key={story.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-colors',
                  expired ? 'border-border/30 bg-surface/50 opacity-50' : 'border-border bg-surface'
                )}
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-surface-hover shrink-0">
                  {story.mediaType === 'VIDEO' ? (
                    <video src={story.mediaUrl} className="w-full h-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={story.mediaUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {story.mediaType === 'VIDEO' ? (
                      <Video className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Image className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span className="text-xs font-medium text-text-secondary">
                      {story.mediaType === 'VIDEO' ? 'Vidéo' : 'Photo'}
                    </span>
                  </div>
                  {story.caption && (
                    <p className="text-sm text-white truncate">{story.caption}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Eye className="h-3 w-3" />
                      {story._count.views} vues
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      {timeLeft(story.expiresAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="shrink-0 p-2 text-text-muted hover:text-error transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
