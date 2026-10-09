'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const linkClass = 'text-sm font-medium text-stone-800 hover:text-teal-700'

const ghostButton = [
'rounded-full',
'border',
'border-teal-700',
'px-5',
'py-2',
'text-sm',
'font-semibold',
'text-teal-800',
'hover:bg-teal-50',
].join(' ')

const solidButton = [
'rounded-full',
'bg-teal-700',
'px-5',
'py-2',
'text-sm',
'font-semibold',
'text-white',
'hover:bg-teal-800',
].join(' ')

const professionalButton = [
'rounded-full',
'border',
'border-stone-400',
'px-5',
'py-2',
'text-sm',
'font-semibold',
'text-stone-800',
'hover:bg-stone-100',
].join(' ')

export default function Navbar() {
const [loggedIn, setLoggedIn] = useState(false)
const [isProfessional, setIsProfessional] = useState(false)
const [open, setOpen] = useState(false)

useEffect(() => {
const supabase = createClient()

```
async function checkAccount() {
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    setLoggedIn(false)
    setIsProfessional(false)
    return
  }

  setLoggedIn(true)

  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', data.session.user.id)
    .maybeSingle()

  setIsProfessional(!!professional)
}

checkAccount()
```

}, [])

async function handleLogout() {
const supabase = createClient()

```
try {
  await Promise.race([
    supabase.auth.signOut({ scope: 'local' }),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ])
} catch {
  // Ignore logout errors and clear the saved login below.
}

document.cookie.split(';').forEach((c) => {
  const name = c.trim().split('=')[0]

  if (name.startsWith('sb-')) {
    document.cookie =
      name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }
})

window.location.href = '/login'
```

}

const links = (
<> <a href="/" className={linkClass}>
Home </a>

```
  <a href="/onboarding" className={linkClass}>
    Find support
  </a>

  <a href="/crisis" className={linkClass}>
    Crisis help
  </a>

  {loggedIn ? (
    <>
      {isProfessional ? (
        <a href="/professional" className={ghostButton}>
          Professional Dashboard
        </a>
      ) : (
        <a href="/dashboard" className={ghostButton}>
          My account
        </a>
      )}

      <button onClick={handleLogout} className={solidButton}>
        Log out
      </button>
    </>
  ) : (
    <>
      <a href="/login" className={ghostButton}>
        Member Login
      </a>

      <a href="/professional/login" className={professionalButton}>
        Professional Login
      </a>

      <a href="/signup" className={solidButton}>
        Join Zentribe
      </a>
    </>
  )}
</>
```

)

return ( <header className="border-b border-stone-200 bg-white"> <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"> <a href="/" className="text-2xl font-bold text-teal-800">
Zentribe </a>

```
    <nav className="hidden items-center gap-4 md:flex">
      {links}
    </nav>

    <button
      onClick={() => setOpen(!open)}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm text-black md:hidden"
    >
      {open ? 'Close' : 'Menu'}
    </button>
  </div>

  {open && (
    <nav className="flex flex-col items-start gap-4 px-6 pb-6 md:hidden">
      {links}
    </nav>
  )}
</header>
```

)
}
