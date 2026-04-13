import React, { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useSession } from '../../lib/auth-client'
import { api } from '../../lib/api'
import type { Stats, UnreadConversation } from '../../lib/api'
import {
  MessageSquare,
  DollarSign,
  RefreshCw,
  ArrowRight,
  Inbox,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { Card } from '#/components/ui/card'

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Avatar({
  name,
  image,
  size = 'md',
}: {
  name: string | null
  image: string | null
  size?: 'sm' | 'md'
}) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
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

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function StatCard({
  icon: Icon,
  value,
  label,
  gradient,
  iconColor,
  delay = '',
}: {
  icon: React.FC<{ className?: string }>
  value: string
  label: string
  gradient: string
  iconColor: string
  delay?: string
}) {
  return (
    <Card className={`stat-card animate-fade-up shadow-sm group`}>
      {/* Gradient accent line */}
      <Icon
        className={`size-8 border group-hover:bg-accent/10 mb-4 transition group-hover:border-accent/20 rounded-lg bg-muted p-2`}
      />
      <p className="font-lora text-2xl font-md text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Card>
  )
}

function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [unread, setUnread] = useState<UnreadConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.stats(), api.unread()])
      .then(([s, u]) => {
        setStats(s)
        setUnread(u)
      })
      .finally(() => setLoading(false))
  }, [])

  const displayName =
    session?.user.name.split(' ')[0] || session?.user.email.split('@')[0]

  return (
    <div className="w-full pt-14">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <h1 className=" text-2xl font-['Lora'] font-medium text-foreground">
            Hey, {displayName}
            <span style={{ fontSize: '22px' }}>🌟</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Here's what's happening in your inbox today.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 animate-pulse"
            >
              <div className="w-9 h-9 bg-muted rounded-xl mb-4" />
              <div className="h-7 w-20 bg-muted rounded mb-2" />
              <div className="h-3 w-28 bg-muted rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={MessageSquare}
              value={String(stats?.totalDMs ?? 0)}
              label="Total conversations"
              gradient="from-blue-500 to-blue-600"
              iconColor="text-blue-500"
              delay="delay-100"
            />
            <StatCard
              icon={DollarSign}
              value={`$${stats?.paywallRevenue?.toFixed(2) ?? '0.00'}`}
              label="DM revenue earned"
              gradient="from-emerald-500 to-emerald-600"
              iconColor="text-emerald-500"
              delay="delay-200"
            />
            <StatCard
              icon={RefreshCw}
              value={`$${stats?.refundedAmount?.toFixed(2) ?? '0.00'}`}
              label="Amount refunded"
              gradient="from-violet-500 to-violet-600"
              iconColor="text-violet-500"
              delay="delay-300"
            />
          </>
        )}
      </div>

      {/* Unread messages */}
      <Card className="overflow-hidden ">
        <div className="flex items-center justify-between pb-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <h2 className=" font-md text-foreground text-sm">New Messages</h2>
            {!loading && unread.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold min-w-[20px] text-center">
                {unread.length}
              </span>
            )}
          </div>
          <Link to="/inbox">
            <span className="text-xs text-primary hover:opacity-75 transition-opacity cursor-pointer flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-4 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-36" />
                  <div className="h-2.5 bg-muted rounded w-4/5" />
                </div>
                <div className="h-2.5 bg-muted rounded w-14" />
              </div>
            ))}
          </div>
        ) : unread.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              All caught up
            </p>
            <p className="text-xs text-muted-foreground">
              No unread messages right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {unread.map((conv, idx) => (
              <Link
                key={conv.id}
                to="/inbox/$username"
                params={{
                  username: conv.other?.username || conv.other?.id || '',
                }}
              >
                <div
                  className={`flex items-center gap-3.5 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer group animate-fade-up`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="relative  flex-shrink-0">
                    <Avatar
                      name={conv.other?.name ?? null}
                      image={conv.other?.image ?? null}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {conv.other?.name || conv.other?.username || 'Someone'}
                      </p>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          conv.type === 'guaranteed'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {conv.type === 'guaranteed' ? 'guaranteed' : 'DM'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
