'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'

type ProfileRow = {
  id: string
  display_name: string | null
  role: string
  created_at: string
}

type Filter = 'all' | 'members' | 'professionals' | 'admins'

function List() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [professionalIds, setProfessionalIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('id, display_name, role, created_at')
        .order('created_at', { ascending: false })

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

      setProfiles((data ?? []) as ProfileRow[])

      const { data: professionalData } = await supabase
        .from('professionals')
        .select('user_id')
        .not('user_id', 'is', null)

      setProfessionalIds(
        new Set((professionalData ?? []).map((row) => row.user_id as string))
      )

      setLoading(false)
    }

    load()
  }, [])

  const counts = useMemo(
    () => ({
      all: profiles.length,
      members: profiles.filter(
        (profile) =>
          profile.role !== 'admin' && !professionalIds.has(profile.id)
      ).length,
      professionals: profiles.filter((profile) =>
        professionalIds.has(profile.id)
      ).length,
      admins: profiles.filter((profile) => profile.role === 'admin').length,
    }),
    [profiles, professionalIds]
  )

  const shown = useMemo(() => {
    const text = search.trim().toLowerCase()

    return profiles.filter((profile) => {
      const isAdmin = profile.role === 'admin'
      const isProfessional = professionalIds.has(profile.id)

      if (filter === 'admins' && !isAdmin) return false
      if (filter === 'professionals' && !isProfessional) return false
      if (filter === 'members' && (isAdmin || isProfessional)) return false

      if (text && !(profile.display_name ?? 'member').toLowerCase().includes(text)) {
        return false
      }

      return true
    })
  }, [profiles, professionalIds, filter, search])

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Everyone' },
    { key: 'members', label: 'Members' },
    { key: 'professionals', label: 'Professionals' },
    { key: 'admins', label: 'Admins' },
  ]

  return (
    <div>
      {error && (
        <div className="mb-4">
          <Notice kind="error">{error}</Notice>
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
            {tab.label} ({counts[tab.key]})
          </button>
        ))}

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name"
          aria-label="Search members"
          className="min-w-[200px] flex-1 rounded-full border-2 border-stone-300 bg-white px-4 py-2 text-stone-900 outline-none focus:border-teal-600"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
        {loading && <p className="p-6 text-stone-700">Loading members...</p>}

        {!loading && shown.length === 0 && (
          <p className="p-6 text-stone-700">No one matches that.</p>
        )}

        <ul className="divide-y divide-stone-200">
          {shown.map((profile) => {
            const isAdmin = profile.role === 'admin'
            const isProfessional = professionalIds.has(profile.id)

            return (
              <li
                key={profile.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                  {(profile.display_name ?? 'M')[0].toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-900">
                    {profile.display_name || 'Member'}
                  </p>

                  <p className="text-sm text-stone-600">
                    Joined{' '}
                    {new Date(profile.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {isAdmin && (
                  <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-semibold text-coral-800">
                    Admin
                  </span>
                )}

                {isProfessional && (
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800">
                    Professional
                  </span>
                )}

                {!isAdmin && !isProfessional && (
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    Member
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mt-4 text-sm text-stone-600">
        Email addresses are private and live in Supabase under Authentication.
        To change someone&apos;s role, use the SQL editor.
      </p>
    </div>
  )
}

export default function MembersAdminPage() {
  return (
    <AdminShell
      title="Members"
      subtitle="Everyone who has joined Zentribe."
      crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Members' }]}
    >
      <List />
    </AdminShell>
  )
}