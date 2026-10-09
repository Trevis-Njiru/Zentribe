'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputClass = [
  'w-full',
  'rounded-xl',
  'border',
  'border-stone-300',
  'bg-white',
  'px-4',
  'py-3',
  'text-black',
  'placeholder-stone-500',
  'focus:border-teal-700',
  'focus:outline-none',
].join(' ')

const buttonClass = [
  'mt-6',
  'w-full',
  'rounded-full',
  'bg-teal-700',
  'px-6',
  'py-3',
  'font-semibold',
  'text-white',
  'hover:bg-teal-800',
  'disabled:opacity-50',
].join(' ')

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setMessage('')

    if (!fullName.trim()) {
      setMessage('Please enter your full name.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Almost there! Check your email for a confirmation link.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-teal-800">Join Zentribe</h1>
        <p className="mt-2 text-stone-700">Create your account to get started.</p>

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass + ' mt-6'}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass + ' mt-4'}
        />
        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass + ' mt-4'}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className={buttonClass}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        {message && <p className="mt-4 text-sm text-black">{message}</p>}

        <p className="mt-6 text-center text-sm text-stone-700">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-teal-800">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}