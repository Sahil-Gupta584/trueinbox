import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { conversation, message, user } from '#/db/schema'
import { eq, or, and, desc, ne } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'

export const Route = createFileRoute('/api/conversations')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })
        
        const myId = session.user.id
        
        const conversations = await db.select().from(conversation)
          .where(or(eq(conversation.senderId, myId), eq(conversation.receiverId, myId)))
          .orderBy(desc(conversation.updatedAt))
          
        const enriched = await Promise.all(conversations.map(async (conv) => {
          const otherId = conv.senderId === myId ? conv.receiverId : conv.senderId
          const otherResult = await db.select({
            id: user.id, name: user.name,
            username: user.username, image: user.image, niche: user.niche,
          }).from(user).where(eq(user.id, otherId))
          
          const other = otherResult[0] || null
          
          const lastMessageResult = await db.select().from(message)
            .where(eq(message.conversationId, conv.id))
            .orderBy(desc(message.createdAt)).limit(1)
            
          const lastMessage = lastMessageResult[0] || null
          
          const unread = await db.select().from(message).where(
            and(
              eq(message.conversationId, conv.id),
              ne(message.senderId, myId),
              eq(message.isRead, false),
            )
          )
          
          return { ...conv, other, lastMessage, unreadCount: unread.length }
        }))
        
        return Response.json(enriched)
      },
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })
        
        const myId = session.user.id
        const { receiverId, message: messageText, subject, type } = await request.json()
        
        if (!receiverId || !messageText) return Response.json({ message: "Missing fields" }, { status: 400 })
        
        const receiverResult = await db.select().from(user).where(eq(user.id, receiverId))
        const receiver = receiverResult[0]
        if (!receiver) return Response.json({ message: "Receiver not found" }, { status: 404 })
        
        const dmType: "paywall" | "guaranteed" = type === "guaranteed" ? "guaranteed" : "paywall"
        const paidAmount = dmType === "guaranteed"
          ? (receiver.guaranteedReplyPrice ?? 0)
          : (receiver.dmPrice ?? 0)
          
        const existingResult = await db.select().from(conversation).where(
          and(
            eq(conversation.senderId, myId),
            eq(conversation.receiverId, receiverId),
            eq(conversation.type, dmType),
          )
        )
        
        let conv = existingResult[0]
        if (!conv) {
          const newConv = await db.insert(conversation).values({
            id: nanoid(), senderId: myId, receiverId,
            subject: subject || null, paidAmount, type: dmType,
            status: "pending", createdAt: new Date(), updatedAt: new Date(),
          }).returning()
          conv = newConv[0]
        }
        
        const msgResult = await db.insert(message).values({
          id: nanoid(), conversationId: conv.id, senderId: myId,
          content: messageText, createdAt: new Date(), isRead: false,
        }).returning()
        const msg = msgResult[0]
        
        await db.update(conversation).set({ updatedAt: new Date() })
          .where(eq(conversation.id, conv.id))
          
        return Response.json({ conversation: conv, message: msg })
      }
    }
  }
})
