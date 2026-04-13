import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { conversation } from '#/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/conversations/$id/refund')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const myId = session.user.id
        const { id } = params

        const convResult = await db
          .select()
          .from(conversation)
          .where(eq(conversation.id, id))
        const conv = convResult[0]
        if (!conv)
          return Response.json({ message: 'Not found' }, { status: 404 })
        if (conv.receiverId !== myId)
          return Response.json(
            { message: 'Only the creator can refund' },
            { status: 403 },
          )
        if (conv.type !== 'paywall')
          return Response.json(
            { message: 'Only paywall DMs can be refunded' },
            { status: 400 },
          )

        const updatedResult = await db
          .update(conversation)
          .set({ status: 'refunded', updatedAt: new Date() })
          .where(eq(conversation.id, conv.id))
          .returning()

        return Response.json(updatedResult[0])
      },
    },
  },
})
