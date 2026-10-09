import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'arrow'
  | 'calendar'
  | 'check'
  | 'chat'
  | 'clock'
  | 'globe'
  | 'heart'
  | 'lightbulb'
  | 'list'
  | 'monitor'
  | 'phone'
  | 'pin'
  | 'shield'
  | 'user'
  | 'users'
  | 'bolt'

type IconProps = SVGProps<SVGSVGElement> & {
  name?: IconName
}

function IconBase({
  children,
  className,
  ...props
}: {
  children: ReactNode
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function LineIcon({
  name = 'check',
  className,
  ...props
}: IconProps) {
  switch (name) {
    case 'calendar':
      return (
        <IconBase className={className} {...props}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </IconBase>
      )

    case 'chat':
      return (
        <IconBase className={className} {...props}>
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.2A7.5 7.5 0 1 1 20 11.5Z" />
        </IconBase>
      )

    case 'clock':
      return (
        <IconBase className={className} {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </IconBase>
      )

    case 'globe':
      return (
        <IconBase className={className} {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.2-3.5-9S9.5 5.5 12 3Z" />
        </IconBase>
      )

    case 'heart':
      return (
        <IconBase className={className} {...props}>
          <path d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />
        </IconBase>
      )

    case 'lightbulb':
      return (
        <IconBase className={className} {...props}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M8.2 14.5A6 6 0 1 1 15.8 14.5c-.9.8-1.4 1.8-1.5 2.5h-4.6c-.1-.7-.6-1.7-1.5-2.5Z" />
        </IconBase>
      )

    case 'list':
      return (
        <IconBase className={className} {...props}>
          <line x1="8" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="8" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
        </IconBase>
      )

    case 'monitor':
      return (
        <IconBase className={className} {...props}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </IconBase>
      )

    case 'phone':
      return (
        <IconBase className={className} {...props}>
          <path d="M7 3.5h3l1.2 4-2 1.6a14.5 14.5 0 0 0 5.7 5.7l1.6-2 4 1.2v3c0 1.1-.9 2-2 2C11 19 5 13 5 5.5c0-1.1.9-2 2-2Z" />
        </IconBase>
      )

    case 'pin':
      return (
        <IconBase className={className} {...props}>
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.2" />
        </IconBase>
      )

    case 'shield':
      return (
        <IconBase className={className} {...props}>
          <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3Z" />
          <path d="M9 12l2 2 4-4" />
        </IconBase>
      )

    case 'user':
      return (
        <IconBase className={className} {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.7-3.3 3.2-5 7-5s6.3 1.7 7 5" />
        </IconBase>
      )

    case 'users':
      return (
        <IconBase className={className} {...props}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 20c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5" />
          <path d="M14 15.5c2.7-.3 5 .9 6 3.5" />
        </IconBase>
      )

    case 'bolt':
      return (
        <IconBase className={className} {...props}>
          <path d="M13.5 2L5 13h6l-.5 9L19 10h-6l.5-8Z" />
        </IconBase>
      )

    case 'arrow':
      return (
        <IconBase className={className} {...props}>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </IconBase>
      )

    case 'check':
    default:
      return (
        <IconBase className={className} {...props}>
          <path d="M5 12.5l4.2 4.2L19 7" />
        </IconBase>
      )
  }
}

export function ArrowIcon({
  left = false,
  className,
  ...props
}: {
  left?: boolean
  className?: string
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {left ? (
        <>
          <path d="M19 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </>
      )}
    </svg>
  )
}

export function VerifiedBadge({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Verified"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        opacity="0.15"
      />

      <path
        d="M12 3.5l2 1.1 2.3-.1 1.1 2 2 .9-.1 2.3 1.1 2-.1 2.3-2 .9-1.1 2-2.3-.1-2 1.1-2-1.1-2.3.1-1.1-2-2-.9.1-2.3-1.1-2 1.1-2-.1-2.3 2-.9 1.1-2 2.3.1L12 3.5Z"
        fill="currentColor"
      />

      <path
        d="M8.5 12.2l2.2 2.2 4.8-5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return 'ZT'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export function Avatar({
  name,
  photoUrl,
  className = '',
}: {
  name: string
  photoUrl?: string | null
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden bg-stone-200 ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-teal-50 text-teal-800">
          <span className="text-4xl font-semibold">
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  )
}
