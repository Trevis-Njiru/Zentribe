'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice, Section } from '@/lib/AdminShell'

type Stats = Record<string, number>

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: number | null
  hint?: string
  href?: string
}) {
  const body = (
    <>
      <p className="text-xs font-semibold tracking-widest text-stone-500">
        {label}
      </p>

      <p className="mt-2 text-4xl font-bold text-stone-900">
        {value === null ? '-' : value}
      </p>

      {hint && <p className="mt-1 text-sm text-stone-600">{hint}</p>}
    </>
  )

  const className = 'block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200'

  if (href) {
    return (
      <a
        href={href}
        className={`${className} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
      >
        {body}
      </a>
    )
  }

  return <div className={className}>{body}</div>
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [topClubs, setTopClubs] = useState<{ name: string; count: number }[]>(
    []
  )

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: statsError } = await supabase.rpc('admin_stats')

      if (statsError) {
        setError(
          'The overview numbers are not set up yet. Run the SQL from the guide, then refresh. (' +
            statsError.message +
            ')'
        )
      } else {
        setStats(data as Stats)
      }

      const { data: clickData } = await supabase
        .from('club_join_clicks')
        .select('club_id')

      const counts: Record<string, number> = {}

      ;(clickData ?? []).forEach((row) => {
        counts[row.club_id] = (counts[row.club_id] ?? 0) + 1
      })

      const ids = Object.keys(counts)

      if (ids.length > 0) {
        const { data: clubData } = await supabase
          .from('clubs')
          .select('id, name')
          .in('id', ids)

        setTopClubs(
          (clubData ?? [])
            .map((club) => ({ name: club.name, count: counts[club.id] ?? 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        )
      }
    }

    load()
  }, [])

  const value = (key: string) => (stats ? stats[key] ?? 0 : null)

  const attention = [
    {
      label: 'Professionals awaiting approval',
      count: stats?.awaiting_professionals ?? 0,
      href: '/admin/professionals',
    },
    {
      label: 'Session requests waiting for a reply',
      count: stats?.requests_pending ?? 0,
      href: '/admin/requests',
    },
    {
      label: 'Open reports about clubs',
      count: stats?.open_reports ?? 0,
      href: '/admin/reports',
    },
    {
      label: 'Clubs that are hidden or pending',
      count: stats?.unlisted_clubs ?? 0,
      href: '/admin/clubs',
    },
  ].filter((item) => item.count > 0)

  return (
    <div className="space-y-8">
      {error && <Notice kind="error">{error}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="MEMBERS"
          value={value('members')}
          hint={stats ? `${stats.new_members_7d} joined this week` : undefined}
          href="/admin/members"
        />

        <StatCard
          label="COMPLETED MATCHING"
          value={value('completed_matching')}
          hint="Members who answered the questions"
        />

        <StatCard
          label="PROFESSIONALS"
          value={value('professionals')}
          hint={
            stats && stats.awaiting_professionals > 0
              ? `${stats.awaiting_professionals} awaiting approval`
              : 'All approved'
          }
          href="/admin/professionals"
        />

        <StatCard
          label="SESSION REQUESTS"
          value={value('requests_total')}
          hint={
            stats
              ? `${stats.requests_pending} pending, ${stats.requests_accepted} accepted`
              : undefined
          }
          href="/admin/requests"
        />

        <StatCard
          label="CLUBS"
          value={value('clubs')}
          hint={
            stats && stats.unlisted_clubs > 0
              ? `${stats.unlisted_clubs} hidden or pending`
              : 'All listed'
          }
          href="/admin/clubs"
        />

        <StatCard
          label="CLUB JOINS"
          value={value('join_clicks')}
          hint={stats ? `${stats.join_clicks_7d} this week` : undefined}
        />

        <StatCard
          label="OPEN REPORTS"
          value={value('open_reports')}
          hint={
            stats && stats.open_reports > 0 ? 'Needs a look' : 'All clear'
          }
          href="/admin/reports"
        />

        <StatCard
          label="NEW MEMBERS"
          value={value('new_members_7d')}
          hint="In the last 7 days"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Needs your attention">
          {attention.length === 0 ? (
            <p className="text-stone-700">Nothing needs your attention. All clear.</p>
          ) : (
            <ul className="space-y-3">
              {attention.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-stone-900 transition-all duration-300 hover:bg-teal-50"
                  >
                    <span className="font-medium">{item.label}</span>

                    <span className="rounded-full bg-coral-500 px-3 py-0.5 text-sm font-bold text-white">
                      {item.count}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Quick actions">
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/professionals/new"
              className="rounded-full bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800"
            >
              Add professional
            </a>

            <a
              href="/admin/clubs/new"
              className="rounded-full bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800"
            >
              Add club
            </a>

            <a
              href="/admin/requests"
              className="rounded-full border-2 border-teal-700 px-5 py-2.5 font-semibold text-teal-800 hover:bg-teal-50"
            >
              Review requests
            </a>

            <a
              href="/admin/reports"
              className="rounded-full border-2 border-teal-700 px-5 py-2.5 font-semibold text-teal-800 hover:bg-teal-50"
            >
              Review reports
            </a>
          </div>
        </Section>
      </div>

      <Section
        title="Most joined clubs"
        hint="Clicks on the join button, since the start."
      >
        {topClubs.length === 0 ? (
          <p className="text-stone-700">
            No one has joined a club through Zentribe yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {topClubs.map((club, index) => (
              <li
                key={club.name}
                className="flex items-center gap-4 rounded-2xl bg-stone-50 px-4 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                  {index + 1}
                </span>

                <span className="flex-1 font-medium text-stone-900">
                  {club.name}
                </span>

                <span className="text-stone-700">{club.count} joins</span>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <AdminShell
      wide
      title="Overview"
      subtitle="How Zentribe is doing, and what needs you."
    >
      <Overview />
    </AdminShell>
  )
}