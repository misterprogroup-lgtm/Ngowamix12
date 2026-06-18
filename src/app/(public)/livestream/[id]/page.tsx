'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Users, Radio, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatar: string | null };
}

export default function WatchLivestreamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [stream, setStream] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/livestream/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.stream) { router.push('/livestream'); return; }
        setStream(data.stream);
        setLoading(false);
      })
      .catch(() => { router.push('/livestream'); });
  }, [id, router]);

  const fetchMessages = useCallback(() => {
    fetch(`/api/livestream/${id}/chat`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []));
  }, [id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/livestream/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;
  if (!stream) return null;

  const isLive = stream.status === 'LIVE';

  return (
    <div className="container mx-auto py-6 pb-24">
      <Link href="/livestream" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />Retour aux directs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface border border-border">
            {stream.thumbnail ? (
              <SafeImage src={stream.thumbnail} alt={stream.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Radio className="h-20 w-20 mx-auto text-text-muted mb-4" />
                  <p className="text-text-muted text-lg font-medium">
                    {isLive ? 'Live en cours...' : 'Live terminé'}
                  </p>
                </div>
              </div>
            )}
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white" />EN DIRECT
              </div>
            )}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
              <Users className="h-3 w-3" />
              {stream.viewerCount} spectateur{stream.viewerCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold">{stream.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                {stream.artist.avatar ? (
                  <SafeImage src={stream.artist.avatar} alt={stream.artist.name} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold text-primary">{stream.artist.name[0]}</div>
                )}
              </div>
              <div>
                <Link href={`/artist/${stream.artist.slug}`} className="font-semibold hover:text-primary transition-colors">
                  {stream.artist.name}
                </Link>
                <p className="text-xs text-text-muted">{stream._count.chats} messages</p>
              </div>
            </div>
            {stream.description && (
              <p className="mt-4 text-text-secondary">{stream.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col h-[500px] rounded-2xl bg-surface border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="font-semibold text-sm">Chat en direct</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-10">Aucun message pour le moment</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 overflow-hidden shrink-0 mt-0.5">
                    {msg.user.avatar ? (
                      <SafeImage src={msg.user.avatar} alt="" width={24} height={24} className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-bold text-primary">{msg.user.displayName?.[0] || '?'}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-primary">{msg.user.displayName || 'Anonyme'}</span>
                    <p className="text-sm text-text-primary break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-border flex gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écris un message..."
              className="flex-1 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
