import { useEffect, useState, useCallback } from 'react'
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from '@tanstack/react-router'
import { api } from '../../lib/api'
import type { ConversationWithMeta } from '../../lib/api'
import {
  MessageSquare,
  Search,
  CheckCheck,
  Clock,
  RefreshCw,
  BadgeCheck,
  DollarSign,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/inbox')({
  component: InboxLayout,
})

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
        <Clock className="w-2.5 h-2.5" />
        pending
      </span>
    )
  if (status === 'replied')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
        <CheckCheck className="w-2.5 h-2.5" />
        replied
      </span>
    )
  if (status === 'refunded')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 font-medium">
        <RefreshCw className="w-2.5 h-2.5" />
        refunded
      </span>
    )
  return null
}

function Avatar({
  name,
  image,
  size = 'md',
}: {
  name: string | null
  image: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const sz =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
        ? 'w-12 h-12 text-base'
        : 'w-10 h-10 text-sm'
  if (image)
    return (
      <img
        src={image}
        referrerPolicy="no-referrer"
        className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-stone-100`}
        alt=""
      />
    )
  return (
    <div
      className={`${sz} rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 flex-shrink-0`}
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

function InboxLayout() {
  const matches = useMatches()
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Check if we're on a specific conversation
  const currentUsername = matches.find(
    (m) => m.routeId === '/_protected/inbox/$username',
  )?.params?.username

  const loadConversations = useCallback(async () => {
    try {
      const convs = await api.conversations()
      setConversations(convs)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const filtered = conversations.filter((c) =>
    (c.other?.name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-[calc(100vh-120px)] -mt-2 -mx-6 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Conversation List - hidden on mobile when viewing a chat */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col flex-shrink-0 ${
          currentUsername ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-100">
          <h1
            className="text-xl font-medium text-stone-900 tracking-tight mb-3"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Inbox
          </h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-stone-100 rounded w-24" />
                      <div className="h-2.5 bg-stone-100 rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-stone-400" />
              </div>
              <p className="font-medium text-stone-700 text-sm mb-1">
                No conversations
              </p>
              <p className="text-stone-500 text-xs mb-3">
                Start by messaging a creator
              </p>
              <Link
                to="/creators"
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Browse Creators
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filtered.map((conv) => {
                const isActive =
                  currentUsername === conv.other?.username ||
                  currentUsername === conv.other?.id
                return (
                  <Link
                    key={conv.id}
                    to="/inbox/$username"
                    params={{
                      username: conv.other?.username || conv.other?.id || '',
                    }}
                    className={`block p-3 hover:bg-stone-50 transition-colors ${
                      isActive
                        ? 'bg-emerald-50 border-r-2 border-r-emerald-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          name={conv.other?.name ?? null}
                          image={conv.other?.image ?? null}
                        />
                        {conv.type === 'guaranteed' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center">
                            <BadgeCheck className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-stone-800 text-sm truncate">
                            {conv.other?.name || 'Unknown'}
                          </p>
                          <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">
                            {conv.lastMessage
                              ? formatTime(conv.lastMessage.createdAt)
                              : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1">
                          {conv.type === 'guaranteed' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                              <BadgeCheck className="w-2 h-2" /> Guaranteed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 font-medium">
                              <DollarSign className="w-2 h-2" /> DM
                            </span>
                          )}
                          <StatusBadge status={conv.status} />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-stone-500 truncate flex-1">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center px-1 flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          currentUsername ? 'flex' : 'hidden md:flex'
        }`}
      >
        <Outlet />
      </div>
    </div>
  )
}
