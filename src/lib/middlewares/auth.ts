import { auth } from '@/lib/auth'
import { createMiddleware } from '@tanstack/react-start'

export const requireAuth = createMiddleware().server(
  async ({ next, request, pathname }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers })

      const publicRoutes = ['/api/auth', '/login', '/api/webhook']
      if (pathname==='/landing'||pathname==='/'||publicRoutes.some((route) => pathname.startsWith(route))) {
        return next()
      }

      if (!session?.user) {
        if (pathname.startsWith('/api/')) {
          console.error('Unauthorized access attempt to:', pathname)
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return Response.redirect(new URL('/login', request.url))
      }
      if (pathname === '/login') {
        return Response.redirect(new URL('/dashboard', request.url))
      }

      return next({
        context: session,
      })
    } catch (error) {
      console.log(error)
      return next()
    }
  },
)
