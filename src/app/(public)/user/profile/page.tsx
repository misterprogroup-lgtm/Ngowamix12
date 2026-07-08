'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Save, Phone, Camera } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { NotificationSettings } from '@/components/notifications/notification-settings';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/user/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setPhone(data.user.phone || '');
          setDisplayName(data.user.displayName || '');
          setEmail(data.user.email || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const fd = new FormData();
      fd.append('displayName', displayName);
      fd.append('phone', phone);
      fd.append('email', email);
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setMessage('Profil mis à jour avec succès');
      setUser(data.user);
      setAvatarFile(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }
    setMessage('Fonctionnalité bientôt disponible');
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="h-6 w-6 text-primary" />
        Mon profil
      </h1>

      {message && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary mb-6">
          {message}
        </div>
      )}

      <div className="space-y-8">
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">Photo de profil</h2>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden border-2 border-border bg-surface shrink-0">
              {avatarPreview ? (
                <SafeImage src={avatarPreview} alt="Aperçu" fill className="object-cover" sizes="96px" fallback={<div className="flex h-full items-center justify-center text-text-muted"><User className="h-10 w-10" /></div>} />
              ) : user?.avatar ? (
                <SafeImage src={user.avatar} alt={user.displayName || ''} fill className="object-cover" sizes="96px" fallback={<div className="flex h-full items-center justify-center text-text-muted"><User className="h-10 w-10" /></div>} />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                {user?.avatar ? 'Changer la photo' : 'Ajouter une photo'}
              </Button>
              <p className="text-xs text-text-muted mt-2">
                JPEG, PNG ou WebP. Format carré recommandé.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">Informations du profil</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Nom affiché"
              placeholder="Votre nom"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Téléphone"
              placeholder="+225 01 02 03 04 05"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
            <Input
              type="email"
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              label="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              label="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
          </form>
        </div>

        <NotificationSettings />
      </div>
    </div>
  );
}
