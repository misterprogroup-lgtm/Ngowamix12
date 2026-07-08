'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Users, Hash, Loader2, LogIn, LogOut } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface ChatRoomItem {
  id: string;
  type: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  artist?: { id: string; name: string; slug: string; avatar: string | null } | null;
  _count: { messages: number; participants: number };
}

interface ChatMessageItem {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatar: string | null; role: string };
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoomItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chat/rooms')
      .then((r) => r.json())
      .then((data) => {
        setRooms(data.rooms || []);
        const global = (data.rooms || []).find((r: ChatRoomItem) => r.type === 'GLOBAL');
        if (global) {
          setActiveRoom(global);
          setJoinedRooms(new Set([global.id]));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchMessages = useCallback(() => {
    if (!activeRoom) return;
    fetch(`/api/chat/rooms/${activeRoom.id}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []));
  }, [activeRoom]);

  useEffect(() => { if (activeRoom) fetchMessages(); }, [activeRoom, fetchMessages]);
  useEffect(() => {
    if (!activeRoom) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeRoom, fetchMessages]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const joinRoom = async (roomId: string) => {
    const res = await fetch(`/api/chat/rooms/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join' }),
    });
    if (res.ok) {
      setJoinedRooms(new Set([...joinedRooms, roomId]));
      setActiveRoom(rooms.find((r) => r.id === roomId) || null);
      fetchMessages();
    }
  };

  const leaveRoom = async (roomId: string) => {
    await fetch(`/api/chat/rooms/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leave' }),
    });
    const newSet = new Set(joinedRooms);
    newSet.delete(roomId);
    setJoinedRooms(newSet);
    const global = rooms.find((r) => r.type === 'GLOBAL');
    if (global) {
      setActiveRoom(global);
      fetchMessages();
    } else {
      setActiveRoom(null);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !activeRoom) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1 rounded-full bg-linear-to-b from-primary to-accent" />
        <h1 className="text-2xl font-bold">Chat communautaire</h1>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Salons</h2>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-text-muted" /></div>
          ) : (
            rooms.map((room) => {
              const isJoined = joinedRooms.has(room.id);
              const isActive = activeRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => isJoined ? setActiveRoom(room) : joinRoom(room.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'bg-surface border border-border hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      room.type === 'GLOBAL' ? 'bg-primary/10 text-primary' :
                      room.type === 'ARTIST' ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
                    }`}>
                      {room.type === 'GLOBAL' ? <Hash className="h-4 w-4" /> :
                       room.type === 'ARTIST' ? <Users className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{room.name}</p>
                      <p className="text-xs text-text-muted">{room._count.participants} participant{room._count.participants !== 1 ? 's' : ''}</p>
                    </div>
                    {!isJoined && <LogIn className="h-3.5 w-3.5 text-text-muted shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-3">
          {activeRoom ? (
            <div className="flex flex-col h-[600px] rounded-2xl bg-surface border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    activeRoom.type === 'GLOBAL' ? 'bg-primary/10 text-primary' :
                    activeRoom.type === 'ARTIST' ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
                  }`}>
                    {activeRoom.type === 'GLOBAL' ? <Hash className="h-4 w-4" /> :
                     activeRoom.type === 'ARTIST' ? <Users className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold">{activeRoom.name}</h3>
                    <p className="text-xs text-text-muted">{activeRoom._count.participants} participant{activeRoom._count.participants !== 1 ? 's' : ''} · {activeRoom._count.messages} message{activeRoom._count.messages !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {activeRoom.type !== 'GLOBAL' && (
                  <button
                    onClick={() => leaveRoom(activeRoom.id)}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />Quitter
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-text-muted text-sm py-10">Aucun message pour le moment</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden shrink-0 mt-0.5">
                        {msg.user.avatar ? (
                          <SafeImage src={msg.user.avatar} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-primary">
                            {msg.user.displayName?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">{msg.user.displayName || 'Anonyme'}</span>
                          {msg.user.role === 'ARTIST' && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-accent/10 text-accent font-medium">Artiste</span>}
                          {msg.user.role === 'ADMIN' && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-error/10 text-error font-medium">Admin</span>}
                        </div>
                        <p className="text-sm text-text-primary wrap-break-word">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="p-4 border-t border-border flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écris un message..."
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary"
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
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] rounded-2xl bg-surface border border-border text-text-muted">
              <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">Rejoins un salon pour discuter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
