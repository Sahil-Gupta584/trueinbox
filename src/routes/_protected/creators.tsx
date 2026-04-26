import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from '../../lib/api'
import { Search, Users, BadgeCheck, UserPlus, Copy, Check } from 'lucide-react'
import type { User } from '#/db/types'
import { PaymentButtons } from '#/components/PaymentButtons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'

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

/* ─── Creator Card ────────────────────────────────────────────────────────── */
function CreatorCard({ creator }: { creator: User }) {
  const navigate = useNavigate()
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

  const handleNavigateToInbox = () => {
    if (creator.username) {
      navigate({
        to: '/inbox/$username',
        params: { username: creator.username },
      })
    }
  }

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

        {/* Payment Buttons - Always at bottom */}
        <div className="pt-3 border-t border-stone-100 mt-auto">
          <PaymentButtons
            dmPrice={creator.dmPrice}
            guaranteedReplyPrice={creator.guaranteedReplyPrice}
            onPaywall={handleNavigateToInbox}
            onGuaranteed={handleNavigateToInbox}
            layout="vertical"
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function Creators() {
  const { user } = Route.useRouteContext()
  const [creators, setCreators] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('All')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteLink = `${window.location.origin}?referral=${user.username || user.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = inviteLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
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
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite Creator</span>
            <span className="sm:hidden">Invite</span>
          </button>
        </div>

        {/* Invite Modal */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Invite a Creator
              </DialogTitle>
              <DialogDescription>
                Invite your favorite creators, influencers, or celebrities to
                TrueInbox. Share this link with them to get their attention!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                <p className="text-xs text-stone-500 mb-2 font-medium">
                  Your invite link
                </p>
                <p className="text-sm text-stone-700 break-all font-mono bg-white px-3 py-2 rounded-lg border border-stone-200">
                  {inviteLink}
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>

              <p className="text-xs text-stone-400 text-center">
                When creators sign up using your link, we'll know you referred
                them.
              </p>
            </div>
          </DialogContent>
        </Dialog>

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
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </div>
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
