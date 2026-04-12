import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db'
import { user as userSchema } from '#/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/creators')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const pageStr = url.searchParams.get('page') || '1'
        const page = parseInt(pageStr)
        const creators = await db
          .select()
          .from(userSchema)
          .limit(20)
          .offset((page - 1) * 20)
        return Response.json(creators)
      },
    },
  },
})
