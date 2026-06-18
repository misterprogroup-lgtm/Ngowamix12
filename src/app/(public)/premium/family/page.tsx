'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Mail, Trash2, Check, X, Loader2, Shield, Crown, UserCheck } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

export default function FamilyPremiumPage() {
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const fetchGroup = () => {
    fetch('/api/family')
      .then((r) => r.json())
      .then((data) => {
        setGroup(data.group);
        if (data.error) setError(data.error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroup(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Famille' }),
      });
      const data = await res.json();
      if (res.ok) { setGroup(data.group); }
      else { setError(data.error || 'Erreur'); }
    } finally { setCreating(false); }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError('');
    try {
      const res = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteEmail('');
        fetchGroup();
      } else {
        setError(data.error || 'Erreur');
      }
    } finally { setInviting(false); }
  };

  const handleRemove = async (memberId: string) => {
    setError('');
    const res = await fetch('/api/family/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', memberId }),
    });
    const data = await res.json();
    if (res.ok) fetchGroup();
    else setError(data.error || 'Erreur');
  };

  const memberCount = group?.members?.length || 0;
  const maxMembers = group?.maxMembers || 6;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;

  return (
    <div className="container mx-auto py-8 pb-24 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
        <h1 className="text-2xl font-bold">Abonnement Famille</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">{error}</div>
      )}

      {!group ? (
        <div className="text-center py-16 rounded-2xl bg-surface border border-border">
          <Users className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">Crée ton groupe familial</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Partage ton abonnement Premium avec ta famille. Jusqu&apos;à 6 membres pour un seul prix.
          </p>
          <div className="inline-block px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 mb-6">
            <p className="text-2xl font-bold text-primary">7 500 FCFA<span className="text-sm font-normal text-text-muted">/mois</span></p>
            <p className="text-xs text-text-muted">Économisez jusqu&apos;à 75% vs abonnements individuels</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 transition-all"
          >
            {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Créer mon groupe familial
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">{group.name}</h2>
                <p className="text-sm text-text-muted">
                  {memberCount}/{maxMembers} membres · {group.price.toLocaleString()} {group.currency}/mois
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="w-full bg-surface-hover rounded-full h-2 mb-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(memberCount / maxMembers) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-6">
            <h3 className="font-semibold mb-4">Inviter un membre</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email du membre..."
                className="flex-1 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting || memberCount >= maxMembers}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Inviter
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Membres ({memberCount})</h3>
            </div>
            <div className="divide-y divide-border">
              {group.members?.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                      {member.user.avatar ? (
                        <SafeImage src={member.user.avatar} alt="" width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-primary">
                          {member.user.displayName?.[0] || member.user.email[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.user.displayName || member.user.email}</span>
                        {member.role === 'ADMIN' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Admin</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        {member.status === 'INVITED' ? 'Invité' : `Membre depuis ${new Date(member.joinedAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.user.isPremium && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">{member.status === 'ACTIVE' ? 'Premium' : ''}</span>
                    )}
                    {member.status === 'INVITED' ? (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <X className="h-3 w-3" /> En attente
                      </span>
                    ) : member.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
