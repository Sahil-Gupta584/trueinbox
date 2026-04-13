import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import {
  dmAccess,
  conversation,
  creatorBalance,
  balanceTransaction,
  payment,
} from '#/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'

// Platform fee percentage (must match webhook.ts)
const PLATFORM_FEE_PERCENT = 0.1

export const Route = createFileRoute('/api/release-escrow/$accessId')({
  server: {
    handlers: {
      // Fan marks satisfaction - release funds from escrow to creator
      POST: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const { accessId } = params

        // Find the dm_access record
        const accessResult = await db
          .select()
          .from(dmAccess)
          .where(eq(dmAccess.id, accessId))

        const access = accessResult[0]

        if (!access) {
          return Response.json(
            { message: 'Access record not found' },
            { status: 404 },
          )
        }

        // Verify the requester is the sender (fan)
        if (access.senderId !== session.user.id) {
          return Response.json(
            { message: 'Only the sender can release escrow' },
            { status: 403 },
          )
        }

        // Check if this is a guaranteed reply access
        if (access.type !== 'guaranteed') {
          return Response.json(
            {
              message: 'This is not a guaranteed reply - no escrow to release',
            },
            { status: 400 },
          )
        }

        // Check if already released
        if (access.guaranteedReplyFulfilled) {
          return Response.json(
            { message: 'Escrow has already been released' },
            { status: 400 },
          )
        }

        // Check if access is still active
        if (access.status !== 'active') {
          return Response.json(
            { message: 'This access is no longer active' },
            { status: 400 },
          )
        }

        // Calculate creator earnings
        const platformFee = Math.round(access.amountPaid * PLATFORM_FEE_PERCENT)
        const creatorEarnings = access.amountPaid - platformFee

        // Update dm_access to mark as fulfilled
        await db
          .update(dmAccess)
          .set({
            guaranteedReplyFulfilled: true,
            guaranteedReplyFulfilledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(dmAccess.id, accessId))

        // Move funds from pending to available
        const currentBalance = await db
          .select()
          .from(creatorBalance)
          .where(eq(creatorBalance.userId, access.receiverId))

        if (currentBalance[0]) {
          await db
            .update(creatorBalance)
            .set({
              pendingBalance: sql`GREATEST(0, ${creatorBalance.pendingBalance} - ${creatorEarnings})`,
              availableBalance: sql`${creatorBalance.availableBalance} + ${creatorEarnings}`,
              updatedAt: new Date(),
            })
            .where(eq(creatorBalance.userId, access.receiverId))
        }

        // Get updated balance
        const updatedBalance = await db
          .select()
          .from(creatorBalance)
          .where(eq(creatorBalance.userId, access.receiverId))

        // Create balance transaction for the release
        await db.insert(balanceTransaction).values({
          id: nanoid(),
          userId: access.receiverId,
          type: 'release',
          amount: creatorEarnings,
          currency: access.currency,
          balanceType: 'available',
          runningBalance:
            updatedBalance[0]?.availableBalance || creatorEarnings,
          description: 'Guaranteed reply funds released from escrow',
          paymentId: access.paymentId,
          dmAccessId: accessId,
          createdAt: new Date(),
        })

        console.log(
          `Released ${creatorEarnings} cents from escrow for creator ${access.receiverId}`,
        )

        return Response.json({
          success: true,
          message: 'Thank you for your feedback! Funds released to creator.',
        })
      },
    },
  },
})
