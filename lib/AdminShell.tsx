'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LineIcon } from '@/lib/ui'
import type { IconName } from '@/lib/ui'

export type Crumb = {
  label: string
  href?: string
}

export function Notice({
  kind,
  children,
}: {
  kind: 'error' | 'success'
  children: ReactNode
}) {
  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3 text-sm font-medium',
        kind === 'error'
          ? 'border-coral-200 bg-coral-50 text-coral-800'
          : 'border-lime-200 bg-lime-50 text-lime-800',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200">
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>

      {hint && <p className="mt-1 text-sm text-stone-600">{hint}</p>}

      <div className="mt-5">{children}</div>
    </section>
  )
}

type NavItem = {
  href: string
  label: string
  icon: IconName
  badgeKey?: string
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: 'list' },
  {
    href: '/admin/professionals',
    label: 'Professionals',
    icon: 'user',
    badgeKey: 'awaiting_professionals',
  },
  {
    href: '/admin/clubs',
    label: 'Clubs',
    icon: 'users',
    badgeKey: 'unlisted_clubs',
  },
  {
    href: '/admin/requests',
    label: 'Session requests',
    icon: 'calendar',
    badgeKey: 'requests_pending',
  },
  { href: '/admin/members', label: 'Members', icon: 'heart' },
  {
    href: '/admin/reports',
    label: 'Reports',
    icon: 'shield',
    badgeKey: 'open_reports',
  },
]

export function AdminShell({
  title,
  subtitle,
  crumbs,
  actions,
  wide,
  children,
}: {
  title: string
  subtitle?: string
  crumbs?: Crumb[]
  actions?: ReactNode
  wide?: boolean
  children: ReactNode
}) {
  const pathname = usePathname() ?? ''
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>(
    'loading'
  )
  const [badges, setBadges] = useState<Record<string, number>>({})
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function check() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role !== 'admin') {
        setState('denied')
        return
      }

      setState('allowed')

      const { data: stats } = await supabase.rpc('admin_stats')

      if (stats && typeof stats === 'object') {
        setBadges(stats as Record<string, number>)
      }
    }

    check()
  }, [])

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-800">Loading...</p>
      </main>
    )
  }

  if (state === 'denied') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-stone-900">Access denied</h1>

          <p className="mt-3 text-stone-700">
            You do not have permission to use the admin area.
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-full bg-teal-700 px-6 py-3 font-semibold text-white"
          >
            Back to home
          </a>
        </div>
      </main>
    )
  }

  const brand = (
    <a href="/admin" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-bold text-white">
        Z
      </span>

      <span>
        <span className="block text-lg font-bold leading-tight text-white">
          Zentribe
        </span>

        <span className="block text-xs tracking-widest text-white/70">
          ADMIN
        </span>
      </span>
    </a>
  )

  const nav = (
    <nav className="mt-8 space-y-1">
      {navItems.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        const badge = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0

        return (
          <a
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300',
              active
                ? 'bg-white/15 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            <LineIcon name={item.icon} className="h-5 w-5" />

            <span className="flex-1">{item.label}</span>

            {badge > 0 && (
              <span className="rounded-full bg-coral-500 px-2 py-0.5 text-xs font-bold text-white">
                {badge}
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )

  const bottom = (
    <div className="mt-8 space-y-1 border-t border-white/15 pt-5 text-sm">
      <a
        href="/"
        className="block rounded-xl px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white"
      >
        View the live site
      </a>

      <a
        href="/dashboard"
        className="block rounded-xl px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white"
      >
        My dashboard
      </a>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 md:flex">
      <aside className="hidden w-64 shrink-0 bg-teal-900 p-5 md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
        {brand}
        {nav}
        {bottom}
      </aside>

      <div className="flex items-center justify-between bg-teal-900 px-5 py-3 md:hidden">
        {brand}

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-semibold text-white"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {menuOpen && (
        <div className="bg-teal-900 px-5 pb-5 md:hidden">
          {nav}
          {bottom}
        </div>
      )}

      <main className="min-w-0 flex-1 px-6 py-8">
        <div className={['mx-auto', wide ? 'max-w-6xl' : 'max-w-5xl'].join(' ')}>
          {crumbs && crumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex flex-wrap items-center gap-2 text-sm text-stone-600"
            >
              {crumbs.map((crumb, index) => (
                <span key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true">&rsaquo;</span>}

                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="font-medium text-stone-900">
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-stone-900">{title}</h1>

              {subtitle && <p className="mt-1 text-stone-700">{subtitle}</p>}
            </div>

            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}