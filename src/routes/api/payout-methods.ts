import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { creatorPayoutMethod } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'

export const Route = createFileRoute('/api/payout-methods')({
  server: {
    handlers: {
      // Get all payout methods for current user
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const methods = await db
          .select()
          .from(creatorPayoutMethod)
          .where(eq(creatorPayoutMethod.userId, session.user.id))
          .orderBy(creatorPayoutMethod.createdAt)

        return Response.json(methods)
      },

      // Add a new payout method
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const data = await request.json()

        // Validate required fields based on method type
        if (!data.methodType) {
          return Response.json(
            { message: 'Method type is required' },
            { status: 400 },
          )
        }

        // Validate based on method type
        const validationErrors: string[] = []

        switch (data.methodType) {
          case 'bank_india':
            if (!data.bankAccountNumber)
              validationErrors.push('Bank account number is required')
            if (!data.bankIfsc) validationErrors.push('IFSC code is required')
            if (!data.accountHolderName)
              validationErrors.push('Account holder name is required')
            break

          case 'bank_us':
            if (!data.bankAccountNumber)
              validationErrors.push('Bank account number is required')
            if (!data.bankRoutingNumber)
              validationErrors.push('Routing number is required')
            if (!data.accountHolderName)
              validationErrors.push('Account holder name is required')
            break

          case 'bank_eu':
            if (!data.bankIban) validationErrors.push('IBAN is required')
            if (!data.accountHolderName)
              validationErrors.push('Account holder name is required')
            break

          case 'upi':
            if (!data.upiId) validationErrors.push('UPI ID is required')
            break

          case 'paypal':
            if (!data.paypalEmail)
              validationErrors.push('PayPal email is required')
            break

          default:
            validationErrors.push('Invalid method type')
        }

        if (validationErrors.length > 0) {
          return Response.json(
            { message: validationErrors.join(', ') },
            { status: 400 },
          )
        }

        // Check if this is the first method (make it primary)
        const existingMethods = await db
          .select()
          .from(creatorPayoutMethod)
          .where(eq(creatorPayoutMethod.userId, session.user.id))

        const isPrimary = existingMethods.length === 0 || data.isPrimary

        // If setting as primary, unset other primary methods
        if (isPrimary && existingMethods.length > 0) {
          await db
            .update(creatorPayoutMethod)
            .set({ isPrimary: false, updatedAt: new Date() })
            .where(eq(creatorPayoutMethod.userId, session.user.id))
        }

        // Generate display name
        let displayName = ''
        switch (data.methodType) {
          case 'bank_india':
          case 'bank_us':
          case 'bank_eu':
            const lastFour = (
              data.bankAccountNumber ||
              data.bankIban ||
              ''
            ).slice(-4)
            displayName = `${data.bankName || 'Bank'} ****${lastFour}`
            break
          case 'upi':
            displayName = `UPI: ${data.upiId}`
            break
          case 'paypal':
            displayName = `PayPal: ${data.paypalEmail}`
            break
        }

        // Create the payout method
        const newMethod = await db
          .insert(creatorPayoutMethod)
          .values({
            id: nanoid(),
            userId: session.user.id,
            methodType: data.methodType,
            displayName,
            bankAccountNumber: data.bankAccountNumber || null,
            bankRoutingNumber: data.bankRoutingNumber || null,
            bankIban: data.bankIban || null,
            bankIfsc: data.bankIfsc || null,
            bankSwift: data.bankSwift || null,
            bankName: data.bankName || null,
            accountHolderName: data.accountHolderName || null,
            paypalEmail: data.paypalEmail || null,
            upiId: data.upiId || null,
            isVerified: false,
            isPrimary,
            country: data.country || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()

        return Response.json(newMethod[0])
      },

      // Delete a payout method
      DELETE: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const url = new URL(request.url)
        const methodId = url.searchParams.get('id')

        if (!methodId) {
          return Response.json(
            { message: 'Method ID is required' },
            { status: 400 },
          )
        }

        // Verify the method belongs to the user
        const method = await db
          .select()
          .from(creatorPayoutMethod)
          .where(
            and(
              eq(creatorPayoutMethod.id, methodId),
              eq(creatorPayoutMethod.userId, session.user.id),
            ),
          )

        if (!method[0]) {
          return Response.json(
            { message: 'Payout method not found' },
            { status: 404 },
          )
        }

        await db
          .delete(creatorPayoutMethod)
          .where(eq(creatorPayoutMethod.id, methodId))

        // If deleted method was primary, make another one primary
        if (method[0].isPrimary) {
          const remainingMethods = await db
            .select()
            .from(creatorPayoutMethod)
            .where(eq(creatorPayoutMethod.userId, session.user.id))
            .limit(1)

          if (remainingMethods[0]) {
            await db
              .update(creatorPayoutMethod)
              .set({ isPrimary: true, updatedAt: new Date() })
              .where(eq(creatorPayoutMethod.id, remainingMethods[0].id))
          }
        }

        return Response.json({ success: true })
      },
    },
  },
})
