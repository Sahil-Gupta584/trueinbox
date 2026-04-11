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

    return <div className="min-h-screen">
        <Navbar />
        <main className="p-4 pt-14  flex items-center justify-center bg-[#faf9f7]  max-w-4xl mx-auto">
            <Outlet />
        </main>
    </div>
}
