'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Users, Clock, Play, Loader2 } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface Livestream {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  status: string;
  viewerCount: number;
  startedAt: string | null;
  scheduledAt: string | null;
  artist: { id: string; name: string; slug: string; avatar: string | null };
  _count: { chats: number };
}

export default function LivestreamPage() {
  const [streams, setStreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/livestream')
      .then((r) => r.json())
      .then((data) => setStreams(data.streams || []))
      .finally(() => setLoading(false));
  }, []);

  const refreshInterval = 30000;
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/livestream')
        .then((r) => r.json())
        .then((data) => setStreams(data.streams || []));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 rounded-full bg-linear-to-b from-red-500 to-red-600" />
        <h1 className="text-2xl font-bold">En Direct</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
      ) : streams.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Aucun live en ce moment</p>
          <p className="text-sm mt-2">Reviens plus tard pour voir les artistes en direct</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => (
            <Link
              key={stream.id}
              href={`/livestream/${stream.id}`}
              className="group relative rounded-2xl overflow-hidden bg-surface border border-border hover:border-primary/30 transition-all"
            >
              <div className="relative aspect-video bg-surface-hover">
                {stream.thumbnail ? (
                  <SafeImage src={stream.thumbnail} alt={stream.title} fill className="object-cover" fallback={<div className="flex h-full items-center justify-center"><Radio className="h-10 w-10 text-text-muted" /></div>} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Radio className="h-10 w-10 text-text-muted" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  EN DIRECT
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 text-white text-xs">
                  <Users className="h-3 w-3" />
                  {stream.viewerCount}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden shrink-0">
                    {stream.artist.avatar ? (
                      <SafeImage src={stream.artist.avatar} alt={stream.artist.name} width={32} height={32} className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-primary">{stream.artist.name[0]}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{stream.title}</h3>
                    <p className="text-sm text-text-muted">{stream.artist.name}</p>
                  </div>
                </div>
                {stream.description && (
                  <p className="text-sm text-text-secondary line-clamp-2">{stream.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
