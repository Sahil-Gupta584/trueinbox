import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db'
import { user, dmAccess, conversation, payment } from '#/db/schema'
import { eq, and, or, desc, isNull, isNotNull } from 'drizzle-orm'

export const Route = createFileRoute('/api/dm-access/$username')({
  server: {
    handlers: {
      // Check if current user has DM access to a specific creator
      GET: async ({ params, context }) => {
        const session = context as any

        const myId = session.user.id
        const { username } = params
        const user2 = await db.select().from(user).where(eq(user.username, username)).then(res => res[0])
        if (!user2) {
          return Response.json({ message: 'Creator not found' }, { status: 404 })
        }
        if (user2.id === myId) {
          return Response.json({
            hasAccess: true,
            isOwner: true,
            creator: {
              id: user2.id,
              name: user2.name,
              username: user2.username,
              image: user2.image,
              dmPrice: user2.dmPrice,
              guaranteedReplyPrice: user2.guaranteedReplyPrice,
            },
          })
        }
        console.log(myId,user2.id);
        
        const paymentRecordQuery = await db
          .select({
            senderId: payment.senderId,
            receiverId: payment.receiverId,
            amount: payment.amount,
            status: payment.status,
            refundedAt: payment.refundedAt,
          })
          .from(payment)
          .where(
            and(
              or(
                and(eq(payment.senderId, myId), eq(payment.receiverId, user2.id)),
                and(eq(payment.senderId, user2.id), eq(payment.receiverId, myId))
              ),
              or(
                and(eq(payment.status, 'succeeded'), isNull(payment.refundedAt)),
                and(eq(payment.status, 'pending'), isNotNull(payment.refundedAt))
              )
            )
          )
          .limit(1)

        const paymentRecord = paymentRecordQuery[0]
        
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!paymentRecord) {
          return Response.json({
            hasAccess: false,
            isOwner: false,
            creator: {
              id: user2.id,
              name: user2.name,
              username: user2.username,
              image: user2.image,
              dmPrice: user2.dmPrice,
              guaranteedReplyPrice: user2.guaranteedReplyPrice,
            },
          })
        }
        // Find the creator by username
        const creatorResult = await db
          .select()
          .from(user)
          .where(eq(user.id, paymentRecord.receiverId))
        const creator = creatorResult[0]
        const fanResult = await db
          .select()
          .from(user)
          .where(eq(user.id, paymentRecord.senderId))
        const fan = fanResult[0]

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!creator) {
          return Response.json(
            { message: 'Creator not found' },
            { status: 404 },
          )
        }

        // If the user is the creator themselves, they have full access


        // Check if creator charges for DMs
        const dmPrice = creator.dmPrice ?? 0
        const guaranteedPrice = creator.guaranteedReplyPrice ?? 0
        const requiresPayment = dmPrice > 0 || guaranteedPrice > 0

        // If creator doesn't charge, access is free
        if (!requiresPayment) {
          return Response.json({
            hasAccess: true,
            isFree: true,
            creator: {
              id: creator.id,
              name: creator.name,
              username: creator.username,
              image: creator.image,
              dmPrice: creator.dmPrice,
              guaranteedReplyPrice: creator.guaranteedReplyPrice,
            },
          })
        }

        // Check for active dm_access (as sender OR receiver)
        const accessResult = await db
          .select()
          .from(dmAccess)
          .where(
            and(
              eq(dmAccess.senderId, paymentRecord.senderId),
              eq(dmAccess.receiverId, paymentRecord.receiverId),
              eq(dmAccess.status, 'active'),
            ),
          )
          .orderBy(desc(dmAccess.createdAt))
          .limit(1)

        const access = accessResult[0]

        const convResult = await db
          .select({
            id: conversation.id,
            status: conversation.status,
            creatorReplied: conversation.creatorReplied,
            senderId: conversation.senderId,
            receiverId: conversation.receiverId,
          })
          .from(conversation)
          .where(
            and(
              eq(conversation.senderId, paymentRecord.senderId),
              eq(conversation.receiverId, paymentRecord.receiverId),
            ),
          )
          .orderBy(desc(conversation.createdAt))
          .limit(1)

        const conv = convResult[0]

        return Response.json({
          hasAccess: !!access,
          requiresPayment: true,
          refund:paymentRecord ,
          access: access
            ? {
              id: access.id,
              type: access.type,
              amountPaid: access.amountPaid,
              guaranteedReplyFulfilled: access.guaranteedReplyFulfilled,
              createdAt: access.createdAt,
            }
            : null,
          conversation: conv,
          creator: {
            id: creator.id,
            name: creator.name,
            username: creator.username,
            image: creator.image,
            dmPrice: creator.dmPrice,
            guaranteedReplyPrice: creator.guaranteedReplyPrice,
          },
          fan: {
            id: fan.id,
            name: fan.name,
            image: fan.image,
          }
        })
      },
    },
  },
})
