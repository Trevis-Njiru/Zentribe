'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'
import { VerifiedBadge } from '@/lib/ui'
import { ClubCover, categoryOf, isClubVerified } from '@/lib/clubs'
import type { Club } from '@/lib/clubs'

type Filter = 'all' | 'listed' | 'unlisted'

function List() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [clicks, setClicks] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: loadError } = await supabase
        .from('clubs')
        .select('*')
        .order('name')

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

      setClubs((data ?? []) as Club[])

      const { data: clickData } = await supabase
        .from('club_join_clicks')
        .select('club_id')

      const counts: Record<string, number> = {}

      ;(clickData ?? []).forEach((row) => {
        counts[row.club_id] = (counts[row.club_id] ?? 0) + 1
      })

      setClicks(counts)
      setLoading(false)
    }

    load()
  }, [])

  const counts = useMemo(
    () => ({
      all: clubs.length,
      listed: clubs.filter((club) => club.status === 'approved').length,
      unlisted: clubs.filter((club) => club.status !== 'approved').length,
    }),
    [clubs]
  )

  const shown = useMemo(() => {
    const text = search.trim().toLowerCase()

    return clubs.filter((club) => {
      if (filter === 'listed' && club.status !== 'approved') return false
      if (filter === 'unlisted' && club.status === 'approved') return false

      if (text) {
        const haystack = [
          club.name,
          club.county ?? '',
          club.area ?? '',
          categoryOf(club.category).label,
          ...(club.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(text)) return false
      }

      return true
    })
  }, [clubs, filter, search])

  async function toggleStatus(club: Club) {
    setError('')
    setSuccess('')

    const newStatus = club.status === 'approved' ? 'hidden' : 'approved'
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('clubs')
      .update({ status: newStatus })
      .eq('id', club.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setClubs((current) =>
      current.map((item) =>
        item.id === club.id ? { ...item, status: newStatus } : item
      )
    )

    setSuccess(
      newStatus === 'approved'
        ? `${club.name} is now listed.`
        : `${club.name} is now hidden.`
    )
  }

  async function deleteClub(club: Club) {
    if (!window.confirm(`Delete ${club.name}? This cannot be undone.`)) return

    setError('')
    setSuccess('')

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('clubs')
      .delete()
      .eq('id', club.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setClubs((current) => current.filter((item) => item.id !== club.id))
    setSuccess(`${club.name} was deleted.`)
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'listed', label: 'Listed', count: counts.listed },
    { key: 'unlisted', label: 'Hidden or pending', count: counts.unlisted },
  ]

  return (
    <div>
      {error && (
        <div className="mb-4">
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Notice kind="success">{success}</Notice>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            aria-pressed={filter === tab.key}
            className={[
              'rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300',
              filter === tab.key
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-stone-300 bg-white text-stone-800 hover:border-teal-400',
            ].join(' ')}
          >
            {tab.label} ({tab.count})
          </button>
        ))}

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, county, category or tag"
          aria-label="Search clubs"
          className="min-w-[240px] flex-1 rounded-full border-2 border-stone-300 bg-white px-4 py-2 text-stone-900 outline-none focus:border-teal-600"
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-stone-700">Loading clubs...</p>}

        {!loading && shown.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
            <p className="text-stone-700">
              No clubs match that. Try another filter or search.
            </p>
          </div>
        )}

        {shown.map((club) => (
          <div
            key={club.id}
            className="flex flex-wrap items-start gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
          >
            <ClubCover
              category={club.category}
              coverUrl={club.cover_url}
              className="h-24 w-40 shrink-0 rounded-2xl"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">
                  {club.name}
                </h3>

                {isClubVerified(club) && <VerifiedBadge />}
              </div>

              <p className="text-sm text-stone-700">
                {categoryOf(club.category).label} in{' '}
                {club.county ?? 'an unshared location'}
              </p>

              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span
                  className={[
                    'rounded-full px-3 py-0.5 font-medium',
                    club.status === 'approved'
                      ? 'bg-lime-100 text-lime-800'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}
                >
                  {club.status}
                </span>

                <span className="rounded-full bg-stone-100 px-3 py-0.5 text-stone-700">
                  {clicks[club.id] ?? 0} joins via Zentribe
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`/admin/clubs/${club.id}`}
                  className="rounded-full border-2 border-teal-700 px-5 py-2 font-semibold text-teal-800 hover:bg-teal-50"
                >
                  Edit
                </a>

                <button
                  type="button"
                  onClick={() => toggleStatus(club)}
                  className="rounded-full bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800"
                >
                  {club.status === 'approved' ? 'Hide' : 'List'}
                </button>

                <a
                  href={`/clubs/${club.id}`}
                  className="rounded-full border-2 border-stone-300 px-5 py-2 font-semibold text-stone-800 hover:bg-stone-100"
                >
                  View page
                </a>

                <button
                  type="button"
                  onClick={() => deleteClub(club)}
                  className="rounded-full border-2 border-coral-300 px-5 py-2 font-semibold text-coral-700 hover:bg-coral-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ClubsAdminPage() {
  return (
    <AdminShell
      title="Clubs"
      subtitle="The independent clubs listed in your directory."
      crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Clubs' }]}
      actions={
        <a
          href="/admin/clubs/new"
          className="rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Add club
        </a>
      }
    >
      <List />
    </AdminShell>
  )
}