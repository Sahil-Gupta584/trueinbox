import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { creatorBalance, balanceTransaction } from '#/db/schema'
import { eq, desc } from 'drizzle-orm'

export const Route = createFileRoute('/api/balance')({
  server: {
    handlers: {
      // Get current user's balance
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return new Response('Unauthorized', { status: 401 })

        // Get balance
        const balanceResult = await db
          .select()
          .from(creatorBalance)
          .where(eq(creatorBalance.userId, session.user.id))

        const balance = balanceResult[0] || {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          currency: 'USD',
        }

        // Get recent transactions
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        const transactions = await db
          .select()
          .from(balanceTransaction)
          .where(eq(balanceTransaction.userId, session.user.id))
          .orderBy(desc(balanceTransaction.createdAt))
          .limit(limit)
          .offset(offset)

        return Response.json({
          balance: {
            available: balance.availableBalance,
            pending: balance.pendingBalance,
            totalEarned: balance.totalEarned,
            totalWithdrawn: balance.totalWithdrawn,
            currency: balance.currency,
          },
          transactions,
        })
      },
    },
  },
})
