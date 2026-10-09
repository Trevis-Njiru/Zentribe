'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfessionalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

    if (signInError || !data.user) {
      setError(signInError?.message || 'Unable to log in. Please try again.')
      setLoading(false)
      return
    }

    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (professionalError) {
      setError('Something went wrong: ' + professionalError.message)
      setLoading(false)
      return
    }

    if (!professional) {
      await supabase.auth.signOut({ scope: 'local' })
      setError(
        'This account is not linked to a professional profile yet. If you are a member, please use the member login instead.'
      )
      setLoading(false)
      return
    }

    window.location.href = '/professional'
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-700">
          For professionals
        </p>

        <h1 className="mt-2 text-3xl font-bold text-teal-800">
          Professional Login
        </h1>

        <p className="mt-2 text-stone-700">
          Log in to manage your session requests.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-black">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin()
              }}
              placeholder="Your password"
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-full bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in as professional'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-stone-700">
          Not a professional?{' '}
          <a href="/login" className="font-semibold text-teal-800">
            Member login
          </a>
        </p>
      </div>
    </main>
  )
}