import type { User } from "#/db/types";

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    console.log(err);
    
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
