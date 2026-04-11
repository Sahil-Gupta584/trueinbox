import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { conversation, message } from '#/db/schema'
import { eq, or, and, ne } from 'drizzle-orm'

export const Route = createFileRoute('/api/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })
        
        const myId = session.user.id
        
        const received = await db.select().from(conversation)
          .where(eq(conversation.receiverId, myId))
          
        const totalDMs = await db.select().from(conversation).where(
          or(eq(conversation.senderId, myId), eq(conversation.receiverId, myId))
        )
        
        const paywallRevenue = received
          .filter(c => c.type === "paywall" && c.status !== "refunded")
          .reduce((sum, c) => sum + (c.paidAmount || 0), 0)
          
        const refundedAmount = received
          .filter(c => c.status === "refunded")
          .reduce((sum, c) => sum + (c.paidAmount || 0), 0)
          
        let unreadCount = 0
        for (const conv of totalDMs) {
          const unreadResult = await db.select().from(message).where(
            and(
              eq(message.conversationId, conv.id),
              ne(message.senderId, myId),
              eq(message.isRead, false),
            )
          ).limit(1)
          if (unreadResult.length > 0) unreadCount++
        }
        
        return Response.json({
          totalDMs: totalDMs.length,
          paywallRevenue,
          refundedAmount,
          unreadCount,
        })
      }
    }
  }
})
