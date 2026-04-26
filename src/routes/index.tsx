import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Shield,
  RefreshCw,
  Users,
  BadgeCheck,
  TrendingUp,
  Heart,
  Sparkles,
  Zap,
  Star,
  CheckCircle,
  MoveRight,
} from 'lucide-react'
import {
  Navbar,
  BackgroundOrbs,
  DashboardMockup,
  StatsStrip,
  FAQ,
} from './-components/landing-components'
import { Logo } from '#/components/logo'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/')({
  component: Landing,
})

/* ─── Page ────────────────────────────────────────────────────────────────── */
function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] pt-36 pb-32 overflow-hidden flex items-center">
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center gap-14 lg:gap-20">
            {/* Left — copy */}
            <div className="flex-1 w-full text-center lg:text-left">
              <Badge className="mb-8">
                <Sparkles className="size-2" />
                0% platform fee, every dollar to creators
              </Badge>
              <div className="flex flex-col items-center lg:items-start gap-8 mb-12 animate-fade-up delay-75">
                <div className="text-center lg:text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/50 ">
                    For Creators
                  </p>
                  <p className="text-2xl sm:text-md lg:text-2xl text-foreground font-bold  leading-tight">
                    Introducing a new earning source for creators.
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/50 ">
                    For Fans & Sponsors
                  </p>
                  <p className="text-2xl sm:text-md lg:text-2xl text-foreground font-bold  leading-tight">
                    Get a guaranteed attention of your loved creators.
                  </p>
                </div>
              </div>

              <p className="text-foreground/68 text-md leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-up delay-200">
                TrueInbox keeps messages from close friends, real sponsors, and
                people who matter always within reach — no fan floods, no bots.
              </p>

              <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 animate-fade-up delay-300">
                <Link to="/sign-in">
                  <button className="bg-foreground text-background">
                    Get started <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
                <Link to="/creators">
                  <button className="bg-transparent">
                    Browse creators
                    <MoveRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 animate-fade-up delay-400">
                {[
                  { value: '0%', label: 'Platform take' },
                  { value: '2 tiers', label: 'DM products' },
                  { value: '4.8k+', label: 'Creator demand' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-left backdrop-blur-sm"
                  >
                    <p className=" text-2xl font-bold text-foreground">
                      {item.value}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-8 animate-fade-up delay-500">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((l, i) => (
                    <div
                      key={l}
                      className="w-7 h-7 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary"
                      style={{ zIndex: 4 - i }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Trusted by 4,800+ creators and the teams trying to reach them
                </span>
              </div>
            </div>

            {/* Right — mockup */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none animate-fade-up delay-200">
              <div className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-3 backdrop-blur-sm">
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[11px] text-muted-foreground uppercase tracking-[0.32em] mb-8">
            Considered by operators from
          </p>
          <div className="overflow-hidden relative">
            <div className="flex gap-16 animate-marquee whitespace-nowrap">
              {[
                'Nike',
                'Spotify',
                'Adobe',
                'Notion',
                'Figma',
                'Stripe',
                'Nike',
                'Spotify',
                'Adobe',
                'Notion',
                'Figma',
                'Stripe',
              ].map((b, i) => (
                <span
                  key={i}
                  className=" font-bold text-lg text-foreground/30 tracking-wide flex-shrink-0"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <StatsStrip />
        </div>
      </section>

      {/* ── FOR CREATORS + FOR FANS ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-4 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Zap className="w-3 h-3" /> Built for both sides
            </span>
            <h2 className=" text-4xl sm:text-5xl font-bold text-foreground mb-4">
              One platform.
              <br />
              Two problems solved.
            </h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
              Creators finally have a new income source. Fans finally get the
              reply they deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Creators */}
            <div
              id="for-creators"
              className="rounded-[2rem] overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] card-hover group"
            >
              <div className="p-8 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                  For Creators
                </p>
                <h3 className=" text-2xl font-bold text-foreground mb-3">
                  A new income source.
                  <br />A cleaner inbox.
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your inbox has always been chaos. TrueInbox turns that chaos
                  into a signal-only channel — every message that reaches you
                  has already paid for your time.
                </p>
              </div>
              <div className="p-6 bg-black/10 space-y-4 border-t border-white/8">
                {[
                  {
                    title: 'Set your own DM price',
                    desc: 'Anywhere from $1 to $500. You decide what your attention is worth.',
                  },
                  {
                    title: 'No reply? You still keep it',
                    desc: 'The fee is yours the moment the message is sent. Reading it is enough.',
                  },
                  {
                    title: 'Guaranteed Reply tier',
                    desc: 'Set a second price for people who need a real, thoughtful response.',
                  },
                  {
                    title: 'Zero platform cut',
                    desc: '100% of every dollar goes directly to you. We take nothing.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 group/item"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-primary/20 transition-colors">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Fans */}
            <div
              id="for-fans"
              className="rounded-[2rem] overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] card-hover group"
            >
              <div className="p-8 bg-gradient-to-br from-violet-500/10 via-violet-500/[0.04] to-transparent">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500/15 transition-colors">
                  <Heart className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-2">
                  For Fans &amp; Brands
                </p>
                <h3 className=" text-2xl font-bold text-foreground mb-3">
                  Stop being ignored.
                  <br />
                  Get the reply you deserve.
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your messages have always been lost in the noise. TrueInbox
                  gives you a direct line — pay to be seen, or pay for a
                  guaranteed reply.
                </p>
              </div>
              <div className="p-6 bg-black/10 space-y-4 border-t border-white/8">
                {[
                  {
                    title: 'Pay to get seen',
                    desc: 'Your message lands directly in their inbox, not buried under hundreds of others.',
                  },
                  {
                    title: 'Guaranteed Reply',
                    desc: 'The creator is committed to replying thoughtfully. No more being ghosted.',
                  },
                  {
                    title: 'Talk directly',
                    desc: 'No agencies, no managers, no gatekeepers. Just you and the creator.',
                  },
                  {
                    title: 'Refund on genuine conversations',
                    desc: 'If the creator finds your message worth continuing, they can refund your DM fee.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 group/item"
                  >
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-violet-500/20 transition-colors">
                      <CheckCircle className="w-3 h-3 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] border-y border-white/8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-4 px-3 py-1 bg-primary/10 rounded-full">
              The platform
            </span>
            <h2 className=" text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Everything in one clean inbox.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Wide — spam filter */}
            <div className="md:col-span-2 border border-white/8 rounded-[2rem] p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] card-hover group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className=" font-bold text-foreground text-xl mb-2">
                Spam dies at the door.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Every message costs money to send. That alone filters out 99% of
                noise — no bots, no cold pitches, no "just checking in."
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    from: 'NovaBrand',
                    msg: "We'd love to collaborate on our Q3 launch...",
                    badge: '$25',
                    type: 'DM',
                    initials: 'N',
                  },
                  {
                    from: 'Alex K.',
                    msg: 'Huge fan — can I ask you something specific?',
                    badge: '$50',
                    type: 'Guaranteed',
                    initials: 'A',
                  },
                ].map((m) => (
                  <div
                    key={m.from}
                    className="flex items-center gap-3 bg-black/10 rounded-2xl p-3.5 border border-white/8 hover:border-primary/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {m.from}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.msg}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-mono-nums text-sm font-bold text-foreground">
                        {m.badge}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          m.type === 'Guaranteed'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-border text-muted-foreground'
                        }`}
                      >
                        {m.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund card */}
            <div className="border border-white/8 rounded-[2rem] p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] card-hover flex flex-col group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-6 border border-emerald-500/10">
                <RefreshCw className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className=" font-bold text-foreground text-xl mb-2">
                Refund is a choice, not a rule.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                Creator finds the conversation worth having? They tick a box
                when replying and the fee goes back. Goodwill, not obligation.
              </p>
              <div className="mt-8 pt-6 border-t border-white/8">
                <p className="font-mono-nums text-4xl font-bold text-gradient">
                  100%
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  refundable — creator's choice
                </p>
              </div>
            </div>

            <div className="border border-white/8 rounded-[2rem] p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] card-hover group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center mb-6 border border-violet-500/10">
                <Users className="w-5 h-5 text-violet-500" />
              </div>
              <h3 className=" font-bold text-foreground text-xl mb-2">
                Find anyone, fast.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Browse creators by niche, see pricing upfront, send your pitch —
                no chasing profiles across platforms.
              </p>
            </div>

            <div className="md:col-span-2 border border-white/8 rounded-[2rem] p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] card-hover group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-6 border border-amber-500/10">
                <BadgeCheck className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className=" font-bold text-foreground text-xl mb-2">
                Two DM types. Total clarity.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Pay to get seen. Pay for a Guaranteed Reply. Both sides always
                know exactly what they're signing up for.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: 'Regular DM',
                    desc: 'Pay to reach — creator may refund',
                    price: 'from $1',
                    color: 'border-border bg-muted/50',
                  },
                  {
                    title: 'Guaranteed Reply',
                    desc: 'Creator obligated to respond',
                    price: 'from $5',
                    color: 'border-primary/30 bg-primary/5',
                  },
                ].map((t) => (
                  <div
                    key={t.title}
                    className={`p-4 rounded-2xl border ${t.color}`}
                  >
                    <p className="text-sm font-bold text-foreground mb-1">
                      {t.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t.desc}
                    </p>
                    <p className="font-mono-nums text-xs font-bold text-primary">
                      {t.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-4 px-3 py-1 bg-primary/10 rounded-full">
              FAQ
            </span>
            <h2 className=" text-4xl sm:text-5xl font-bold text-foreground">
              Common questions.
            </h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(255,255,255,0.04),transparent)] p-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <BackgroundOrbs />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="w-3 h-3" /> Ready to start?
              </span>
              <h2 className=" text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Your inbox, your rules.
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Join thousands of creators who've turned their inbox into a
                revenue channel — with zero platform cut.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/sign-in">
                  <button className="btn-primary text-base px-8 py-3 glow-primary">
                    Get started — it's free <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/creators">
                  <button className="btn-secondary text-base px-8 py-3">
                    Browse creators
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-12 px-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Logo size={22} />
              <span className=" font-bold text-foreground">TrueInbox</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#faq"
                className="hover:text-foreground transition-colors"
              >
                FAQ
              </a>
              <Link href="/sign-in">
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Sign in
                </span>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 TrueInbox. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
