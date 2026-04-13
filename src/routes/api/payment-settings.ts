import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { userPaymentSettings } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'

export const Route = createFileRoute('/api/payment-settings')({
  server: {
    handlers: {
      // Get current user's payment settings
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const result = await db
          .select()
          .from(userPaymentSettings)
          .where(eq(userPaymentSettings.userId, session.user.id))

        return Response.json(result[0] || null)
      },

      // Update payment settings
      PATCH: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const data = await request.json()

        // Check if settings exist
        const existing = await db
          .select()
          .from(userPaymentSettings)
          .where(eq(userPaymentSettings.userId, session.user.id))

        if (existing[0]) {
          // Update existing
          const updated = await db
            .update(userPaymentSettings)
            .set({
              ...data,
              updatedAt: new Date(),
            })
            .where(eq(userPaymentSettings.userId, session.user.id))
            .returning()

          return Response.json(updated[0])
        } else {
          // Create new
          const created = await db
            .insert(userPaymentSettings)
            .values({
              id: nanoid(),
              userId: session.user.id,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()

          return Response.json(created[0])
        }
      },
    },
  },
})
