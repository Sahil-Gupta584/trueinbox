import React, { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '../../lib/auth-client'
import { api } from '../../lib/api'
import {
  Twitter,
  Instagram,
  Youtube,
  Loader2,
  Building2,
  Wallet,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
  Smartphone,
} from 'lucide-react'
import type { AddPayoutMethodRequest } from '../../lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxValue,
} from '../../components/ui/combobox'
import { Field, FieldLabel } from '../../components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../../components/ui/input-group'
import { Input } from '#/components/ui/input'
import { SectionCard } from '#/components/SectionCard'

export const Route = createFileRoute('/_protected/me')({
  component: ProfileSettings,
})

const niches = [
  'travel',
  'lifestyle',
  'tech-gadgets',
  'beauty-skincare',
  'fitness-health',
  'food-cooking',
  'finance',
  'gaming',
  'music',
  'art-design',
  'comedy',
  'education',
  'fashion',
  'parenting',
  'sports',
  'photography',
  'business',
  'other',
]

const nichesDisplay = [
  'Travel',
  'Lifestyle',
  'Tech & Gadgets',
  'Beauty & Skincare',
  'Fitness & Health',
  'Food & Cooking',
  'Finance',
  'Gaming',
  'Music',
  'Art & Design',
  'Comedy',
  'Education',
  'Fashion',
  'Parenting',
  'Sports',
  'Photography',
  'Business',
  'Other',
]

const nicheMap: Record<string, string> = {}
niches.forEach((n, i) => {
  nicheMap[n] = nichesDisplay[i]
})

type Platform = {
  key: 'socialTwitter' | 'socialInstagram' | 'socialYoutube'
  audienceKey:
    | 'socialTwitterAudience'
    | 'socialInstagramAudience'
    | 'socialYoutubeAudience'
  label: string
  icon: any
  placeholder: string
}

const platforms: Platform[] = [
  {
    key: 'socialTwitter',
    audienceKey: 'socialTwitterAudience',
    label: 'Twitter / X',
    icon: Twitter,
    placeholder: '@username',
  },
  {
    key: 'socialInstagram',
    audienceKey: 'socialInstagramAudience',
    label: 'Instagram',
    icon: Instagram,
    placeholder: '@username',
  },
  {
    key: 'socialYoutube',
    audienceKey: 'socialYoutubeAudience',
    label: 'YouTube',
    icon: Youtube,
    placeholder: '@channel',
  },
]

function Label({ children, hint }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {children}
      </label>
      {hint && <span className="text-xs text-stone-400">{hint}</span>}
    </div>
  )
}

// function Input({ icon, prefix, ...props }) {
//   return (
//     <div className="relative flex items-center">
//       {(icon || prefix) && (
//         <span className="absolute left-3.5 text-stone-400 text-sm select-none pointer-events-none">
//           {icon || prefix}
//         </span>
//       )}
//       <input
//         className={`w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400
//           focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600
//           transition-all duration-150 py-3
//           ${icon || prefix ? 'pl-9 pr-4' : 'px-4'}`}
//         {...props}
//       />
//     </div>
//   )
// }

function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400
        focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600
        transition-all duration-150 px-4 py-3 resize-none leading-relaxed"
      {...props}
    />
  )
}

function PriceInput({ value, onChange, highlighted, label, description }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-150 ${
        highlighted
          ? 'border-emerald-300 bg-emerald-50/60'
          : 'border-stone-200 bg-stone-50/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${highlighted ? 'text-emerald-700' : 'text-stone-500'}`}
          >
            {label}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
            {description}
          </p>
        </div>
        {highlighted && (
          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ml-3">
            Recommended
          </span>
        )}
      </div>
      <div className="relative flex items-center w-28">
        <span className="absolute left-3.5 text-stone-500 text-sm font-medium">
          $
        </span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={onChange}
          className={`w-full pl-7 pr-3 py-2.5 rounded-lg text-sm font-semibold border
            focus:outline-none focus:ring-2 transition-all duration-150
            ${
              highlighted
                ? 'bg-white border-emerald-300 text-emerald-800 focus:ring-emerald-600/20 focus:border-emerald-600'
                : 'bg-white border-stone-200 text-stone-800 focus:ring-emerald-600/20 focus:border-emerald-600'
            }`}
        />
      </div>
    </div>
  )
}

type FormState = {
  username: string
  bio: string
  niche: string[]
  country: string
  dmPrice: string
  guaranteedReplyPrice: string
  socialTwitter: string
  socialTwitterAudience: string
  socialInstagram: string
  socialInstagramAudience: string
  socialYoutube: string
  socialYoutubeAudience: string
}

function ProfileSettings() {
  Route.useRouteContext
  const { data: session } = useSession()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageInput, setImageInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formInitialized, setFormInitialized] = useState(false)

  const [form, setForm] = useState<FormState>({
    username: '',
    bio: '',
    niche: [] as string[],
    country: '',
    dmPrice: '0',
    guaranteedReplyPrice: '0',
    socialTwitter: '',
    socialTwitterAudience: '',
    socialInstagram: '',
    socialInstagramAudience: '',
    socialYoutube: '',
    socialYoutubeAudience: '',
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [countrySearch, setCountrySearch] = useState('')
  const [countryResults, setCountryResults] = useState<any[]>([])
  const [countryLoading, setCountryLoading] = useState(false)
  const [countryCode, setCountryCode] = useState('')

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me(),
  })

  const { data: paymentSettings, isLoading: paymentSettingsLoading } = useQuery(
    {
      queryKey: ['paymentSettings'],
      queryFn: () => api.getPaymentSettings(),
    },
  )

  // Balance & Payout Methods queries
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.getBalance(),
  })

  const { data: payoutMethods, isLoading: payoutMethodsLoading } = useQuery({
    queryKey: ['payoutMethods'],
    queryFn: () => api.getPayoutMethods(),
  })

  const queryClient = useQueryClient()

  const updateImageMutation = useMutation({
    mutationFn: (image: string) => api.updateMe({ image }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setImageModalOpen(false)
      setImageInput('')
    },
  })

  // Payout method state
  const [showAddPayoutMethod, setShowAddPayoutMethod] = useState(false)
  const [payoutMethodType, setPayoutMethodType] = useState<
    'bank_us' | 'bank_eu' | 'bank_india' | 'paypal' | 'upi' | null
  >(null)
  const [payoutForm, setPayoutForm] = useState<AddPayoutMethodRequest>({
    methodType: 'bank_us',
  })
  const [payoutFormError, setPayoutFormError] = useState<string | null>(null)

  // Payout method mutations
  const addPayoutMethodMutation = useMutation({
    mutationFn: (data: AddPayoutMethodRequest) => api.addPayoutMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutMethods'] })
      setShowAddPayoutMethod(false)
      setPayoutMethodType(null)
      setPayoutForm({ methodType: 'bank_us' })
      setPayoutFormError(null)
    },
    onError: (err: Error) => {
      setPayoutFormError(err.message)
    },
  })

  const deletePayoutMethodMutation = useMutation({
    mutationFn: (id: string) => api.deletePayoutMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutMethods'] })
    },
  })

  // Initialize form when user data loads
  useEffect(() => {
    if (user && !formInitialized) {
      setForm({
        username: user.username || '',
        bio: user.bio || '',
        niche: user.niche ? user.niche.split(',').filter(Boolean) : [],
        country: user.country || '',
        dmPrice: user.dmPrice ? String(user.dmPrice) : '0',
        guaranteedReplyPrice: user.guaranteedReplyPrice
          ? String(user.guaranteedReplyPrice)
          : '0',
        socialTwitter: user.socialTwitter || '',
        socialTwitterAudience: user.socialTwitterAudience || '',
        socialInstagram: user.socialInstagram || '',
        socialInstagramAudience: user.socialInstagramAudience || '',
        socialYoutube: user.socialYoutube || '',
        socialYoutubeAudience: user.socialYoutubeAudience || '',
      })
      setProfileImage(user.image || null)
      if (user.country) {
        setCountryCode(user.country)
      }
      setFormInitialized(true)
    }
  }, [user, formInitialized])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (countrySearch.trim().length < 2) {
        setCountryResults([])
        return
      }
      setCountryLoading(true)
      try {
        const res = await fetch(
          `https://restcountries.com/v3.1/name/${countrySearch}`,
        )
        const data = await res.json()
        setCountryResults(Array.isArray(data) ? data.slice(0, 8) : [])
      } catch {
        setCountryResults([])
      } finally {
        setCountryLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [countrySearch])

  const set =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const setSocial =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value.replace(/@/g, '') }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateMe({
        ...form,
        niche: form.niche.join(','),
        dmPrice: form.dmPrice ? parseFloat(form.dmPrice) : 0,
        guaranteedReplyPrice: form.guaranteedReplyPrice
          ? parseFloat(form.guaranteedReplyPrice)
          : 0,
        image: profileImage,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleImageSubmit = () => {
    if (imageInput.trim()) {
      setProfileImage(imageInput.trim())
      updateImageMutation.mutate(imageInput.trim())
    }
  }

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const reader = new FileReader()
            const dataUrl = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(blob)
            })
            setImageInput(dataUrl)
            return
          }
        }
      }
      const text = await navigator.clipboard.readText()
      setImageInput(text)
    } catch {
      const text = await navigator.clipboard.readText()
      setImageInput(text)
    }
  }

  const charCount = form.bio.length
  const bioMax = 200

  if (isLoading) {
    return (
      <div className="pt-14 flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const avatarLetter = session?.user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <div>
      {/* Page */}
      <div className="space-y-4">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-md text-stone-900 tracking-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            My Profile
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {session?.user?.name && <>{session.user.name} · </>}
            {session?.user?.email}
          </p>
        </div>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-5 flex items-center gap-5">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-4 ring-stone-100"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 ring-4 ring-stone-100"
              style={{ background: '#2d6a4f' }}
            >
              {avatarLetter}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-stone-800 mb-1">
              Profile photo
            </p>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Shown to sponsors and fans who message you.
            </p>
            <button
              onClick={() => setImageModalOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg transition-colors border border-stone-200"
            >
              <span className="text-sm">📷</span>{' '}
              {profileImage ? 'Change Photo' : 'Add Photo'}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <SectionCard
          icon="◉"
          title="Basic Info"
          subtitle="This is what sponsors and fans see on your public profile."
        >
          <div>
            <Label>Username</Label>
            <Input
              icon="@"
              value={form.username}
              onChange={set('username')}
              placeholder="yourhandle"
            />
            <p className="text-xs text-stone-400 mt-1.5">
              trueinbox.com/
              <span className="text-emerald-700 font-medium">
                {form.username || 'yourhandle'}
              </span>
            </p>
          </div>

          <div>
            <Label hint={`${charCount}/${bioMax}`}>Bio</Label>
            <Textarea
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              maxLength={bioMax}
              placeholder="Tell people who you are and what you create..."
            />
          </div>

          <div>
            <Label>Niche</Label>
            <Combobox
              multiple
              items={niches}
              itemToStringValue={(n) => nicheMap[n] || n}
              value={form.niche}
              onValueChange={(v) => setForm((f) => ({ ...f, niche: v }))}
            >
              <ComboboxChips className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 min-h-[42px]">
                <ComboboxValue>
                  {form.niche.map((n) => (
                    <ComboboxChip key={n}>{nicheMap[n]}</ComboboxChip>
                  ))}
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Add niches..." />
              </ComboboxChips>
              <ComboboxContent>
                <ComboboxList>
                  {(n) => (
                    <ComboboxItem key={n} value={n}>
                      {nicheMap[n]}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div>
            <Label>Country</Label>
            <Combobox
              value={form.country}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, country: v || '' }))
                setCountryCode(v || '')
              }}
            >
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  {countryLoading ? (
                    <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                  ) : countryCode ? (
                    <img
                      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode.toUpperCase()}.svg`}
                      alt=""
                      className="w-5 h-auto rounded-sm"
                    />
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
                <ComboboxInput
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
              <ComboboxContent>
                <ComboboxList>
                  {countryResults.map((c: any) => (
                    <ComboboxItem
                      key={c.cca3}
                      value={c.cca2?.toLowerCase() || ''}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${c.cca2}.svg`}
                          alt=""
                          className="w-5 h-auto rounded-sm"
                        />
                        {c.name.common}
                      </div>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </SectionCard>

        {/* DM Pricing */}
        <SectionCard
          icon="💳"
          title="DM Pricing"
          subtitle="Set prices so fans/sponsors pay to reach you. You keep it all — reply to refund if you want to continue the conversation."
        >
          <PriceInput
            label="DM Price"
            description="Anyone pays this fee to land in your inbox. You keep it and reply — or ignore and keep it too. (Example: $9)"
            value={form.dmPrice}
            onChange={set('dmPrice')}
            highlighted={false}
          />

          <PriceInput
            label="Guaranteed Reply"
            description="People who need a real, thoughtful response pay this. You commit to replying meaningfully. Great for sponsor consultations. (Example: $29)"
            value={form.guaranteedReplyPrice}
            onChange={set('guaranteedReplyPrice')}
            highlighted={true}
          />
        </SectionCard>

        {/* Social Links */}
        <SectionCard
          icon="🔗"
          title="Social Links"
          subtitle="Connect your platforms so sponsors can see your full reach."
        >
          {platforms.map((p) => (
            <div key={p.key} className="flex gap-4">
              <Field>
                <FieldLabel>{p.label}</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <p.icon className="text-stone-400 size-3.5" />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={form[p.key]}
                    onChange={setSocial(p.key)}
                    placeholder={p.placeholder}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel>followers more than</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    min="0"
                    step="1"
                    value={form[p.audienceKey]}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow whole numbers
                      if (value === '' || /^\d+$/.test(value)) {
                        set(p.audienceKey)(e)
                      }
                    }}
                    placeholder="0"
                  />
                </InputGroup>
              </Field>
            </div>
          ))}
        </SectionCard>

        {/* Balance */}
        {/* <SectionCard
          icon="💰"
          title="Your Balance"
          subtitle="Track your earnings from paid DMs."
        >
          {balanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            </div>
          ) : balanceData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Available
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-800">
                    ${(balanceData.balance.available / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Ready to withdraw
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-800">
                    ${(balanceData.balance.pending / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    In escrow (Guaranteed Reply)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>
                  Total earned:{' '}
                  <strong className="text-stone-700">
                    ${(balanceData.balance.totalEarned / 100).toFixed(2)}
                  </strong>
                </span>
                <span>
                  Total withdrawn:{' '}
                  <strong className="text-stone-700">
                    ${(balanceData.balance.totalWithdrawn / 100).toFixed(2)}
                  </strong>
                </span>
              </div>

              {!payoutMethods?.length && (
                <p className="text-xs text-amber-600 text-center">
                  Add a payout method below to receive monthly payouts
                </p>
              )}

              {balanceData.transactions.length > 0 && (
                <div className="border-t border-stone-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    Recent Activity
                  </p>
                  <div className="space-y-2">
                    {balanceData.transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              tx.type === 'earning' || tx.type === 'release'
                                ? 'bg-emerald-100 text-emerald-600'
                                : tx.type === 'withdrawal'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {tx.type === 'earning' || tx.type === 'release' ? (
                              <Plus className="w-3 h-3" />
                            ) : tx.type === 'withdrawal' ? (
                              <ArrowRight className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                          </div>
                          <div>
                            <p className="text-stone-700 text-xs font-medium">
                              {tx.type === 'earning'
                                ? 'Payment received'
                                : tx.type === 'release'
                                  ? 'Escrow released'
                                  : tx.type === 'withdrawal'
                                    ? 'Withdrawal'
                                    : tx.type === 'refund'
                                      ? 'Refund'
                                      : 'Adjustment'}
                            </p>
                            <p className="text-stone-400 text-[10px]">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-semibold text-xs ${
                            tx.type === 'earning' || tx.type === 'release'
                              ? 'text-emerald-600'
                              : tx.type === 'withdrawal'
                                ? 'text-blue-600'
                                : 'text-red-600'
                          }`}
                        >
                          {tx.type === 'earning' || tx.type === 'release'
                            ? '+'
                            : '-'}
                          ${(Math.abs(tx.amount) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-500">Unable to load balance</p>
          )}
        </SectionCard> */}

        {/*<SectionCard
          icon="🏦"
          title="Payout Methods"
          subtitle="Add a bank account, UPI, or PayPal to receive withdrawals."
        >
          <div className="space-y-4">
            {payoutMethodsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
              </div>
            ) : payoutMethods && payoutMethods.length > 0 ? (
              <div className="space-y-3">
                {payoutMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`rounded-xl border p-4 ${
                      method.isPrimary
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-stone-200 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            method.methodType === 'paypal'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                              : method.methodType === 'upi'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-gradient-to-br from-stone-600 to-stone-700'
                          }`}
                        >
                          {method.methodType === 'paypal' ? (
                            <Wallet className="w-5 h-5 text-white" />
                          ) : method.methodType === 'upi' ? (
                            <Smartphone className="w-5 h-5 text-white" />
                          ) : (
                            <Building2 className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-stone-800">
                              {method.methodType === 'bank_us'
                                ? 'US Bank Account'
                                : method.methodType === 'bank_eu'
                                  ? 'EU Bank Account (IBAN)'
                                  : method.methodType === 'bank_india'
                                    ? 'Indian Bank Account'
                                    : method.methodType === 'paypal'
                                      ? 'PayPal'
                                      : 'UPI'}
                            </p>
                            {method.isPrimary && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {method.methodType === 'paypal'
                              ? method.paypalEmail
                              : method.methodType === 'upi'
                                ? method.upiId
                                : method.methodType === 'bank_eu'
                                  ? `IBAN: ****${method.bankIban?.slice(-4) || ''}`
                                  : `****${method.bankAccountNumber?.slice(-4) || ''}`}
                            {method.bankName && ` - ${method.bankName}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          deletePayoutMethodMutation.mutate(method.id)
                        }
                        disabled={deletePayoutMethodMutation.isPending}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!showAddPayoutMethod ? (
              <button
                onClick={() => setShowAddPayoutMethod(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-emerald-400 text-stone-500 hover:text-emerald-600 font-medium text-sm py-3 px-4 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Payout Method
              </button>
            ) : (
              <div className="border border-stone-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-700">
                    Add Payout Method
                  </p>
                  <button
                    onClick={() => {
                      setShowAddPayoutMethod(false)
                      setPayoutMethodType(null)
                      setPayoutForm({ methodType: 'bank_us' })
                      setPayoutFormError(null)
                    }}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Cancel
                  </button>
                </div>

                {!payoutMethodType ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        type: 'bank_us' as const,
                        label: 'US Bank',
                        icon: Building2,
                      },
                      {
                        type: 'bank_eu' as const,
                        label: 'EU Bank (IBAN)',
                        icon: Building2,
                      },
                      {
                        type: 'bank_india' as const,
                        label: 'Indian Bank',
                        icon: Building2,
                      },
                      {
                        type: 'upi' as const,
                        label: 'UPI',
                        icon: Smartphone,
                      },
                      {
                        type: 'paypal' as const,
                        label: 'PayPal',
                        icon: Wallet,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => {
                          setPayoutMethodType(opt.type)
                          setPayoutForm({
                            methodType: opt.type,
                            isPrimary: !payoutMethods?.length,
                          })
                        }}
                        className="flex items-center gap-2 p-3 rounded-lg border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-sm text-stone-700"
                      >
                        <opt.icon className="w-4 h-4 text-stone-500" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payoutMethodType === 'bank_us' && (
                      <>
                        <Field>
                          <FieldLabel>Account Holder Name</FieldLabel>
                          <Input
                            value={payoutForm.accountHolderName || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                accountHolderName: e.target.value,
                              })
                            }
                            placeholder="John Doe"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Bank Name</FieldLabel>
                          <Input
                            value={payoutForm.bankName || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankName: e.target.value,
                              })
                            }
                            placeholder="Chase, Bank of America, etc."
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Routing Number</FieldLabel>
                          <Input
                            value={payoutForm.bankRoutingNumber || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankRoutingNumber: e.target.value,
                              })
                            }
                            placeholder="9 digits"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Account Number</FieldLabel>
                          <Input
                            value={payoutForm.bankAccountNumber || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankAccountNumber: e.target.value,
                              })
                            }
                            placeholder="Account number"
                          />
                        </Field>
                      </>
                    )}

                    {payoutMethodType === 'bank_eu' && (
                      <>
                        <Field>
                          <FieldLabel>Account Holder Name</FieldLabel>
                          <Input
                            value={payoutForm.accountHolderName || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                accountHolderName: e.target.value,
                              })
                            }
                            placeholder="John Doe"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Bank Name</FieldLabel>
                          <Input
                            value={payoutForm.bankName || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankName: e.target.value,
                              })
                            }
                            placeholder="Bank name"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>IBAN</FieldLabel>
                          <Input
                            value={payoutForm.bankIban || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankIban: e.target.value,
                              })
                            }
                            placeholder="DE89 3704 0044 0532 0130 00"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>SWIFT/BIC (Optional)</FieldLabel>
                          <Input
                            value={payoutForm.bankSwift || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankSwift: e.target.value,
                              })
                            }
                            placeholder="COBADEFFXXX"
                          />
                        </Field>
                      </>
                    )}

                    {payoutMethodType === 'bank_india' && (
                      <>
                        <Field>
                          <FieldLabel>Account Holder Name</FieldLabel>
                          <Input
                            value={payoutForm.accountHolderName || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                accountHolderName: e.target.value,
                              })
                            }
                            placeholder="As per bank records"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Bank Name</FieldLabel>
                          <Input
                            value={payoutForm.bankName || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankName: e.target.value,
                              })
                            }
                            placeholder="HDFC, ICICI, SBI, etc."
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Account Number</FieldLabel>
                          <Input
                            value={payoutForm.bankAccountNumber || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankAccountNumber: e.target.value,
                              })
                            }
                            placeholder="Account number"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>IFSC Code</FieldLabel>
                          <Input
                            value={payoutForm.bankIfsc || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                bankIfsc: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="HDFC0001234"
                          />
                        </Field>
                      </>
                    )}

                    {payoutMethodType === 'upi' && (
                      <>
                        <Field>
                          <FieldLabel>UPI ID</FieldLabel>
                          <Input
                            value={payoutForm.upiId || ''}
                            onChange={(e) =>
                              setPayoutForm({
                                ...payoutForm,
                                upiId: e.target.value,
                              })
                            }
                            placeholder="name@upi or 1234567890@upi"
                          />
                        </Field>
                        <p className="text-xs text-emerald-600">
                          UPI payouts have zero fees!
                        </p>
                      </>
                    )}

                    {payoutMethodType === 'paypal' && (
                      <Field>
                        <FieldLabel>PayPal Email</FieldLabel>
                        <Input
                          type="email"
                          value={payoutForm.paypalEmail || ''}
                          onChange={(e) =>
                            setPayoutForm({
                              ...payoutForm,
                              paypalEmail: e.target.value,
                            })
                          }
                          placeholder="your@email.com"
                        />
                      </Field>
                    )}

                    {payoutFormError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {payoutFormError}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setPayoutMethodType(null)
                          setPayoutForm({ methodType: 'bank_us' })
                        }}
                        className="flex-1 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 py-2 px-4 rounded-lg transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() =>
                          addPayoutMethodMutation.mutate(payoutForm)
                        }
                        disabled={addPayoutMethodMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 py-2 px-4 rounded-lg transition-colors"
                      >
                        {addPayoutMethodMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!payoutMethods?.length && !showAddPayoutMethod && (
              <p className="text-xs text-stone-400 leading-relaxed">
                Add a payout method to receive your earnings. We support bank
                transfers (US, EU, India), UPI, and PayPal.
              </p>
            )}
          </div>
        </SectionCard> *\}

        {/* Danger zone */}
        <details className="group">
          <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600 transition-colors list-none flex items-center gap-1.5 py-1">
            <span className="transition-transform group-open:rotate-90 inline-block">
              ▶
            </span>
            Danger zone
          </summary>
          <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-red-700 mb-1">
              Delete account
            </p>
            <p className="text-xs text-red-500 mb-4 leading-relaxed">
              Permanently delete your TrueInbox profile and all associated data.
              This cannot be undone.
            </p>
            <button className="text-xs font-semibold text-red-600 border border-red-300 bg-white hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              Delete my account
            </button>
          </div>
        </details>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-stone-200 px-4 py-4">
        <div className="max-w-xl mx-auto  items-center gap-3">
          <div className="flex-1">
            {saved && (
              <p className="text-xs flex justify-center text-emerald-700 font-medium  items-center gap-1.5 animate-pulse">
                <span>✓</span> Profile saved successfully!
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full justify-center
              ${
                saving
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : saved
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-stone-900 hover:bg-emerald-700 text-white shadow-lg shadow-stone-900/15 hover:shadow-emerald-700/25 hover:-translate-y-0.5'
              }`}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="40 60"
                  />
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>✓ Saved!</>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
            <DialogDescription>
              Paste an image URL or click the button below to paste from
              clipboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && imageInput.trim()) {
                  handleImageSubmit()
                }
              }}
              placeholder="Paste image URL here..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <p className="text-xs text-stone-400 leading-relaxed">
              Tip: Right-click your profile picture on Twitter, Instagram, or
              LinkedIn and select "Copy image address" to get the URL.
            </p>
            {imageInput && (
              <div className="flex justify-center">
                <img
                  src={imageInput}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-stone-200"
                  onError={() => setImageInput('')}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handlePasteImage}
              disabled={updateImageMutation.isPending}
            >
              Paste from Clipboard
            </Button>
            <Button
              onClick={handleImageSubmit}
              isLoading={updateImageMutation.isPending}
            >
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
