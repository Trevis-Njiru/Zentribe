'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: window.location.origin + '/reset-password',
      }
    )

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setMessage(
      'If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.'
    )
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
              Forgot password
            </h1>

            <p className="mt-3 text-sm leading-6 text-stone-600">
              Enter your email and we will send you a link to set a new
              password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-stone-800"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-8 border-t border-stone-200 pt-6 text-center">
            <a
              href="/login"
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}