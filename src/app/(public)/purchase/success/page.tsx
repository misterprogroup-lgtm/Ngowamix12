'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

function PurchaseContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    if (transactionId) {
      verifyPurchase(transactionId);
    }
  }, [transactionId]);

  const verifyPurchase = async (id: string) => {
    setStatus('processing');
    try {
      const res = await fetch(`/api/payment/verify?transactionId=${id}`);
      const data = await res.json();

      if (data.transaction?.status === 'PAID') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (transactionId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Vérification de l&apos;achat...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Achat réussi !</h1>
            <p className="text-text-secondary mb-6">L&apos;album est maintenant dans votre bibliothèque</p>
            <Badge variant="success" className="mb-8">
              <ShoppingBag className="h-4 w-4 mr-1" />
              Ajouté à la bibliothèque
            </Badge>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => window.location.href = ROUTES.USER_PURCHASES}>
                Mes achats
              </Button>
              <Button variant="outline" onClick={() => window.location.href = ROUTES.EXPLORE}>
                Continuer l&apos;exploration
              </Button>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10 mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-error" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Achat non confirmé</h1>
            <p className="text-text-secondary mb-6">Le paiement n&apos;a pas pu être vérifié</p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Retour à l&apos;accueil
            </Button>
          </>
        )}
      </div>
    );
  }

  return null;
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16"><p>Chargement...</p></div>}>
      <PurchaseContent />
    </Suspense>
  );
}
