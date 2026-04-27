import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import landingStyleUrl from './-components/landing.style.css?url'

export const Route = createFileRoute('/')({
  component: TrueInboxLanding,
  head: () => ({
    links: [
      {
        rel: 'stylesheet',
        href: landingStyleUrl,
      },
    ],
  }),
})

function TrueInboxLanding() {
  useEffect(() => {
    // Reveal elements on scroll
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
          }
        })
      },
      { threshold: 0.1 },
    )

    const revealElements = document.querySelectorAll('.reveal')
    revealElements.forEach((el) => revealObserver.observe(el))

    // Navbar scroll effect
    const handleScroll = () => {
      const nav = document.getElementById('nav')
      if (window.scrollY > 20) {
        nav?.classList.add('scrolled')
      } else {
        nav?.classList.remove('scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      revealObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <nav id="nav">
        <a href="#" className="logo">
          <div className="logo-mark">✓</div>
          TrueInbox
        </a>
        <ul className="nav-links">
          <li>
            <a href="#how">How it works</a>
          </li>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
        </ul>
        <a href="/dashboard">
          <button className="nav-cta">Dashboard</button>
        </a>
      </nav>
      {/* HERO */}
      <div
        style={{
          background: 'var(--bg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 70% at 70% 40%, rgba(45,106,79,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <section className="hero">
          {/* LEFT: Text content */}
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span style={{ fontSize: 13 }}>✦</span>
              0% platform fee — every dollar goes to creators
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                marginBottom: 4,
                animation: 'fadeUp 0.7s 0.08s ease both',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: 5,
                  }}
                >
                  FOR CREATORS
                </div>
                <h1 className="hero-title" style={{ animation: 'none' }}>
                  Introducing a new
                  <br />
                  earning source.
                </h1>
              </div>
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: 5,
                  }}
                >
                  FOR FANS &amp; SPONSORS
                </div>
                <h1
                  className="hero-title"
                  style={{ animation: 'none', color: 'var(--accent)' }}
                >
                  Get guaranteed
                  <br />
                  attention.
                </h1>
              </div>
            </div>
            <p className="hero-sub">
              TrueInbox keeps messages from close friends, real sponsors, and
              people who matter always within reach — no fan floods, no bots.
            </p>
            <div className="hero-actions">
              <a href="/dashboard">
                <button className="btn-primary">
                  Get started
                  <svg
                    width={14}
                    height={14}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </a>
              <a href="/creators">
                <button className="btn-outline">Browse creators →</button>
              </a>
            </div>
            <div className="hero-social-proof">
              <div className="proof-avatars">
                <div
                  className="proof-av"
                  style={{ background: '#e8f5ef', color: 'var(--accent2)' }}
                >
                  Z
                </div>
                <div
                  className="proof-av"
                  style={{ background: '#dde8f5', color: 'var(--blue)' }}
                >
                  M
                </div>
                <div
                  className="proof-av"
                  style={{ background: '#fde8e8', color: 'var(--red)' }}
                >
                  P
                </div>
                <div
                  className="proof-av"
                  style={{ background: '#fdf3e3', color: '#92600a' }}
                >
                  A
                </div>
                <div
                  className="proof-av"
                  style={{ background: '#f3e8fd', color: '#6b3fa0' }}
                >
                  K
                </div>
              </div>
              <div className="proof-text">
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>
                  12,400+ creators
                </strong>{' '}
                already joined
                <br />
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  $2.4M+
                </span>{' '}
                in deals unlocked
              </div>
            </div>
          </div>
          {/* RIGHT: Visual */}
          <div className="hero-right">
            <div className="hero-preview">
              <div className="phone-wrap">
                <div className="phone-header">
                  <span className="phone-back">‹</span>
                  <img
                    src="https://pbs.twimg.com/profile_images/1996831016720486400/vycHz0uG_400x400.jpg"
                    className="w-8 h-8 rounded-full object-cover"
                    alt="levelsio's Avatar"
                  />
                  <div className="phone-info">
                    <div className="phone-name">levelsio</div>
                    <div className="phone-status">Fan · Paid DM</div>
                  </div>
                  <div className="phone-verified">✓ Guaranteed</div>
                </div>
                <div
                  className="chat-body"
                  style={{
                    padding: '0',
                    background: '#fafaf9',
                    backgroundImage:
                      'radial-gradient(#e7e5e4 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                  }}
                >
                  <div className="flex items-center justify-center my-1">
                    <span className="text-[10px] text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                      Today
                    </span>
                  </div>

                  {/* Payment chip */}
                  <div className="flex justify-center mb-2 mt-1">
                    <div
                      className="rounded-xl bg-white shadow-sm p-2 border border-stone-200 text-center mx-3"
                      style={{ width: 'calc(100% - 24px)' }}
                    >
                      <div className="text-stone-500 text-[11px] flex items-center justify-center gap-1.5">
                        <span>
                          <strong>Alex</strong> made a payment of
                        </span>
                        <span className="font-medium text-green-600">
                          $50.00
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message them (Fan) */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] flex flex-col gap-0.5 items-end px-3">
                      <div className="px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm bg-emerald-600 text-white rounded-br-sm">
                        Hey levelsio! Building an AI dev tool and struggling
                        with our GTM strategy for early enterprise pilots.
                      </div>
                      <span className="text-[9px] px-1 text-stone-400">
                        9:41 AM
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[85%] flex flex-col gap-0.5 items-end px-3">
                      <div className="px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm bg-emerald-600 text-white rounded-br-sm">
                        Should we target individual devs first or go straight to
                        engineering managers? Happy to pay for your thoughts!
                      </div>
                      <span className="text-[9px] px-1 text-stone-400">
                        9:42 AM
                      </span>
                    </div>
                  </div>

                  {/* Refund chip */}
                  <div className="flex items-center justify-center my-2">
                    <div className="text-[10px] text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-emerald-200 text-center mx-3 leading-tight">
                      🎉 levelsio issued the refund of{' '}
                      <span className="font-medium text-emerald-600">
                        $50.00
                      </span>{' '}
                      at 10:05 AM 🎉
                    </div>
                  </div>

                  {/* Message me (Creator) */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex flex-col gap-0.5 items-start px-3">
                      <div className="px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm bg-white text-stone-800 rounded-bl-sm border border-stone-200">
                        Hey Alex! Start with individual devs. Get them to
                        champion your tool internally. Top-down enterprise sales
                        are too slow for early stage. Good luck! 🚀
                      </div>
                      <span className="text-[9px] px-1 text-stone-400">
                        10:05 AM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* STATS */}
      <div className="stats-strip">
        <div className="stats-track">
          <div className="stat-item">
            <span className="stat-num">$2.4M+</span>
            <span className="stat-label">Deals unlocked</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">12,400</span>
            <span className="stat-label">Creators active</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">98%</span>
            <span className="stat-label">Spam filtered</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">340+</span>
            <span className="stat-label">Verified sponsors</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">4.8 ★</span>
            <span className="stat-label">Creator rating</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">$2.4M+</span>
            <span className="stat-label">Deals unlocked</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">12,400</span>
            <span className="stat-label">Creators active</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">98%</span>
            <span className="stat-label">Spam filtered</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">340+</span>
            <span className="stat-label">Verified sponsors</span>
          </div>
          <span className="stat-dot">·</span>
          <div className="stat-item">
            <span className="stat-num">4.8 ★</span>
            <span className="stat-label">Creator rating</span>
          </div>
          <span className="stat-dot">·</span>
        </div>
      </div>
      <div className="divider" />
      {/* HOW IT WORKS */}
      <section id="how">
        <div className="container text-center">
          <div className="reveal">
            <div className="label">How it works</div>
            <h2 className="section-title">
              Simple enough to <em>just work.</em>
            </h2>
            <p className="section-sub" style={{ margin: '14px auto 0' }}>
              Three steps. Zero friction.
            </p>
          </div>
          <div className="steps reveal">
            <div className="step">
              <div className="step-circle">💳</div>
              <div className="step-num-label">Step 01</div>
              <div className="step-title">Sponsor deposits</div>
              <div className="step-desc">
                A small, refundable deposit is required to message any creator.
                This alone blocks 99% of spam before it starts.
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-circle">📬</div>
              <div className="step-num-label">Step 02</div>
              <div className="step-title">You receive it</div>
              <div className="step-desc">
                The message lands in your TrueInbox — clean, verified, alongside
                your trusted friends and team.
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-circle">✅</div>
              <div className="step-num-label">Step 03</div>
              <div className="step-title">Reply = refund</div>
              <div className="step-desc">
                You reply, the sponsor gets their deposit back. You ignore? The
                deposit comes to you instead.
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />
      {/* TWO PROBLEMS SOLVED */}
      <section id="two-sides" style={{ padding: '80px 24px' }}>
        <div className="container">
          <div className="reveal text-center" style={{ marginBottom: 52 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--warm)',
                border: '1px solid var(--border)',
                padding: '5px 14px',
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text2)',
                marginBottom: 20,
              }}
            >
              <span>⚡</span> Built for both sides
            </div>
            <h2 className="section-title">
              One platform.
              <br />
              <em>Two problems solved.</em>
            </h2>
            <p className="section-sub" style={{ margin: '14px auto 0' }}>
              Creators finally have a new income source. Fans finally get the
              reply they deserve.
            </p>
          </div>
          <div
            className="reveal grid md:grid-cols-2"
            style={{
              gap: 16,
              maxWidth: 1040,
              margin: '0 auto',
            }}
          >
            {/* FOR CREATORS card */}
            <div
              style={{
                background: '#f7f6f3',
                border: '1px solid var(--border)',
                borderRadius: 20,
                overflow: 'hidden',
              }}
              className='flex flex-col'
            >
              <div style={{
                padding: '32px 32px 24px',
                height: '50%',

              }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20,
                    marginBottom: 24,
                    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                  }}
                >
                  📈
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: 10,
                  }}
                >
                  For Creators
                </div>
                <h3
                  style={{
                    fontFamily: '"Lora",serif',
                    fontSize: 'clamp(20px,2.4vw,26px)',
                    lineHeight: '1.2',
                    letterSpacing: '-.02em',
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  A new income source.
                  <br />A cleaner inbox.
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text2)',
                    lineHeight: '1.7',
                    maxWidth: 380,
                  }}
                >
                  Your inbox has always been chaos. TrueInbox turns that chaos
                  into a signal-only channel — every message that reaches you
                  has already paid for your time.
                  <br />
                  <span>
                    Clean inbox for your sponsorships, friends and family DMs.
                  </span>
                  <br />
                  <span className="italic text-foreground">
                    Make it free via refunds!
                  </span>
                </p>
              </div>
              <div
                style={{
                  background: '#edecea',
                  borderTop: '1px solid var(--border)',
                  padding: '24px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  flexGrow: 1,
                }}
              >
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      border: '1px solid rgba(45,106,79,.2)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: 'var(--accent2)',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Set your own DM price
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Anywhere from $1 to $500. You decide what your attention
                      is worth.
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      border: '1px solid rgba(45,106,79,.2)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: 'var(--accent2)',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      No reply? You still keep it
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      The fee is yours the moment the message is sent. Reading
                      it is enough.
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      border: '1px solid rgba(45,106,79,.2)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: 'var(--accent2)',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Guaranteed Reply tier
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Set a second price for people who need a real, thoughtful
                      response.
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      border: '1px solid rgba(45,106,79,.2)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: 'var(--accent2)',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Zero platform cut
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      100% of every dollar goes directly to you. We take
                      nothing.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* FOR FANS & BRANDS card */}
            <div
              style={{
                background: '#f3f2f8',
                border: '1px solid #dbd9ee',
                borderRadius: 20,
                overflow: 'hidden',
              }}
              className='flex flex-col'
            >
              <div style={{
                padding: '32px 32px 24px',
                height: '50%',

              }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'var(--surface)',
                    border: '1px solid #dbd9ee',
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20,
                    marginBottom: 24,
                    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                  }}
                >
                  🤍
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: '#7c6fa0',
                    marginBottom: 10,
                  }}
                >
                  For Fans &amp; Brands
                </div>
                <h3
                  style={{
                    fontFamily: '"Lora",serif',
                    fontSize: 'clamp(20px,2.4vw,26px)',
                    lineHeight: '1.2',
                    letterSpacing: '-.02em',
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  Stop being ignored.
                  <br />
                  Get the reply you deserve.
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text2)',
                    lineHeight: '1.7',
                    maxWidth: 380,
                  }}
                >
                  Your messages have always been lost in the noise. TrueInbox
                  gives you a direct line — pay to be seen, or pay for a
                  guaranteed reply.
                  <br />
                  <br />
                  <br />
                </p>
              </div>
              <div
                style={{
                  background: '#ebe9f5',
                  borderTop: '1px solid #dbd9ee',
                  padding: '24px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
                className='grow-span-2 h'
              >
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#f0eefa',
                      border: '1px solid #c4b9e8',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: '#5b4a9a',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Pay to get seen
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Your message lands directly in their inbox, not buried
                      under hundreds of others.
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#f0eefa',
                      border: '1px solid #c4b9e8',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: '#5b4a9a',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Guaranteed Reply
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      The creator is committed to replying thoughtfully. No more
                      being ghosted.
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#f0eefa',
                      border: '1px solid #c4b9e8',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: '#5b4a9a',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Talk directly
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      No agencies, no managers, no gatekeepers. Just you and the
                      creator.
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#f0eefa',
                      border: '1px solid #c4b9e8',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 11,
                      color: '#5b4a9a',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}
                    >
                      Refund on genuine conversations
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      If the creator finds your message worth continuing, they
                      can refund your DM fee.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />
      {/* INBOX SPLIT */}
      <section>
        <div className="container">
          <div className="reveal text-center">
            <div className="label">The difference</div>
            <h2 className="section-title">
              Before &amp; <em>after TrueInbox.</em>
            </h2>
          </div>
          <div className="inbox-split reveal">
            <div className="inbox-panel">
              <div
                className="inbox-panel-header"
                style={{ color: 'var(--red)' }}
              >
                <div
                  className="panel-dot"
                  style={{ background: 'var(--red)' }}
                />
                Your Instagram DMs right now
              </div>
              <div className="inbox-row" style={{ opacity: '0.3' }}>
                <div className="row-av" style={{ background: '#f3f0ea' }}>
                  😭
                </div>
                <div className="row-info">
                  <div className="row-name">superfan_99</div>
                  <div className="row-preview">
                    omg pls notice me ur literally my idol
                  </div>
                </div>
                <div className="row-tag tag-no">Spam</div>
              </div>
              <div className="inbox-row" style={{ opacity: '0.3' }}>
                <div className="row-av" style={{ background: '#f3f0ea' }}>
                  🤖
                </div>
                <div className="row-info">
                  <div className="row-name">brand_collab_bot</div>
                  <div className="row-preview">
                    Hi! Amazing content! 70% commission offer...
                  </div>
                </div>
                <div className="row-tag tag-no">Spam</div>
              </div>
              <div className="inbox-row" style={{ opacity: '0.3' }}>
                <div className="row-av" style={{ background: '#f3f0ea' }}>
                  👤
                </div>
                <div className="row-info">
                  <div className="row-name">anonymous123</div>
                  <div className="row-preview">
                    follow me back plsssss 🙏🙏🙏
                  </div>
                </div>
                <div className="row-tag tag-no">Spam</div>
              </div>
              <div className="inbox-row" style={{ opacity: '0.45' }}>
                <div className="row-av" style={{ background: '#dde8f5' }}>
                  S
                </div>
                <div className="row-info">
                  <div className="row-name">Sana (bestie)</div>
                  <div className="row-preview">
                    are you coming Friday?? let me know 🙏
                  </div>
                </div>
                <div className="row-tag tag-fr">Friend</div>
              </div>
              <div className="inbox-row" style={{ opacity: '0.35' }}>
                <div className="row-av" style={{ background: '#e8f5ef' }}>
                  N
                </div>
                <div className="row-info">
                  <div className="row-name">Nike Partnerships</div>
                  <div className="row-preview">
                    Hi! We'd love to offer you a $8,000 deal...
                  </div>
                </div>
                <div className="row-tag tag-ok">Sponsor</div>
              </div>
            </div>
            <div
              className="inbox-panel"
              style={{ borderColor: 'rgba(45,106,79,0.3)' }}
            >
              <div
                className="inbox-panel-header"
                style={{ color: 'var(--accent)' }}
              >
                <div
                  className="panel-dot"
                  style={{ background: 'var(--accent)' }}
                />
                Your TrueInbox ✓
              </div>
              <div className="inbox-row">
                <div className="row-av" style={{ background: '#e8f5ef' }}>
                  N
                </div>
                <div className="row-info">
                  <div className="row-name">Nike Partnerships</div>
                  <div className="row-preview">
                    Hi! We'd love to offer you a $8,000 deal...
                  </div>
                </div>
                <div className="row-tag tag-ok">Sponsor</div>
              </div>
              <div className="inbox-row">
                <div className="row-av" style={{ background: '#dde8f5' }}>
                  S
                </div>
                <div className="row-info">
                  <div className="row-name">Sana (bestie)</div>
                  <div className="row-preview">
                    are you coming Friday?? let me know 🙏
                  </div>
                </div>
                <div className="row-tag tag-fr">Friend</div>
              </div>
              <div className="inbox-row">
                <div className="row-av" style={{ background: '#e8f5ef' }}>
                  L
                </div>
                <div className="row-info">
                  <div className="row-name">Lume Skincare</div>
                  <div className="row-preview">
                    $6,000 collab — Vitamin C launch 🌿
                  </div>
                </div>
                <div className="row-tag tag-ok">Sponsor</div>
              </div>
              <div className="inbox-row">
                <div className="row-av" style={{ background: '#dde8f5' }}>
                  P
                </div>
                <div className="row-info">
                  <div className="row-name">Priya (Manager)</div>
                  <div className="row-preview">
                    Contract ready for review, check your email
                  </div>
                </div>
                <div className="row-tag tag-fr">Trusted</div>
              </div>
              <div className="inbox-row">
                <div className="row-av" style={{ background: '#e8f5ef' }}>
                  A
                </div>
                <div className="row-info">
                  <div className="row-name">Aura Labs</div>
                  <div className="row-preview">
                    Following up on our skincare collab proposal
                  </div>
                </div>
                <div className="row-tag tag-ok">Sponsor</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ECON */}
      <section className="econ-section">
        <div className="container text-center">
          <div className="reveal">
            <div className="label">The economics</div>
            <h2 className="section-title">
              Money creates <em>accountability.</em>
            </h2>
            <p className="section-sub" style={{ margin: '14px auto 0' }}>
              Real brands don't mind a deposit. Spammers can't survive one.
            </p>
          </div>
          <div className="econ-flow reveal">
            <div className="econ-box">
              <div className="econ-emoji">🏢</div>
              <div className="econ-label">Sponsor sends</div>
              <div className="econ-val">$25 deposit</div>
            </div>
            <div className="econ-arrow">→</div>
            <div className="econ-box highlight">
              <div className="econ-emoji">📨</div>
              <div className="econ-label">Lands in</div>
              <div className="econ-val">Your TrueInbox</div>
            </div>
            <div className="econ-arrow">→</div>
            <div className="econ-box">
              <div className="econ-emoji">✅</div>
              <div className="econ-label">You reply</div>
              <div className="econ-val">Full refund</div>
            </div>
            <div className="econ-or">or</div>
            <div className="econ-box">
              <div className="econ-emoji">🙅</div>
              <div className="econ-label">You ignore</div>
              <div className="econ-val" style={{ color: 'var(--accent)' }}>
                You keep $25
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section id="features">
        <div className="container">
          <div className="reveal text-center">
            <div className="label">Features</div>
            <h2 className="section-title">
              Everything a creator <em>actually needs.</em>
            </h2>
          </div>
          <div className="feat-grid reveal">
            <div className="feat-card">
              <div className="feat-icon">💬</div>
              <div className="feat-title">TrueInbox</div>
              <div className="feat-desc">
                A clean inbox reserved for verified sponsors and your trusted
                circle. Fan messages and bots simply can't enter.
              </div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🤝</div>
              <div className="feat-title">Trusted Circle</div>
              <div className="feat-desc">
                Add close friends, managers, family — they always reach you for
                free. Your people, always accessible.
              </div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">✅</div>
              <div className="feat-title">Sponsor Verification</div>
              <div className="feat-desc">
                Every sponsor is vetted before they can message you. Brand,
                budget, and intent confirmed upfront.
              </div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">📊</div>
              <div className="feat-title">Deal Analytics</div>
              <div className="feat-desc">
                See your deal history, response rates, and lifetime earnings at
                a glance. Know your worth.
              </div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🔗</div>
              <div className="feat-title">Cross-Platform</div>
              <div className="feat-desc">
                One inbox from Instagram, X, YouTube, TikTok. No more switching
                between five different apps.
              </div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🔔</div>
              <div className="feat-title">Smart Alerts</div>
              <div className="feat-desc">
                Only notified when it's worth your time. High-value messages get
                priority. Everything else can wait.
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="divider" />
      {/* TESTIMONIALS */}
      <section>
        <div className="container text-center">
          <div className="reveal">
            <div className="label">Creators say</div>
            <h2 className="section-title">
              Real creators, <em>real deals found.</em>
            </h2>
          </div>
          <div className="testi-grid reveal">
            <div className="testi-card">
              <div className="testi-stars">★ ★ ★ ★ ★</div>
              <div className="testi-text">
                "I missed a $30K Nike deal buried under 4,000 fan DMs. TrueInbox
                would have surfaced it the same day."
              </div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: '#e8f5ef' }}>
                  Z
                </div>
                <div>
                  <div className="testi-name">Zara K.</div>
                  <div className="testi-handle">
                    @zaraaesthetic · 2.1M followers
                  </div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★ ★ ★ ★ ★</div>
              <div className="testi-text">
                "Real brands don't flinch at a deposit. My reply rate went from
                12% to 89% — every message now means something."
              </div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: '#dde8f5' }}>
                  M
                </div>
                <div>
                  <div className="testi-name">Marcus T.</div>
                  <div className="testi-handle">
                    @marcustech · 890K followers
                  </div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★ ★ ★ ★ ★</div>
              <div className="testi-text">
                "I made $1,200 in one month from ignored fake sponsors. The
                deposit system literally pays you for the noise."
              </div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: '#fde8f5' }}>
                  P
                </div>
                <div>
                  <div className="testi-name">Priya S.</div>
                  <div className="testi-handle">
                    @priyalifestyle · 540K followers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* PRICING */}
      <section
        id="pricing"
        style={{
          background: 'var(--warm)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container text-center">
          <div className="reveal">
            <div className="label">Pricing</div>
            <h2 className="section-title">
              Free for creators, <em>always.</em>
            </h2>
            <p className="section-sub" style={{ margin: '14px auto 0' }}>
              Sponsors fund the ecosystem. Creators never pay a cent.
            </p>
          </div>
          <div className="pricing-grid reveal">
            <div className="price-card">
              <div className="price-tier">Creator Free</div>
              <div className="price-amount">$0</div>
              <div className="price-period">forever free</div>
              <ul className="price-features">
                <li>TrueInbox access</li>
                <li>Up to 20 trusted contacts</li>
                <li>Basic deal analytics</li>
                <li>2 platforms connected</li>
                <li>Earn from ignored DMs</li>
              </ul>
              <button className="price-btn price-btn-ghost">
                Join as Creator
              </button>
            </div>
            <div className="price-card featured">
              <div className="featured-badge">Most Popular</div>
              <div className="price-tier">Sponsor</div>
              <div className="price-amount">$25</div>
              <div className="price-period">
                per outreach · refundable on reply
              </div>
              <ul className="price-features">
                <li>Reach any verified creator</li>
                <li>Full deposit refund on reply</li>
                <li>Verified sponsor badge</li>
                <li>Priority inbox placement</li>
                <li>Campaign analytics</li>
              </ul>
              <button className="price-btn price-btn-solid">
                Start Outreach
              </button>
            </div>
            <div className="price-card">
              <div className="price-tier">Creator Pro</div>
              <div className="price-amount">$19</div>
              <div className="price-period">per month</div>
              <ul className="price-features">
                <li>Everything in Free</li>
                <li>Unlimited trusted contacts</li>
                <li>Advanced analytics</li>
                <li>All platforms connected</li>
                <li>Custom intake forms</li>
              </ul>
              <button className="price-btn price-btn-ghost">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* CTA */}
      <div className="cta-wrap reveal">
        <div className="cta-box">
          <h2 className="cta-title">
            Your next deal is in
            <br />
            the <em>wrong inbox.</em>
          </h2>
          <p className="cta-sub">
            Join 12,400+ creators. Free forever, no credit card needed.
          </p>
          <div className="email-row">
            <input
              className="email-input"
              type="email"
              placeholder="your@email.com"
            />
            <button className="email-btn">DashBoard</button>
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <footer>
        <a href="#" className="logo">
          <div className="logo-mark">✓</div>
          TrueInbox
        </a>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">For Sponsors</a>
          <a href="#">Blog</a>
          <a href="#">Twitter</a>
        </div>
        <div className="footer-copy">© 2025 TrueInbox. Built for creators.</div>
      </footer>
    </>
  )
}
