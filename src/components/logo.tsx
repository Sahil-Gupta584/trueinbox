interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 28, className = '' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className={`flex-shrink-0 rounded-full ${className}`}
      style={{ objectFit: 'contain' }}
    />
  )
}

export function LogoWithText({ size = 28, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span
        className=" font-bold text-foreground"
        style={{ fontSize: size * 0.6, lineHeight: 1 }}
      >
        TrueInbox
      </span>
    </div>
  )
}
