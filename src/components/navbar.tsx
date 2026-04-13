import React, { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from '../lib/auth-client'
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  ChevronDown,
  MessageSquareText,
} from 'lucide-react'
import { setTheme, isDark } from '../lib/theme'
import { Logo } from './logo'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Link, useLocation, useRouter } from '@tanstack/react-router'

const tabRoutes = [
  {
    value: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    value: 'inbox',
    href: '/inbox',
    label: 'Inbox',
    icon: MessageSquareText,
  },
  { value: 'creators', href: '/creators', label: 'Creators', icon: Users },
]

const navRoutes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', icon: MessageSquareText },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/me', label: 'My Profile', icon: User },
]

function getActiveTab(location: string): string {
  if (location.startsWith('/inbox')) return 'inbox'
  if (location.startsWith('/creators')) return 'creators'
  if (location === '/dashboard' || location.startsWith('/dashboard'))
    return 'dashboard'
  return ''
}

function Avatar({
  name,
  image,
  size = 32,
}: {
  name: string | null
  image: string | null
  size?: number
}) {
  const sz = `${size}px`
  if (image)
    return (
      <img
        src={image}
        style={{ width: sz, height: sz }}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover flex-shrink-0 ring-2 ring-border"
        alt=""
      />
    )
  return (
    <div
      style={{ width: sz, height: sz }}
      className="rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0"
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

function UserDropdown() {
  const { data: session, error } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const router = useRouter()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(isDark())
    const observer = new MutationObserver(() => setDark(isDark()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    setTheme(next)
    setDark(!dark)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    window.location.href = '/'
  }

  const user = session?.user

  if (!user) {
    return <span></span>
  }

  const displayName = user.name || user.email.split('@')[0] || 'Account'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
          open ? 'bg-accent/10' : 'hover:bg-muted'
        }`}
      >
        <Avatar name={user.name} image={user.image ?? null} size={30} />
        <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-up"
          style={{ animationDuration: '0.15s' }}
        >
          {/* Profile header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-muted/30">
            <Avatar name={user.name} image={user.image ?? null} size={40} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.name || 'No name set'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Routes */}
          <div className="p-1.5">
            {navRoutes.map((route) => {
              const isActive =
                location.pathname === route.href ||
                (route.href !== '/dashboard' &&
                  location.pathname.startsWith(route.href))
              return (
                <Link key={route.href} to={route.href}>
                  <button
                    onClick={() => setOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <route.icon
                      className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                    {route.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                </Link>
              )
            })}
          </div>

          {/* Theme toggle + Sign out */}
          <div className="p-1.5 border-t border-border space-y-0.5">
            {/* <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-3">
                {dark ? (
                  <Sun className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 flex-shrink-0" />
                )}
                {dark ? 'Light mode' : 'Dark mode'}
              </span>
              <div
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${dark ? 'bg-primary' : 'bg-border'}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </div>
            </button> */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const location = useLocation()
  const router = useRouter()
  const activeTab = getActiveTab(location.pathname)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 sm:px-6 shadow-sm bg-background">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto gap-4">
        {/* Left — brand */}
        <Link to="/dashboard">
          <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0">
            <Logo size={26} />
            <span className=" font-bold text-foreground text-base hidden sm:block group-hover:text-primary transition-colors">
              TrueInbox
            </span>
          </div>
        </Link>

        {/* Center — nav items */}
        <div className="flex items-center gap-1">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              const route = tabRoutes.find((r) => r.value === v)
              if (route) router.navigate({ to: route.href })
            }}
          >
            <TabsList variant="line">
              {tabRoutes.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <tab.icon /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Right — user dropdown */}
        <UserDropdown />
      </div>
    </nav>
  )
}
