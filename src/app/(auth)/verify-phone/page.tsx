import { VerifyPhoneForm } from '@/components/auth/verify-phone-form';
import { Smartphone } from 'lucide-react';

export default function VerifyPhonePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Vérification du téléphone</h1>
        <p className="text-text-secondary mt-2">
          Confirmez votre numéro de téléphone
        </p>
      </div>
      <VerifyPhoneForm />
    </div>
  );
}
