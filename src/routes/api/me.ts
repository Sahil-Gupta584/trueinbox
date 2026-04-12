import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { user as userSchema } from '#/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const result = await db
          .select()
          .from(userSchema)
          .where(eq(userSchema.id, session.user.id))
          console.log({result});
          
        return Response.json(result[0] || null)
      },
      PATCH: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        const body = await request.json()
        const allowed = [
          'name',
          'username',
          'bio',
          'niche',
          'country',
          'dmPrice',
          'guaranteedReplyPrice',
          'socialTwitter',
          'socialTwitterAudience',
          'socialInstagram',
          'socialInstagramAudience',
          'socialYoutube',
          'socialYoutubeAudience',
          'followerCount',
          'image',
        ]
        const updates: Record<string, any> = { updatedAt: new Date() }
        for (const key of allowed) {
          if (body[key] !== undefined) updates[key] = body[key]
        }

        const updated = await db
          .update(userSchema)
          .set(updates)
          .where(eq(userSchema.id, session.user.id))
          .returning()

        return Response.json(updated[0] || null)
      },
    },
  },
})
