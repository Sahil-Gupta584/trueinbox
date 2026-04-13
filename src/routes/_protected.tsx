import { Navbar } from '#/components/navbar'
import { getSession } from '#/lib/auth-client'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: '/login' })
    }
    return session
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 mt-18">
        <Outlet />
      </main>
    </div>
  )
}
