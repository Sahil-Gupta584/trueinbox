import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { user, userPaymentSettings, payment, dmAccess } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { env } from '#/lib/env'

// DodoPayments API configuration

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const myId = session.user.id
        const {
          creatorId,
          type,
          upgradeFromAccessId,
        }: {
          creatorId: string
          type: 'paywall' | 'guaranteed'
          upgradeFromAccessId?: string // If upgrading from paywall to guaranteed
        } = await request.json()

        if (!creatorId || !type) {
          return Response.json(
            { message: 'Missing creatorId or type' },
            { status: 400 },
          )
        }

        // Can't pay yourself
        if (creatorId === myId) {
          return Response.json(
            { message: 'You cannot pay yourself' },
            { status: 400 },
          )
        }

        // Fetch creator
        const creatorResult = await db
          .select()
          .from(user)
          .where(eq(user.id, creatorId))
        const creator = creatorResult[0]
        if (!creator) {
          return Response.json(
            { message: 'Creator not found' },
            { status: 404 },
          )
        }

        // Fetch creator's payment settings
        const paymentSettingsResult = await db
          .select()
          .from(userPaymentSettings)
          .where(eq(userPaymentSettings.userId, creatorId))
        const paymentSettings = paymentSettingsResult[0]
        console.log({ paymentSettings })

        // Determine price (stored in dollars, convert to cents for payment)
        let priceInDollars =
          type === 'guaranteed'
            ? (creator.guaranteedReplyPrice ?? 0)
            : (creator.dmPrice ?? 0)

        let isUpgrade = false
        let existingAccessId: string | null = null
        let previousAmountPaid = 0

        // Handle upgrade from paywall to guaranteed
        if (upgradeFromAccessId && type === 'guaranteed') {
          const existingAccess = await db
            .select()
            .from(dmAccess)
            .where(
              and(
                eq(dmAccess.id, upgradeFromAccessId),
                eq(dmAccess.senderId, myId),
                eq(dmAccess.receiverId, creatorId),
                eq(dmAccess.type, 'paywall'),
                eq(dmAccess.status, 'active'),
              ),
            )

          if (existingAccess[0]) {
            isUpgrade = true
            existingAccessId = existingAccess[0].id
            // Amount already paid (in cents), convert to dollars for calculation
            previousAmountPaid = existingAccess[0].amountPaid
            const previousAmountInDollars = previousAmountPaid / 100

            // Calculate the difference
            const guaranteedPrice = creator.guaranteedReplyPrice ?? 0
            priceInDollars = Math.max(
              0,
              guaranteedPrice - previousAmountInDollars,
            )

            if (priceInDollars <= 0) {
              // Already paid enough, just upgrade directly
              // This shouldn't happen normally but handle edge case
              return Response.json(
                {
                  message:
                    'You have already paid enough for a guaranteed reply',
                },
                { status: 400 },
              )
            }
          } else {
            return Response.json(
              { message: 'No valid paywall access found to upgrade' },
              { status: 400 },
            )
          }
        }

        if (priceInDollars <= 0) {
          return Response.json(
            { message: 'This creator does not charge for this type of DM' },
            { status: 400 },
          )
        }

        const priceInCents = Math.round(priceInDollars * 100)
        let paymentId = null
        const metadata: Record<string, any> = {
          sender_id: myId,
          receiver_id: creatorId,
          type,
        }
        if (isUpgrade) metadata.is_upgrade = String(isUpgrade)
        if (existingAccessId) metadata.upgrade_from_access_id = existingAccessId
        if (previousAmountPaid) metadata.previous_amount_paid = String(previousAmountPaid)
        
        try {
          const checkoutResponse = await fetch(
            `${env.DODO_API_BASE}/payments`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.DODO_API_KEY}`,
              },
              body: JSON.stringify({
                billing: {
                  currency: 'USD',
                  country: 'US',
                },
                customer: {
                  email: session.user.email,
                  name: session.user.name || 'TrueInbox User',
                },
                product_cart: [
                  {
                    product_id: `pdt_0NcaBSeeRfNZQccto9nA2`,
                    quantity: 1,
                    amount: priceInCents,
                  },
                ],
                payment_link: true,
                return_url: `${env.BASE_URL}/inbox/${creator.username}`,
                metadata,
              }),
            },
          )
          const checkoutData = await checkoutResponse.json()
          paymentId = (checkoutData?.payment_id as string) || null
          if (!paymentId) {
            console.error(
              'DodoPayments error: No payment ID returned',
              checkoutData,
            )
            return Response.json(
              { message: 'Failed to create checkout session' },
              { status: 500 },
            )
          }
          await db.insert(payment).values({
            id: paymentId,
            senderId: myId,
            receiverId: creatorId,
            amount: priceInCents,
            currency: 'USD',
            type: isUpgrade ? 'guaranteed' : type,
            status: 'pending',
            provider: 'dodo',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          if (!checkoutResponse.ok) {
            console.error('DodoPayments error:', checkoutData, checkoutResponse)
            console.log();

            // Mark payment as failed
            await db
              .update(payment)
              .set({ status: 'failed', updatedAt: new Date() })
              .where(eq(payment.id, paymentId))

            return Response.json(
              { message: 'Failed to create checkout session' },
              { status: 500 },
            )
          }

          // Update payment record with provider references
          await db
            .update(payment)
            .set({
              providerPaymentId: checkoutData.payment_id,
              providerCheckoutUrl: checkoutData.payment_link,
              providerCheckoutId: checkoutData.id,
              status: 'processing',
              updatedAt: new Date(),
            })
            .where(eq(payment.id, paymentId))

          return Response.json({
            checkoutUrl: checkoutData.payment_link,
            paymentId,
            isUpgrade,
            amountToPay: priceInDollars,
          })
        } catch (error) {
          console.error('Checkout error:', error)
          if (paymentId) {
            await db
              .update(payment)
              .set({ status: 'failed', updatedAt: new Date() })
              .where(eq(payment.id, paymentId))
          }
          return Response.json(
            { message: 'Failed to create checkout' },
            { status: 500 },
          )
        }
      },
    },
  },
})
