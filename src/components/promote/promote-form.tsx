'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket } from 'lucide-react';

const PLACEMENTS = [
  { value: 'POPUP', label: 'Popup', desc: 'Affiché en superposition' },
  { value: 'SIDEBAR', label: 'Barre latérale', desc: 'Affiché dans la sidebar' },
  { value: 'BANNER', label: 'Bannière', desc: 'Grande bannière sur la page' },
  { value: 'IN_FEED', label: 'Dans le fil', desc: 'Entre les contenus du fil' },
];

const DURATIONS = [
  { value: '1_day', label: '1 jour', price: '500 XOF' },
  { value: '3_days', label: '3 jours', price: '1 200 XOF' },
  { value: '7_days', label: '7 jours', price: '2 500 XOF' },
  { value: '14_days', label: '14 jours', price: '4 500 XOF' },
  { value: '30_days', label: '30 jours', price: '8 000 XOF' },
];

export function PromoteForm() {
  const router = useRouter();
  const [placement, setPlacement] = useState('POPUP');
  const [duration, setDuration] = useState('7_days');
  const [image, setImage] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placement, duration, image, text, link: link || undefined }),
      });
      if (res.ok) {
        router.push('/user/promote?success=1');
        router.refresh();
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Placement */}
      <div>
        <label className="block text-sm font-medium mb-2">Emplacement</label>
        <div className="grid grid-cols-2 gap-2">
          {PLACEMENTS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlacement(p.value)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                placement === p.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-2">Durée</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`text-center p-3 rounded-xl border transition-colors ${
                duration === d.value
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/30'
              }`}
            >
              <p className="text-sm font-medium">{d.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{d.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium mb-1">Image (URL)</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://exemple.com/image.jpg"
          required
          className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {/* Text */}
      <div>
        <label className="block text-sm font-medium mb-1">Texte promotionnel</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Décrivez votre promotion..."
          required
          rows={3}
          className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
        />
      </div>

      {/* Link */}
      <div>
        <label className="block text-sm font-medium mb-1">Lien (optionnel)</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://ngowamix.com/album/..."
          className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      <Button type="submit" variant="premium" className="w-full" disabled={submitting}>
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <Rocket className="h-5 w-5 mr-2" />
        )}
        Lancer la promotion
      </Button>
    </form>
  );
}
