'use client'

import { Lora } from 'next/font/google'
import { useAuth } from '@/lib/useAuth'
import { ArrowIcon, LineIcon } from '@/lib/ui'
import type { IconName } from '@/lib/ui'

const serif = Lora({ subsets: ['latin'] })

const steps = [
  {
    number: '01',
    title: 'Logistics',
    text: 'The kind of care you want, your county, when you are free and when you would like to start.',
    card: 'bg-teal-700',
    badge: 'text-teal-700',
  },
  {
    number: '02',
    title: 'Style',
    text: 'Slide to show how you like a therapist to work, from hands-on to reflective to creative.',
    card: 'bg-lime-700',
    badge: 'text-lime-700',
  },
  {
    number: '03',
    title: 'Focus areas',
    text: 'Choose up to five things you would like support with, from anxiety to grief to dating.',
    card: 'bg-stone-700',
    badge: 'text-stone-700',
  },
  {
    number: '04',
    title: 'Identity',
    text: 'Share any preferences about the gender and age of your therapist.',
    card: 'bg-coral-700',
    badge: 'text-coral-700',
  },
  {
    number: '05',
    title: 'Priorities',
    text: 'Rank what matters most, so we weigh your answers the way you would.',
    card: 'bg-amber-700',
    badge: 'text-amber-700',
  },
]

const gets: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'list',
    title: 'Ranked matches',
    text: 'Therapists ordered by how well they fit you, with the reasons shown.',
  },
  {
    icon: 'user',
    title: 'Real profiles',
    text: 'Read their message, approach, languages and availability before you decide.',
  },
  {
    icon: 'calendar',
    title: 'One-tap requests',
    text: 'Request a session and follow it from your dashboard.',
  },
]

export default function SupportLandingPage() {
  const auth = useAuth()

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto max-w-5xl px-6 pb-14 pt-16 text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-stone-600">
          FIND SUPPORT
        </p>

        <h1
          className={`${serif.className} mt-4 text-5xl leading-tight text-stone-900 md:text-6xl`}
        >
          The right therapist or coach, matched to you
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-700">
          Choosing someone to talk to is a big step, and it should not feel like
          guessing. Answer a few short questions about what you need and how you
          like to work, and we will rank the professionals who fit you best,
          with the reasons shown.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/find-support"
            className="zt-lift inline-flex items-center gap-4 rounded-full bg-teal-700 py-2 pl-8 pr-2 text-lg font-semibold text-white transition-all duration-300 hover:bg-teal-800"
          >
            Start matching
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
              <ArrowIcon />
            </span>
          </a>

          {auth.signedIn && (
            <a
              href="/matches"
              className="inline-flex items-center rounded-full border-2 border-stone-300 px-8 py-3 text-lg font-semibold text-stone-800 hover:bg-stone-100"
            >
              See my matches
            </a>
          )}
        </div>

        <p className="mt-4 text-sm text-stone-600">
          Takes about five minutes. You can go back at any time.
        </p>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2
            className={`${serif.className} text-center text-3xl text-stone-900 md:text-4xl`}
          >
            What we will ask you
          </h2>

          <div className="relative mt-12 space-y-6 pl-14">
            <span className="absolute bottom-6 left-[17px] top-6 w-0.5 bg-stone-300" />

            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span
                  className={`absolute -left-14 top-8 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-current bg-white ${step.badge}`}
                >
                  <span className="h-3 w-3 rounded-full bg-current" />
                </span>

                <div
                  className={`zt-card-shadow flex items-center gap-5 rounded-[2.5rem] p-5 text-white ${step.card}`}
                >
                  <div
                    className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-md ${step.badge}`}
                  >
                    <span className="text-[10px] font-semibold tracking-widest">
                      STEP
                    </span>

                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>

                  <div>
                    <h3 className={`${serif.className} text-2xl`}>
                      {step.title}
                    </h3>

                    <p className="mt-1 leading-7 text-white">{step.text}</p>
                  </div>
                </div>
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
            What you get
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {gets.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-stone-200"
              >
                <span className="zt-disc flex h-14 w-14 items-center justify-center bg-white text-teal-700">
                  <LineIcon name={item.icon} className="h-7 w-7" />
                </span>

                <h3 className={`${serif.className} mt-4 text-xl text-stone-900`}>
                  {item.title}
                </h3>

                <p className="mt-2 leading-7 text-stone-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-50 px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="zt-disc mx-auto flex h-14 w-14 items-center justify-center bg-white text-teal-700">
            <LineIcon name="shield" className="h-7 w-7" />
          </span>

          <h2 className={`${serif.className} mt-4 text-2xl text-stone-900`}>
            Your answers stay yours
          </h2>

          <p className="mt-3 leading-7 text-stone-700">
            We use your answers only to rank professionals for you. They are
            never shown to clubs or to other members. Until you create an
            account, they stay on your own device.
          </p>

          <p className="mt-6 text-stone-700">
            Need help right now?{' '}
            <a href="/crisis" className="font-semibold text-teal-800 underline">
              Go to urgent help
            </a>
          </p>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <a
          href="/find-support"
          className="zt-lift inline-flex items-center gap-4 rounded-full bg-teal-700 py-2 pl-8 pr-2 text-lg font-semibold text-white transition-all duration-300 hover:bg-teal-800"
        >
          Start matching
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700">
            <ArrowIcon />
          </span>
        </a>
      </section>
    </main>
  )
}