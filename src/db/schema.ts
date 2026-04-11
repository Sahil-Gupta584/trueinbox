import * as t from 'drizzle-orm/pg-core'
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial().primaryKey(),
  title: text().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const user = pgTable('user', {
  id: t.text('id').primaryKey(),
  name: t.text('name').notNull(),
  email: t.varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: t.boolean('email_verified').notNull(),
  image: t.text('image'),
  username: t.text('username').unique(),
  bio: t.text('bio'),
  niche: t.text('niche'),
  country: t.text('country'),
  dmPrice: t.integer('dm_price'),
  guaranteedReplyPrice: t.integer('guaranteed_reply_price'),
  socialTwitter: t.text('social_twitter'),
  socialTwitterAudience: t.text('social_twitter_audience'),
  socialInstagram: t.text('social_instagram'),
  socialInstagramAudience: t.text('social_instagram_audience'),
  socialYoutube: t.text('social_youtube'),
  socialYoutubeAudience: t.text('social_youtube_audience'),
  followerCount: t.integer('follower_count').default(0),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

export const conversation = pgTable('conversation', {
  id: t.text('id').primaryKey(),
  senderId: t
    .text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  receiverId: t
    .text('receiver_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  subject: t.text('subject'),
  paidAmount: t.integer('paid_amount').notNull(),
  type: t.text('type').notNull(), // "paywall" | "guaranteed"
  status: t.text('status').notNull().default('pending'), // "pending", "replied", "refunded"
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

export const message = pgTable('message', {
  id: t.text('id').primaryKey(),
  conversationId: t
    .text('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  senderId: t
    .text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  content: t.text('content').notNull(),
  isRead: t.boolean('is_read').notNull().default(false),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
})

export const session = pgTable('session', {
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: t.varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: t
    .timestamp('expires_at', { precision: 6, withTimezone: true })
    .notNull(),
  ipAddress: t.text('ip_address'),
  userAgent: t.text('user_agent'),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})
export const account = pgTable('account', {
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: t.text('account_id').notNull(),
  providerId: t.text('provider_id').notNull(),
  accessToken: t.text('access_token'),
  refreshToken: t.text('refresh_token'),
  accessTokenExpiresAt: t.timestamp('access_token_expires_at', {
    precision: 6,
    withTimezone: true,
  }),
  refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at', {
    precision: 6,
    withTimezone: true,
  }),
  scope: t.text('scope'),
  idToken: t.text('id_token'),
  password: t.text('password'),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

export const verification = pgTable('verification', {
  id: t.text('id').primaryKey(),
  identifier: t.text('identifier').notNull(),
  value: t.text('value').notNull(),
  expiresAt: t
    .timestamp('expires_at', { precision: 6, withTimezone: true })
    .notNull(),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})
