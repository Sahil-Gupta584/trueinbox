export function SectionCard({ icon, title, subtitle, children, className }: { icon?: React.ReactNode, title?: string, subtitle?: string, children: React.ReactNode, className?: React.HTMLAttributes<HTMLDivElement>['className'] }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-5 border-b border-stone-100 flex items-start gap-3">
        <span className="text-base mt-0.5 opacity-70">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-stone-800 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  )
}