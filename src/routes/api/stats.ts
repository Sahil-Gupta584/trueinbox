import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { conversation, message, payment, balanceTransaction } from '#/db/schema'
import { eq, or, and, ne, isNull, isNotNull } from 'drizzle-orm'

export const Route = createFileRoute('/api/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const myId = session.user.id

        const paymentsRecords = await db
          .select()
          .from(payment)
          .where(and(
            eq(payment.receiverId, myId),
          )
          )

          
        const paywallRevenueCents = paymentsRecords
          .reduce((sum, p) => sum + (p.amount || 0), 0)

        const refundedAmountCents = paymentsRecords
          .filter((p) => p.status === 'pending' && p.refundedAt)
          .reduce((sum, p) => sum + (p.amount || 0), 0)

        const analyticsRefundTx = await db
          .select()
          .from(balanceTransaction)
          .where(
            and(
              eq(balanceTransaction.userId, myId),
              eq(balanceTransaction.type, 'refund'),
            ),
          )

        let unreadCount = 0
        const totalDMs = await db
          .select()
          .from(conversation)
          .where(
            or(
              eq(conversation.senderId, myId),
              eq(conversation.receiverId, myId),
            ),
          )

        for (const conv of totalDMs) {
          const unreadResult = await db
            .select()
            .from(message)
            .where(
              and(
                eq(message.conversationId, conv.id),
                ne(message.senderId, myId),
                eq(message.isRead, false),
              ),
            )
            .limit(1)
          if (unreadResult.length > 0) unreadCount++
        }

        // Convert cents -> dollars for the API response
        const paywallRevenue = paywallRevenueCents / 100
        const refundedAmount = refundedAmountCents / 100

        return Response.json({
          totalDMs: totalDMs.length,
          paywallRevenue,
          refundedAmount,
          unreadCount,
          analyticsRefundCount: analyticsRefundTx.length,
        })
      },
    },
  },
})
