'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    !!navigator.standalone;
}

function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
}

async function subscribeAndSendToServer(swReg: ServiceWorkerRegistration, vapidKey: string) {
  let sub = await swReg.pushManager.getSubscription();

  if (!sub) {
    try {
      sub = await timeout(
        swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
        }),
        8000
      );
    } catch {
      throw new Error('Échec abonnement push (timeout ou refus)');
    }
  }

  const json = sub.toJSON();
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
      userAgent: navigator.userAgent,
    }),
  });
  if (!res.ok) throw new Error('Erreur serveur abonnement');
  return sub;
}

export function PushNotificationManager() {
  const user = useAuthStore((s) => s.user);
  const [subscribed, setSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    const onIOS = isIOS();
    const onStandalone = isStandalone();
    const supported = pushSupported();

    if (!supported && !onIOS) return;

    if (onIOS && !onStandalone) {
      const dismissed = localStorage.getItem('push-dismissed-ios');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 4000);
      }
      return;
    }

    if (onIOS && onStandalone) {
      const dismissed = localStorage.getItem('push-dismissed-ios-pwa');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 4000);
      }
      return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    const currentPerm = Notification.permission;

    if (currentPerm === 'granted') {
      navigator.serviceWorker.ready
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription();
          setSubscribed(!!sub);
          if (!sub && user) {
            const r = await subscribeAndSendToServer(reg, vapidKey);
            if (r) setSubscribed(true);
          }
          attempted.current = true;
        })
        .catch(() => { attempted.current = true; });
    } else if (currentPerm === 'default') {
      const dismissed = localStorage.getItem('push-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 4000);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!('Notification' in window) || !('permissions' in navigator)) return;
    let cancelled = false;
    navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
      if (cancelled) return;
      status.onchange = () => {
        const p = Notification.permission;
        if (p === 'granted') {
          setShowPrompt(false);
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (vapidKey) {
            navigator.serviceWorker.ready
              .then((reg) => subscribeAndSendToServer(reg, vapidKey))
              .then((r) => { if (r) setSubscribed(true); });
          }
        }
      };
    });
    return () => { cancelled = true; };
  }, []);

  const doSubscribe = useCallback(async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) throw new Error('Clé VAPID manquante');

    const supported = pushSupported();
    if (!supported) throw new Error('Push non supporté');

    let reg: ServiceWorkerRegistration;
    try {
      reg = await timeout(navigator.serviceWorker.ready, 5000);
    } catch {
      if (navigator.serviceWorker.controller) {
        reg = await timeout(navigator.serviceWorker.ready, 5000);
      } else {
        await timeout(navigator.serviceWorker.register('/sw.js', { scope: '/' }), 5000);
        reg = await timeout(navigator.serviceWorker.ready, 5000);
      }
    }

    const sub = await subscribeAndSendToServer(reg, vapidKey);
    if (!sub) throw new Error('Subscription failed');
    return sub;
  }, []);

  const handleEnable = useCallback(async () => {
    if (!('Notification' in window)) return;

    const currentPerm = Notification.permission;
    if (currentPerm === 'denied') {
      setError('Permission bloquée dans les réglages');
      return;
    }

    let granted = currentPerm === 'granted';

    if (currentPerm === 'default') {
      try {
        const result = await timeout(Notification.requestPermission(), 8000);
        granted = result === 'granted';
      } catch {
        granted = false;
      }
    }

    if (!granted) {
      setError('Permission refusée');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await doSubscribe();
      setSubscribed(true);
      setShowPrompt(false);
      localStorage.removeItem('push-dismissed');
      setError(null);
    } catch (e) {
      const msg = (e instanceof Error ? e.message : String(e)) || 'Erreur inconnue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [doSubscribe]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setError(null);
    if (isIOS() && isStandalone()) {
      localStorage.setItem('push-dismissed-ios-pwa', 'true');
    } else if (isIOS()) {
      localStorage.setItem('push-dismissed-ios', 'true');
    } else {
      localStorage.setItem('push-dismissed', 'true');
    }
  }, []);

  if (!showPrompt) return null;

  if (isIOS() && !isStandalone()) {
    return (
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slideUp">
        <div className="rounded-xl border border-border bg-surface shadow-2xl p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Notifications push</p>
              <p className="text-xs text-text-muted">
                Sur iPhone, ajoutez Ngowamix à votre écran d&apos;accueil pour activer les notifications
              </p>
            </div>
          </div>
          <ol className="text-xs text-text-muted space-y-1 mb-3 list-decimal list-inside">
            <li>Appuyez sur Partager <span className="inline-block text-base">⎙</span></li>
            <li>Sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong></li>
            <li>Appuyez sur <strong>Ajouter</strong></li>
            <li>Ouvrez Ngowamix depuis l&apos;écran d&apos;accueil</li>
          </ol>
          <Button variant="primary" size="sm" className="w-full" onClick={handleDismiss}>
            J&apos;ai compris
          </Button>
        </div>
      </div>
    );
  }

  if (isIOS() && isStandalone()) {
    return (
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slideUp">
        <div className="rounded-xl border border-border bg-surface shadow-2xl p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Notifications push</p>
              <p className="text-xs text-text-muted">
                Sur iPhone, les notifications push système sont gérées dans les Réglages.
              </p>
            </div>
          </div>
          <ol className="text-xs text-text-muted space-y-1 mb-3 list-decimal list-inside">
            <li>Allez dans <strong>Réglages</strong> <span className="inline-block text-base">⚙️</span></li>
            <li>Descendez jusqu&apos;à <strong>Ngowamix</strong></li>
            <li>Activez <strong>Notifications</strong></li>
          </ol>
          <Button variant="primary" size="sm" className="w-full" onClick={handleDismiss}>
            J&apos;ai compris
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 animate-slideUp">
      <div className="rounded-xl border border-border bg-surface shadow-2xl p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-text-muted hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">Ne manquez rien !</p>
            <p className="text-xs text-text-muted">
              Activez les notifications pour être alerté des nouveaux albums et actualités.
            </p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={handleDismiss}>
            Plus tard
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={handleEnable} disabled={loading}>
            {loading ? 'Activation...' : error ? 'Réessayer' : 'Activer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
