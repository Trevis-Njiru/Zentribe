'use client'

import { useEffect, useState } from 'react'
import { Lora } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ArrowIcon, LineIcon } from '@/lib/ui'
import type { IconName } from '@/lib/ui'
import { CategoryIcon, clubCategories } from '@/lib/clubs'

const serif = Lora({ subsets: ['latin'] })

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'list',
    title: 'Browse',
    text: 'Search clubs by interest, county, schedule and cost. Filter for free or beginner friendly.',
  },
  {
    icon: 'shield',
    title: 'Check',
    text: 'Look for the Verified by Zentribe tick, then read the details and safety tips before you go.',
  },
  {
    icon: 'users',
    title: 'Join',
    text: "Tap join and you land on the club's own WhatsApp, Instagram or page, where they welcome you.",
  },
]

const promises: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'heart',
    title: 'Independent clubs',
    text: 'We do not run the clubs. We just make them easy to find, so they keep their own character.',
  },
  {
    icon: 'check',
    title: 'Checked by people',
    text: 'We confirm the organizer and that the club really meets, and we show you exactly what we checked.',
  },
  {
    icon: 'shield',
    title: 'Report anything',
    text: 'Something feels off? Every club page has a report button, and we look into every report.',
  },
]

export default function CommunityLandingPage() {
  const [stats, setStats] = useState<{ clubs: number; categories: number } | null>(
    null
  )

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('clubs')
        .select('id, category')
        .eq('status', 'approved')

      const rows = data ?? []

      setStats({
        clubs: rows.length,
        categories: new Set(rows.map((row) => row.category)).size,
      })
    }

    load()
  }, [])

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-16 text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-stone-600">
          COMMUNITY
        </p>

        <h1
          className={`${serif.className} mt-4 text-5xl leading-tight text-stone-900 md:text-7xl`}
        >
          Find your tribe
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-700">
          Good clubs are hard to find. They live in WhatsApp groups and on
          Instagram pages, and you only hear about them if you already know
          someone. Zentribe brings independent clubs from across Kenya into one
          place, so you can stop guessing and start showing up.
        </p>

        {stats && stats.clubs > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-800">
              {stats.clubs} {stats.clubs === 1 ? 'club' : 'clubs'}
            </span>

            <span className="rounded-full bg-lime-100 px-4 py-1.5 text-sm font-semibold text-lime-800">
              {stats.categories}{' '}
              {stats.categories === 1 ? 'category' : 'categories'}
            </span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/clubs"
            className="zt-lift inline-flex items-center gap-4 rounded-full bg-teal-700 py-2 pl-8 pr-2 text-lg font-semibold text-white transition-all duration-300 hover:bg-teal-800"
          >
            Browse clubs
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
              <ArrowIcon />
            </span>
          </a>

          <a
            href="#how"
            className="inline-flex items-center rounded-full border-2 border-stone-300 px-8 py-3 text-lg font-semibold text-stone-800 hover:bg-stone-100"
          >
            How it works
          </a>
        </div>
      </section>

      <section id="how" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2
            className={`${serif.className} text-center text-3xl text-stone-900 md:text-4xl`}
          >
            How it works
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <span className="zt-disc mx-auto flex h-20 w-20 items-center justify-center bg-white text-teal-700">
                  <LineIcon name={step.icon} className="h-9 w-9" />
                </span>

                <p className="mt-5 text-sm font-semibold tracking-widest text-stone-500">
                  STEP {index + 1}
                </p>

                <h3 className={`${serif.className} mt-1 text-2xl text-stone-900`}>
                  {step.title}
                </h3>

                <p className="mt-2 leading-7 text-stone-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2
            className={`${serif.className} text-center text-3xl text-stone-900 md:text-4xl`}
          >
            What you will find
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {clubCategories.map((category) => (
              <a
                key={category.key}
                href="/clubs"
                className="flex flex-col items-center rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{
                    background: `linear-gradient(145deg, ${category.from}, ${category.to})`,
                  }}
                >
                  <CategoryIcon name={category.key} className="h-7 w-7" />
                </span>

                <span className="mt-3 text-sm font-semibold text-stone-900">
                  {category.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2
            className={`${serif.className} text-center text-3xl text-stone-900 md:text-4xl`}
          >
            Built on trust
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {promises.map((promise) => (
              <div
                key={promise.title}
                className="rounded-[2rem] bg-white p-7 shadow-sm"
              >
                <span className="zt-disc flex h-14 w-14 items-center justify-center bg-white text-teal-700">
                  <LineIcon name={promise.icon} className="h-7 w-7" />
                </span>

                <h3 className={`${serif.className} mt-4 text-xl text-stone-900`}>
                  {promise.title}
                </h3>

                <p className="mt-2 leading-7 text-stone-700">{promise.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className={`${serif.className} text-4xl text-stone-900`}>
          Ready to find yours?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-stone-700">
          Your next favourite Saturday could be one tap away.
        </p>

        <a
          href="/clubs"
          className="zt-lift mt-8 inline-flex items-center gap-4 rounded-full bg-teal-700 py-2 pl-8 pr-2 text-lg font-semibold text-white transition-all duration-300 hover:bg-teal-800"
        >
          Browse clubs
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
            <ArrowIcon />
          </span>
        </a>
      </section>
    </main>
  )
}