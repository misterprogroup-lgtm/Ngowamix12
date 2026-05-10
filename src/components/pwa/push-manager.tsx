'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';

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

async function subscribeUser(swReg: ServiceWorkerRegistration, vapidKey: string) {
  const existing = await swReg.pushManager.getSubscription();
  if (existing) {
    return existing;
  }
  return swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
  });
}

export function PushNotificationManager() {
  const user = useAuthStore((s) => s.user);
  const didSubscribe = useRef(false);

  useEffect(() => {
    if (!user || didSubscribe.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    didSubscribe.current = true;

    navigator.serviceWorker.ready
      .then((reg) => subscribeUser(reg, vapidKey))
      .then((sub) => {
        const json = sub.toJSON();
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
            userAgent: navigator.userAgent,
          }),
        });
      })
      .catch((err) => {
        if (Notification?.permission === 'denied') return;
        console.warn('Push subscription failed:', err);
      });
  }, [user]);

  return null;
}
