'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const inputClass = [
  'w-full rounded-xl border border-stone-300 px-4 py-3 text-black',
  'outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100',
].join(' ')

const labelClass = 'mb-2 block text-sm font-semibold text-stone-800'

const linkClass = 'font-semibold text-teal-700 hover:text-teal-800'

const errorClass = [
  'rounded-xl border border-red-200 bg-red-50',
  'px-4 py-3 text-sm leading-6 text-red-700',
].join(' ')

const buttonClass = [
  'w-full rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white',
  'transition hover:bg-teal-800',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

export default function MemberLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const supabase = createClient()

    const loginResult = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
    ])

    if (loginResult === null) {
      setError(
        'This is taking too long. Refresh the page (Ctrl + Shift + R) and try again.'
      )
      setLoading(false)
      return
    }

    const { data, error: loginError } = loginResult

    if (loginError || !data.session) {
      setError(
        loginError?.message ||
          'We could not sign you in. Please check your email and password.'
      )
      setLoading(false)
      return
    }

    // Members go to the hero section of the home page
    window.location.href = '/#hero'
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              Zentribe
            </p>

            <h1 className="text-3xl font-bold text-stone-900">Member Login</h1>

            <p className="mt-3 text-sm leading-6 text-stone-600">
              Log in to see your session requests or find your match.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
                placeholder="Enter your password"
              />

              <div className="mt-2 text-right">
                <a href="/forgot-password" className={`text-sm ${linkClass}`}>
                  Forgot password?
                </a>
              </div>
            </div>

            {error && <div className={errorClass}>{error}</div>}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-center">
            <p className="text-sm text-stone-600">
              New to Zentribe?{' '}
              <a href="/signup" className={linkClass}>
                Create an account
              </a>
            </p>

            <p className="text-sm text-stone-600">
              Are you a professional?{' '}
              <a href="/professional/login" className={linkClass}>
                Professional login
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}