import type {
  user,
  userPaymentSettings,
  dmAccess,
  payment,
  conversation,
  message,
  creatorBalance,
  creatorPayoutMethod,
  payout,
  balanceTransaction,
} from './schema'
import type { InferSelectModel } from 'drizzle-orm'

export type User = InferSelectModel<typeof user>
export type UserPaymentSettings = InferSelectModel<typeof userPaymentSettings>
export type DmAccess = InferSelectModel<typeof dmAccess>
export type Payment = InferSelectModel<typeof payment>
export type Conversation = InferSelectModel<typeof conversation>
export type Message = InferSelectModel<typeof message>
export type CreatorBalance = InferSelectModel<typeof creatorBalance>
export type CreatorPayoutMethod = InferSelectModel<typeof creatorPayoutMethod>
export type Payout = InferSelectModel<typeof payout>
export type BalanceTransaction = InferSelectModel<typeof balanceTransaction>
