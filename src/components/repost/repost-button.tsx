'use client';

import { useState, useEffect } from 'react';
import { Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepostButtonProps {
  trackId?: string;
  albumId?: string;
  initialCount?: number;
}

export function RepostButton({ trackId, albumId, initialCount = 0 }: RepostButtonProps) {
  const [reposted, setReposted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (trackId) params.set('trackId', trackId);
    if (albumId) params.set('albumId', albumId);
    fetch(`/api/repost?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setReposted(data.reposted);
        setCount(data.count);
      })
      .catch(() => {});
  }, [trackId, albumId]);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, albumId }),
      });
      const data = await res.json();
      setReposted(data.reposted);
      setCount((c) => (data.reposted ? c + 1 : c - 1));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={reposted ? 'text-accent' : 'text-text-muted'}
    >
      <Repeat2 className="h-4 w-4 mr-1" />
      <span className="text-xs">{count}</span>
    </Button>
  );
}
