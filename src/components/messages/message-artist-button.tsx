'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageArtistButtonProps {
  artistUserId: string;
}

export function MessageArtistButton({ artistUserId }: MessageArtistButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: artistUserId }),
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/messages/${conv.id}`);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="lg" onClick={handleClick} isLoading={loading}>
      <MessageSquare className="h-5 w-5 mr-2" />
      Message
    </Button>
  );
}
