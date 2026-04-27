import * as t from 'drizzle-orm/pg-core'
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const mySchema = t.pgSchema("trueinbox");

export const todos = mySchema.table('todos', {
  id: serial().primaryKey(),
  title: text().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const user = mySchema.table('user', {
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

// Separate table for user payment settings (payout configuration)
export const userPaymentSettings = mySchema.table('user_payment_settings', {
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Active provider for receiving payments
  activeProvider: t.text('active_provider'), // 'dodo' | 'stripe' | null
  // DodoPayments fields
  dodoBusinessId: t.text('dodo_business_id'),
  dodoOnboarded: t.boolean('dodo_onboarded').default(false),
  dodoOnboardedAt: t.timestamp('dodo_onboarded_at', {
    precision: 6,
    withTimezone: true,
  }),
  // Stripe Connect fields
  stripeAccountId: t.text('stripe_account_id'),
  stripeOnboarded: t.boolean('stripe_onboarded').default(false),
  stripeOnboardedAt: t.timestamp('stripe_onboarded_at', {
    precision: 6,
    withTimezone: true,
  }),
  // Metadata
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

// DM Access - tracks who has paid to message whom
// This is the source of truth for whether a user can send messages to a creator
export const dmAccess = mySchema.table('dm_access', {
  id: t.text('id').primaryKey(),
  // The user who paid (sender/fan)
  senderId: t
    .text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // The creator who received payment
  receiverId: t
    .text('receiver_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Type of access purchased
  type: t.text('type').notNull(), // 'paywall' | 'guaranteed'
  // Status of the access
  status: t.text('status').notNull().default('active'), // 'active' | 'expired' | 'refunded'
  // Amount paid (in cents)
  amountPaid: t.integer('amount_paid').notNull(),
  currency: t.text('currency').notNull().default('USD'),
  // Link to the payment record
  paymentId: t
    .text('payment_id')
    .references(() => payment.id, { onDelete: 'set null' }),
  paymentId2: t
    .text('payment_id_2')
    .references(() => payment.id, { onDelete: 'set null' }),
  // For guaranteed replies - has the creator responded?
  guaranteedReplyFulfilled: t
    .boolean('guaranteed_reply_fulfilled')
    .default(false),
  guaranteedReplyFulfilledAt: t.timestamp('guaranteed_reply_fulfilled_at', {
    precision: 6,
    withTimezone: true,
  }),
  // Expiration (optional - for time-limited access)
  expiresAt: t.timestamp('expires_at', { precision: 6, withTimezone: true }),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

// Payment records for tracking all payment transactions
export const payment = mySchema.table('payment', {
  id: t.text('id').primaryKey(),
  // Who paid and who received
  senderId: t
    .text('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  receiverId: t
    .text('receiver_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Payment details
  amount: t.integer('amount').notNull(), // Amount in cents
  currency: t.text('currency').notNull().default('USD'),
  type: t.text('type').notNull(), // 'paywall' | 'guaranteed'
  // Payment status
  status: t.text('status').notNull().default('pending'), // 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'
  // Provider info
  provider: t.text('provider').notNull(), // 'dodo' | 'stripe'
  providerPaymentId: t.text('provider_payment_id'),
  providerCheckoutUrl: t.text('provider_checkout_url'),
  providerCheckoutId: t.text('provider_checkout_id'),
  // Refund tracking
  refundedAt: t.timestamp('refunded_at', { precision: 6, withTimezone: true }),
  refundReason: t.text('refund_reason'),
  // Metadata
  metadata: t.json('metadata'),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

// Conversation between users
export const conversation = mySchema.table('conversation', {
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
  // Link to dm_access that enabled this conversation
  dmAccessId: t
    .text('dm_access_id')
    .references(() => dmAccess.id, { onDelete: 'set null' }),
  // Conversation status
  status: t.text('status').notNull().default('active'), // 'active' | 'closed' | 'archived'
  // For guaranteed - has creator replied?
  creatorReplied: t.boolean('creator_replied').default(false),
  creatorRepliedAt: t.timestamp('creator_replied_at', {
    precision: 6,
    withTimezone: true,
  }),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

export const message = mySchema.table('message', {
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

export const session = mySchema.table('session', {
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
export const account = mySchema.table('account', {
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

export const verification = mySchema.table('verification', {
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

// Creator balance - tracks earnings for each creator
// Money is held in TrueInbox's account, this tracks what each creator is owed
export const creatorBalance = mySchema.table('creator_balance', {
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Available balance - can be withdrawn
  availableBalance: t.integer('available_balance').notNull().default(0), // in cents
  // Pending balance - in escrow (guaranteed reply not yet marked satisfied)
  pendingBalance: t.integer('pending_balance').notNull().default(0), // in cents
  // Total earned all time (for stats)
  totalEarned: t.integer('total_earned').notNull().default(0), // in cents
  // Total withdrawn all time
  totalWithdrawn: t.integer('total_withdrawn').notNull().default(0), // in cents
  currency: t.text('currency').notNull().default('USD'),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

// Creator payout methods - bank accounts, UPI, PayPal where creators receive money
export const creatorPayoutMethod = mySchema.table('creator_payout_method', {
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Type of payout method
  methodType: t.text('method_type').notNull(), // 'bank_us' | 'bank_eu' | 'bank_india' | 'paypal' | 'upi'
  // Display name for the method
  displayName: t.text('display_name'), // e.g., "HDFC Bank ****1234"
  // Bank details (stored securely - consider encryption in production)
  bankAccountNumber: t.text('bank_account_number'),
  bankRoutingNumber: t.text('bank_routing_number'), // US ACH routing
  bankIban: t.text('bank_iban'), // EU SEPA IBAN
  bankIfsc: t.text('bank_ifsc'), // India IFSC code
  bankSwift: t.text('bank_swift'), // SWIFT/BIC code
  bankName: t.text('bank_name'),
  accountHolderName: t.text('account_holder_name'),
  // Alternative methods
  paypalEmail: t.text('paypal_email'),
  upiId: t.text('upi_id'),
  // Status
  isVerified: t.boolean('is_verified').default(false),
  isPrimary: t.boolean('is_primary').default(false),
  // Country for the payout method
  country: t.text('country'),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

// Payout records - tracks all withdrawals/payouts to creators
export const payout = mySchema.table('payout', {
  id: t.text('id').primaryKey(),
  // Creator receiving the payout
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Payout method used
  payoutMethodId: t
    .text('payout_method_id')
    .references(() => creatorPayoutMethod.id, { onDelete: 'set null' }),
  // Amount
  amount: t.integer('amount').notNull(), // in cents
  currency: t.text('currency').notNull().default('USD'),
  // Fees charged for this payout
  fee: t.integer('fee').default(0), // in cents
  netAmount: t.integer('net_amount').notNull(), // amount - fee, what creator actually receives
  // Status
  status: t.text('status').notNull().default('pending'), // 'pending' | 'processing' | 'completed' | 'failed'
  // Provider info (Wise, Razorpay, etc.)
  provider: t.text('provider'), // 'wise' | 'razorpay' | 'paypal' | 'manual'
  providerPayoutId: t.text('provider_payout_id'),
  providerResponse: t.json('provider_response'),
  // Failure reason if failed
  failureReason: t.text('failure_reason'),
  // Timestamps
  processedAt: t.timestamp('processed_at', {
    precision: 6,
    withTimezone: true,
  }),
  completedAt: t.timestamp('completed_at', {
    precision: 6,
    withTimezone: true,
  }),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { precision: 6, withTimezone: true })
    .notNull(),
})

// Balance transactions - ledger of all balance changes
export const balanceTransaction = mySchema.table('balance_transaction', {
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Type of transaction
  type: t.text('type').notNull(), // 'earning' | 'release' | 'withdrawal' | 'refund' | 'adjustment'
  // Amount (positive for credits, negative for debits)
  amount: t.integer('amount').notNull(), // in cents
  currency: t.text('currency').notNull().default('USD'),
  // Balance type affected
  balanceType: t.text('balance_type').notNull(), // 'pending' | 'available'
  // Running balance after this transaction
  runningBalance: t.integer('running_balance').notNull(),
  // Description
  description: t.text('description'),
  // Related records
  paymentId: t
    .text('payment_id')
    .references(() => payment.id, { onDelete: 'set null' }),
  payoutId: t
    .text('payout_id')
    .references(() => payout.id, { onDelete: 'set null' }),
  dmAccessId: t
    .text('dm_access_id')
    .references(() => dmAccess.id, { onDelete: 'set null' }),
  createdAt: t
    .timestamp('created_at', { precision: 6, withTimezone: true })
    .notNull(),
})
