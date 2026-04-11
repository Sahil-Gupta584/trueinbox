import { useEffect, useState } from 'react'
import {
  createFileRoute,
  Link,
  useParams,
  useNavigate,
} from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { api, type Creator } from '@/lib/api'
import {
  Twitter,
  Instagram,
  Youtube,
  Users,
  MessageSquare,
  DollarSign,
  ArrowLeft,
} from 'lucide-react'

export const Route = createFileRoute('/profile/$username')({
  component: Profile,
})

function SendDMModal({
  creator,
  onClose,
  onSent,
}: {
  creator: Creator
  onClose: () => void
  onSent: () => void
}) {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputCls =
    'w-full px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/10 transition-all'

  const handleSend = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await api.startConversation(
        creator.id,
        message.trim(),
        'paywall',
        subject.trim() || undefined,
      )
      onSent()
    } catch (e: any) {
      setError(e.message || 'Failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-border">
          <p className="font-display font-bold text-foreground">
            Message {creator.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fee:{' '}
            <span className="font-mono-nums font-bold text-primary">
              ${creator.dmPrice ?? 0}
            </span>{' '}
            · refunded on reply
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Subject (optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Q4 Sponsorship Proposal"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Introduce yourself..."
              className={`${inputCls} resize-none`}
            />
          </div>
          {error && (
            <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="flex items-center gap-2 p-3 bg-accent rounded-xl border border-ring/20">
            <DollarSign className="w-4 h-4 text-accent-foreground flex-shrink-0" />
            <p className="text-xs text-accent-foreground">
              <span className="font-semibold">${creator.dmPrice ?? 0} fee</span>{' '}
              · 100% refunded when they reply
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border text-muted-foreground text-sm font-medium rounded-xl hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : `Send · $${creator.dmPrice ?? 0}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function Profile() {
  const { username } = useParams({ from: '/profile/$username' })
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showDM, setShowDM] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!username) return
    api
      .creatorByUsername(username)
      .then(setCreator)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  const isOwn = session?.user?.id === creator?.id

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  if (notFound || !creator)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="font-display font-bold text-foreground text-xl mb-2">
          Profile not found
        </p>
        <p className="text-muted-foreground text-sm mb-4">
          This creator hasn't set up their TrueInbox profile yet.
        </p>
        <Link
          to="/creators"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition-all"
        >
          Browse Creators
        </Link>
      </div>
    )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to="/creators"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Creators
      </Link>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-accent" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground border-4 border-card shadow-md">
              {creator.name?.charAt(0).toUpperCase()}
            </div>
            {!isOwn ? (
              <button
                onClick={() => setShowDM(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all glow-primary-sm"
              >
                <MessageSquare className="w-4 h-4" /> Send DM · $
                {creator.dmPrice ?? 0}
              </button>
            ) : (
              <Link to="/me">
                <button className="flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground text-sm font-medium rounded-xl hover:border-ring/40 hover:text-foreground transition-all">
                  Edit Profile
                </button>
              </Link>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            {creator.name}
          </h1>
          {creator.username && (
            <p className="text-sm text-muted-foreground mb-3">
              @{creator.username}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {creator.niche && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-ring/20 font-medium">
                {creator.niche}
              </span>
            )}
            {creator.followerCount && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {creator.followerCount} followers
              </span>
            )}
          </div>
          {creator.bio && (
            <p className="text-sm text-foreground/80 leading-relaxed mb-5">
              {creator.bio}
            </p>
          )}
          <div className="flex items-center gap-4 mb-6">
            {creator.socialTwitter && (
              <a
                href={`https://twitter.com/${creator.socialTwitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-4 h-4" />@{creator.socialTwitter}
              </a>
            )}
            {creator.socialInstagram && (
              <a
                href={`https://instagram.com/${creator.socialInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />@{creator.socialInstagram}
              </a>
            )}
            {creator.socialYoutube && (
              <a
                href={`https://youtube.com/@${creator.socialYoutube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Youtube className="w-4 h-4" />@{creator.socialYoutube}
              </a>
            )}
          </div>
          <div className="p-4 bg-muted border border-border rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                DM Price
              </p>
              <p className="text-xs text-muted-foreground">
                100% refunded on reply
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono-nums text-2xl font-bold text-foreground">
                ${creator.dmPrice ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">per message</p>
            </div>
          </div>
        </div>
      </div>
      {showDM && (
        <SendDMModal
          creator={creator}
          onClose={() => setShowDM(false)}
          onSent={() => {
            setShowDM(false)
            setSent(true)
            setTimeout(() => setSent(false), 4000)
          }}
        />
      )}
      {sent && (
        <div className="fixed bottom-6 right-6 z-50 bg-sidebar text-sidebar-foreground text-sm font-medium px-5 py-3 rounded-xl shadow-lg border border-sidebar-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" /> Message sent!
        </div>
      )}
    </div>
  )
}
