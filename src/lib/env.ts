import { z } from 'zod'
import { config } from 'dotenv'

config({ override: true })

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  BASE_URL: z.string().min(1, 'BASE_URL is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DODO_API_KEY: z.string().min(1, 'DODO_PAYMENTS_API_KEY is required'),
  DODO_API_BASE: z.string().min(1, 'DODO_API_BASE is required'),
  DODO_PAYMENTS_WEBHOOK_KEY: z
    .string()
    .min(1, 'DODO_PAYMENTS_WEBHOOK_KEY is required'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.issues.forEach((issue) => {
        console.error(
          `   - ${issue.path.join('.')}: ${issue.message}. actual value:${process.env[issue.path.join('.')]}`,
        )
      })
      process.exit(1)
    }
    throw error
  }
}

export const env = validateEnv()
