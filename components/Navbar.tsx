'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/useAuth'
import {
  ghostButtonSm,
  neutralButtonSm,
  primaryButtonSm,
} from '@/lib/styles'

const authPages = ['/login', '/signup', '/professional/login']

const siteLinks = [
  { href: '/', label: 'Home' },
  { href: '/support', label: 'Find support' },
  { href: '/community', label: 'Community' },
]

// Crisis help is never hidden behind a menu, at any screen size.
const crisisPill =
  'zt-press inline-flex min-h-11 items-center gap-2 rounded-full bg-coral-50 px-4 text-sm font-semibold text-coral-800 ring-1 ring-coral-200 hover:bg-coral-100'

function initialsOf(name: string) {
  const words = name
    .replace(/^dr\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Navbar() {
  const auth = useAuth()
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const accountRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)

  const closeAll = useCallback(() => {
    setOpen(false)
    setMenuOpen(false)
  }, [])

  // Signed-in people never need the login pages.
  useEffect(() => {
    if (!auth.loading && auth.signedIn && authPages.includes(pathname)) {
      window.location.replace(
        auth.isProfessional ? '/professional' : '/dashboard'
      )
    }
  }, [auth.loading, auth.signedIn, auth.isProfessional, pathname])

  // Scroll-edge effect: the hairline only appears once content passes under.
  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      setScrolled(window.scrollY > 4)
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Escape closes; a press outside closes. Only listens while something is open.
  useEffect(() => {
    if (!open && !menuOpen) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAll()
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node

      // The toggle buttons handle their own open/close; don't fight them.
      if (target instanceof Element && target.closest('[data-menu-toggle]')) {
        return
      }

      const insideAccount = accountRef.current?.contains(target)
      const insideMobile = mobileRef.current?.contains(target)
      if (!insideAccount && !insideMobile) closeAll()
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, menuOpen, closeAll])

  // Lock page scroll behind the mobile sheet.
  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

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

  const desktopLinkClass =
    'zt-press rounded-full px-3.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-900/5 hover:text-stone-900 aria-[current=page]:bg-teal-700/10 aria-[current=page]:text-teal-800'

  const signedOutButtons = (
    <>
      <Link href="/login" onClick={closeAll} className={ghostButtonSm}>
        Member Login
      </Link>

      <Link
        href="/professional/login"
        onClick={closeAll}
        className={neutralButtonSm}
      >
        Professional Login
      </Link>

      <Link href="/signup" onClick={closeAll} className={primaryButtonSm}>
        Join Zentribe
      </Link>
    </>
  )

  const accountMenu = (
    <div ref={accountRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-controls="account-menu"
        data-menu-toggle
        className="zt-press flex min-h-11 items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-4 text-sm font-semibold text-stone-800 ring-1 ring-stone-300/80 hover:bg-white"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
          {initialsOf(auth.displayName)}
        </span>

        <span className="max-w-[150px] truncate">
          {auth.displayName || 'My account'}
        </span>
      </button>

      <div
        id="account-menu"
        role="menu"
        data-open={menuOpen}
        inert={!menuOpen}
        className="zt-sheet zt-glass-thick absolute right-0 top-full z-40 mt-2 w-64 rounded-3xl p-2"
      >
        <p className="px-3 pt-2 text-xs text-stone-500">Signed in as</p>

        <p className="truncate px-3 pb-2 text-sm font-semibold text-stone-900">
          {auth.displayName}
        </p>

        {accountLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            role="menuitem"
            onClick={closeAll}
            className="zt-press block rounded-2xl px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-900/5"
          >
            {link.label}
          </Link>
        ))}

        <button
          type="button"
          role="menuitem"
          onClick={handleLogout}
          className="zt-press mt-1 w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-coral-700 hover:bg-coral-50"
        >
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <header
        className="zt-header sticky top-0 z-50"
        data-scrolled={scrolled}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* The glass lives on its own layer so menus inside the header can
            still blur the page behind them (a blurred parent would block it). */}
        <div
          aria-hidden="true"
          className="zt-glass pointer-events-none absolute inset-0 -z-10"
        />
        <span aria-hidden="true" className="zt-header-edge" />

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5 md:px-6">
          <Link
            href="/"
            onClick={closeAll}
            className="zt-press rounded-full text-2xl font-bold tracking-[-0.03em] text-teal-800"
          >
            Zentribe
          </Link>

          {/* Desktop */}
          <nav
            aria-label="Main"
            className="hidden items-center gap-1 md:flex"
          >
            {siteLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? 'page' : undefined}
                className={desktopLinkClass}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/crisis"
              aria-current={pathname === '/crisis' ? 'page' : undefined}
              className={crisisPill + ' ml-2'}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-coral-500"
              />
              Crisis help
            </Link>

            <div className="ml-3 flex items-center gap-2">
              {auth.loading ? (
                <span className="h-11 w-40" />
              ) : auth.signedIn ? (
                accountMenu
              ) : (
                signedOutButtons
              )}
            </div>
          </nav>

          {/* Mobile: crisis help stays outside the menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/crisis" onClick={closeAll} className={crisisPill}>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-coral-500"
              />
              Crisis help
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              data-menu-toggle
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="zt-press flex h-11 w-11 items-center justify-center rounded-full bg-white/70 ring-1 ring-stone-300/80"
            >
              <span className="relative block h-3.5 w-5" aria-hidden="true">
                <span
                  className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-stone-800 transition-transform duration-[420ms]"
                  style={{
                    transitionTimingFunction: 'var(--zt-spring)',
                    transform: open
                      ? 'translateY(6px) rotate(45deg)'
                      : 'none',
                  }}
                />
                <span
                  className="absolute bottom-0 left-0 block h-0.5 w-5 rounded-full bg-stone-800 transition-transform duration-[420ms]"
                  style={{
                    transitionTimingFunction: 'var(--zt-spring)',
                    transform: open
                      ? 'translateY(-6px) rotate(-45deg)'
                      : 'none',
                  }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile sheet: grows from the button that opened it */}
        <div ref={mobileRef} className="md:hidden">
          <nav
            id="mobile-menu"
            aria-label="Menu"
            data-open={open}
            inert={!open}
            className="zt-sheet zt-glass-thick absolute inset-x-3 top-full z-40 mt-1 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl p-3"
          >
            <div className="flex flex-col">
              {siteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  aria-current={
                    isActive(pathname, link.href) ? 'page' : undefined
                  }
                  className="zt-press rounded-2xl px-4 py-3.5 text-base font-medium text-stone-800 hover:bg-stone-900/5 aria-[current=page]:bg-teal-700/10 aria-[current=page]:text-teal-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {!auth.loading && auth.signedIn && (
              <div className="mt-2 border-t border-stone-900/10 pt-3">
                <p className="px-4 text-xs text-stone-500">Signed in as</p>

                <p className="px-4 pb-1 text-sm font-semibold text-stone-900">
                  {auth.displayName}
                </p>

                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeAll}
                    className="zt-press block rounded-2xl px-4 py-3 text-base font-medium text-stone-800 hover:bg-stone-900/5"
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="zt-press w-full rounded-2xl px-4 py-3 text-left text-base font-semibold text-coral-700 hover:bg-coral-50"
                >
                  Log out
                </button>
              </div>
            )}

            {!auth.loading && !auth.signedIn && (
              <div className="mt-2 flex flex-col gap-2 border-t border-stone-900/10 pt-3">
                {signedOutButtons}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Dim to focus. Sits outside the header so position:fixed is relative to the screen. */}
      <div
        aria-hidden="true"
        data-open={open}
        onClick={closeAll}
        className="zt-scrim fixed inset-0 z-40 md:hidden"
      />
    </>
  )
}
