import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api, type Creator } from '../../lib/api'
import {
  Search,
  Users,
  MessageSquare,
  DollarSign,
  BadgeCheck,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/creators')({
  component: Creators,
})

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
        ? 'w-16 h-16 text-xl'
        : 'w-11 h-11 text-base'
  if (image)
    return (
      <img
        src={image}
        referrerPolicy="no-referrer"
        className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-border`}
        alt={name || ''}
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
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" />

      <div className="relative bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl w-full max-w-md animate-fade-up z-10">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <Avatar name={creator.name} image={creator.image} />
          <div className="flex-1">
            <p className=" font-bold text-foreground">{creator.name}</p>
            {creator.niche && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {creator.niche}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted hover:bg-border flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle */}
          {(creator.dmPrice ?? 0) > 0 &&
            (creator.guaranteedReplyPrice ?? 0) > 0 && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Message type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setType('paywall')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${type === 'paywall'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                  >
                    <p className="text-xs font-bold text-foreground">
                      Send a DM
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      Pay to reach · may refund
                    </p>
                    <p className="font-mono-nums text-base font-bold text-primary mt-2">
                      ${creator.dmPrice ?? 0}
                    </p>
                  </button>
                  <button
                    onClick={() => setType('guaranteed')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${type === 'guaranteed'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                      <p className="text-xs font-bold text-foreground">
                        Guaranteed Reply
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      Creator must reply
                    </p>
                    <p className="font-mono-nums text-base font-bold text-primary mt-2">
                      ${creator.guaranteedReplyPrice ?? 0}
                    </p>
                  </button>
                </div>
              </div>
            )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Subject{' '}
              <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Collab proposal, Quick question…"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={
                type === 'guaranteed'
                  ? 'Ask your question or describe what you need clearly…'
                  : 'Introduce yourself and your proposal…'
              }
              className="input-base resize-none"
            />
          </div>

          {error && (
            <div className="px-3.5 py-2.5 bg-destructive/8 border border-destructive/20 rounded-xl text-xs text-destructive">
              {error}
            </div>
          )}

          <div
            className={`flex items-start gap-3 p-3.5 rounded-2xl border ${type === 'guaranteed'
                ? 'bg-primary/5 border-primary/20'
                : 'bg-muted/50 border-border'
              }`}
          >
            <DollarSign className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {type === 'guaranteed' ? (
                <>
                  <span className="font-semibold text-foreground">
                    ${price} fee
                  </span>{' '}
                  — {creator.name?.split(' ')[0]} is obligated to reply
                  thoughtfully.
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground">
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
            className="flex-1 py-3 border border-border text-muted-foreground text-sm font-medium rounded-2xl hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Sending…
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
  creator: Creator
  onMessage: (c: Creator, type: 'paywall' | 'guaranteed') => void
}) {
  const hasPaywall = (creator.dmPrice ?? 0) > 0
  const hasGuaranteed = (creator.guaranteedReplyPrice ?? 0) > 0

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden card-hover group">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={creator.name} image={creator.image} />
              {hasGuaranteed && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-primary border-2 border-card flex items-center justify-center">
                  <BadgeCheck className="w-2.5 h-2.5 text-primary-foreground" />
                </span>
              )}
            </div>
            <div>
              <p className=" font-bold text-foreground text-sm">
                {creator.name || 'Creator'}
              </p>
              {creator.username && (
                <p className="text-xs text-muted-foreground">
                  @{creator.username}
                </p>
              )}
            </div>
          </div>
          {creator.followerCount && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-full border border-border">
              <Users className="w-3 h-3" />{' '}
              {creator.followerCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Niche badge */}
        {creator.niche && (
          <span className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15 font-semibold mb-3 uppercase tracking-wide">
            {creator.niche}
          </span>
        )}

        {/* Bio */}
        {creator.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {creator.bio}
          </p>
        )}

        {/* Socials */}
        {(creator.socialTwitter ||
          creator.socialInstagram ||
          creator.socialYoutube) && (
            <div className="flex items-center gap-3 mb-4">
              {creator.socialTwitter && (
                <a
                  href={`https://twitter.com/${creator.socialTwitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-muted hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {creator.socialInstagram && (
                <a
                  href={`https://instagram.com/${creator.socialInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-muted hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {creator.socialYoutube && (
                <a
                  href={`https://youtube.com/@${creator.socialYoutube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-muted hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

        {/* Pricing & CTA */}
        <div className="space-y-2 mt-auto pt-2 border-t border-border/60">
          {hasPaywall && (
            <button
              onClick={() => onMessage(creator, 'paywall')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/3 transition-all text-left group/btn"
            >
              <span className="text-xs text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                Send DM
              </span>
              <span className="font-mono-nums text-sm font-bold text-primary">
                ${creator.dmPrice}
              </span>
            </button>
          )}
          {hasGuaranteed && (
            <button
              onClick={() => onMessage(creator, 'guaranteed')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-left glow-primary-sm"
            >
              <span className="text-xs font-bold flex items-center gap-2">
                <BadgeCheck className="w-3.5 h-3.5" />
                Guaranteed Reply
              </span>
              <span className="font-mono-nums text-sm font-bold">
                ${creator.guaranteedReplyPrice}
              </span>
            </button>
          )}
          {!hasPaywall && !hasGuaranteed && (
            <button
              onClick={() => onMessage(creator, 'paywall')}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-border text-foreground text-xs font-medium rounded-xl hover:border-primary/30 hover:bg-muted transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send free DM
            </button>
          )}
          {creator.username && (
            <Link to={`/profile/${creator.username}`}>
              <button className="w-full py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                View profile <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function Creators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('All')
  const [modal, setModal] = useState<{
    creator: Creator
    type: 'paywall' | 'guaranteed'
  } | null>(null)
  const [sentSuccess, setSentSuccess] = useState(false)

  useEffect(() => {
    api
      .creators()
      .then(setCreators)
      .catch(() => { })
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

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <h1 className=" text-2xl font-bold text-foreground">
              Browse Creators
            </h1>
            <Sparkles className="w-5 h-5 text-primary animate-pulse-slow" />
          </div>
          <p className="text-muted-foreground text-sm">
            Reach out directly, or pay for a guaranteed reply.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up delay-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators…"
              className="input-base pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0 scrollbar-hide">
            {NICHES.map((n) => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${niche === n
                    ? 'bg-primary text-primary-foreground glow-primary-sm'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="h-1 bg-muted" />
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 bg-muted rounded w-28" />
                      <div className="h-2.5 bg-muted rounded w-20" />
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded" />
                  <div className="h-2.5 bg-muted rounded w-3/4" />
                  <div className="space-y-2 pt-2">
                    <div className="h-10 bg-muted rounded-xl" />
                    <div className="h-10 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-5">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className=" font-bold text-foreground text-xl mb-2">
              No creators found
            </p>
            <p className="text-muted-foreground text-sm">
              {search || niche !== 'All'
                ? 'Try adjusting your filters.'
                : 'Be the first to set up your profile!'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CreatorCard
                  creator={c}
                  onMessage={(creator, type) => setModal({ creator, type })}
                />
              </div>
            ))}
          </div>
        )}
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
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-border shadow-xl text-sm font-semibold px-5 py-3.5 rounded-2xl flex items-center gap-3 animate-fade-up">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <BadgeCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-foreground">Message sent!</p>
            <p className="text-xs text-muted-foreground font-normal">
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
