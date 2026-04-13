import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.ts'
import { env } from '#/lib/env.ts'

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
})
export const db = drizzle({ client: pool, schema })
