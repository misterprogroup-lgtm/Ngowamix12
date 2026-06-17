'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Camera } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export function MissingAvatarPopup() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !user.avatar && !localStorage.getItem('avatar-popup-dismissed')) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('avatar-popup-dismissed', 'true');
    setOpen(false);
  };

  const handleGoToProfile = () => {
    localStorage.setItem('avatar-popup-dismissed', 'true');
    setOpen(false);
    router.push('/user/profile');
  };

  if (!user || user.avatar) return null;

  return (
    <Modal isOpen={open} onClose={handleDismiss} title="Photo de profil">
      <div className="text-center space-y-4">
        <div className="mx-auto h-20 w-20 rounded-full bg-surface flex items-center justify-center">
          <User className="h-10 w-10 text-text-muted" />
        </div>
        <p className="text-text-secondary">
          Vous n&apos;avez pas encore ajouté de photo de profil.
          Ajoutez-en une pour personnaliser votre compte.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={handleGoToProfile} variant="primary">
            <Camera className="h-4 w-4 mr-2" />
            Ajouter une photo
          </Button>
          <Button onClick={handleDismiss} variant="ghost">
            Plus tard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
