import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { conversation, message } from '#/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'

export const Route = createFileRoute('/api/conversations/$id/messages')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
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
        if (conv.senderId !== myId && conv.receiverId !== myId)
          return Response.json({ message: 'Forbidden' }, { status: 403 })

        const messages = await db
          .select()
          .from(message)
          .where(eq(message.conversationId, conv.id))
          .orderBy(message.createdAt)

        await db
          .update(message)
          .set({ isRead: true })
          .where(
            and(
              eq(message.conversationId, conv.id),
              ne(message.senderId, myId),
              eq(message.isRead, false),
            ),
          )

        return Response.json(messages)
      },
      POST: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const myId = session.user.id
        const { id } = params
        const { content } = await request.json()

        if (!content?.trim())
          return Response.json({ message: 'Missing content' }, { status: 400 })

        const convResult = await db
          .select()
          .from(conversation)
          .where(eq(conversation.id, id))
        const conv = convResult[0]
        if (!conv)
          return Response.json({ message: 'Not found' }, { status: 404 })
        if (conv.senderId !== myId && conv.receiverId !== myId)
          return Response.json({ message: 'Forbidden' }, { status: 403 })

        const msgResult = await db
          .insert(message)
          .values({
            id: nanoid(),
            conversationId: conv.id,
            senderId: myId,
            content: content.trim(),
            createdAt: new Date(),
            isRead: false,
          })
          .returning()
        const msg = msgResult[0]

        let updatedConv = conv
        if (
          conv.type === 'guaranteed' &&
          conv.receiverId === myId &&
          conv.status === 'pending'
        ) {
          const res = await db
            .update(conversation)
            .set({ status: 'replied', updatedAt: new Date() })
            .where(eq(conversation.id, conv.id))
            .returning()
          updatedConv = res[0]
        } else {
          await db
            .update(conversation)
            .set({ updatedAt: new Date() })
            .where(eq(conversation.id, conv.id))
        }

        return Response.json({ message: msg, conversation: updatedConv })
      },
    },
  },
})
