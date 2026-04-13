import { useEffect, useState, useRef, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { InfoIcon } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useSession } from '../../../lib/auth-client'
import { api } from '../../../lib/api'
import type { Message, DmAccessStatus } from '../../../lib/api'
import {
  Send,
  MessageSquare,
  CheckCheck,
  Clock,
  RefreshCw,
  BadgeCheck,
  DollarSign,
  ChevronLeft,
  Smile,
  Lock,
  Sparkles,
  ArrowUpCircle,
} from 'lucide-react'
import { PaymentButtons } from '#/components/PaymentButtons'
import { Kbd, KbdGroup } from '#/components/ui/kbd'
import { Spinner } from '#/components/ui/spinner'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_protected/inbox/$username')({
  component: ChatPage,
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
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
        <BadgeCheck className="w-2.5 h-2.5" /> Guaranteed
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 font-medium">
      <DollarSign className="w-2.5 h-2.5" /> DM
    </span>
  )
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

function ChatPage() {
  const { username } = Route.useParams()
  const { data: session } = useSession()

  // const [accessStatus, setAccessStatus] = useState<DmAccessStatus | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  // const [loading, setLoading] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myId = session?.user?.id

  // Keyboard shortcut: focus the chat input on Ctrl+/ or Cmd+/
  useEffect(() => {
    function handleFocusShortcut(e: KeyboardEvent) {
      const isMac = navigator.platform.includes('Mac')
      const isSlashKey = e.key === '/' || e.key === 'Slash'
      const isShortcut =
        isSlashKey && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))
      if (isShortcut) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleFocusShortcut)
    return () => {
      window.removeEventListener('keydown', handleFocusShortcut)
    }
  }, [])

  const {
    data: accessStatus,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['dmAccessStatus', username],
    queryFn: async () => await api.checkDmAccess(username),
  })
  // Load messages when we have access and a conversation
  useEffect(() => {
    if (!accessStatus?.conversation?.id) return
    setLoadingMsgs(true)
    api
      .messages(accessStatus.conversation.id)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false))
  }, [accessStatus?.conversation?.id])

  useEffect(() => {
    // Scroll within the messages container only, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  // Refund checkbox state for analytics refunds (first creator reply to paywall DM)
  const [refundChecked, setRefundChecked] = useState(true)

  const handleSend = async () => {
    if (!input.trim() || !accessStatus?.conversation?.id || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    try {
      const { message } = await api.sendMessage(
        accessStatus.conversation.id,
        content,
      )
      setMessages((prev) => [...prev, message])

      // Only execute refund analytics logic if:
      //  - access.type === 'paywall'
      //  - isReceiver (creator)
      //  - !creatorReplied (first reply)
      //  - refundChecked is true
      if (
        access &&
        access.type === 'paywall' &&
        isReceiver &&
        !accessStatus.conversation.creatorReplied &&
        refundChecked
      ) {
        try {
          await api.refund(accessStatus.fan.id)
        } catch (e) {
          // Fail silently or show toast - up to product
          console.error('Failed to record refund analytics', e)
        }
      }
    } catch {
      setInput(content)
    } finally {
      setSending(false)
      refetch()
    }
  }

  const handlePayment = async (
    type: 'paywall' | 'guaranteed',
    upgradeFromAccessId?: string,
  ) => {
    if (!accessStatus?.creator) return
    try {
      const { checkoutUrl } = await api.createCheckout(
        accessStatus.creator.id,
        type,
        upgradeFromAccessId,
      )
      window.location.href = checkoutUrl
    } catch (err: any) {
      alert(err.message || 'Failed to create checkout')
    }
  }

  // Calculate upgrade price (difference between guaranteed and what was already paid)
  const getUpgradePrice = () => {
    if (!accessStatus?.access || accessStatus.access.type !== 'paywall')
      return 0
    const guaranteedPrice =
      (accessStatus.creator?.guaranteedReplyPrice ?? 0) * 100 // convert to cents
    const alreadyPaid = accessStatus.access.amountPaid
    return Math.max(0, guaranteedPrice - alreadyPaid) / 100 // back to dollars
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50/50">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  // Error state
  if (error || !accessStatus) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-stone-50/50">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-red-400" />
        </div>
        <p className="font-semibold text-stone-800 mb-2">
          {error || 'Something went wrong'}
        </p>
        <Link
          to="/inbox"
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Back to Inbox
        </Link>
      </div>
    )
  }

  const { creator, hasAccess, isOwner, access, fan, refund } =
    accessStatus

  const isReceiver = creator?.id === myId

  const displayItems = [
    ...messages.map((m) => ({ ...m, itemType: 'message' as const })),
  ]
  if (refund?.refundedAt) {
    displayItems.push({
      itemType: 'refund' as const,
      id: 'refund-event',
      createdAt: new Date(refund.refundedAt).toISOString(),
      amount: refund.amount,
      senderId: '',
      content: '',
      conversationId: '',
      readAt: null,
    })
  }
  displayItems.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  // Payment required - show payment options
  if (!hasAccess && !isOwner) {
    return (
      <div className="flex-1 flex flex-col bg-stone-50/50">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-stone-200 bg-white">
          <Link
            to="/inbox"
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500 md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Avatar name={creator.name} image={creator.image} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-stone-800">{creator.name}</p>
            {creator.username && (
              <p className="text-sm text-stone-400">@{creator.username}</p>
            )}
          </div>
        </div>

        {/* Payment Required Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden max-w-sm w-full">
            <div className="p-6 text-center border-b border-stone-100">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">
                Payment required
              </h2>
              <p className="text-sm text-stone-500">
                {creator.name} requires a payment to message them.
              </p>
            </div>

            {/* Payment Options */}
            <div className="p-4 space-y-3">
              {(creator.dmPrice ?? 0) > 0 && (
                <button
                  onClick={() => handlePayment('paywall')}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">
                        Send a DM
                      </p>
                      <p className="text-xs text-stone-500">
                        Pay to reach their inbox
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-stone-800">
                    ${creator.dmPrice}
                  </span>
                </button>
              )}

              {(creator.guaranteedReplyPrice ?? 0) > 0 && (
                <button
                  onClick={() => handlePayment('guaranteed')}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all text-left shadow-lg shadow-emerald-600/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        Guaranteed Reply
                        <BadgeCheck className="w-3.5 h-3.5" />
                      </p>
                      <p className="text-xs text-emerald-100">
                        Creator must respond
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-bold">
                    ${creator.guaranteedReplyPrice}
                  </span>
                </button>
              )}
            </div>

            <div className="px-6 pb-5">
              <p className="text-xs text-stone-400 text-center">
                Secure payments. Refunds per creator's policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Has access - show chat interface
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-stone-200 bg-white flex-shrink-0">
        <Link
          to="/inbox"
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500 md:hidden"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Avatar name={creator.name} image={creator.image} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 text-sm leading-tight">
            {creator.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {access && <TypeBadge type={access.type} />}
          </div>
        </div>
      </div>

      {/* Access info banner */}
      {access &&
        access.type === 'guaranteed' &&
        !access.guaranteedReplyFulfilled && (
          <div className="mx-4 mt-4 flex-shrink-0 p-3 rounded-xl border bg-emerald-50 border-emerald-200 flex items-start gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              <span className="font-semibold">Guaranteed Reply</span> —{' '}
              {isReceiver
                ? 'You are expected to respond thoughtfully to this message.'
                : `${creator.name} is expected to respond thoughtfully.`}
            </p>
          </div>
        )}

      {access &&
        access.type === 'guaranteed' &&
        access.guaranteedReplyFulfilled && (
          <div className="mx-4 mt-4 flex-shrink-0 p-3 rounded-xl border bg-stone-50 border-stone-200 flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-stone-600">
              {isReceiver
                ? 'You have fulfilled your guaranteed reply.'
                : `${creator.name} has fulfilled their guaranteed reply.`}
            </p>
          </div>
        )}

      {/* Upgrade to Guaranteed Reply - only for fans with paywall DM who haven't received a reply */}
      {!refund.refundedAt && access &&
        access.type === 'paywall' &&
        !isReceiver &&
        !accessStatus.conversation?.creatorReplied &&
        (creator.guaranteedReplyPrice ?? 0) > 0 &&
        getUpgradePrice() > 0 && (
          <div className="mx-4 mt-4 flex-shrink-0 p-3 rounded-xl border bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-emerald-800 font-semibold">
                  Want a guaranteed response?
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Pay ${getUpgradePrice()} more to ensure {creator.name}{' '}
                  replies.
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePayment('guaranteed', access.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex-shrink-0"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Upgrade ${getUpgradePrice()}</span>
            </button>
          </div>
        )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        style={{
          backgroundImage: 'radial-gradient(#e7e5e4 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {access && isReceiver && access.amountPaid > 0 && access.type === 'paywall' &&  (
          <div className="rounded-xl bg-white shadow p-2 border text-center max-w-md w-full">
            <div className="text-stone-500 text-sm flex items-center justify-center gap-2">
              <Avatar name={fan.name} image={fan.image} size="sm" />
              <span>
                <strong>{fan.name || 'This user'}</strong> made a payment of
              </span>
              <span className="font-medium text-green-600">
                ${(access.amountPaid / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        {loadingMsgs ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-3">
              <Smile className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-sm text-stone-500">
              {hasAccess ? 'Start the conversation!' : 'No messages yet'}
            </p>
          </div>
        ) : (
          displayItems.map((msg, idx) => {
            if (msg.itemType === 'refund') {
              return (
                <div
                  key="refund-event"
                  className="flex items-center justify-center my-4"
                >
                  <div className="text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-emerald-200">
                    🎉 {isReceiver ? "You Issued the refund of " : `${creator.name} issued the refund of `}
                    <span className="font-medium text-emerald-600">
                      ${((msg.amount || 0) / 100).toFixed(2)}
                    </span>{' '}
                    at {formatTime(msg.createdAt)} 🎉 
                  </div>
                </div>
              )
            }

            const isMe = msg.senderId === myId
            const prevMsg = idx > 0 ? displayItems[idx - 1] : null
            const showDateSeparator =
              !prevMsg ||
              new Date(msg.createdAt).getTime() -
              new Date(prevMsg.createdAt).getTime() >
              300000

            return (
              <div key={msg.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-white text-stone-800 rounded-bl-sm border border-stone-200'
                        }`}
                    >
                      {msg.content}
                    </div>
                    <span
                      className={`text-[10px] px-1 ${isMe ? 'text-stone-400' : 'text-stone-400'
                        }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - only show if has access */}
      <div className="p-4 border-t border-stone-200 bg-white flex-shrink-0">
        {isOwner ? (
          <p className="text-sm text-stone-500 text-center">
            Hehe, You Can't DM Yourself :)
          </p>
        ) : hasAccess ? (
          <>
            {/* Refund Analytics Checkbox - first creator reply to paywall DM */}
            {access &&
              access.type === 'paywall' &&
              isReceiver &&
              !refund.refundedAt &&
              !accessStatus.conversation?.creatorReplied && (
                <div className="mb-2 flex items-center gap-2">
                  <input
                    id="refund-checkbox"
                    type="checkbox"
                    checked={refundChecked}
                    onChange={(e) => setRefundChecked(e.target.checked)}
                    className="accent-emerald-600 h-4 w-4"
                  />
                  <label
                    htmlFor="refund-checkbox"
                    className="text-xs text-stone-700 select-none cursor-pointer"
                  >
                    Make refund (show goodwill, fan will see analytics refund—no
                    money removed)
                  </label>
                </div>
              )}
            <div className="flex items-center gap-3 w-full">
              <Field className="flex-1">
                <InputGroup>
                  <InputGroupInput
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && !e.shiftKey && handleSend()
                    }
                    placeholder="Type a message..."
                    aria-label="Message input"
                    className="text-sm px-4 py-3"
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer"
                    onClick={() => inputRef.current?.focus()}
                  >
                    <KbdGroup>
                      <Kbd>Ctrl</Kbd>+<Kbd>/</Kbd>
                    </KbdGroup>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-emerald-600/20"
              >
                {sending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
