'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { primaryButton } from '@/lib/styles'

const secondaryButton = [
  'rounded-full',
  'border',
  'border-teal-700',
  'px-6',
  'py-3',
  'font-semibold',
  'text-teal-800',
  'hover:bg-teal-50',
].join(' ')

export default function DashboardPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isProfessional, setIsProfessional] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadDashboard() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .maybeSingle()

      const { data: professional } = await supabase
        .from('professionals')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle()

      setEmail(user.email ?? '')

      if (professional?.full_name) {
        setName(professional.full_name)
      } else if (profile?.display_name && profile.display_name !== 'Member') {
        setName(profile.display_name)
      }

      setIsAdmin(profile?.role === 'admin')
      setIsProfessional(!!professional)
      setChecking(false)
    }

    loadDashboard()
  }, [])

  async function handleLogout() {
    const supabase = createClient()

    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ])
    } catch {
      // ignore, we clear the saved login below anyway
    }

    document.cookie.split(';').forEach((c) => {
      const cookieName = c.trim().split('=')[0]

      if (cookieName.startsWith('sb-')) {
        document.cookie =
          cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      }
    })

    window.location.href = '/login'
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-black">Loading...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-teal-800">
          {name ? `Welcome, ${name}` : 'Welcome to Zentribe'}
        </h1>

        <p className="mt-3 text-black">You are logged in as {email}</p>

        <p className="mt-2 text-stone-700">
          {isProfessional
            ? 'Manage your details and your session requests from your professional dashboard.'
            : 'Check on your session requests or find professional support that fits you.'}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          {isProfessional ? (
            <button
              onClick={() => (window.location.href = '/professional')}
              className={primaryButton}
            >
              Professional dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => (window.location.href = '/requests')}
                className={primaryButton}
              >
                My session requests
              </button>

              <button
                onClick={() => (window.location.href = '/matches')}
                className={secondaryButton}
              >
                Find my match
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => (window.location.href = '/admin')}
              className={secondaryButton}
            >
              Admin dashboard
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-sm text-stone-700 underline"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  )
}