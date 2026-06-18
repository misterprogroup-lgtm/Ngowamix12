'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Radio, Loader2, Copy, Check, Trash2, Play, Square, Monitor, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ArtistLivestreamPage() {
  const router = useRouter();
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStreams = () => {
    fetch('/api/artist/streams')
      .then((r) => r.json())
      .then((data) => setStreams(data.streams || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStreams(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/livestream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, streamUrl: streamUrl.trim() || undefined }),
      });
      if (res.ok) {
        setShowCreate(false);
        setTitle('');
        setDescription('');
        setStreamUrl('');
        fetchStreams();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/livestream/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchStreams();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteStream = async (id: string) => {
    if (!confirm('Supprimer ce live ?')) return;
    setActionLoading(id);
    try {
      await fetch(`/api/livestream/${id}`, { method: 'DELETE' });
      fetchStreams();
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mes Lives</h1>
          <p className="text-sm text-text-secondary mt-1">{streams.length} live{streams.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />Nouveau live
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-5 rounded-2xl bg-surface border border-border space-y-4">
          <h3 className="font-semibold">Créer un nouveau live</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du live..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnelle)..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <input
            type="url"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="Lien YouTube Live (optionnel) — ex: https://youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!title.trim() || creating}
              className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer le live'}
            </button>
            <button
              onClick={() => { setShowCreate(false); setTitle(''); setDescription(''); }}
              className="px-4 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
      ) : streams.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Tu n&apos;as pas encore créé de live</p>
        </div>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => (
            <div key={stream.id} className="rounded-2xl bg-surface border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{stream.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      stream.status === 'LIVE' ? 'bg-red-600/20 text-red-500' :
                      stream.status === 'ENDED' ? 'bg-text-muted/10 text-text-muted' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {stream.status === 'LIVE' ? 'En direct' : stream.status === 'ENDED' ? 'Terminé' : 'Planifié'}
                    </span>
                  </div>
                  {stream.description && <p className="text-sm text-text-secondary line-clamp-1">{stream.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                    {stream.viewerCount > 0 && <span>{stream.viewerCount} spectateur{stream.viewerCount !== 1 ? 's' : ''}</span>}
                    <span>{stream._count.chats} messages</span>
                    <span>{new Date(stream.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {stream.streamKey && (
                    <div className="mt-3 flex items-center gap-2">
                      <code className="text-[11px] bg-surface-hover px-2 py-1 rounded font-mono text-text-muted truncate max-w-[200px]">{stream.streamKey}</code>
                      <button onClick={() => copyToClipboard('key', stream.streamKey)} className="text-text-muted hover:text-primary transition-colors" title="Copier la clé">
                        {copiedField === 'key' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {stream.status !== 'ENDED' && (
                    <button
                      onClick={() => toggleStatus(stream.id, stream.status === 'LIVE' ? 'ENDED' : 'LIVE')}
                      disabled={actionLoading === stream.id}
                      className={`p-2.5 rounded-xl transition-colors ${
                        stream.status === 'LIVE' ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-success/10 text-success hover:bg-success/20'
                      }`}
                      title={stream.status === 'LIVE' ? 'Arrêter le live' : 'Démarrer le live'}
                    >
                      {actionLoading === stream.id ? <Loader2 className="h-4 w-4 animate-spin" /> : stream.status === 'LIVE' ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => deleteStream(stream.id)}
                    disabled={actionLoading === stream.id}
                    className="p-2.5 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/livestream/${stream.id}`}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Diffuser en vidéo (gratuit)</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="font-semibold text-sm mb-2">YouTube Live (recommandé)</h4>
            <p className="text-sm text-text-secondary mb-3">
              100% gratuit. Va sur <strong>YouTube Studio → Créer → Passer en direct</strong>, copie ta clé de diffusion, et configure OBS avec.
            </p>
            <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside mb-3">
              <li>Ouvre OBS → Paramètres → Diffusion</li>
              <li>Service : <strong>YouTube - RTMPS</strong></li>
              <li>Clé de streaming : colle celle de YouTube</li>
              <li>Colle le lien YouTube du live dans le champ ci-dessus</li>
            </ol>
            <a
              href="https://www.youtube.com/live_dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir le tableau de bord YouTube Live
            </a>
          </div>

          <div className="p-4 rounded-xl bg-surface-hover border border-border">
            <h4 className="font-semibold text-sm mb-2">Owncast (auto-hébergé)</h4>
            <p className="text-sm text-text-secondary mb-2">
              Installe Owncast sur un VPS (~5$/mois) pour un contrôle total.
            </p>
            <a
              href="https://owncast.online/docs/quickstart/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Guide d&apos;installation Owncast
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
