import { createServerFn } from '@tanstack/react-start'
import { createAuthClient } from 'better-auth/react'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'

export const authClient = createAuthClient()
export const { useSession, signIn, signOut } = authClient
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
        headers,
    })
    return session
})