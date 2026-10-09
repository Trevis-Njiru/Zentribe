'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { ArrowIcon, LineIcon } from '@/lib/ui'
import {
  cardInteractive,
  primaryButtonLg,
  secondaryButtonLg,
} from '@/lib/styles'

const cardLink =
  'zt-press mt-6 inline-flex items-center gap-1.5 rounded-full font-semibold text-teal-700 hover:text-teal-900'

export default function Home() {
  const auth = useAuth()

  const joinHref = auth.signedIn ? '/dashboard' : '/signup'
  const joinLabel = auth.signedIn ? 'Explore Zentribe' : 'Join Zentribe'

  return (
    <main className="bg-stone-50 text-black">
      {/* Hero: one idea, one action. Elements rise in sequence, once. */}
      <section className="px-6 pb-20 pt-16 text-center md:px-8 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-4xl">
          <p
            className="zt-eyebrow zt-rise mb-6 text-teal-700"
            style={{ '--i': 0 } as React.CSSProperties}
          >
            {auth.signedIn && auth.firstName
              ? `Welcome back, ${auth.firstName}`
              : 'You do not have to figure everything out alone.'}
          </p>

          <h1
            className="zt-display zt-rise text-black"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            Find your people.
            <br />
            Find your support.
          </h1>

          <p
            className="zt-lead zt-rise mx-auto mt-7 max-w-2xl text-lg text-stone-700 md:text-xl"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            Zentribe is a welcoming community where people can connect, share
            experiences, discover helpful resources, and find the right
            professional support when they need it.
          </p>

          <div
            className="zt-rise mt-11 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4"
            style={{ '--i': 3 } as React.CSSProperties}
          >
            <Link href={joinHref} className={primaryButtonLg}>
              {joinLabel}
            </Link>

            <Link href="/support" className={secondaryButtonLg}>
              Find support
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="zt-title text-3xl text-black md:text-4xl">
              A space built around people
            </h2>

            <p className="zt-lead mt-3 text-stone-700">
              Connect, learn and find support in one place.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            <div className={cardInteractive + ' flex flex-col'}>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <LineIcon name="users" className="h-6 w-6" />
              </span>

              <h3 className="zt-heading text-xl text-teal-800">Community</h3>

              <p className="zt-lead mt-3 text-stone-700">
                Find independent clubs across Kenya, from running and chess to
                book clubs and volunteering, and join them in a few taps.
              </p>

              <Link href="/community" className={cardLink + ' mt-auto pt-6'}>
                Explore the community
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className={cardInteractive + ' flex flex-col'}>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <LineIcon name="heart" className="h-6 w-6" />
              </span>

              <h3 className="zt-heading text-xl text-teal-800">Find support</h3>

              <p className="zt-lead mt-3 text-stone-700">
                Answer a few questions and see professionals who fit your needs
                and preferences, with the reasons why.
              </p>

              <Link href="/support" className={cardLink + ' mt-auto pt-6'}>
                See how matching works
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col rounded-3xl bg-stone-50 p-8 ring-1 ring-stone-200/80">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-200/70 text-stone-600">
                <LineIcon name="lightbulb" className="h-6 w-6" />
              </span>

              <h3 className="zt-heading text-xl text-teal-800">
                Grow together
              </h3>

              <p className="zt-lead mt-3 text-stone-700">
                Access resources and experiences that can help you take your
                next step. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center md:px-8 md:py-32">
        <h2 className="zt-title text-4xl text-black md:text-5xl">
          Your tribe is waiting.
        </h2>

        <p className="zt-lead mx-auto mt-5 max-w-xl text-lg text-stone-700">
          Start building meaningful connections and discover support through
          Zentribe.
        </p>

        <Link href={joinHref} className={'mt-9 ' + primaryButtonLg}>
          {auth.signedIn ? 'Go to my dashboard' : 'Get started'}
        </Link>
      </section>

      <footer className="border-t border-stone-200 px-6 py-10 text-center text-sm text-stone-600 md:px-8">
        <p>
          In crisis or need help right now?{' '}
          <Link
            href="/crisis"
            className="font-semibold text-teal-800 underline decoration-teal-800/30 underline-offset-4 hover:decoration-teal-800"
          >
            Get urgent help
          </Link>
        </p>

        <p className="mt-2">
          © 2026 Zentribe. A community for connection and support.
        </p>
      </footer>
    </main>
  )
}
