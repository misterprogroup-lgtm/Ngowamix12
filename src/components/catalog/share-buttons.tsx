'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Send, Copy, Check } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : url;

  const shareText = `${title} — ${APP_NAME}`;

  const links = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: Facebook,
      color: 'hover:text-[#1877F2]',
    },
    {
      name: 'X (Twitter)',
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      icon: Twitter,
      color: 'hover:text-[#1DA1F2]',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      icon: MessageCircle,
      color: 'hover:text-[#25D366]',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: Send,
      color: 'hover:text-[#0088cc]',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    if (supportsNativeShare) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        title="Partager"
      >
        <Share2 className="h-4 w-4" />
        Partager
      </button>

      {open && !supportsNativeShare && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary ${link.color} hover:bg-surface transition-colors`}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.name}
                </a>
              ))}
              <div className="border-t border-border my-1" />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0" />
                )}
                {copied ? 'Lien copié !' : 'Copier le lien'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
