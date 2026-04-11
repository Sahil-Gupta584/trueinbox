import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { conversation, message, user } from '#/db/schema'
import { eq, or, and, desc, ne } from 'drizzle-orm'

export const Route = createFileRoute('/api/unread')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })
        
        const myId = session.user.id
        
        const allConvs = await db.select().from(conversation).where(
          or(eq(conversation.senderId, myId), eq(conversation.receiverId, myId))
        ).orderBy(desc(conversation.updatedAt))
        
        const unreadConvs = []
        for (const conv of allConvs) {
          const unreadMsgResult = await db.select().from(message).where(
            and(
              eq(message.conversationId, conv.id),
              ne(message.senderId, myId),
              eq(message.isRead, false),
            )
          ).limit(1)
          
          const unreadMsg = unreadMsgResult[0]
          if (unreadMsg) {
            const otherId = conv.senderId === myId ? conv.receiverId : conv.senderId
            const otherResult = await db.select({
              id: user.id, name: user.name,
              username: user.username, image: user.image,
            }).from(user).where(eq(user.id, otherId))
            
            unreadConvs.push({ ...conv, other: otherResult[0] || null, lastMessage: unreadMsg })
          }
        }
        
        return Response.json(unreadConvs.slice(0, 10))
      }
    }
  }
})
