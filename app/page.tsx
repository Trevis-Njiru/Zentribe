'use client'

import { useAuth } from '@/lib/useAuth'

const primary = [
  'rounded-full',
  'bg-teal-700',
  'px-8',
  'py-4',
  'font-semibold',
  'text-white',
  'shadow-lg',
  'hover:bg-teal-800',
].join(' ')

const secondary = [
  'rounded-full',
  'border',
  'border-stone-400',
  'px-8',
  'py-4',
  'font-semibold',
  'text-stone-800',
  'hover:bg-stone-100',
].join(' ')

const featureCard = 'rounded-3xl bg-white p-8 shadow-sm'

export default function Home() {
  const auth = useAuth()

  const joinHref = auth.signedIn ? '/dashboard' : '/signup'
  const joinLabel = auth.signedIn ? 'Explore Zentribe' : 'Join Zentribe'

  return (
    <main className="bg-stone-50 text-black">
      <section className="px-8 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-teal-700">
            {auth.signedIn && auth.firstName
              ? `Welcome back, ${auth.firstName}`
              : 'You do not have to figure everything out alone.'}
          </p>

          <h1 className="text-5xl font-bold leading-tight text-black md:text-7xl">
            Find your people.
            <br />
            Find your support.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            Zentribe is a welcoming community where people can connect, share
            experiences, discover helpful resources, and find the right
            professional support when they need it.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a href={joinHref} className={primary}>
              {joinLabel}
            </a>

            <a href="/support" className={secondary}>
              Find support
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-black">
              A space built around people
            </h2>

            <p className="mt-3 text-stone-700">
              Connect, learn and find support in one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className={featureCard + ' border border-stone-200'}>
              <h3 className="text-xl font-bold text-teal-800">Community</h3>

              <p className="mt-3 leading-7 text-stone-700">
                Find independent clubs across Kenya, from running and chess to
                book clubs and volunteering, and join them in a few taps.
              </p>

              <a
                href="/community"
                className="mt-5 inline-block font-semibold text-teal-700 underline"
              >
                Explore the community
              </a>
            </div>

            <div className={featureCard + ' border border-stone-200'}>
              <h3 className="text-xl font-bold text-teal-800">Find support</h3>

              <p className="mt-3 leading-7 text-stone-700">
                Answer a few questions and see professionals who fit your needs
                and preferences, with the reasons why.
              </p>

              <a
                href="/support"
                className="mt-5 inline-block font-semibold text-teal-700 underline"
              >
                See how matching works
              </a>
            </div>

            <div className={featureCard + ' border border-stone-200'}>
              <h3 className="text-xl font-bold text-teal-800">
                Grow together
              </h3>

              <p className="mt-3 leading-7 text-stone-700">
                Access resources and experiences that can help you take your
                next step. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-24 text-center">
        <h2 className="text-4xl font-bold text-black">
          Your tribe is waiting.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-stone-700">
          Start building meaningful connections and discover support through
          Zentribe.
        </p>

        <a href={joinHref} className={'mt-8 inline-block ' + primary}>
          {auth.signedIn ? 'Go to my dashboard' : 'Get started'}
        </a>
      </section>

      <footer className="border-t border-stone-200 px-8 py-8 text-center text-sm text-stone-700">
        <p>
          In crisis or need help right now?{' '}
          <a href="/crisis" className="font-semibold text-teal-800 underline">
            Get urgent help
          </a>
        </p>

        <p className="mt-2">
          © 2026 Zentribe. A community for connection and support.
        </p>
      </footer>
    </main>
  )
}