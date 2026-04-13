import { db } from '#/db'
import { payment } from '#/db/schema'
import { createFileRoute } from '@tanstack/react-router'
import type { Session } from 'better-auth'
import { and, eq, isNotNull, isNull, or } from 'drizzle-orm'
import z from 'zod'

const refundZodSchema = z.object({
  fanId: z.string(),
})
export const Route = createFileRoute('/api/refund')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const session= context as any
          const userId = session.user.id
          const payload = await request.json()

          // Validate input
          const parsed = refundZodSchema.safeParse(payload)
          if (!parsed.success) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })
          }
          const { fanId } = parsed.data
          console.log('payment.senderId', payment.senderId);
          console.log('payment.receiverId', payment.receiverId);
          console.log({ userId, fanId });

          // Process refund
          const paymentsToRefund = await db.select().from(payment).where(
            and(
              or(
                and(eq(payment.senderId, userId), eq(payment.receiverId, fanId)),
                and(eq(payment.senderId, fanId), eq(payment.receiverId, userId))
              ),
            ),
          )

          if (paymentsToRefund.length === 0) {
            return new Response(JSON.stringify({ error: 'No payments to refund' }), { status: 404 })
          }
          await db.update(payment).set({ refundedAt: new Date(), status: 'pending' }).where(
            and(
              eq(payment.receiverId, userId),
              eq(payment.senderId, fanId),
              isNull(payment.refundedAt))
          )
          return new Response(JSON.stringify({ success: true }), { status: 200 })
        } catch (error) {
          console.error("Failed to refund", error);

          return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
        }
      },
    },
  },
})