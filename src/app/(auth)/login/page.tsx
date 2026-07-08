import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Music, Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <Music className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-text-secondary mt-2">
          Accédez à votre espace personnel
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
