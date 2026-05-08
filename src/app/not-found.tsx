import Link from 'next/link';
import { Music, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface mx-auto mb-6">
          <Music className="h-10 w-10 text-text-muted" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Page introuvable</h1>
        <p className="text-text-secondary mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button variant="primary">
            <Home className="h-5 w-5 mr-2" />
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
