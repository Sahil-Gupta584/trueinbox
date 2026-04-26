import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { db } from '#/db'
import { env } from './env'

const resend = new Resend(env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  baseURL: env.BASE_URL,
  plugins: [
    tanstackStartCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log('b');

        if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 're_123456789') {
          console.log(`Magic link for ${email}: ${url}`)
          return
        }
        const a = await resend.emails.send({
          from: 'login@syncmate.xyz',
          to: email,
          subject: 'Sign in to TrueInbox',
          html: `<p>Click the link below to sign in to your account:</p><p><a href="${url}">${url}</a></p>`,
        })
        console.log(a);

      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
})
