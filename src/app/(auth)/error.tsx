'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Erreur d&apos;authentification</h1>
        <p className="text-text-secondary mb-8">
          Une erreur est survenue. Veuillez réessayer.
        </p>
        <Button variant="primary" onClick={reset}>
          <RefreshCw className="h-5 w-5 mr-2" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}
