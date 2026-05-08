'use client';

import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Fonctionnalité bientôt disponible');
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
        {/* Profile info */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Informations du profil</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Nom affiché"
              placeholder="Votre nom"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              type="email"
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </form>
        </div>

        {/* Change password */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Changer le mot de passe</h2>
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
      </div>
    </div>
  );
}
