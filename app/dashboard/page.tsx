'use client'

import { useEffect } from 'react'
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

function Card({ card }: { card: ActionCard }) {
  const tone = toneClasses[card.tone]

  return (
    <div className="zt-card-shadow flex flex-col rounded-[2rem] bg-white p-7">
      <span
        className={`zt-disc flex h-16 w-16 items-center justify-center bg-white ${tone.icon}`}
      >
        <LineIcon name={card.icon} className="h-8 w-8" />
      </span>

      <h2 className={`${serif.className} mt-5 text-2xl text-stone-900`}>
        {card.title}
      </h2>

      <p className="mt-2 flex-1 leading-7 text-stone-700">{card.text}</p>

      <a
        href={card.href}
        className={`mt-6 inline-flex w-fit items-center gap-3 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ${tone.button}`}
      >
        {card.button}
        <ArrowIcon className="h-5 w-5" />
      </a>
    </div>
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-800">Loading...</p>
      </main>
    )
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
    <main className="min-h-screen bg-stone-50 px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold tracking-[0.25em] text-stone-600">
          WELCOME
        </p>

        <h1
          className={`${serif.className} mt-3 text-4xl leading-tight text-stone-900 md:text-6xl`}
        >
          {auth.firstName ? `Hello, ${auth.firstName}` : 'Welcome to Zentribe'}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
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
          {cards.map((card) => (
            <Card key={card.title} card={card} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {!auth.isProfessional && (
            <>
              <a
                href="/matches"
                className="rounded-full border-2 border-stone-300 px-5 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                My matches
              </a>

              <a
                href="/requests"
                className="rounded-full border-2 border-stone-300 px-5 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                My session requests
              </a>
            </>
          )}

          <a
            href="/crisis"
            className="rounded-full border-2 border-coral-300 px-5 py-2 text-sm font-semibold text-coral-700 hover:bg-coral-50"
          >
            Need urgent help?
          </a>
        </div>
      </div>
    </main>
  )
}