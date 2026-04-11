import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db'
import { user as userSchema, session as sessionSchema } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from '#/lib/nanoid'

async function signCookieValue(value: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${value}.${b64}`;
}

export const Route = createFileRoute('/api/dev-login')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (process.env.NODE_ENV === "production") {
          return Response.json({ message: "Not found" }, { status: 404 })
        }

        const email = "guptas3067@gmail.com"
        const name = "Sahil Gupta"
        const secret = process.env.BETTER_AUTH_SECRET || "trueinbox-dev-secret-change-in-prod"

        let userResult = await db.select().from(userSchema).where(eq(userSchema.email, email))
        let user = userResult[0]
        
        if (!user) {
          const newUser = await db.insert(userSchema).values({
            id: nanoid(),
            name,
            email,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning()
          user = newUser[0]
        } else if (!user.name) {
          const updatedUser = await db.update(userSchema).set({ name, updatedAt: new Date() })
            .where(eq(userSchema.id, user.id)).returning()
          user = updatedUser[0]
        }

        const token = nanoid(32)
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await db.insert(sessionSchema).values({
          id: nanoid(),
          token,
          userId: user!.id,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const signedToken = await signCookieValue(token, secret)
        const isSecure = new URL(request.url).protocol === "https:"
        const cookieFlags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${isSecure ? "; Secure" : ""}`
        
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/dashboard',
            'Set-Cookie': `better-auth.session_token=${signedToken}; ${cookieFlags}`
          }
        })
      }
    }
  }
})
