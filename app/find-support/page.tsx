'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { Lora } from 'next/font/google'

const serif = Lora({ subsets: ['latin'] })

type Step =
  | 'intro'
  | 'logistics'
  | 'care'
  | 'county'
  | 'availability'
  | 'timing'
  | 'styleIntro'
  | 'styleRate'
  | 'almostThere'
  | 'focusIntro'
  | 'focus'
  | 'identityIntro'
  | 'genderPref'
  | 'agePref'
  | 'prioritiesIntro'
  | 'priorities'

type Accent = 'teal' | 'lime' | 'slate' | 'coral' | 'amber'

type IconName =
  | 'bolt'
  | 'calendar'
  | 'help'
  | 'user'
  | 'users'
  | 'sprout'
  | 'sun'
  | 'tree'
  | 'clock'

type Option = {
  value: string
  label: string
  icon?: IconName
}

type StyleScores = {
  action: number
  relational: number
  creative: number
}

type HairStyle = 'short' | 'long' | 'bun' | 'curly'

const MAX_FOCUS_AREAS = 5

const animationCss = `
  .zt-enter {
    animation: ztEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }

  .zt-leave {
    animation: ztLeave 450ms ease-in both;
  }

  .zt-pop {
    animation: ztPop 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .zt-disc {
    border-radius: 9999px;
    box-shadow: 8px 12px 24px rgba(35, 45, 52, 0.14),
      -3px -3px 10px rgba(255, 255, 255, 0.9);
    transition: transform 300ms ease, box-shadow 300ms ease;
  }

  .zt-disc:hover {
    transform: translateY(-2px);
    box-shadow: 10px 16px 28px rgba(35, 45, 52, 0.18),
      -3px -3px 10px rgba(255, 255, 255, 0.9);
  }

  .zt-lift {
    box-shadow: 8px 14px 26px rgba(11, 127, 139, 0.35);
  }

  .zt-card-shadow {
    box-shadow: 14px 20px 40px rgba(35, 45, 52, 0.22);
  }

  @keyframes ztEnter {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ztLeave {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-8px);
    }
  }

  @keyframes ztPop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    70% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zt-enter,
    .zt-leave,
    .zt-pop {
      animation: none;
    }
  }
`

const accentClasses: Record<Accent, { card: string; text: string }> = {
  teal: { card: 'bg-teal-700', text: 'text-teal-700' },
  lime: { card: 'bg-lime-700', text: 'text-lime-700' },
  slate: { card: 'bg-stone-700', text: 'text-stone-700' },
  coral: { card: 'bg-coral-700', text: 'text-coral-700' },
  amber: { card: 'bg-amber-700', text: 'text-amber-700' },
}

const hillA = 'M0 620 Q200 520 400 600 T800 560 L800 1000 L0 1000 Z'
const hillB = 'M0 710 Q250 630 450 700 T800 660 L800 1000 L0 1000 Z'
const hillC = 'M0 800 Q220 740 420 790 T800 760 L800 1000 L0 1000 Z'
const hillD = 'M0 890 Q260 850 460 880 T800 860 L800 1000 L0 1000 Z'
const lakeBase = 'M0 680 L800 680 L800 1000 L0 1000 Z'
const waveC = 'M0 850 Q100 810 200 850 T400 850 T600 850 T800 850 L800 1000 L0 1000 Z'
const waveD = 'M0 930 Q100 890 200 930 T400 930 T600 930 T800 930 L800 1000 L0 1000 Z'
const peaks = 'M0 700 L180 470 L330 660 L480 420 L660 690 L800 520 L800 1000 L0 1000 Z'

const scenes: Record<
  Accent,
  {
    skyTop: string
    skyBottom: string
    sun?: { cx: number; cy: number; r: number; fill: string }
    layers: { d: string; fill: string; opacity?: number }[]
  }
> = {
  teal: {
    skyTop: '#e8f8fa',
    skyBottom: '#c9eef2',
    sun: { cx: 560, cy: 470, r: 95, fill: '#fff3d6' },
    layers: [
      { d: hillA, fill: '#9adfe6' },
      { d: hillB, fill: '#61ccd7' },
      { d: hillC, fill: '#1ab5c4' },
      { d: hillD, fill: '#0b7f8b' },
    ],
  },
  lime: {
    skyTop: '#f3f9e8',
    skyBottom: '#e2f1c6',
    sun: { cx: 300, cy: 430, r: 80, fill: '#fff7d6' },
    layers: [
      { d: hillA, fill: '#c5e48c' },
      { d: hillB, fill: '#a4d35f' },
      { d: hillC, fill: '#8bc53f' },
      { d: hillD, fill: '#568022' },
    ],
  },
  slate: {
    skyTop: '#eceff1',
    skyBottom: '#dde3e6',
    sun: { cx: 300, cy: 400, r: 70, fill: '#f6f8f9' },
    layers: [
      { d: peaks, fill: '#9aa8af' },
      { d: hillB, fill: '#7a8b92' },
      { d: hillC, fill: '#5f6f76' },
      { d: hillD, fill: '#33414a' },
    ],
  },
  coral: {
    skyTop: '#ffdad8',
    skyBottom: '#fff0ef',
    sun: { cx: 400, cy: 600, r: 160, fill: '#ffe9c2' },
    layers: [
      { d: hillA, fill: '#f4817f' },
      { d: lakeBase, fill: '#ef6461' },
      { d: waveC, fill: '#d94a47', opacity: 0.7 },
      { d: waveD, fill: '#b53836', opacity: 0.8 },
    ],
  },
  amber: {
    skyTop: '#ffe9c2',
    skyBottom: '#fff6e5',
    sun: { cx: 520, cy: 440, r: 90, fill: '#fffaf0' },
    layers: [
      { d: hillA, fill: '#fed48a' },
      { d: hillB, fill: '#fbbd54' },
      { d: hillC, fill: '#f5a524' },
      { d: hillD, fill: '#b06b10' },
    ],
  },
}

const iconPaths: Record<IconName, ReactNode> = {
  bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.2.9-1.2 1.8" />
      <path d="M12 16.8v.1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <circle cx="17" cy="9.5" r="2.4" />
      <path d="M17 14.2c2.6 0 4.5 1.4 4.5 4" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z" />
      <path d="M12 14c0-3-2.2-5-5.5-5 0 3 2.2 5 5.5 5z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  tree: (
    <>
      <path d="M12 21v-4" />
      <path d="M12 3.5l5 6h-3l4 5.5H6l4-5.5H7z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
}

const careOptions: Option[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'child', label: 'Child (under 10)' },
  { value: 'family', label: 'Family' },
  { value: 'couple', label: 'Couple' },
  { value: 'adolescent', label: 'Adolescent (10-18)' },
]

const counties = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  "Murang'a",
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
]

const weekdaySlots: Option[] = [
  { value: 'weekdays_before_9am', label: 'Before 9am' },
  { value: 'weekdays_9am_5pm', label: '9am-5pm' },
  { value: 'weekdays_after_5pm', label: 'After 5pm' },
]

const weekendSlots: Option[] = [
  { value: 'weekends_9am_5pm', label: '9am-5pm' },
  { value: 'weekends_after_5pm', label: 'After 5pm' },
]

const timingOptions: Option[] = [
  { value: 'asap', label: 'As soon as possible', icon: 'bolt' },
  { value: 'within_month', label: 'Within a month', icon: 'calendar' },
  { value: 'not_sure', label: 'Not sure', icon: 'help' },
]

const genderOptions: Option[] = [
  { value: 'no_preference', label: 'No preference', icon: 'users' },
  { value: 'woman', label: 'Woman', icon: 'user' },
  { value: 'man', label: 'Man', icon: 'user' },
  { value: 'non_binary', label: 'Non-binary', icon: 'user' },
]

const ageOptions: Option[] = [
  { value: 'no_preference', label: 'No preference', icon: 'users' },
  { value: 'under_35', label: 'Under 35', icon: 'sprout' },
  { value: '35_to_50', label: '35 to 50', icon: 'sun' },
  { value: 'over_50', label: 'Over 50', icon: 'tree' },
]

const priorityOptions = [
  'Age',
  'Expertise or speciality',
  'Gender',
  'Style or personality',
]

const defaultStyles: StyleScores = {
  action: 75,
  relational: 75,
  creative: 25,
}

const styleCards: {
  key: keyof StyleScores
  title: string
  willBe: string
  offer: string
}[] = [
  {
    key: 'action',
    title: 'Action Oriented',
    willBe: 'Practical and hands-on, with a clear focus on your next step.',
    offer:
      'Tools and exercises you can use between sessions to change unhelpful thoughts and habits.',
  },
  {
    key: 'relational',
    title: 'Relational and reflective',
    willBe:
      'A steady, non-judgemental listener who gives you room to talk about anything.',
    offer:
      'Help noticing patterns in your life and relationships, so you understand where your feelings come from.',
  },
  {
    key: 'creative',
    title: 'Creative and integrative',
    willBe:
      'Open to approaches that involve the body and creativity, not only talking.',
    offer:
      'Options such as art, music, breathing exercises or mindfulness alongside conversation.',
  },
]

const commonFocusAreas = [
  'Anxiety',
  'Body Image',
  'Dating',
  'Depression',
  'Self-Esteem',
  'Trauma',
]

const otherFocusAreas = [
  'ADD/ADHD',
  'Addiction and Substance Use',
  'Adoption',
  'Aging Parents',
  'Anger',
  'Artist-Related Stress',
  'Bipolar Disorder',
  'Borderline Personality Disorder',
  'Burnout',
  'Career-Related Stress',
  'Chronic Illness',
  'Codependency',
  'Commitment Obstacles',
  'Creative Blocks',
  'Cultural Competence',
  'Divorce',
  'Domestic Violence',
  'Eating Disorder',
  'Ex-cult support',
  'Existential Crisis or Transition',
  'Family Dynamics',
  'Family Planning',
  'Fear of Failure',
  'Fertility',
  'Food-Related Stress',
  'Gambling/Crypto Addiction',
  'Gaslighting',
  'Gender Identity',
  'Grief and Loss',
  'Loneliness',
  'Panic Attacks',
  'Parenting',
  'Personal Growth',
  'Relationship Issues',
  'Sleep Problems',
  'Stress',
  'Youth Issues',
]

function saveAnswer(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Saving is optional for now, so ignore any storage problem.
  }
}

function LineIcon({
  name,
  className,
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-6 w-6'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function ArrowIcon({ left }: { left?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={['h-5 w-5', left ? 'rotate-180' : ''].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CheckBadge() {
  return (
    <span
      className="zt-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

function BackButton({
  onClick,
  compact,
}: {
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="inline-flex items-center gap-3 text-stone-800"
    >
      <span className="zt-disc flex h-11 w-11 items-center justify-center bg-white text-teal-700">
        <ArrowIcon left />
      </span>

      {!compact && <span className="text-base font-medium">Back</span>}
    </button>
  )
}

function NextButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="zt-lift inline-flex items-center gap-4 rounded-full bg-teal-700 py-2 pl-8 pr-2 text-lg font-semibold text-white transition-all duration-300 hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span>{label ?? 'Next'}</span>

      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
        <ArrowIcon />
      </span>
    </button>
  )
}

function Character({
  x,
  y,
  scale,
  skin,
  hair,
  hairStyle,
  shirt,
  pants,
}: {
  x: number
  y: number
  scale: number
  skin: string
  hair: string
  hairStyle: HairStyle
  shirt: string
  pants: string
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="1" rx="22" ry="4.5" fill="#000" opacity="0.12" />

      {hairStyle === 'long' && (
        <rect x="-16" y="-93" width="32" height="40" rx="14" fill={hair} />
      )}

      <rect x="-11" y="-30" width="9" height="30" rx="4.5" fill={pants} />
      <rect x="2" y="-30" width="9" height="30" rx="4.5" fill={pants} />
      <ellipse cx="-6.5" cy="0" rx="7.5" ry="3.5" fill="#26323a" />
      <ellipse cx="6.5" cy="0" rx="7.5" ry="3.5" fill="#26323a" />

      <rect x="-23" y="-62" width="9" height="30" rx="4.5" fill={shirt} />
      <rect x="14" y="-62" width="9" height="30" rx="4.5" fill={shirt} />
      <circle cx="-18.5" cy="-31" r="4.5" fill={skin} />
      <circle cx="18.5" cy="-31" r="4.5" fill={skin} />

      <rect x="-15" y="-64" width="30" height="38" rx="14" fill={shirt} />
      <ellipse cx="-6" cy="-50" rx="4.5" ry="11" fill="#fff" opacity="0.16" />

      <rect x="-4.5" y="-71" width="9" height="9" rx="3" fill={skin} />
      <circle cx="0" cy="-81" r="14" fill={skin} />
      <ellipse cx="-5" cy="-87" rx="5" ry="3" fill="#fff" opacity="0.22" />

      <path
        d="M-14.5 -80 C-16 -97 16 -97 14.5 -80 C10 -89 -10 -89 -14.5 -80 Z"
        fill={hair}
      />

      {hairStyle === 'bun' && <circle cx="0" cy="-97" r="6.5" fill={hair} />}

      {hairStyle === 'curly' && (
        <>
          <circle cx="-10" cy="-91" r="6" fill={hair} />
          <circle cx="-3" cy="-95" r="6" fill={hair} />
          <circle cx="5" cy="-94.5" r="6" fill={hair} />
          <circle cx="11" cy="-90" r="6" fill={hair} />
        </>
      )}

      <circle cx="-5" cy="-81" r="1.6" fill="#2a1c16" />
      <circle cx="5" cy="-81" r="1.6" fill="#2a1c16" />
      <circle cx="-9" cy="-77" r="2.4" fill="#e57373" opacity="0.35" />
      <circle cx="9" cy="-77" r="2.4" fill="#e57373" opacity="0.35" />
      <path
        d="M-4.2 -75.5 Q0 -72 4.2 -75.5"
        fill="none"
        stroke="#2a1c16"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  )
}

function CareIllustration({ value }: { value: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="60" fill="#e8f8fa" />

      {value === 'individual' && (
        <Character
          x={60}
          y={106}
          scale={0.98}
          skin="#8d5a3b"
          hair="#1f1612"
          hairStyle="long"
          shirt="#1ab5c4"
          pants="#485860"
        />
      )}

      {value === 'child' && (
        <Character
          x={60}
          y={106}
          scale={0.62}
          skin="#a56b45"
          hair="#1f1612"
          hairStyle="curly"
          shirt="#f5a524"
          pants="#33414a"
        />
      )}

      {value === 'family' && (
        <>
          <Character
            x={34}
            y={106}
            scale={0.82}
            skin="#8d5a3b"
            hair="#1f1612"
            hairStyle="bun"
            shirt="#ef6461"
            pants="#485860"
          />
          <Character
            x={86}
            y={106}
            scale={0.82}
            skin="#a56b45"
            hair="#1f1612"
            hairStyle="short"
            shirt="#8bc53f"
            pants="#33414a"
          />
          <Character
            x={60}
            y={108}
            scale={0.5}
            skin="#7a4a30"
            hair="#1f1612"
            hairStyle="curly"
            shirt="#f5a524"
            pants="#485860"
          />
        </>
      )}

      {value === 'couple' && (
        <>
          <Character
            x={38}
            y={106}
            scale={0.88}
            skin="#8d5a3b"
            hair="#1f1612"
            hairStyle="short"
            shirt="#1ab5c4"
            pants="#485860"
          />
          <Character
            x={82}
            y={106}
            scale={0.88}
            skin="#a56b45"
            hair="#1f1612"
            hairStyle="long"
            shirt="#ef6461"
            pants="#33414a"
          />
        </>
      )}

      {value === 'adolescent' && (
        <>
          <Character
            x={56}
            y={106}
            scale={0.84}
            skin="#6f4328"
            hair="#1f1612"
            hairStyle="short"
            shirt="#8bc53f"
            pants="#33414a"
          />
          <circle
            cx="90"
            cy="46"
            r="7"
            fill="#f5a524"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  )
}

function SceneArt({ variant }: { variant: Accent }) {
  const scene = scenes[variant]
  const gradientId = `sky-${variant}`

  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.skyTop} />
          <stop offset="100%" stopColor={scene.skyBottom} />
        </linearGradient>
      </defs>

      <rect width="800" height="1000" fill={`url(#${gradientId})`} />

      {scene.sun && (
        <circle
          cx={scene.sun.cx}
          cy={scene.sun.cy}
          r={scene.sun.r}
          fill={scene.sun.fill}
        />
      )}

      {scene.layers.map((layer, index) => (
        <path
          key={index}
          d={layer.d}
          fill={layer.fill}
          opacity={layer.opacity ?? 1}
        />
      ))}
    </svg>
  )
}

function SplitPage({
  variant,
  imageName,
  onBack,
  children,
}: {
  variant: Accent
  imageName: string
  onBack: () => void
  children: ReactNode
}) {
  return (
    <main
      className={`flex min-h-screen flex-col bg-stone-50 md:flex-row ${serif.className}`}
    >
      <div className="relative h-56 w-full md:h-auto md:w-1/2">
        <SceneArt variant={variant} />

        <img
          src={`/section-images/${imageName}.jpg`}
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute left-5 top-5 z-10">
          <BackButton onClick={onBack} compact />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        {children}
      </div>
    </main>
  )
}

function PillCard({
  accent,
  badge,
  title,
  children,
}: {
  accent: Accent
  badge: ReactNode
  title: string
  children: ReactNode
}) {
  const colors = accentClasses[accent]

  return (
    <div className="relative w-full max-w-xl pl-14">
      <span className="absolute bottom-[-4rem] left-[17px] top-[-4rem] w-0.5 bg-stone-300" />

      <span
        className={`absolute left-0 top-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-current bg-white ${colors.text}`}
      >
        <span className="h-3 w-3 rounded-full bg-current" />
      </span>

      <div
        className={`zt-card-shadow rounded-[2.5rem] p-7 text-white ${colors.card}`}
      >
        <div className="flex items-center gap-5">
          <div
            className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-md ${colors.text}`}
          >
            {badge}
          </div>

          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            {title}
          </h1>
        </div>

        <div className="mt-6 space-y-4 text-lg leading-8 text-white">
          {children}
        </div>
      </div>
    </div>
  )
}

function SectionIntro({
  number,
  title,
  accent,
  onBack,
  onNext,
  children,
}: {
  number: string
  title: string
  accent: Accent
  onBack: () => void
  onNext: () => void
  children: ReactNode
}) {
  return (
    <SplitPage
      variant={accent}
      imageName={number.replace('.', '')}
      onBack={onBack}
    >
      <div className="w-full max-w-xl">
        <PillCard
          accent={accent}
          title={title}
          badge={
            <>
              <span className="text-xs font-semibold tracking-widest">
                STEP
              </span>
              <span className="text-3xl font-bold">
                {number.replace('.', '')}
              </span>
            </>
          }
        >
          {children}
        </PillCard>

        <div className="mt-10 flex justify-end">
          <NextButton label="Next question" onClick={onNext} />
        </div>
      </div>
    </SplitPage>
  )
}

function QuestionShell({
  title,
  subtitle,
  onBack,
  onNext,
  nextDisabled,
  wide,
  belowNext,
  children,
}: {
  title: string
  subtitle?: string
  onBack: () => void
  onNext: () => void
  nextDisabled: boolean
  wide?: boolean
  belowNext?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="flex h-dvh flex-col bg-stone-50 px-5 py-4">
      <div
        className={[
          'mx-auto flex min-h-0 w-full flex-1 flex-col',
          wide ? 'max-w-6xl' : 'max-w-3xl',
        ].join(' ')}
      >
        <div>
          <BackButton onClick={onBack} />
        </div>

        <h1 className="mt-2 text-center text-2xl font-semibold text-stone-900 md:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-2 max-w-3xl text-center text-base leading-7 text-stone-700">
            {subtitle}
          </p>
        )}

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="flex min-h-full flex-col justify-center">
            {children}
          </div>
        </div>

        <div className="flex flex-col items-center pb-2 pt-3">
          <NextButton onClick={onNext} disabled={nextDisabled} />

          {belowNext}
        </div>
      </div>
    </main>
  )
}

function ChoiceList({
  options,
  value,
  onChange,
}: {
  options: Option[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={[
              'flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-4 py-3 text-left text-lg font-medium text-stone-900 shadow-sm transition-all duration-300',
              selected
                ? 'scale-[1.01] border-teal-600'
                : 'border-transparent hover:border-teal-300',
            ].join(' ')}
          >
            {option.icon && (
              <span
                className={[
                  'zt-disc flex h-12 w-12 shrink-0 items-center justify-center transition-colors duration-300',
                  selected ? 'bg-teal-700 text-white' : 'bg-white text-teal-700',
                ].join(' ')}
              >
                <LineIcon name={option.icon} />
              </span>
            )}

            <span className="flex-1">{option.label}</span>

            {selected && <CheckBadge />}
          </button>
        )
      })}
    </div>
  )
}

function SlotButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        'rounded-full border-2 px-4 py-2 text-base font-medium transition-all duration-300',
        selected
          ? 'border-teal-700 bg-teal-700 text-white'
          : 'border-stone-300 bg-white text-stone-900 hover:border-teal-400',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function FocusChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        'w-[calc(50%-4px)] rounded-full border-2 px-3 py-2 text-sm transition-all duration-300 sm:w-[calc(33.333%-6px)] lg:w-[calc(20%-8px)]',
        selected
          ? 'border-teal-700 bg-teal-700 font-medium text-white'
          : 'border-transparent bg-white text-stone-900 shadow-sm hover:border-teal-300',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export default function FindSupportPage() {
  const [step, setStep] = useState<Step>('intro')
  const [leaving, setLeaving] = useState(false)
  const transitioning = useRef(false)
  const [careType, setCareType] = useState('')
  const [county, setCounty] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [timing, setTiming] = useState('')
  const [styles, setStyles] = useState<StyleScores>(defaultStyles)
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [focusSearch, setFocusSearch] = useState('')
  const [focusNote, setFocusNote] = useState('')
  const [genderPref, setGenderPref] = useState('')
  const [agePref, setAgePref] = useState('')
  const [priorities, setPriorities] = useState<string[]>(priorityOptions)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  function goTo(nextStep: Step) {
    if (transitioning.current) return

    transitioning.current = true
    setLeaving(true)

    setTimeout(() => {
      setStep(nextStep)
      setLeaving(false)
      transitioning.current = false
      window.scrollTo({ top: 0 })
    }, 500)
  }

  function finish() {
    if (transitioning.current) return

    transitioning.current = true
    setLeaving(true)

    setTimeout(() => {
      window.location.href = '/onboarding'
    }, 500)
  }

  useEffect(() => {
    if (step !== 'almostThere') return

    const timer = setTimeout(() => {
      goTo('focusIntro')
    }, 6000)

    return () => clearTimeout(timer)
  }, [step])

  function selectAndContinue(
    setValue: (value: string) => void,
    storageKey: string,
    value: string,
    nextStep: Step
  ) {
    setValue(value)
    saveAnswer(storageKey, value)

    setTimeout(() => {
      goTo(nextStep)
    }, 850)
  }

  function toggleSlot(value: string) {
    setAvailability((current) => {
      if (value === 'flexible') {
        return current.includes('flexible') ? [] : ['flexible']
      }

      const withoutFlexible = current.filter((item) => item !== 'flexible')

      return withoutFlexible.includes(value)
        ? withoutFlexible.filter((item) => item !== value)
        : [...withoutFlexible, value]
    })
  }

  function toggleFocusArea(area: string) {
    setFocusNote('')

    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((item) => item !== area))
      return
    }

    if (focusAreas.length >= MAX_FOCUS_AREAS) {
      setFocusNote(
        'You can choose up to 5. Unselect one to pick a different area.'
      )
      return
    }

    setFocusAreas([...focusAreas, area])
  }

  function movePriority(from: number, to: number) {
    if (from === to || to < 0 || to >= priorities.length) return

    setPriorities((current) => {
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  function renderStep() {
    if (step === 'logistics') {
      return (
        <SectionIntro
          number="01."
          title="Logistics"
          accent="teal"
          onBack={() => goTo('intro')}
          onNext={() => goTo('care')}
        >
          <p>
            Start by letting us know your needs around fee, availability, and
            location so that we can optimize your options.
          </p>
        </SectionIntro>
      )
    }

    if (step === 'care') {
      return (
        <QuestionShell
          wide
          title="What type of care are you looking for?"
          onBack={() => goTo('logistics')}
          nextDisabled={!careType}
          onNext={() => {
            saveAnswer('zentribe_care_type', careType)
            goTo('county')
          }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            {careOptions.map((option) => {
              const selected = careType === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    selectAndContinue(
                      setCareType,
                      'zentribe_care_type',
                      option.value,
                      'county'
                    )
                  }
                  className={[
                    'relative flex w-[calc(50%-8px)] flex-col items-center rounded-3xl bg-white p-4 shadow-sm transition-all duration-300 sm:w-[calc(33.333%-12px)] lg:w-[calc(20%-13px)]',
                    selected
                      ? 'scale-[1.03] ring-4 ring-teal-500'
                      : 'ring-4 ring-transparent hover:ring-teal-200',
                  ].join(' ')}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 z-10">
                      <CheckBadge />
                    </span>
                  )}

                  <div className="zt-disc relative h-28 w-28 overflow-hidden bg-white lg:h-32 lg:w-32">
                    <CareIllustration value={option.value} />

                    <img
                      src={`/care-images/${option.value}.png`}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>

                  <span className="mt-3 text-center text-base font-medium text-stone-900">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </QuestionShell>
      )
    }

    if (step === 'county') {
      return (
        <QuestionShell
          title="What county are you in?"
          onBack={() => goTo('care')}
          nextDisabled={!county}
          onNext={() => {
            saveAnswer('zentribe_county', county)
            goTo('availability')
          }}
        >
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <label
              htmlFor="county"
              className="mb-2 block text-base font-semibold text-stone-900"
            >
              County
            </label>

            <select
              id="county"
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              className="w-full rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-lg text-black outline-none focus:border-teal-600"
            >
              <option value="">Select your county</option>

              {counties.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <div className="mt-5 rounded-2xl bg-teal-50 p-4">
              <p className="font-semibold text-teal-900">Why we ask this</p>

              <p className="mt-1 leading-7 text-stone-800">
                Your county helps us find therapists who are close to you for
                in-person sessions. If you would rather meet online, you can
                still be matched with therapists who offer that.
              </p>
            </div>
          </div>
        </QuestionShell>
      )
    }

    if (step === 'availability') {
      return (
        <QuestionShell
          wide
          title="When are you available?"
          subtitle="Choose all that apply."
          onBack={() => goTo('county')}
          nextDisabled={availability.length === 0}
          onNext={() => {
            saveAnswer('zentribe_availability', JSON.stringify(availability))
            goTo('timing')
          }}
        >
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <button
              type="button"
              aria-pressed={availability.includes('flexible')}
              onClick={() => toggleSlot('flexible')}
              className={[
                'flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-4 py-3 text-left shadow-sm transition-all duration-300',
                availability.includes('flexible')
                  ? 'border-teal-600'
                  : 'border-transparent hover:border-teal-300',
              ].join(' ')}
            >
              <span
                className={[
                  'zt-disc flex h-12 w-12 shrink-0 items-center justify-center transition-colors duration-300',
                  availability.includes('flexible')
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-teal-700',
                ].join(' ')}
              >
                <LineIcon name="clock" />
              </span>

              <span className="flex-1">
                <span className="block text-lg font-semibold text-stone-900">
                  Flexible
                </span>

                <span className="block text-sm text-stone-700">
                  Any day or time works for me.
                </span>
              </span>

              {availability.includes('flexible') && <CheckBadge />}
            </button>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="zt-disc flex h-10 w-10 items-center justify-center bg-white text-teal-700">
                    <LineIcon name="calendar" className="h-5 w-5" />
                  </span>

                  <h2 className="text-lg font-semibold text-stone-900">
                    Weekdays
                  </h2>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {weekdaySlots.map((slot) => (
                    <SlotButton
                      key={slot.value}
                      label={slot.label}
                      selected={availability.includes(slot.value)}
                      onClick={() => toggleSlot(slot.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="zt-disc flex h-10 w-10 items-center justify-center bg-white text-teal-700">
                    <LineIcon name="sun" className="h-5 w-5" />
                  </span>

                  <h2 className="text-lg font-semibold text-stone-900">
                    Weekends
                  </h2>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {weekendSlots.map((slot) => (
                    <SlotButton
                      key={slot.value}
                      label={slot.label}
                      selected={availability.includes(slot.value)}
                      onClick={() => toggleSlot(slot.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </QuestionShell>
      )
    }

    if (step === 'timing') {
      return (
        <QuestionShell
          title="When are you hoping to begin?"
          onBack={() => goTo('availability')}
          nextDisabled={!timing}
          onNext={() => {
            saveAnswer('zentribe_start_timing', timing)
            goTo('styleIntro')
          }}
        >
          <ChoiceList
            options={timingOptions}
            value={timing}
            onChange={(value) =>
              selectAndContinue(
                setTiming,
                'zentribe_start_timing',
                value,
                'styleIntro'
              )
            }
          />
        </QuestionShell>
      )
    }

    if (step === 'styleIntro') {
      return (
        <SectionIntro
          number="02."
          title="Style"
          accent="lime"
          onBack={() => goTo('timing')}
          onNext={() => goTo('styleRate')}
        >
          <p>Next, let us know what style most resonates with you.</p>

          <p>
            Like you, mental health providers are unique; for example, some
            primarily listen while others are more direct. We&apos;re here to
            help you navigate your options.
          </p>
        </SectionIntro>
      )
    }

    if (step === 'styleRate') {
      return (
        <QuestionShell
          wide
          title="Rate your interests in each style"
          subtitle="Not sure? Below, the options are pre-set to reflect what's been most popular among others. You can proceed with that selection, or easily adjust the sliders to reflect your preferences."
          onBack={() => goTo('styleIntro')}
          nextDisabled={false}
          onNext={() => {
            saveAnswer('zentribe_style', JSON.stringify(styles))
            goTo('almostThere')
          }}
          belowNext={
            <button
              type="button"
              onClick={() => setStyles(defaultStyles)}
              className="mt-2 text-sm text-stone-900 underline transition-all duration-300 hover:text-teal-700"
            >
              Reset to suggested selections
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            {styleCards.map((card) => (
              <div
                key={card.key}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="bg-teal-700 px-4 py-3 text-center text-xl text-white">
                  {card.title}
                </div>

                <div className="flex-1 px-4 py-4">
                  <p className="text-xs text-stone-600">
                    This provider will be:
                  </p>

                  <p className="mt-1 text-base leading-6 text-stone-900">
                    {card.willBe}
                  </p>

                  <p className="mt-3 text-xs text-stone-600">They offer:</p>

                  <p className="mt-1 text-base leading-6 text-stone-900">
                    {card.offer}
                  </p>
                </div>

                <div className="border-t border-stone-300 px-4 py-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={styles[card.key]}
                    onChange={(event) =>
                      setStyles((current) => ({
                        ...current,
                        [card.key]: Number(event.target.value),
                      }))
                    }
                    aria-label={`How much the ${card.title} style suits you`}
                    className="h-2 w-full cursor-pointer accent-teal-700"
                  />

                  <div className="mt-3 flex justify-between text-xs font-medium text-stone-900">
                    <span>Not my style</span>
                    <span>Yes please!</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </QuestionShell>
      )
    }

    if (step === 'almostThere') {
      return (
        <SplitPage
          variant="teal"
          imageName="almost-there"
          onBack={() => goTo('styleRate')}
        >
          <div className="w-full max-w-xl">
            <PillCard
              accent="teal"
              title="Almost there"
              badge={
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              }
            >
              <p>
                We now have a good sense of your logistics and the style that
                suits you.
              </p>

              <p>Next up, a few questions about expertise and identity.</p>

              <p className="text-base text-white/90">
                There are no wrong answers, and you can go back at any time.
              </p>
            </PillCard>

            <div className="mt-10 flex flex-col items-end gap-3">
              <NextButton
                label="Next question"
                onClick={() => goTo('focusIntro')}
              />

              <p className="text-sm text-stone-500">
                Continuing automatically in a moment...
              </p>
            </div>
          </div>
        </SplitPage>
      )
    }

    if (step === 'focusIntro') {
      return (
        <SectionIntro
          number="03."
          title="Focus areas"
          accent="slate"
          onBack={() => goTo('styleRate')}
          onNext={() => goTo('focus')}
        >
          <p>
            Whether it&apos;s anxiety, dating, or substance use, we will
            prioritize that your recommended providers have expertise in the
            areas you&apos;re hoping to work through.
          </p>
        </SectionIntro>
      )
    }

    if (step === 'focus') {
      const searchText = focusSearch.trim().toLowerCase()

      const visibleOtherAreas = otherFocusAreas.filter((area) =>
        area.toLowerCase().includes(searchText)
      )

      return (
        <QuestionShell
          wide
          title="What would you like support with?"
          subtitle="Choose up to 5. If you're unsure or want more, don't worry, you can discuss directly with your provider in your first session."
          onBack={() => goTo('focusIntro')}
          nextDisabled={focusAreas.length === 0}
          onNext={() => {
            saveAnswer('zentribe_focus_areas', JSON.stringify(focusAreas))
            goTo('identityIntro')
          }}
        >
          <p className="text-center text-sm font-medium text-stone-800">
            {focusAreas.length} of {MAX_FOCUS_AREAS} selected
          </p>

          {focusNote && (
            <p className="mt-1 text-center text-sm font-medium text-coral-700">
              {focusNote}
            </p>
          )}

          <h2 className="mt-4 text-center text-lg text-stone-900">
            Most Common Selections
          </h2>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {commonFocusAreas.map((area) => (
              <FocusChip
                key={area}
                label={area}
                selected={focusAreas.includes(area)}
                onClick={() => toggleFocusArea(area)}
              />
            ))}
          </div>

          <h2 className="mt-5 text-center text-lg text-stone-900">Other</h2>

          <div className="relative mx-auto mt-2 w-full max-w-2xl">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>

            <input
              type="text"
              value={focusSearch}
              onChange={(event) => setFocusSearch(event.target.value)}
              placeholder="For example, anger, loneliness, eating disorders..."
              aria-label="Search other focus areas"
              className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-12 pr-12 text-base text-black outline-none focus:border-teal-600"
            />

            {focusSearch && (
              <button
                type="button"
                onClick={() => setFocusSearch('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl leading-none text-stone-600 hover:text-black"
              >
                &times;
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {visibleOtherAreas.map((area) => (
              <FocusChip
                key={area}
                label={area}
                selected={focusAreas.includes(area)}
                onClick={() => toggleFocusArea(area)}
              />
            ))}
          </div>

          {visibleOtherAreas.length === 0 && (
            <p className="mt-3 text-center text-stone-700">
              Nothing matches that yet. Try a different word.
            </p>
          )}
        </QuestionShell>
      )
    }

    if (step === 'identityIntro') {
      return (
        <SectionIntro
          number="04."
          title="Identity"
          accent="coral"
          onBack={() => goTo('focus')}
          onNext={() => goTo('genderPref')}
        >
          <p>Our priority is that you feel safe and empowered during care.</p>

          <p>
            In this section, please let us know if any age, ethnicity, or
            gender identity specifications are important to you.
          </p>
        </SectionIntro>
      )
    }

    if (step === 'genderPref') {
      return (
        <QuestionShell
          title="What is your gender preference for your provider?"
          onBack={() => goTo('identityIntro')}
          nextDisabled={!genderPref}
          onNext={() => {
            saveAnswer('zentribe_gender_pref', genderPref)
            goTo('agePref')
          }}
        >
          <ChoiceList
            options={genderOptions}
            value={genderPref}
            onChange={(value) =>
              selectAndContinue(
                setGenderPref,
                'zentribe_gender_pref',
                value,
                'agePref'
              )
            }
          />
        </QuestionShell>
      )
    }

    if (step === 'agePref') {
      return (
        <QuestionShell
          title="What is your provider age preference?"
          onBack={() => goTo('genderPref')}
          nextDisabled={!agePref}
          onNext={() => {
            saveAnswer('zentribe_age_pref', agePref)
            goTo('prioritiesIntro')
          }}
        >
          <ChoiceList
            options={ageOptions}
            value={agePref}
            onChange={(value) =>
              selectAndContinue(
                setAgePref,
                'zentribe_age_pref',
                value,
                'prioritiesIntro'
              )
            }
          />
        </QuestionShell>
      )
    }

    if (step === 'prioritiesIntro') {
      return (
        <SectionIntro
          number="05."
          title="Priorities"
          accent="amber"
          onBack={() => goTo('agePref')}
          onNext={() => goTo('priorities')}
        >
          <p>
            Last, tell us what matters most to you when choosing a provider.
            Everyone weighs these things differently, so put them in the order
            that feels right for you.
          </p>
        </SectionIntro>
      )
    }

    if (step === 'priorities') {
      return (
        <QuestionShell
          title="Which aspects are most important to you?"
          subtitle="Drag and drop to reflect your priorities:"
          onBack={() => goTo('prioritiesIntro')}
          nextDisabled={false}
          onNext={() => {
            saveAnswer('zentribe_priorities', JSON.stringify(priorities))
            finish()
          }}
        >
          <p className="mb-2 text-center text-base font-semibold text-teal-800">
            Most important
          </p>

          <ul className="space-y-2">
            {priorities.map((item, index) => (
              <li
                key={item}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', String(index))
                  event.dataTransfer.effectAllowed = 'move'
                  setDragIndex(index)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setOverIndex(index)
                }}
                onDrop={(event) => {
                  event.preventDefault()

                  if (dragIndex !== null) {
                    movePriority(dragIndex, index)
                  }

                  setDragIndex(null)
                  setOverIndex(null)
                }}
                onDragEnd={() => {
                  setDragIndex(null)
                  setOverIndex(null)
                }}
                className={[
                  'flex cursor-grab items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 shadow-sm transition-all duration-300 active:cursor-grabbing',
                  dragIndex === index ? 'opacity-40' : '',
                  overIndex === index && dragIndex !== index
                    ? 'border-teal-600'
                    : 'border-transparent',
                ].join(' ')}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-stone-400"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>

                <span className="zt-disc flex h-9 w-9 shrink-0 items-center justify-center bg-white font-semibold text-teal-700">
                  {index + 1}
                </span>

                <span className="flex-1 text-lg font-medium text-stone-900">
                  {item}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => movePriority(index, index - 1)}
                    aria-label={`Move ${item} up`}
                    className="rounded-full border border-stone-300 px-3 py-1 text-stone-800 transition-all duration-300 hover:bg-stone-100 disabled:opacity-30"
                  >
                    &uarr;
                  </button>

                  <button
                    type="button"
                    disabled={index === priorities.length - 1}
                    onClick={() => movePriority(index, index + 1)}
                    aria-label={`Move ${item} down`}
                    className="rounded-full border border-stone-300 px-3 py-1 text-stone-800 transition-all duration-300 hover:bg-stone-100 disabled:opacity-30"
                  >
                    &darr;
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-center text-base font-semibold text-teal-800">
            Least important
          </p>
        </QuestionShell>
      )
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12">
        <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold leading-tight text-teal-800 md:text-4xl">
            Connect with the right therapist or coach for you.
          </h1>

          <p className="mt-4 text-lg leading-8 text-stone-700">
            Get personalized matches based on things like, issue, area, and
            more.
          </p>

          <div className="mt-8 flex justify-center">
            <NextButton
              label="Find your match"
              onClick={() => goTo('logistics')}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <style>{animationCss}</style>

      <div key={step} className={leaving ? 'zt-leave' : 'zt-enter'}>
        {renderStep()}
      </div>
    </>
  )
}