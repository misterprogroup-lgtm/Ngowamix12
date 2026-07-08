'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    !!navigator.standalone;
}

function getBrowserInfo() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  return 'other';
}

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | 'pwa-required' | 'loading'>('loading');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasNotification = 'Notification' in window;
    const hasPushManager = 'PushManager' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;

    if (!hasServiceWorker) {
      setPermission('unsupported');
      return;
    }

    if (!hasPushManager) {
      if (isIOS()) {
        setPermission('pwa-required');
      } else {
        setPermission('unsupported');
      }
      return;
    }

    if (!hasNotification) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);
    checkSubscription();
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || !('permissions' in navigator)) return;
    let cancelled = false;
    navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
      if (cancelled) return;
      status.onchange = () => setPermission(Notification.permission);
    });
    return () => { cancelled = true; };
  }, []);

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {
      setSubscribed(false);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) {
        return;
      }
      let reg = await navigator.serviceWorker.ready;
      let existing = await reg.pushManager.getSubscription();
      if (existing) {
        setSubscribed(true);
        setPermission('granted');
        return;
      }
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return;
      reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as unknown as BufferSource,
      });
      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      });
      setSubscribed(true);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (permission === 'loading') {
    return (
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications push
        </h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      </div>
    );
  }

  if (permission === 'pwa-required') {
    return (
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications push
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Sur iOS, les notifications push nécessitent d&apos;ajouter Ngowamix à votre écran d&apos;accueil.
          </p>
          <ol className="text-xs text-text-muted space-y-1.5 list-decimal list-inside">
            <li>Appuyez sur <strong>Partager</strong> <span className="inline-block text-base">⎙</span> en bas de Safari</li>
            <li>Sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong></li>
            <li>Appuyez sur <strong>Ajouter</strong> en haut à droite</li>
            <li>Ouvrez Ngowamix depuis l&apos;écran d&apos;accueil</li>
          </ol>
          <div className="flex items-center gap-2 text-xs text-primary pt-1">
            <Download className="h-3.5 w-3.5" />
            <span>L&apos;application s&apos;ouvrira comme une vraie app</span>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'unsupported') {
    return (
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications push
        </h2>
        <p className="text-sm text-text-secondary">
          Votre navigateur ne supporte pas les notifications push. Essayez avec Chrome, Firefox ou Safari en version récente.
        </p>
      </div>
    );
  }

  const enabled = permission === 'granted' && subscribed;

  return (
    <div className="rounded-xl border border-border p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        Notifications push
      </h2>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-primary">
            Recevoir des notifications
          </p>
          <p className="text-xs text-text-secondary">
            {enabled
              ? 'Vous recevrez les alertes des nouveaux albums et actualités.'
              : permission === 'denied'
                ? 'Notifications bloquées. Activez-les dans les paramètres de votre navigateur.'
                : 'Activez pour être notifié des nouveaux albums et actualités.'}
          </p>
        </div>

        <button
          onClick={enabled ? handleDisable : handleEnable}
          disabled={loading}
          className={cn(
            'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors shrink-0 ml-4',
            enabled
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-surface-hover text-text-muted hover:text-text-primary hover:bg-surface'
          )}
          title={enabled ? 'Désactiver' : 'Activer'}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : enabled ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
        </button>
      </div>

      {permission === 'denied' && (
        <p className="mt-3 text-xs text-text-muted">
          Pour réactiver, mettez à jour les permissions dans les paramètres de votre navigateur (🔒 à côté de l'URL).
        </p>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
