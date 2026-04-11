import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db'
import { user as userSchema } from '#/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/creators/$username')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { username } = params
        const result = await db.select({
          id: userSchema.id, 
          name: userSchema.name, 
          username: userSchema.username,
          bio: userSchema.bio, 
          niche: userSchema.niche,
          dmPrice: userSchema.dmPrice,
          guaranteedReplyPrice: userSchema.guaranteedReplyPrice,
          socialTwitter: userSchema.socialTwitter, 
          socialInstagram: userSchema.socialInstagram,
          socialYoutube: userSchema.socialYoutube, 
          followerCount: userSchema.followerCount,
          image: userSchema.image,
        }).from(userSchema).where(eq(userSchema.username, username))
        
        const creator = result[0]
        if (!creator) return Response.json({ message: "Not found" }, { status: 404 })
        return Response.json(creator)
      }
    }
  }
})
