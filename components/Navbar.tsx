'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/useAuth'

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

const authPages = ['/login', '/signup', '/professional/login']

function initialsOf(name: string) {
  const words = name
    .replace(/^dr\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export default function Navbar() {
  const auth = useAuth()
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!auth.loading && auth.signedIn && authPages.includes(pathname)) {
      window.location.replace(
        auth.isProfessional ? '/professional' : '/dashboard'
      )
    }
  }, [auth.loading, auth.signedIn, auth.isProfessional, pathname])

  async function handleLogout() {
    const supabase = createClient()

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

    window.location.href = '/'
  }

  const accountLinks = [
    { href: '/dashboard', label: 'My dashboard' },
    ...(auth.isProfessional
      ? [{ href: '/professional', label: 'Professional dashboard' }]
      : [
          { href: '/requests', label: 'My session requests' },
          { href: '/matches', label: 'My matches' },
        ]),
    ...(auth.isAdmin ? [{ href: '/admin', label: 'Admin dashboard' }] : []),
  ]

  const siteLinks = (
    <>
      <a href="/" className={linkClass}>
        Home
      </a>

      <a href="/support" className={linkClass}>
        Find support
      </a>

      <a href="/community" className={linkClass}>
        Community
      </a>

      <a href="/crisis" className={linkClass}>
        Crisis help
      </a>
    </>
  )

  const signedOutButtons = (
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
  )

  const accountMenu = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        className="flex items-center gap-2 rounded-full border border-stone-300 bg-white py-1 pl-1 pr-4 text-sm font-semibold text-stone-800 hover:bg-stone-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
          {initialsOf(auth.displayName)}
        </span>

        <span className="max-w-[150px] truncate">
          {auth.displayName || 'My account'}
        </span>
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />

          <div className="absolute right-0 z-40 mt-2 w-60 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-stone-200">
            <p className="px-3 pt-1 text-xs text-stone-500">Signed in as</p>

            <p className="truncate px-3 pb-2 text-sm font-semibold text-stone-900">
              {auth.displayName}
            </p>

            {accountLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
              >
                {link.label}
              </a>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-coral-700 hover:bg-coral-50"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-2xl font-bold text-teal-800">
          Zentribe
        </a>

        <nav className="hidden items-center gap-5 md:flex">
          {siteLinks}

          {auth.loading ? (
            <span className="h-10 w-32" />
          ) : auth.signedIn ? (
            accountMenu
          ) : (
            signedOutButtons
          )}
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
          {siteLinks}

          {!auth.loading && auth.signedIn && (
            <div className="w-full border-t border-stone-200 pt-4">
              <p className="text-xs text-stone-500">Signed in as</p>

              <p className="text-sm font-semibold text-stone-900">
                {auth.displayName}
              </p>

              <div className="mt-3 flex flex-col items-start gap-3">
                {accountLinks.map((link) => (
                  <a key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-coral-700"
                >
                  Log out
                </button>
              </div>
            </div>
          )}

          {!auth.loading && !auth.signedIn && signedOutButtons}
        </nav>
      )}
    </header>
  )
}