import { createStart } from '@tanstack/react-start'
import { requireAuth } from './lib/middlewares/auth'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [requireAuth],
  }
})
