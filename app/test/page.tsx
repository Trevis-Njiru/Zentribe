'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? 'Error: ' + error.message : 'Connected to Supabase!')
    })
  }, [])

  return <main className="p-10 text-xl">{status}</main>
}