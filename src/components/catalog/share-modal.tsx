'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { X, Check, Facebook, Twitter, MessageCircle, Send, Music, Link as LinkIcon } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { APP_NAME } from '@/lib/constants';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  artistName?: string;
  coverImage?: string | null;
  type?: 'track' | 'album' | 'playlist';
}

export function ShareModal({ isOpen, onClose, url, title, artistName, coverImage, type = 'track' }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : url;

  const shareText = `${title}${artistName ? ` — ${artistName}` : ''} — ${APP_NAME}`;

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      icon: MessageCircle,
      bg: 'bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: Facebook,
      bg: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2]',
    },
    {
      name: 'X (Twitter)',
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      icon: Twitter,
      bg: 'bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: Send,
      bg: 'bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc]',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const typeLabel = type === 'track' ? 'Titre' : type === 'album' ? 'Album' : 'Playlist';

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col items-center text-center -m-4 p-4 pt-8 pb-4 rounded-t-xl"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)' }}>
        <div className="relative h-28 w-28 rounded-lg overflow-hidden shadow-lg mb-3 bg-surface">
          {coverImage ? (
            <SafeImage src={coverImage} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-10 w-10" /></div>} />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              <Music className="h-10 w-10" />
            </div>
          )}
        </div>
        <h3 className="font-bold text-base text-text-primary line-clamp-1">{title}</h3>
        {artistName && (
          <p className="text-sm text-text-secondary mt-0.5">{artistName}</p>
        )}
        <span className="text-[11px] text-text-muted uppercase tracking-wider mt-1">
          {typeLabel}
        </span>
      </div>

      <div className="pt-4">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <LinkIcon className="h-4 w-4" />
          )}
          {copied ? 'Lien copié !' : 'Copier le lien'}
        </button>
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <p className="text-xs text-text-muted text-center mb-3">
          Partager sur
        </p>
        <div className="flex items-center justify-center gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex flex-col items-center gap-1.5"
              title={link.name}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${link.bg} transition-colors`}>
                <link.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] text-text-muted">{link.name}</span>
            </a>
          ))}
        </div>
      </div>

      {type !== 'playlist' && (
        <div className="border-t border-border mt-4 pt-3">
          <p className="text-[10px] text-text-muted text-center truncate">
            {shareUrl}
          </p>
        </div>
      )}
    </Modal>
  );
}
