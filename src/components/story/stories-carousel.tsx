'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, User, X, ImageIcon, Camera, Loader2, Heart } from 'lucide-react';

interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string | null;
  likesCount?: number;
  isLiked?: boolean;
}

interface StoryGroup {
  artist: {
    id: string;
    name: string;
    slug: string;
    avatar: string | null;
    isVerified: boolean;
  };
  stories: StoryItem[];
  allViewed: boolean;
}

interface CurrentUser {
  id: string;
  role: string;
  displayName: string;
  avatar: string | null;
  artistAvatar: string | null;
}

export function StoriesCarousel() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [likesMap, setLikesMap] = useState<Record<string, { liked: boolean; count: number }>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/stories').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ])
      .then(([storiesData, userData]) => {
        const groups: StoryGroup[] = storiesData.groups || [];
        setGroups(groups);
        setCurrentUser(userData.user || null);
        setLoading(false);
        const map: Record<string, { liked: boolean; count: number }> = {};
        for (const g of groups) {
          for (const s of g.stories) {
            map[s.id] = { liked: s.isLiked || false, count: s.likesCount || 0 };
          }
        }
        setLikesMap(map);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLike = useCallback(async (storyId: string) => {
    const prev = likesMap[storyId];
    setLikesMap(m => ({
      ...m,
      [storyId]: { liked: !prev?.liked, count: (prev?.count || 0) + (prev?.liked ? -1 : 1) },
    }));
    try {
      const res = await fetch(`/api/stories/${storyId}/like`, { method: 'POST' });
      const data = await res.json();
      setLikesMap(m => ({ ...m, [storyId]: { liked: data.liked, count: data.likesCount } }));
    } catch {
      setLikesMap(m => ({ ...m, [storyId]: prev || { liked: false, count: 0 } }));
    }
  }, [likesMap]);

  const openStory = useCallback((group: StoryGroup) => {
    setActiveGroup(group);
    setActiveIndex(0);
  }, []);

  const closeStory = useCallback(() => {
    setActiveGroup(null);
    setActiveIndex(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const goNext = useCallback(() => {
    if (!activeGroup) return;
    if (activeIndex < activeGroup.stories.length - 1) {
      setActiveIndex(i => i + 1);
    } else {
      closeStory();
    }
  }, [activeGroup, activeIndex, closeStory]);

  const goPrev = useCallback(() => {
    if (!activeGroup) return;
    if (activeIndex > 0) {
      setActiveIndex(i => i - 1);
    }
  }, [activeGroup, activeIndex]);

  useEffect(() => {
    if (!activeGroup) return;
    const story = activeGroup.stories[activeIndex];
    const duration = 30000;
    timerRef.current = setTimeout(goNext, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeGroup, activeIndex, goNext]);

  async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  const handleFileSelect = async (file: File) => {
    let processedFile = file;
    if (file.type.startsWith('image/')) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        processedFile = await compressImage(file);
      }
    } else if (file.type.startsWith('video/')) {
      const maxVideoSize = 50 * 1024 * 1024;
      if (file.size > maxVideoSize) {
        setUploadError('Video too large (max 50MB)');
        return;
      }
    }
    const type = processedFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    setPendingType(type);
    setPendingFile(processedFile);
    setPendingPreview(URL.createObjectURL(processedFile));
    setCaption('');
    setUploadError('');
    setShowPicker(false);
  };

  const handleGallery = () => galleryRef.current?.click();
  const handleCamera = () => cameraRef.current?.click();

  const publishStory = async () => {
    if (!pendingFile || !pendingType) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', pendingFile);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      const { url, pathname } = await new Promise<{ url: string; pathname: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
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

      setUploadProgress(100);

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl: url, mediaType: pendingType, caption: caption || null, pathname }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to publish story');
      }

      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingFile(null);
      setPendingPreview(null);
      setPendingType(null);
      setCaption('');

      const storiesRes = await fetch('/api/stories');
      const storiesData = await storiesRes.json();
      setGroups(storiesData.groups || []);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur publication');
    } finally {
      setUploading(false);
    }
  };

  const canCreate = currentUser && (currentUser.role === 'ARTIST' || currentUser.role === 'LABEL');

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 px-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {canCreate && (
            <>
              <button
                onClick={() => setShowPicker(true)}
                className="shrink-0 snap-start cursor-pointer select-none block w-[100px] sm:w-[120px] md:w-[140px] text-left"
                style={{ height: 200 }}
              >
                <div
                  className="w-full h-full relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  style={{ borderRadius: 24 }}
                >
                  <div className="h-[60%] bg-gradient-to-br from-orange-400 to-orange-600 relative">
                    {(currentUser.avatar || currentUser.artistAvatar) ? (
                      <img
                        src={currentUser.artistAvatar || currentUser.avatar || ''}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                    ) : (
                      <User className="absolute inset-0 m-auto h-10 w-10 text-white/60" />
                    )}
                  </div>
                  <div className="h-[40%] flex flex-col items-center justify-center relative px-2">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-[#FF8800] flex items-center justify-center border-[3px] border-white shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
                      {(currentUser.avatar || currentUser.artistAvatar) ? (
                        <img
                          src={currentUser.artistAvatar || currentUser.avatar || ''}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Plus className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-black text-center mt-2 leading-tight">
                      Create Story
                    </p>
                  </div>
                </div>
              </button>

              <input
                ref={galleryRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
              />
            </>
          )}

          {/* Loading skeleton */}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 snap-start animate-pulse w-[100px] sm:w-[120px] md:w-[140px]"
              style={{ height: 200 }}
            >
              <div className="w-full h-full rounded-2xl bg-surface-hover" style={{ borderRadius: 24 }} />
            </div>
          ))}

          {/* Story cards */}
          {!loading && groups.map((group) => (
            <div
              key={group.artist.id}
              onClick={() => openStory(group)}
              className="shrink-0 snap-start cursor-pointer select-none transition-transform duration-250 ease-linear hover:scale-[1.03] active:scale-[0.98] w-[100px] sm:w-[120px] md:w-[140px]"
              style={{ height: 200 }}
            >
              <div
                className="w-full h-full relative overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                style={{ borderRadius: 24 }}
              >
                <img
                  src={group.stories[0]?.mediaUrl || ''}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

                <div className="absolute top-2 left-2">
                  <div className="h-8 w-8 rounded-full p-[2px] bg-[#FF8800]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white ring-2 ring-white">
                      {group.artist.avatar ? (
                        <img
                          src={group.artist.avatar}
                          alt={group.artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                          <User className="h-3.5 w-3.5 text-text-muted" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-bold text-xs leading-tight line-clamp-2">
                    {group.artist.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Picker popup */}
      {showPicker && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 flex items-end justify-center pb-12"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white rounded-2xl w-64 p-4 flex flex-col gap-3 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleGallery}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-[#FF8800]" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Gallery</span>
            </button>
            <div className="h-px bg-gray-100" />
            <button
              onClick={handleCamera}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Camera className="h-5 w-5 text-[#FF8800]" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Camera</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview & publish overlay */}
      {pendingPreview && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between p-3 z-10">
            <button onClick={() => {
              if (pendingPreview) URL.revokeObjectURL(pendingPreview);
              setPendingPreview(null);
              setPendingFile(null);
              setPendingType(null);
              setCaption('');
            }}>
              <X className="h-6 w-6 text-white" />
            </button>
            <p className="text-white font-semibold text-sm">Create Story</p>
            <div className="w-6" />
          </div>

          {/* Media preview */}
          <div className="flex-1 flex items-center justify-center relative">
            {pendingType === 'VIDEO' ? (
              <video src={pendingPreview} className="max-h-full max-w-full object-contain" autoPlay muted loop playsInline />
            ) : (
              <img src={pendingPreview} alt="" className="max-h-full max-w-full object-contain" />
            )}
          </div>

          {/* Bottom bar */}
          <div className="p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-full px-4 py-2.5 text-sm outline-none border border-white/20 focus:border-white/40"
            />
            <button
              onClick={publishStory}
              disabled={uploading}
              className="h-10 w-10 rounded-full bg-[#FF8800] flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Upload progress bar */}
          {uploading && (
            <div className="h-1 bg-white/20">
              <div className="h-full bg-[#FF8800] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {/* Error message */}
          {uploadError && (
            <div className="px-4 pb-4">
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-300 text-sm flex-1">{uploadError}</span>
                <button
                  onClick={publishStory}
                  className="text-sm font-semibold text-red-300 hover:text-red-200 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Viewer overlay */}
      {activeGroup && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={closeStory}>
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
            {activeGroup.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={[
                    'h-full bg-white rounded-full transition-all duration-100',
                    i < activeIndex ? 'w-full' : i === activeIndex ? 'w-full animate-shrink' : 'w-0',
                  ].join(' ')}
                  style={{ animationDuration: '30s' }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={closeStory}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute top-3 left-3 z-10 flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <div className="h-9 w-9 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/40">
              {activeGroup.artist.avatar ? (
                <img src={activeGroup.artist.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white/60" />
                </div>
              )}
            </div>
            <span className="text-sm font-semibold text-white">{activeGroup.artist.name}</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 flex" onClick={goPrev}>
              <div className="w-1/3 h-full" />
            </div>
            <div className="absolute inset-0 flex" onClick={goNext}>
              <div className="w-2/3 h-full ml-auto" />
            </div>

            {activeGroup.stories[activeIndex]?.mediaType === 'VIDEO' ? (
              <video
                src={activeGroup.stories[activeIndex].mediaUrl}
                className="max-h-full max-w-full object-contain"
                autoPlay
                playsInline
                onEnded={goNext}
              />
            ) : (
              <img
                src={activeGroup.stories[activeIndex]?.mediaUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            )}

            {activeGroup.stories[activeIndex]?.caption && (
              <div className="absolute bottom-8 left-4 right-16 text-center">
                <p className="text-sm text-white/90 bg-black/40 px-4 py-2 rounded-lg inline-block backdrop-blur-sm">
                  {activeGroup.stories[activeIndex].caption}
                </p>
              </div>
            )}
          </div>

          {/* Like button */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => handleLike(activeGroup.stories[activeIndex].id)}
              className="h-12 w-12 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm hover:bg-black/50 transition-colors"
            >
              <Heart
                className={`h-6 w-6 transition-all duration-200 ${likesMap[activeGroup.stories[activeIndex].id]?.liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`}
              />
            </button>
            <span className="text-xs font-semibold text-white/90">
              {likesMap[activeGroup.stories[activeIndex].id]?.count || 0}
            </span>
          </div>

          <style jsx>{`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
            .animate-shrink {
              animation: shrink linear forwards;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
