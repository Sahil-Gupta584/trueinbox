import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ChevronDown,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Heart,
  Shield,
  RefreshCw,
  Users,
  BadgeCheck,
} from 'lucide-react'
import { ThemeToggle } from '../../components/theme-toggle'
import { Logo } from '../../components/logo'

/* ─── Animated background orbs ───────────────────────────────────────────── */
export function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07] dark:opacity-[0.12]"
        style={{
          background:
            'radial-gradient(circle, oklch(0.546 0.215 264.1), transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/2 -left-32 w-80 h-80 rounded-full opacity-[0.05] dark:opacity-[0.08]"
        style={{
          background:
            'radial-gradient(circle, oklch(0.65 0.2 295), transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-[0.04] dark:opacity-[0.07]"
        style={{
          background:
            'radial-gradient(circle, oklch(0.546 0.215 264.1), transparent 70%)',
        }}
      />
    </div>
  )
}

/* ─── Fading grid ─────────────────────────────────────────────────────────── */
export function FadingGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
        linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)
      `,
        backgroundSize: '28px 28px',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 40%, transparent 85%)',
        maskImage:
          'linear-gradient(to bottom, black 0%, black 40%, transparent 85%)',
      }}
    />
  )
}

/* ─── Animated counter ────────────────────────────────────────────────────── */
export function Counter({
  target,
  prefix = '',
  suffix = '',
}: {
  target: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1500
          const step = target / (duration / 16)
          let current = 0
          const timer = setInterval(() => {
            current = Math.min(current + step, target)
            setCount(Math.floor(current))
            if (current >= target) clearInterval(timer)
          }, 16)
        }
      },
      { threshold: 0.5 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background backdrop-blur-3xl`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <Logo size={28} />
            <span className=" font-medium text-foreground text-base group-hover:text-primary transition-colors">
              TrueInbox
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {[
            ['#features', 'Features'],
            ['#faq', 'FAQ'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="relative hover:text-foreground transition-colors after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all hover:after:w-full"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/sign-in">
            <span className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-muted">
              Sign in
            </span>
          </Link>
          <Link href="/sign-in">
            <button className="bg-foreground text-background text-xs sm:text-sm">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── Dashboard Mockup ────────────────────────────────────────────────────── */
export function DashboardMockup() {
  const messages = [
    {
      name: 'NovaBrand',
      msg: "We'd love to feature you in our Q4...",
      type: 'paywall',
      amount: '$25',
      initials: 'N',
      delay: 'delay-200',
    },
    {
      name: 'Alex K.',
      msg: 'Quick question about your workflow?',
      type: 'guaranteed',
      amount: '$50',
      initials: 'A',
      delay: 'delay-300',
    },
    {
      name: 'GearUp Co.',
      msg: 'Partnership proposal for next month...',
      type: 'paywall',
      amount: '$30',
      initials: 'G',
      delay: 'delay-400',
    },
  ]

  return (
    <div className="relative animate-float">
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,oklch(0.65_0.2_295_/_0.28),transparent_30%),radial-gradient(circle_at_bottom_left,oklch(0.546_0.215_264.1_/_0.22),transparent_35%)] blur-3xl opacity-80" />
      <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[1.75rem] bg-primary/10 dark:bg-primary/5 blur-sm" />
      <div className="relative rounded-[1.75rem] overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-black/20 border-b border-white/10">
          <div className="w-3 h-3 rounded-full bg-red-400/90" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/90" />
          <div className="w-3 h-3 rounded-full bg-green-400/90" />
          <div className="flex-1 mx-4">
            <div className="bg-background border border-border rounded-md px-3 py-0.5 text-[10px] text-muted-foreground max-w-40 mx-auto text-center">
              trueinbox.dev
            </div>
          </div>
        </div>
        {/* App navbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-1.5">
            <Logo size={16} />
            <span className="text-[10px] font-bold text-foreground ">
              TrueInbox
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">
              J
            </div>
            <span className="text-[9px] text-muted-foreground">Jamie</span>
          </div>
        </div>
        {/* Body */}
        <div className="p-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total DMs', value: '38', color: 'text-foreground' },
              { label: 'Revenue', value: '$640', color: 'text-primary' },
              {
                label: 'Refunded',
                value: '$120',
                color: 'text-muted-foreground',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 border border-white/10 bg-black/10 hover:border-primary/20 transition-colors"
              >
                <p className={`font-mono-nums text-sm font-bold ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-[9px] font-semibold text-foreground">
                New Messages
              </span>
              <span className="text-[8px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-semibold">
                3 unread
              </span>
            </div>
            {messages.map((m) => (
              <div
                key={m.name}
                className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-white/10 last:border-0 hover:bg-white/[0.03] transition-colors animate-fade-up ${m.delay}`}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0">
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[9px] font-semibold text-foreground">
                      {m.name}
                    </p>
                    <span
                      className={`text-[7px] px-1 py-0.5 rounded font-medium ${
                        m.type === 'guaranteed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {m.type === 'guaranteed' ? '✓ Guaranteed' : 'DM'}
                    </span>
                  </div>
                  <p className="text-[8px] text-muted-foreground truncate">
                    {m.msg}
                  </p>
                </div>
                <span className="text-[9px] font-mono-nums font-bold text-foreground flex-shrink-0">
                  {m.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── FAQ ─────────────────────────────────────────────────────────────────── */
export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const items = [
    {
      q: "Do creators keep the money if they don't reply?",
      a: "Yes. The DM fee is theirs the moment it's sent. They're being paid for their attention, not just their reply. No response required.",
    },
    {
      q: 'How does a creator refund a DM?',
      a: "It's fully their choice. Inside the chat, before sending a reply, there's a checkbox: 'Refund this sender when I reply.' Tick it, hit send — message goes out and the refund fires automatically.",
    },
    {
      q: "What's the difference between a regular DM and a Guaranteed Reply?",
      a: 'Regular DM — you pay to get seen. Creator reads it, keeps the fee, engages if they want. Guaranteed Reply — you pay for a thoughtful, genuine response. The creator is committed to reply.',
    },
    {
      q: 'Is there a platform fee?',
      a: "Zero. Every dollar paid goes directly to the creator. We don't take a cut.",
    },
    {
      q: 'Can fans use this, not just brands?',
      a: "That's exactly who it's for. A fan who wants real advice, a genuine answer, or just a moment with someone they look up to — Guaranteed Reply is built for that.",
    },
  ]

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            open === i
              ? 'border-primary/30 bg-primary/[0.02]'
              : 'border-border bg-card'
          }`}
        >
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className=" font-semibold text-foreground text-sm pr-6">
              {item.q}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                open === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-6 pb-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Stats strip ─────────────────────────────────────────────────────────── */
export function StatsStrip() {
  const stats = [
    { value: 12000, suffix: '+', label: 'Messages sent' },
    { value: 98, suffix: '%', label: 'Creator satisfaction' },
    { value: 0, suffix: '%', label: 'Platform fee' },
    { value: 4800, suffix: '+', label: 'Active creators' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-5 py-6 text-center"
        >
          <p className=" text-3xl font-bold text-foreground">
            <Counter target={s.value} suffix={s.suffix} />
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-2">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}
