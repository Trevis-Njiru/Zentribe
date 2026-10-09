'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lines, setLines] = useState<string[]>([])

  function cookieNames() {
    return document.cookie
      .split(';')
      .map((c) => c.trim().split('=')[0])
      .filter((n) => n.includes('auth-token'))
  }

  async function runTest() {
    const out: string[] = []
    const show = () => setLines([...out])
    out.push('Cookies before login: ' + JSON.stringify(cookieNames()))
    show()

    const supabase = createClient()
    const started = Date.now()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    out.push('Login took ' + (Date.now() - started) + ' ms')
    out.push('Login error: ' + (error ? error.message : 'none'))
    out.push('Login returned a session: ' + !!data.session)
    show()

    const s = await supabase.auth.getSession()
    out.push('getSession right after: logged in = ' + !!s.data.session)
    out.push('Cookies after login: ' + JSON.stringify(cookieNames()))
    out.push('Now click "Open dashboard" below.')
    show()
  }

  const box = {
    display: 'block',
    marginTop: 10,
    padding: 10,
    width: 300,
    border: '1px solid #999',
    color: 'black',
    background: 'white',
  } as const

  return (
    <main style={{ padding: 24, color: 'black', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Zentribe login test</h1>
      <input style={box} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={box} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button style={{ ...box, background: '#0f766e', color: 'white', cursor: 'pointer' }} onClick={runTest}>
        Run login test
      </button>
      <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 15 }}>{lines.join('\n')}</pre>
      <a href="/dashboard" style={{ display: 'inline-block', marginTop: 16, color: '#0f766e', textDecoration: 'underline' }}>
        Open dashboard
      </a>
    </main>
  )
}