'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
        setChecking(false)
      }
    })

    async function checkSession() {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        setReady(true)
      }

      setChecking(false)
    }

    checkSession()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Your password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)

    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              Zentribe
            </p>

            <h1 className="text-3xl font-bold text-stone-900">
              Set a new password
            </h1>
          </div>

          {checking && (
            <p className="text-center text-stone-700">Checking your link...</p>
          )}

          {!checking && !ready && (
            <div className="space-y-4 text-center">
              <p className="text-stone-700">
                This reset link is invalid or has expired. Please request a
                new one.
              </p>

              <a
                href="/forgot-password"
                className="inline-block rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
              >
                Request a new link
              </a>
            </div>
          )}

          {!checking && ready && !done && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Confirm new password
                </label>

                <input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  placeholder="Type it again"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          )}

          {done && (
            <p className="text-center text-teal-800">
              Your password has been updated. Taking you to your dashboard...
            </p>
          )}
        </div>
      </div>
    </main>
  )
}