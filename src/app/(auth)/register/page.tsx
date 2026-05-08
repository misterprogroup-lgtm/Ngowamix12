import { RegisterForm } from '@/components/auth/register-form';
import { Music } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <Music className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="text-text-secondary mt-2">
          Rejoignez Ngowamix et découvrez la musique africaine
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
