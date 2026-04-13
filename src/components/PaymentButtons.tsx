import { MessageSquare, Sparkles, BadgeCheck } from 'lucide-react'

export type DMType = 'paywall' | 'guaranteed'

export interface PaymentButtonsProps {
  dmPrice?: number | null
  guaranteedReplyPrice?: number | null
  onPaywall?: () => void
  onGuaranteed?: () => void
  layout?: 'vertical' | 'horizontal'
  showFreeOption?: boolean
  className?: string
}

export function PaymentButtons({
  dmPrice,
  guaranteedReplyPrice,
  onPaywall,
  onGuaranteed,
  layout = 'vertical',
  showFreeOption = true,
  className = '',
}: PaymentButtonsProps) {
  const hasPaywall = (dmPrice ?? 0) > 0
  const hasGuaranteed = (guaranteedReplyPrice ?? 0) > 0

  const containerClass =
    layout === 'horizontal' ? 'flex gap-2.5' : 'space-y-2.5'

  return (
    <div className={`${containerClass} ${className}`}>
      {/* DM Button */}
      {hasPaywall && (
        <button
          onClick={onPaywall}
          className={`flex items-center justify-between px-4 py-3 bg-emerald-100 border border-emerald-400 hover:bg-emerald-200 rounded-xl transition text-left ${layout === 'horizontal' ? 'flex-1' : 'w-full'}`}
        >
          <span className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-medium text-emerald-900">
              Send DM
            </span>
          </span>
          <span className="text-sm font-semibold text-emerald-800">
            ${dmPrice}
          </span>
        </button>
      )}

      {/* Guaranteed Reply Button - Premium styling */}
      {hasGuaranteed && (
        <button
          onClick={onGuaranteed}
          className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.99] transition-all text-left shadow-lg shadow-emerald-600/20 ${layout === 'horizontal' ? 'flex-1' : 'w-full'}`}
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
          <span className="text-base font-medium">${guaranteedReplyPrice}</span>
        </button>
      )}

      {/* Free DM fallback */}
      {showFreeOption && !hasPaywall && !hasGuaranteed && (
        <button
          onClick={onPaywall}
          className={`flex items-center justify-center gap-2 py-3 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:border-stone-300 hover:bg-stone-50 transition-all ${layout === 'horizontal' ? 'flex-1' : 'w-full'}`}
        >
          <MessageSquare className="w-4 h-4" /> Send free DM
        </button>
      )}
    </div>
  )
}

// Compact version for chat page (horizontal layout)
export function PaymentButtonsCompact({
  dmPrice,
  guaranteedReplyPrice,
  onPaywall,
  onGuaranteed,
}: Omit<PaymentButtonsProps, 'layout' | 'showFreeOption'>) {
  const hasPaywall = (dmPrice ?? 0) > 0
  const hasGuaranteed = (guaranteedReplyPrice ?? 0) > 0

  return (
    <div className="flex gap-3 p-4 bg-stone-50 border-t border-stone-200">
      {hasPaywall && (
        <button
          onClick={onPaywall}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition text-sm font-medium text-stone-700"
        >
          <MessageSquare className="w-4 h-4" />
          Send DM · ${dmPrice}
        </button>
      )}

      {hasGuaranteed && (
        <button
          onClick={onGuaranteed}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all text-sm font-semibold shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Guaranteed · ${guaranteedReplyPrice}
        </button>
      )}
    </div>
  )
}
