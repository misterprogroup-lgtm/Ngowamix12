import webpush from 'web-push';
import { db } from './db';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;
const subject = process.env.VAPID_SUBJECT || 'mailto:support@ngowamix.com';

webpush.setVapidDetails(subject, publicKey, privateKey);

export function getVapidPublicKey(): string {
  return publicKey;
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    })
  );
  return results;
}

export async function sendPushToAllListeners(
  payload: { title: string; body: string; url?: string }
) {
  const listeners = await db.user.findMany({
    where: { role: 'LISTENER' },
    select: { id: true },
  });
  await Promise.allSettled(
    listeners.map((l) => sendPushToUser(l.id, payload))
  );
}
