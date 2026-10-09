'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AuthInfo = {
  loading: boolean
  signedIn: boolean
  userId: string | null
  email: string | null
  displayName: string
  firstName: string
  isProfessional: boolean
  isAdmin: boolean
}

const signedOut: AuthInfo = {
  loading: false,
  signedIn: false,
  userId: null,
  email: null,
  displayName: '',
  firstName: '',
  isProfessional: false,
  isAdmin: false,
}

export function useAuth(): AuthInfo {
  const [info, setInfo] = useState<AuthInfo>({ ...signedOut, loading: true })

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load(userId: string | null, email: string | null) {
      if (!userId) {
        if (active) setInfo(signedOut)
        return
      }

      const [profileResult, professionalResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name, role')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('professionals')
          .select('full_name')
          .eq('user_id', userId)
          .maybeSingle(),
      ])

      const profile = profileResult.data
      const professional = professionalResult.data

      const fromProfile =
        profile?.display_name && profile.display_name !== 'Member'
          ? profile.display_name
          : ''

      const name =
        professional?.full_name ||
        fromProfile ||
        (email ? email.split('@')[0] : '')

      if (!active) return

      setInfo({
        loading: false,
        signedIn: true,
        userId,
        email,
        displayName: name,
        firstName: name.replace(/^dr\.?\s+/i, '').split(' ')[0],
        isProfessional: !!professional,
        isAdmin: profile?.role === 'admin',
      })
    }

    supabase.auth.getSession().then(({ data }) => {
      load(data.session?.user.id ?? null, data.session?.user.email ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(() => {
          load(session?.user.id ?? null, session?.user.email ?? null)
        }, 0)
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return info
}