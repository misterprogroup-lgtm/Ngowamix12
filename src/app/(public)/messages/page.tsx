import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { MessageSquare, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { maybeProxyAvatar } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl text-center">
        <Mail className="h-12 w-12 mx-auto mb-3 opacity-50 text-text-muted" />
        <p className="text-text-muted">Connectez-vous pour voir vos messages</p>
        <Link href={ROUTES.LOGIN}>
          <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Connexion</button>
        </Link>
      </div>
    );
  }

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ user1Id: user.sub }, { user2Id: user.sub }],
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      user1: { select: { id: true, displayName: true, avatar: true } },
      user2: { select: { id: true, displayName: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, displayName: true } },
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Vous n&apos;avez pas encore de conversations</p>
          <p className="text-sm mt-2">Visitez la page d&apos;un artiste pour lui envoyer un message</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.user1Id === user.sub ? conv.user2 : conv.user1;
            const lastMsg = conv.messages[0];
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {other.avatar ? (
                    <img src={maybeProxyAvatar(other.avatar) ?? ''} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{other.displayName || 'Utilisateur'}</p>
                  {lastMsg && (
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {lastMsg.sender.id === user.sub ? 'Vous : ' : ''}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
                {lastMsg && (
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {formatDate(lastMsg.createdAt)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
