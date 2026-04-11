import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearch } from 'wouter'
import { useSession } from '../../lib/auth-client'
import { api, type ConversationWithMeta, type Message } from '../../lib/api'
import {
  Send,
  MessageSquare,
  Search,
  CheckCheck,
  Clock,
  RefreshCw,
  BadgeCheck,
  DollarSign,
  ChevronLeft,
  Smile,
} from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/messages')({
  component: Messages,
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

function TypeBadge({ type }: { type: 'paywall' | 'guaranteed' }) {
  if (type === 'guaranteed')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
        <BadgeCheck className="w-2.5 h-2.5" /> Guaranteed
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
      <DollarSign className="w-2.5 h-2.5" /> DM
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
        <Clock className="w-2.5 h-2.5" />
        pending
      </span>
    )
  if (status === 'replied')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
        <CheckCheck className="w-2.5 h-2.5" />
        replied
      </span>
    )
  if (status === 'refunded')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
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
        : 'w-9 h-9 text-sm'
  if (image)
    return (
      <img
        src={image}
        referrerPolicy="no-referrer"
        className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-border`}
        alt=""
      />
    )
  return (
    <div
      className={`${sz} rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0`}
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

function Messages() {
  const { data: session } = useSession()
  const search: any = useSearch()
  const initialConvId = search.conv

  const [conversations, setConversations] = useState<ConversationWithMeta[]>([])
  const [activeConv, setActiveConv] = useState<ConversationWithMeta | null>(
    null,
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [willRefund, setWillRefund] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myId = session?.user?.id

  const loadConversations = useCallback(async () => {
    try {
      const convs = await api.conversations()
      setConversations(convs)
      if (initialConvId) {
        const match = convs.find((c) => c.id === initialConvId)
        if (match) setActiveConv(match)
      }
    } finally {
      setLoadingConvs(false)
    }
  }, [initialConvId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!activeConv) return
    setLoadingMsgs(true)
    setWillRefund(false)
    api
      .messages(activeConv.id)
      .then(setMessages)
      .finally(() => setLoadingMsgs(false))
  }, [activeConv?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !activeConv || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    try {
      const { message, conversation } = await api.sendMessage(
        activeConv.id,
        content,
      )
      setMessages((prev) => [...prev, message])
      setActiveConv((prev) =>
        prev ? { ...prev, status: conversation.status } : prev,
      )

      if (
        willRefund &&
        isReceiver &&
        activeConv.type === 'paywall' &&
        activeConv.status !== 'refunded'
      ) {
        setRefunding(true)
        try {
          const updated = await api.refundConversation(activeConv.id)
          setActiveConv((prev) =>
            prev ? { ...prev, status: updated.status } : prev,
          )
        } finally {
          setRefunding(false)
        }
      }

      setWillRefund(false)
      loadConversations()
    } catch {
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const filtered = conversations.filter((c) =>
    (c.other?.name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const isReceiver = activeConv?.receiverId === myId
  const isPaywall = activeConv?.type === 'paywall'
  const isGuaranteed = activeConv?.type === 'guaranteed'
  const canRefund =
    isReceiver &&
    isPaywall &&
    activeConv?.status !== 'refunded' &&
    activeConv?.status !== 'closed'
  const isAlreadyRefunded = activeConv?.status === 'refunded'

  return (
    <div
      className="flex bg-background"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* ── Conversation sidebar ── */}
      <div
        className={`w-full md:w-[300px] lg:w-[340px] border-r border-border flex flex-col flex-shrink-0 bg-card ${activeConv ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 border-b border-border">
          <h2 className=" font-bold text-foreground text-base mb-3">
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse p-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-muted rounded w-32" />
                    <div className="h-2.5 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                No conversations
              </p>
              <p className="text-xs text-muted-foreground">
                Start one by messaging a creator
              </p>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = activeConv?.id === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/40 transition-all text-left relative ${
                    isActive
                      ? 'bg-primary/8 border-l-2 border-l-primary'
                      : 'hover:bg-muted/60'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      name={conv.other?.name ?? null}
                      image={conv.other?.image ?? null}
                    />
                    {conv.type === 'guaranteed' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-card flex items-center justify-center">
                        <BadgeCheck className="w-2.5 h-2.5 text-primary-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p
                        className={`text-sm truncate ${isActive ? 'font-bold text-primary' : 'font-semibold text-foreground'}`}
                      >
                        {conv.other?.name || 'Unknown'}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                        {conv.lastMessage
                          ? formatTime(conv.lastMessage.createdAt)
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {conv.lastMessage?.content || 'No messages'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1 flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div
        className={`flex-1 flex flex-col min-h-0 ${!activeConv ? 'hidden md:flex' : 'flex'}`}
      >
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mb-5">
              <MessageSquare className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className=" font-bold text-foreground text-xl mb-2">
              Select a conversation
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Pick from the list on the left, or go to Creators to start a new
              paid conversation.
            </p>
          </div>
        ) : (
          <>
            {/* ── Chat header ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm flex-shrink-0">
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => setActiveConv(null)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <Avatar
                name={activeConv.other?.name ?? null}
                image={activeConv.other?.image ?? null}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight">
                  {activeConv.other?.name || 'Unknown'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TypeBadge
                    type={activeConv.type as 'paywall' | 'guaranteed'}
                  />
                  <StatusBadge status={activeConv.status} />
                </div>
              </div>
              {activeConv.paidAmount > 0 && (
                <div className="flex-shrink-0 px-3 py-1.5 bg-muted border border-border rounded-xl">
                  <span className="font-mono-nums text-sm font-bold text-foreground">
                    ${activeConv.paidAmount}
                  </span>
                </div>
              )}
            </div>

            {/* ── Context banners ── */}
            {isReceiver && activeConv.status === 'pending' && (
              <div
                className={`mx-4 mt-3 flex-shrink-0 p-3.5 rounded-2xl border flex items-start gap-3 ${
                  isGuaranteed
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-500/8 dark:border-amber-500/20'
                }`}
              >
                {isGuaranteed ? (
                  <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-xs leading-relaxed ${isGuaranteed ? 'text-primary' : 'text-amber-700 dark:text-amber-400'}`}
                >
                  {isGuaranteed ? (
                    <>
                      <span className="font-semibold">Guaranteed Reply DM</span>{' '}
                      — {activeConv.other?.name} paid{' '}
                      <span className="font-mono-nums font-bold">
                        ${activeConv.paidAmount}
                      </span>{' '}
                      for your genuine reply. You are expected to respond
                      thoughtfully.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Paid DM</span> —{' '}
                      {activeConv.other?.name} paid{' '}
                      <span className="font-mono-nums font-bold">
                        ${activeConv.paidAmount}
                      </span>{' '}
                      to reach you. Reply and keep the fee, or refund it if you
                      choose.
                    </>
                  )}
                </p>
              </div>
            )}

            {isAlreadyRefunded && (
              <div className="mx-4 mt-3 flex-shrink-0 p-3.5 rounded-2xl border border-border bg-muted/60 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  You refunded{' '}
                  <span className="font-mono-nums font-semibold">
                    ${activeConv.paidAmount}
                  </span>{' '}
                  to {activeConv.other?.name}.
                </p>
              </div>
            )}

            {!isReceiver && activeConv.status === 'refunded' && (
              <div className="mx-4 mt-3 flex-shrink-0 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/8 dark:border-emerald-500/20 flex items-center gap-3">
                <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Creator refunded your{' '}
                  <span className="font-mono-nums font-semibold">
                    ${activeConv.paidAmount}
                  </span>{' '}
                  fee.
                </p>
              </div>
            )}

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-muted/10 min-h-0"
              style={{
                backgroundImage:
                  'radial-gradient(var(--border) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <Smile className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No messages yet — say something!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === myId
                  const prevMsg = idx > 0 ? messages[idx - 1] : null
                  const showTime =
                    !prevMsg ||
                    new Date(msg.createdAt).getTime() -
                      new Date(prevMsg.createdAt).getTime() >
                      300000

                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <div className="flex items-center justify-center my-3">
                          <span className="text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-br-sm glow-primary-sm'
                                : 'bg-card text-foreground rounded-bl-sm border border-border'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <div className="border-t border-border bg-card flex-shrink-0">
              {canRefund && (
                <label className="flex items-start gap-3 px-4 pt-3.5 cursor-pointer group border-b border-border/50 pb-3">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={willRefund}
                      onChange={(e) => setWillRefund(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        willRefund
                          ? 'bg-primary border-primary'
                          : 'border-border group-hover:border-primary/40'
                      }`}
                    >
                      {willRefund && (
                        <svg
                          className="w-2.5 h-2.5 text-primary-foreground"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M1.5 5L3.5 7.5L8.5 2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      Refund{' '}
                      <span className="font-mono-nums font-bold text-primary">
                        ${activeConv.paidAmount}
                      </span>{' '}
                      to {activeConv.other?.name} when I send
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Tick this if the conversation feels genuine.
                    </p>
                  </div>
                </label>
              )}

              <div className="flex items-center gap-3 p-3.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && handleSend()
                  }
                  placeholder="Type a message..."
                  className="input-base flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending || refunding}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 glow-primary-sm"
                >
                  {sending || refunding ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-primary-foreground" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
