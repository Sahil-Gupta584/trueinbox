import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db'
import { user as userSchema } from '#/db/schema'
import { and, isNotNull, or, gt } from 'drizzle-orm'

export const Route = createFileRoute('/api/creators')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const pageStr = url.searchParams.get('page') || '1'
        const page = parseInt(pageStr)
        
        // Only show creators who have set at least one DM price
        const creators = await db
          .select()
          .from(userSchema)
          .where(
            or(
              and(isNotNull(userSchema.dmPrice), gt(userSchema.dmPrice, 0)),
              and(
                isNotNull(userSchema.guaranteedReplyPrice),
                gt(userSchema.guaranteedReplyPrice, 0),
              ),
            ),
          )
          .limit(20)
          .offset((page - 1) * 20)
        
        return Response.json(creators)
      },
    },
  },
})
