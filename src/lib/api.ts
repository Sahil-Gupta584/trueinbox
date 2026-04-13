import type { User } from '#/db/types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    console.log(err)

    throw new Error((err as { message: string }).message || 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  me: () => request<User>('/me'),
  updateMe: (data: Partial<User>) =>
    request<User>('/me', { method: 'PATCH', body: JSON.stringify(data) }),

  creators: (page = 1) => request<User[]>(`/creators?page=${page}`),
  creatorByUsername: (username: string) =>
    request<User>(`/creators/${username}`),

  conversations: () => request<ConversationWithMeta[]>('/conversations'),
  startConversation: (
    receiverId: string,
    message: string,
    type: 'paywall' | 'guaranteed',
    subject?: string,
  ) =>
    request<{ conversation: Conversation; message: Message }>(
      '/conversations',
      {
        method: 'POST',
        body: JSON.stringify({ receiverId, message, type, subject }),
      },
    ),
  messages: (convId: string) =>
    request<Message[]>(`/conversations/${convId}/messages`),
  sendMessage: (convId: string, content: string) =>
    request<{ message: Message; conversation: Conversation }>(
      `/conversations/${convId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      },
    ),
  refundConversation: (convId: string) =>
    request<Conversation>(`/conversations/${convId}/refund`, {
      method: 'POST',
    }),

  refund: (
    fanId: string,
  ) =>
    request<{ success: boolean }>(`/refund`, {
      method: 'POST',
      body: JSON.stringify({ fanId }),
    }),

  // Payment
  createCheckout: (
    creatorId: string,
    type: 'paywall' | 'guaranteed',
    upgradeFromAccessId?: string,
  ) =>
    request<{
      checkoutUrl: string
      paymentId: string
      isUpgrade?: boolean
      amountToPay?: number
    }>('/checkout', {
      method: 'POST',
      body: JSON.stringify({ creatorId, type, upgradeFromAccessId }),
    }),

  // DM Access
  checkDmAccess: (username: string) =>
    request<DmAccessStatus>(`/dm-access/${username}`),

  // Payment Settings
  getPaymentSettings: () =>
    request<PaymentSettings | null>('/payment-settings'),
  updatePaymentSettings: (data: Partial<PaymentSettings>) =>
    request<PaymentSettings>('/payment-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Creator Balance & Payouts
  getBalance: () => request<BalanceResponse>('/balance'),
  getPayoutMethods: () => request<PayoutMethod[]>('/payout-methods'),
  addPayoutMethod: (data: AddPayoutMethodRequest) =>
    request<PayoutMethod>('/payout-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deletePayoutMethod: (id: string) =>
    request<{ success: boolean }>(`/payout-methods?id=${id}`, {
      method: 'DELETE',
    }),
  releaseEscrow: (accessId: string) =>
    request<{ success: boolean; message: string }>(
      `/release-escrow/${accessId}`,
      { method: 'POST' },
    ),

  stats: () => request<Stats>('/stats'),
  unread: () => request<UnreadConversation[]>('/unread'),
}

export interface Conversation {
  id: string
  senderId: string
  receiverId: string
  subject: string | null
  paidAmount: number
  type: 'paywall' | 'guaranteed'
  status: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface ConversationWithMeta extends Conversation {
  other:
  | {
    id: string
    name: string | null
    username: string | null
    image: string | null
    niche: string | null
    dmPrice: number | null
    guaranteedReplyPrice: number | null
  }
  | undefined
  lastMessage: Message | undefined
  unreadCount: number
}

export interface UnreadConversation extends Conversation {
  other:
  | {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  | undefined
  lastMessage: Message
}

export interface Stats {
  totalDMs: number
  paywallRevenue: number // internal field name kept for API compat
  refundedAmount: number
  unreadCount: number
}

export interface DmAccessStatus {
  hasAccess: boolean
  isOwner?: boolean
  isReceiver?: boolean // true if current user is the creator receiving the DM
  isFree?: boolean
  requiresPayment?: boolean
  refund: {
    senderId: string;
    receiverId: string;
    amount: number;
    status: string;
    refundedAt: Date | null;
  }
  access?: {
    id: string
    type: 'paywall' | 'guaranteed'
    amountPaid: number
    guaranteedReplyFulfilled: boolean
    createdAt: string
  } | null
  conversation?: {
    id: string
    status: string
    creatorReplied: boolean
    senderId: string
    receiverId: string
  } | null
  creator: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    dmPrice: number | null
    guaranteedReplyPrice: number | null
  }
  fan: {
    id: string
    name: string | null
    image: string | null
  }
}

export interface PaymentSettings {
  id: string
  userId: string
  activeProvider: 'dodo' | 'stripe' | null
  dodoBusinessId: string | null
  dodoOnboarded: boolean
  dodoOnboardedAt: string | null
  stripeAccountId: string | null
  stripeOnboarded: boolean
  stripeOnboardedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BalanceResponse {
  balance: {
    available: number
    pending: number
    totalEarned: number
    totalWithdrawn: number
    currency: string
  }
  transactions: BalanceTransaction[]
}

export interface BalanceTransaction {
  id: string
  userId: string
  type: 'earning' | 'release' | 'withdrawal' | 'refund' | 'adjustment'
  amount: number
  currency: string
  balanceType: 'pending' | 'available'
  runningBalance: number
  description: string | null
  paymentId: string | null
  payoutId: string | null
  dmAccessId: string | null
  createdAt: string
}

export interface PayoutMethod {
  id: string
  userId: string
  methodType: 'bank_us' | 'bank_eu' | 'bank_india' | 'paypal' | 'upi'
  displayName: string | null
  bankAccountNumber: string | null
  bankRoutingNumber: string | null
  bankIban: string | null
  bankIfsc: string | null
  bankSwift: string | null
  bankName: string | null
  accountHolderName: string | null
  paypalEmail: string | null
  upiId: string | null
  isVerified: boolean
  isPrimary: boolean
  country: string | null
  createdAt: string
  updatedAt: string
}

export interface AddPayoutMethodRequest {
  methodType: 'bank_us' | 'bank_eu' | 'bank_india' | 'paypal' | 'upi'
  bankAccountNumber?: string
  bankRoutingNumber?: string
  bankIban?: string
  bankIfsc?: string
  bankSwift?: string
  bankName?: string
  accountHolderName?: string
  paypalEmail?: string
  upiId?: string
  country?: string
  isPrimary?: boolean
}
