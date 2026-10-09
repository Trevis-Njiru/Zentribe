'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Lora } from 'next/font/google'
import { useAuth } from '@/lib/useAuth'
import { ArrowIcon, LineIcon } from '@/lib/ui'
import type { IconName } from '@/lib/ui'

const serif = Lora({ subsets: ['latin'] })

type Tone = 'teal' | 'lime' | 'slate' | 'coral'

type ActionCard = {
  icon: IconName
  title: string
  text: string
  href: string
  button: string
  tone: Tone
}

const toneClasses: Record<Tone, { icon: string; button: string }> = {
  teal: { icon: 'text-teal-700', button: 'bg-teal-700 hover:bg-teal-800' },
  lime: { icon: 'text-lime-700', button: 'bg-lime-700 hover:bg-lime-800' },
  slate: { icon: 'text-stone-700', button: 'bg-stone-700 hover:bg-stone-800' },
  coral: { icon: 'text-coral-700', button: 'bg-coral-700 hover:bg-coral-800' },
}

const quietButton =
  'zt-press inline-flex min-h-11 items-center rounded-full border border-stone-300 bg-white/60 px-5 text-sm font-semibold text-stone-800 hover:border-stone-400 hover:bg-white'

function greeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Card({ card, index }: { card: ActionCard; index: number }) {
  const tone = toneClasses[card.tone]

  return (
    <div
      className="zt-card-hover zt-rise flex flex-col rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-stone-200/70"
      style={{ '--i': index + 2 } as React.CSSProperties}
    >
      <span
        className={`zt-disc flex h-16 w-16 items-center justify-center bg-white ${tone.icon}`}
      >
        <LineIcon name={card.icon} className="h-8 w-8" />
      </span>

      <h2
        className={`${serif.className} mt-5 text-2xl tracking-[-0.01em] text-stone-900`}
      >
        {card.title}
      </h2>

      <p className="zt-lead mt-2 flex-1 text-stone-700">{card.text}</p>

      <Link
        href={card.href}
        className={`zt-press mt-6 inline-flex min-h-11 w-fit items-center gap-3 rounded-full px-6 py-3 font-semibold text-white ${tone.button}`}
      >
        {card.button}
        <ArrowIcon className="h-5 w-5" />
      </Link>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <main className="flex-1 bg-stone-50 px-6 pb-20 pt-14" aria-busy="true">
      <div className="mx-auto max-w-5xl">
        <span className="sr-only">Loading your dashboard</span>

        <div className="h-4 w-24 rounded-full bg-stone-200 motion-safe:animate-pulse" />
        <div className="mt-4 h-12 w-72 max-w-full rounded-2xl bg-stone-200 motion-safe:animate-pulse md:h-16" />
        <div className="mt-6 h-5 w-full max-w-2xl rounded-full bg-stone-200 motion-safe:animate-pulse" />
        <div className="mt-2 h-5 w-2/3 max-w-xl rounded-full bg-stone-200 motion-safe:animate-pulse" />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-72 rounded-[2rem] bg-stone-200/70 motion-safe:animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.loading && !auth.signedIn) {
      window.location.replace('/login')
    }
  }, [auth.loading, auth.signedIn])

  if (auth.loading || !auth.signedIn) {
    return <DashboardSkeleton />
  }

  const cards: ActionCard[] = [
    auth.isProfessional
      ? {
          icon: 'user',
          title: 'Your professional dashboard',
          text: 'Manage your profile and photo, and respond to session requests from members.',
          href: '/professional',
          button: 'Open dashboard',
          tone: 'teal',
        }
      : {
          icon: 'heart',
          title: 'Find support',
          text: 'Answer a few questions and we will match you with therapists and coaches who fit you, with the reasons shown.',
          href: '/find-support',
          button: 'Start matching',
          tone: 'teal',
        },
    {
      icon: 'users',
      title: 'Explore the community',
      text: 'Find independent clubs across Kenya, from running to book clubs, and join them in a few taps.',
      href: '/community',
      button: 'Explore clubs',
      tone: 'lime',
    },
  ]

  if (auth.isAdmin) {
    cards.push({
      icon: 'shield',
      title: 'Admin dashboard',
      text: 'Manage professionals, clubs, session requests, members and reports.',
      href: '/admin',
      button: 'Open admin',
      tone: 'slate',
    })
  }

  return (
    <main className="flex-1 bg-stone-50 px-6 pb-20 pt-12 md:pt-14">
      <div className="mx-auto max-w-5xl">
        <p
          className="zt-eyebrow zt-rise text-stone-600"
          style={{ '--i': 0 } as React.CSSProperties}
        >
          Welcome
        </p>

        <h1
          className={`${serif.className} zt-rise mt-3 text-4xl leading-tight tracking-[-0.02em] text-stone-900 md:text-6xl`}
          style={{ '--i': 1 } as React.CSSProperties}
        >
          {auth.firstName
            ? `${greeting()}, ${auth.firstName}`
            : 'Welcome to Zentribe'}
        </h1>

        <p
          className="zt-lead zt-rise mt-5 max-w-2xl text-lg text-stone-700"
          style={{ '--i': 2 } as React.CSSProperties}
        >
          Zentribe is a place to look after yourself and find your people. You
          can be matched with a therapist or coach who suits you, and discover
          independent clubs across Kenya where you can meet others. Pick where
          you would like to start.
        </p>

        <div
          className={[
            'mt-10 grid gap-6',
            cards.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2',
          ].join(' ')}
        >
          {cards.map((card, index) => (
            <Card key={card.title} card={card} index={index} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {!auth.isProfessional && (
            <>
              <Link href="/matches" className={quietButton}>
                My matches
              </Link>

              <Link href="/requests" className={quietButton}>
                My session requests
              </Link>
            </>
          )}

          <Link
            href="/crisis"
            className="zt-press inline-flex min-h-11 items-center rounded-full border border-coral-300 px-5 text-sm font-semibold text-coral-700 hover:bg-coral-50"
          >
            Need urgent help?
          </Link>
        </div>
      </div>
    </main>
  )
}
