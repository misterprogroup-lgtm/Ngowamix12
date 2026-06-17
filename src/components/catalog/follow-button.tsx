'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  artistId: string;
  initiallyFollowing?: boolean;
  followerCount?: number;
}

export function FollowButton({ artistId, initiallyFollowing = false, followerCount: initialCount }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialCount ?? 0);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/api/user/favorites?type=artist&artistId=${artistId}`);
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following);
        }
      } catch {}
    }
    if (!initiallyFollowing) check();
  }, [artistId, initiallyFollowing]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.action === 'added');
        setFollowerCount((c) => data.action === 'added' ? c + 1 : Math.max(0, c - 1));
        router.refresh();
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={following ? 'primary' : 'outline'}
      size="lg"
      onClick={handleToggle}
      isLoading={loading}
    >
      {following ? (
        <Heart className="h-5 w-5 mr-2" fill="currentColor" />
      ) : (
        <UserPlus className="h-5 w-5 mr-2" />
      )}
      {following ? 'Suivi' : 'Suivre'}
      {followerCount > 0 && (
        <span className="ml-2 text-sm opacity-80">{followerCount}</span>
      )}
    </Button>
  );
}
