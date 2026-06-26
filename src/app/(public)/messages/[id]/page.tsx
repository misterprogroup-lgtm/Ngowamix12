import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { ConversationView } from '@/components/messages/conversation-view';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: {
      id,
      OR: [{ user1Id: user.sub }, { user2Id: user.sub }],
    },
    include: {
      user1: { select: { id: true, displayName: true, avatar: true } },
      user2: { select: { id: true, displayName: true, avatar: true } },
    },
  });

  if (!conversation) notFound();

  const other = conversation.user1Id === user.sub ? conversation.user2 : conversation.user1;

  const messages = await db.directMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, displayName: true, avatar: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl flex flex-col h-[calc(100vh-12rem)]">
      <ConversationView
        conversationId={id}
        otherUserName={other.displayName || 'Utilisateur'}
        otherUserAvatar={other.avatar}
        currentUserId={user.sub}
        initialMessages={messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          senderId: m.sender.id,
          senderName: m.sender.displayName || 'Utilisateur',
          senderAvatar: m.sender.avatar,
        }))}
      />
    </div>
  );
}
