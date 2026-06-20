'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate, maybeProxyAvatar } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
}

interface ConversationViewProps {
  conversationId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  currentUserId: string;
  initialMessages: Message[];
}

export function ConversationView({
  conversationId,
  otherUserName,
  otherUserAvatar,
  currentUserId,
  initialMessages,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setInput('');
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <Link href="/messages" className="text-text-muted hover:text-text">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {otherUserAvatar ? (
            <img src={maybeProxyAvatar(otherUserAvatar) ?? ''} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-primary">{otherUserName[0]}</span>
          )}
        </div>
        <span className="font-medium">{otherUserName}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-1">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-surface rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-text-muted'}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez un message..."
          className="flex-1 px-4 py-2 rounded-full bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        <Button
          variant="primary"
          size="icon"
          onClick={send}
          disabled={!input.trim() || sending}
          className="rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
