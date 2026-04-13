import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db'
import {
  payment,
  dmAccess,
  conversation,
  creatorBalance,
  balanceTransaction,
} from '#/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'
import { env } from '#/lib/env'
import { Webhook } from 'standardwebhooks'

const WEBHOOK_SECRET = env.DODO_PAYMENTS_WEBHOOK_KEY

// Platform fee percentage (e.g., 10% = 0.10)
const PLATFORM_FEE_PERCENT = 0.1

export const Route = createFileRoute('/api/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Get raw body for signature verification
        const payload = await request.text()
        const webhook = new Webhook(WEBHOOK_SECRET)
        const headers = Object.fromEntries(request.headers.entries())

        const event = (await webhook.verify(payload, headers)) as any
        console.log(JSON.stringify({ payload, event }))

        console.log('Webhook event received:', event.type)

        switch (event.type) {
          case 'payment.succeeded': {
            await handlePaymentSucceeded(event.data)
            break
          }

          case 'payment.failed': {
            await handlePaymentFailed(event.data)
            break
          }

          case 'refund.succeeded': {
            await handleRefundSucceeded(event.data)
            break
          }

          default:
            console.log('Unhandled webhook event:', event.type)
        }

        return new Response('OK', { status: 200 })
      },
    },
  },
})

async function handlePaymentSucceeded(data: any) {
  const { payment_id, metadata } = data

  // Find the payment record
  const paymentResult = await db
    .select()
    .from(payment)
    .where(eq(payment.id, payment_id))
  const paymentRecord = paymentResult[0]

  if (!paymentRecord) {
    console.error('Payment record not found:', payment_id)
    return
  }

  // Update payment status
  await db
    .update(payment)
    .set({
      status: 'succeeded',
      providerPaymentId: payment_id,
      updatedAt: new Date(),
    })
    .where(eq(payment.id, payment_id))

  // Check if this is an upgrade payment
  const isUpgrade = metadata?.is_upgrade === true
  const upgradeFromAccessId = metadata?.upgrade_from_access_id
  const previousAmountPaid = metadata?.previous_amount_paid || 0

  if (isUpgrade && upgradeFromAccessId) {
    // Handle upgrade from paywall to guaranteed
    await handleUpgradePayment(
      paymentRecord,
      upgradeFromAccessId,
      previousAmountPaid,
    )
    return
  }

  // Check if dm_access already exists for this payment
  const existingAccess = await db
    .select()
    .from(dmAccess)
    .where(eq(dmAccess.paymentId, payment_id))

  if (existingAccess[0]) {
    console.log('DM access already exists for payment:', payment_id)
    return
  }

  // Create dm_access record - this grants the sender access to message the receiver
  const accessId = nanoid()
  await db.insert(dmAccess).values({
    id: accessId,
    senderId: paymentRecord.senderId,
    receiverId: paymentRecord.receiverId,
    type: paymentRecord.type,
    status: 'active',
    amountPaid: paymentRecord.amount,
    currency: paymentRecord.currency,
    paymentId: paymentRecord.id,
    guaranteedReplyFulfilled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  console.log(
    'Created DM access:',
    accessId,
    'for payment:',
    metadata.payment_id,
  )

  // ============================================
  // CREDIT CREATOR BALANCE
  // ============================================
  // Calculate creator's earnings after platform fee
  const platformFee = Math.round(paymentRecord.amount * PLATFORM_FEE_PERCENT)
  const creatorEarnings = paymentRecord.amount - platformFee

  // Get or create creator balance record
  const existingBalance = await db
    .select()
    .from(creatorBalance)
    .where(eq(creatorBalance.userId, paymentRecord.receiverId))

  const isGuaranteed = paymentRecord.type === 'guaranteed'

  if (existingBalance[0]) {
    // Update existing balance
    if (isGuaranteed) {
      // Guaranteed reply: add to pending balance (escrow)
      await db
        .update(creatorBalance)
        .set({
          pendingBalance: sql`${creatorBalance.pendingBalance} + ${creatorEarnings}`,
          totalEarned: sql`${creatorBalance.totalEarned} + ${creatorEarnings}`,
          updatedAt: new Date(),
        })
        .where(eq(creatorBalance.userId, paymentRecord.receiverId))
    } else {
      // Simple DM: add to available balance immediately
      await db
        .update(creatorBalance)
        .set({
          availableBalance: sql`${creatorBalance.availableBalance} + ${creatorEarnings}`,
          totalEarned: sql`${creatorBalance.totalEarned} + ${creatorEarnings}`,
          updatedAt: new Date(),
        })
        .where(eq(creatorBalance.userId, paymentRecord.receiverId))
    }
  } else {
    // Create new balance record
    await db.insert(creatorBalance).values({
      id: nanoid(),
      userId: paymentRecord.receiverId,
      availableBalance: isGuaranteed ? 0 : creatorEarnings,
      pendingBalance: isGuaranteed ? creatorEarnings : 0,
      totalEarned: creatorEarnings,
      totalWithdrawn: 0,
      currency: paymentRecord.currency,
      updatedAt: new Date(),
    })
  }

  // Get updated balance for transaction record
  const updatedBalance = await db
    .select()
    .from(creatorBalance)
    .where(eq(creatorBalance.userId, paymentRecord.receiverId))

  // Create balance transaction record
  await db.insert(balanceTransaction).values({
    id: nanoid(),
    userId: paymentRecord.receiverId,
    type: 'earning',
    amount: creatorEarnings,
    currency: paymentRecord.currency,
    balanceType: isGuaranteed ? 'pending' : 'available',
    runningBalance: isGuaranteed
      ? updatedBalance[0].pendingBalance
      : updatedBalance[0].availableBalance,
    description: isGuaranteed
      ? `Guaranteed reply payment (in escrow)`
      : `DM payment received`,
    paymentId: paymentRecord.id,
    dmAccessId: accessId,
    createdAt: new Date(),
  })

  console.log(
    `Credited ${creatorEarnings} cents to creator ${paymentRecord.receiverId}`,
    isGuaranteed ? '(pending/escrow)' : '(available)',
  )

  // ============================================
  // CREATE OR UPDATE CONVERSATION
  // ============================================
  // Check if there's already a conversation between these users
  const existingConv = await db
    .select()
    .from(conversation)
    .where(
      and(
        eq(conversation.senderId, paymentRecord.senderId),
        eq(conversation.receiverId, paymentRecord.receiverId),
      ),
    )

  if (!existingConv[0]) {
    // Create a new conversation linked to this dm_access
    const convId = nanoid()
    await db.insert(conversation).values({
      id: convId,
      senderId: paymentRecord.senderId,
      receiverId: paymentRecord.receiverId,
      subject: null,
      dmAccessId: accessId,
      status: 'active',
      creatorReplied: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('Created conversation:', convId)
  } else {
    // Update existing conversation with new dm_access
    await db
      .update(conversation)
      .set({
        dmAccessId: accessId,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(conversation.id, existingConv[0].id))

    console.log(
      'Updated conversation:',
      existingConv[0].id,
      'with dm_access:',
      accessId,
    )
  }
}

// Handle upgrade from paywall to guaranteed
async function handleUpgradePayment(
  paymentRecord: any,
  upgradeFromAccessId: string,
  previousAmountPaid: number,
) {
  // Find the existing dm_access to upgrade
  const existingAccessResult = await db
    .select()
    .from(dmAccess)
    .where(eq(dmAccess.id, upgradeFromAccessId))

  const existingAccess = existingAccessResult[0]
  if (!existingAccess) {
    console.error(
      'Existing dm_access not found for upgrade:',
      upgradeFromAccessId,
    )
    return
  }

  // Calculate total amount paid (previous + new payment)
  const totalAmountPaid = previousAmountPaid + paymentRecord.amount

  // Update the existing dm_access record to guaranteed
  await db
    .update(dmAccess)
    .set({
      type: 'guaranteed',
      amountPaid: totalAmountPaid,
      paymentId: paymentRecord.id, // Link to the upgrade payment
      updatedAt: new Date(),
    })
    .where(eq(dmAccess.id, upgradeFromAccessId))

  console.log(
    'Upgraded dm_access:',
    upgradeFromAccessId,
    'to guaranteed. Total paid:',
    totalAmountPaid,
  )

  // ============================================
  // HANDLE BALANCE CHANGES FOR UPGRADE
  // ============================================
  // The previous payment was for paywall (went to available balance)
  // Now we need to:
  // 1. Credit the new upgrade payment to pending balance (escrow)
  // 2. Move the previous amount from available to pending (escrow)

  const platformFee = Math.round(paymentRecord.amount * PLATFORM_FEE_PERCENT)
  const newEarnings = paymentRecord.amount - platformFee

  // Also calculate what was earned from the original payment
  const previousPlatformFee = Math.round(
    previousAmountPaid * PLATFORM_FEE_PERCENT,
  )
  const previousEarnings = previousAmountPaid - previousPlatformFee

  // Get creator's current balance
  const currentBalance = await db
    .select()
    .from(creatorBalance)
    .where(eq(creatorBalance.userId, paymentRecord.receiverId))

  if (currentBalance[0]) {
    // Move previous earnings from available to pending + add new earnings to pending
    await db
      .update(creatorBalance)
      .set({
        availableBalance: sql`GREATEST(0, ${creatorBalance.availableBalance} - ${previousEarnings})`,
        pendingBalance: sql`${creatorBalance.pendingBalance} + ${previousEarnings} + ${newEarnings}`,
        totalEarned: sql`${creatorBalance.totalEarned} + ${newEarnings}`,
        updatedAt: new Date(),
      })
      .where(eq(creatorBalance.userId, paymentRecord.receiverId))
  } else {
    // Shouldn't happen normally, but create balance record
    await db.insert(creatorBalance).values({
      id: nanoid(),
      userId: paymentRecord.receiverId,
      availableBalance: 0,
      pendingBalance: previousEarnings + newEarnings,
      totalEarned: previousEarnings + newEarnings,
      totalWithdrawn: 0,
      currency: paymentRecord.currency,
      updatedAt: new Date(),
    })
  }

  // Get updated balance
  const updatedBalance = await db
    .select()
    .from(creatorBalance)
    .where(eq(creatorBalance.userId, paymentRecord.receiverId))

  // Create transaction for moving previous earnings to escrow
  await db.insert(balanceTransaction).values({
    id: nanoid(),
    userId: paymentRecord.receiverId,
    type: 'adjustment',
    amount: -previousEarnings,
    currency: paymentRecord.currency,
    balanceType: 'available',
    runningBalance: updatedBalance[0].availableBalance,
    description: `Moved to escrow for guaranteed reply upgrade`,
    paymentId: paymentRecord.id,
    dmAccessId: upgradeFromAccessId,
    createdAt: new Date(),
  })

  // Create transaction for the new upgrade payment + moved amount going to pending
  await db.insert(balanceTransaction).values({
    id: nanoid(),
    userId: paymentRecord.receiverId,
    type: 'earning',
    amount: previousEarnings + newEarnings,
    currency: paymentRecord.currency,
    balanceType: 'pending',
    runningBalance: updatedBalance[0].pendingBalance,
    description: `Guaranteed reply upgrade payment (in escrow)`,
    paymentId: paymentRecord.id,
    dmAccessId: upgradeFromAccessId,
    createdAt: new Date(),
  })

  console.log(
    `Upgrade balance update: moved ${previousEarnings} from available to pending, added ${newEarnings} new earnings to pending`,
  )

  // Update conversation to link to the upgraded access
  const existingConv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.dmAccessId, upgradeFromAccessId))

  if (existingConv[0]) {
    await db
      .update(conversation)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(conversation.id, existingConv[0].id))

    console.log('Updated conversation for upgrade:', existingConv[0].id)
  }
}

async function handlePaymentFailed(data: any) {
  const { metadata } = data

  if (!metadata?.payment_id) {
    console.error('Missing payment_id in metadata')
    return
  }

  await db
    .update(payment)
    .set({
      status: 'failed',
      updatedAt: new Date(),
    })
    .where(eq(payment.id, metadata.payment_id))

  console.log('Payment failed:', metadata.payment_id)
}

async function handleRefundSucceeded(data: any) {
  const { metadata, refund_reason } = data

  if (!metadata?.payment_id) {
    console.error('Missing payment_id in metadata')
    return
  }

  // Find the payment record first
  const paymentResult = await db
    .select()
    .from(payment)
    .where(eq(payment.id, metadata.payment_id))
  const paymentRecord = paymentResult[0]

  // Update payment status
  await db
    .update(payment)
    .set({
      status: 'refunded',
      refundedAt: new Date(),
      refundReason: refund_reason || null,
      updatedAt: new Date(),
    })
    .where(eq(payment.id, metadata.payment_id))

  // Find and update the dm_access record
  const accessResult = await db
    .select()
    .from(dmAccess)
    .where(eq(dmAccess.paymentId, metadata.payment_id))

  if (accessResult[0]) {
    await db
      .update(dmAccess)
      .set({
        status: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(dmAccess.id, accessResult[0].id))

    // Also update the conversation status
    const convResult = await db
      .select()
      .from(conversation)
      .where(eq(conversation.dmAccessId, accessResult[0].id))

    if (convResult[0]) {
      await db
        .update(conversation)
        .set({
          status: 'closed',
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, convResult[0].id))
    }
  }

  // ============================================
  // DEDUCT FROM CREATOR BALANCE
  // ============================================
  if (paymentRecord) {
    const platformFee = Math.round(paymentRecord.amount * PLATFORM_FEE_PERCENT)
    const creatorEarnings = paymentRecord.amount - platformFee
    const isGuaranteed = paymentRecord.type === 'guaranteed'
    const wasReleased = accessResult[0]?.guaranteedReplyFulfilled

    // Get creator's current balance
    const currentBalance = await db
      .select()
      .from(creatorBalance)
      .where(eq(creatorBalance.userId, paymentRecord.receiverId))

    if (currentBalance[0]) {
      // Determine which balance to deduct from
      // If guaranteed and NOT yet released, deduct from pending
      // Otherwise, deduct from available
      const deductFromPending = isGuaranteed && !wasReleased

      if (deductFromPending) {
        await db
          .update(creatorBalance)
          .set({
            pendingBalance: sql`GREATEST(0, ${creatorBalance.pendingBalance} - ${creatorEarnings})`,
            totalEarned: sql`GREATEST(0, ${creatorBalance.totalEarned} - ${creatorEarnings})`,
            updatedAt: new Date(),
          })
          .where(eq(creatorBalance.userId, paymentRecord.receiverId))
      } else {
        await db
          .update(creatorBalance)
          .set({
            availableBalance: sql`GREATEST(0, ${creatorBalance.availableBalance} - ${creatorEarnings})`,
            totalEarned: sql`GREATEST(0, ${creatorBalance.totalEarned} - ${creatorEarnings})`,
            updatedAt: new Date(),
          })
          .where(eq(creatorBalance.userId, paymentRecord.receiverId))
      }

      // Get updated balance
      const updatedBalance = await db
        .select()
        .from(creatorBalance)
        .where(eq(creatorBalance.userId, paymentRecord.receiverId))

      // Create refund transaction record
      await db.insert(balanceTransaction).values({
        id: nanoid(),
        userId: paymentRecord.receiverId,
        type: 'refund',
        amount: -creatorEarnings, // Negative for deduction
        currency: paymentRecord.currency,
        balanceType: deductFromPending ? 'pending' : 'available',
        runningBalance: deductFromPending
          ? updatedBalance[0].pendingBalance
          : updatedBalance[0].availableBalance,
        description: `Refund for payment`,
        paymentId: paymentRecord.id,
        dmAccessId: accessResult[0]?.id || null,
        createdAt: new Date(),
      })

      console.log(
        `Deducted ${creatorEarnings} cents from creator ${paymentRecord.receiverId}`,
        deductFromPending ? '(from pending)' : '(from available)',
      )
    }
  }

  console.log('Refund processed for payment:', metadata.payment_id)
}
