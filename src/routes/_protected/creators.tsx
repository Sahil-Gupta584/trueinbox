import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api } from '../../lib/api'
import {
  Search,
  Users,
  MessageSquareText,
  DollarSign,
  BadgeCheck,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { User } from '#/db/types'

export const Route = createFileRoute('/_protected/creators')({
  component: Creators,
})

// Utility function to format large numbers (10000 → 10k+)
function formatCount(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') return ''
  const n = typeof num === 'string' ? parseInt(num, 10) : num
  if (isNaN(n) || n === 0) return ''
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k+`
  return `${n}+`
}

const NICHES = [
  'All',
  'Tech',
  'Lifestyle',
  'Gaming',
  'Finance',
  'Fitness',
  'Food',
  'Travel',
  'Fashion',
  'Education',
]

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
      ? 'w-9 h-9 text-sm'
      : size === 'lg'
        ? 'w-14 h-14 text-xl'
        : 'w-11 h-11 text-base'
  if (image)
    return (
      <img
        src={image}
        referrerPolicy="no-referrer"
        className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-stone-100`}
        alt={name || ''}
      />
    )
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ring-2 ring-stone-100`}
      style={{ background: '#2d6a4f' }}
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

/* ─── Send DM Modal ───────────────────────────────────────────────────────── */
function SendDMModal({
  creator,
  defaultType,
  onClose,
  onSent,
}: {
  creator: Creator
  defaultType: 'paywall' | 'guaranteed'
  onClose: () => void
  onSent: () => void
}) {
  const [type, setType] = useState<'paywall' | 'guaranteed'>(defaultType)
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price =
    type === 'guaranteed'
      ? (creator.guaranteedReplyPrice ?? 0)
      : (creator.dmPrice ?? 0)

  const handleSend = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.startConversation(
        creator.id,
        message.trim(),
        type,
        subject.trim() || undefined,
      )
      onSent()
    } catch (e: any) {
      setError(e.message || 'Failed to send.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-stone-100">
          <Avatar name={creator.name} image={creator.image} />
          <div className="flex-1">
            <p className="font-semibold text-stone-800">{creator.name}</p>
            {creator.niche && (
              <p className="text-xs text-stone-400 mt-0.5">{creator.niche}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle */}
          {(creator.dmPrice ?? 0) > 0 &&
            (creator.guaranteedReplyPrice ?? 0) > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  Message type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setType('paywall')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      type === 'paywall'
                        ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <p className="text-xs font-semibold text-stone-700">
                      Send a DM
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                      Pay to reach · may refund
                    </p>
                    <p className="text-base font-bold text-stone-800 mt-2">
                      ${creator.dmPrice ?? 0}
                    </p>
                  </button>
                  <button
                    onClick={() => setType('guaranteed')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      type === 'guaranteed'
                        ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 ring-1 ring-emerald-300'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <p className="text-xs font-semibold text-stone-700">
                        Guaranteed
                      </p>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                      Creator must reply
                    </p>
                    <p className="text-base font-bold text-emerald-700 mt-2">
                      ${creator.guaranteedReplyPrice ?? 0}
                    </p>
                  </button>
                </div>
              </div>
            )}

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Subject{' '}
              <span className="font-normal normal-case text-stone-400">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Collab proposal, Quick question..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={
                type === 'guaranteed'
                  ? 'Ask your question or describe what you need clearly...'
                  : 'Introduce yourself and your proposal...'
              }
              className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {error}
            </div>
          )}

          <div
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              type === 'guaranteed'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <DollarSign
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${type === 'guaranteed' ? 'text-emerald-600' : 'text-stone-500'}`}
            />
            <p className="text-xs text-stone-600 leading-relaxed">
              {type === 'guaranteed' ? (
                <>
                  <span className="font-semibold text-emerald-700">
                    ${price} fee
                  </span>{' '}
                  — {creator.name?.split(' ')[0]} is obligated to reply
                  thoughtfully.
                </>
              ) : (
                <>
                  <span className="font-semibold text-stone-700">
                    ${price} fee
                  </span>{' '}
                  — paid to reach their inbox. Creator can refund if they
                  choose.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'guaranteed'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Sending...
              </span>
            ) : (
              `Send · $${price}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Creator Card ────────────────────────────────────────────────────────── */
function CreatorCard({
  creator,
  onMessage,
}: {
  creator: User
  onMessage: (c: User, type: 'paywall' | 'guaranteed') => void
}) {
  const hasPaywall = (creator.dmPrice ?? 0) > 0
  const hasGuaranteed = (creator.guaranteedReplyPrice ?? 0) > 0

  const socials = [
    {
      key: 'twitter',
      handle: creator.socialTwitter,
      audience: creator.socialTwitterAudience,
      icon: Twitter,
      url: (h: string) => `https://twitter.com/${h}`,
      color: 'hover:text-sky-500',
    },
    {
      key: 'instagram',
      handle: creator.socialInstagram,
      audience: creator.socialInstagramAudience,
      icon: Instagram,
      url: (h: string) => `https://instagram.com/${h}`,
      color: 'hover:text-pink-500',
    },
    {
      key: 'youtube',
      handle: creator.socialYoutube,
      audience: creator.socialYoutubeAudience,
      icon: Youtube,
      url: (h: string) => `https://youtube.com/@${h}`,
      color: 'hover:text-red-500',
    },
  ].filter((s) => s.handle)
  console.log({ socials })
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col h-full">
      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar name={creator.name} image={creator.image} size="lg" />
            {hasGuaranteed && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-800 ">
              {creator.name || 'Creator'}
            </p>
            {creator.username && (
              <p className="text-sm text-stone-400">@{creator.username}</p>
            )}
            {/* Categories as small rounded badges */}
            {creator.niche && (
              <div className="flex flex-wrap gap-1 mt-2">
                {creator.niche.split(',').map((category, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium"
                  >
                    {category.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-2">
            {creator.bio}
          </p>
        )}

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {socials.map((social) => {
              const count = formatCount(social.audience)
              return (
                <a
                  key={social.key}
                  href={social.url(social.handle!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-500 text-xs font-medium transition-all hover:bg-stone-100 ${social.color}`}
                >
                  <social.icon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[80px]">
                    @{social.handle}
                  </span>
                  {count && (
                    <span className="text-stone-400 text-[10px] font-semibold">
                      {count}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        )}

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Pricing Buttons - Always at bottom */}
        <div className="space-y-2.5 pt-3 border-t border-stone-100 mt-auto">
          {/* DM Button - Simple styling */}
          {hasPaywall && (
            <button
              onClick={() => onMessage(creator, 'paywall')}
              className="w-full flex items-center justify-between px-4 py-3 bg-emerald-100 border border-emerald-400 hover:bg-emerald-300 texta-white rounded-xl transition text-left"
            >
              <span className="flex items-center gap-2.5">
                <MessageSquareText size={20} />
                <span className="text-sm font-medium">Send DM</span>
              </span>
              <span className="text-sm font-semibold">${creator.dmPrice}</span>
            </button>
          )}

          {/* Guaranteed Reply Button - Premium styling */}
          {hasGuaranteed && (
            <button
              onClick={() => onMessage(creator, 'guaranteed')}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.99] transition-all text-left shadow-lg shadow-emerald-600/20 group"
            >
              <span className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    Guaranteed Reply
                    <BadgeCheck className="w-3.5 h-3.5" />
                  </p>
                  <p className="text-[10px] text-emerald-100">
                    Genuine conversation or your money back
                  </p>
                </div>
              </span>
              <span className="text-base font-medium">
                ${creator.guaranteedReplyPrice}
              </span>
            </button>
          )}

          {/* Free DM fallback */}
          {!hasPaywall && !hasGuaranteed && (
            <button
              onClick={() => onMessage(creator, 'paywall')}
              className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:border-stone-300 hover:bg-stone-50 transition-all"
            >
              <MessageSquareText className="w-4 h-4" /> Send free DM
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function Creators() {
  const [creators, setCreators] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('All')
  const [modal, setModal] = useState<{
    creator: User
    type: 'paywall' | 'guaranteed'
  } | null>(null)
  const [sentSuccess, setSentSuccess] = useState(false)

  useEffect(() => {
    api
      .creators()
      .then(setCreators)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = creators.filter((c) => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.bio || '').toLowerCase().includes(search.toLowerCase())
    const matchNiche =
      niche === 'All' || (c.niche || '').toLowerCase() === niche.toLowerCase()
    return matchSearch && matchNiche
  })

  return (
    <div>
      <div className="pt-14 pb-24">
        {/* <div className="max-w-6xl mx-auto px-6"> */}
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-md text-stone-900 tracking-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Browse Creators
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Reach out directly, or pay for a guaranteed reply.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators..."
            className="w-full bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {NICHES.map((n) => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                niche === n
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="p-5 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-stone-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-stone-100 rounded w-28" />
                      <div className="h-3 bg-stone-100 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-3 bg-stone-100 rounded" />
                  <div className="h-3 bg-stone-100 rounded w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-stone-100 rounded-lg w-24" />
                    <div className="h-8 bg-stone-100 rounded-lg w-24" />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="h-12 bg-stone-100 rounded-xl" />
                    <div className="h-12 bg-stone-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
                <Users className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-semibold text-stone-800 text-lg mb-2">
                No creators found
              </p>
              <p className="text-stone-500 text-sm max-w-sm">
                {search || niche !== 'All'
                  ? 'Try adjusting your search or filters to find more creators.'
                  : 'Be the first to set up your creator profile!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {filtered.map((c) => (
              <CreatorCard
                key={c.id}
                creator={c}
                onMessage={(creator, type) => setModal({ creator, type })}
              />
            ))}
          </div>
        )}
        {/* </div> */}
      </div>

      {modal && (
        <SendDMModal
          creator={modal.creator}
          defaultType={modal.type}
          onClose={() => setModal(null)}
          onSent={() => {
            setModal(null)
            setSentSuccess(true)
            setTimeout(() => setSentSuccess(false), 4000)
          }}
        />
      )}

      {/* Success toast */}
      {sentSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-stone-200 shadow-xl text-sm font-semibold px-5 py-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-stone-800">Message sent!</p>
            <p className="text-xs text-stone-500 font-normal">
              Your DM is in their inbox
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Twitter(props: any) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function Instagram(props: any) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function Youtube(props: any) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}
