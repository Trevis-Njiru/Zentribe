'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'

type RequestRow = {
  id: string
  user_id: string
  professional_id: string
  status: string
  note: string | null
  created_at: string
  session_date: string | null
  session_time: string | null
  session_format: string | null
  session_location: string | null
}

type Filter = 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled'

const statuses = ['pending', 'accepted', 'declined', 'cancelled']

function statusClass(status: string) {
  if (status === 'accepted') return 'bg-lime-100 text-lime-800'
  if (status === 'declined') return 'bg-coral-100 text-coral-800'
  if (status === 'cancelled') return 'bg-stone-100 text-stone-700'
  return 'bg-amber-100 text-amber-800'
}

function List() {
  const [rows, setRows] = useState<RequestRow[]>([])
  const [members, setMembers] = useState<Record<string, string>>({})
  const [professionals, setProfessionals] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: loadError } = await supabase
        .from('session_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

      setRows((data ?? []) as RequestRow[])

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name')

      const memberLookup: Record<string, string> = {}

      ;(profileData ?? []).forEach((profile) => {
        memberLookup[profile.id] = profile.display_name || 'Member'
      })

      setMembers(memberLookup)

      const { data: professionalData } = await supabase
        .from('professionals')
        .select('id, full_name')

      const professionalLookup: Record<string, string> = {}

      ;(professionalData ?? []).forEach((professional) => {
        professionalLookup[professional.id] = professional.full_name
      })

      setProfessionals(professionalLookup)
      setLoading(false)
    }

    load()
  }, [])

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: rows.length }

    statuses.forEach((status) => {
      result[status] = rows.filter((row) => row.status === status).length
    })

    return result
  }, [rows])

  const shown = useMemo(() => {
    const text = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false

      if (text) {
        const haystack = [
          members[row.user_id] ?? '',
          professionals[row.professional_id] ?? '',
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(text)) return false
      }

      return true
    })
  }, [rows, filter, search, members, professionals])

  async function changeStatus(row: RequestRow, status: string) {
    setError('')
    setSuccess('')

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('session_requests')
      .update({ status })
      .eq('id', row.id)
      .select('id')

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? 'The database did not allow this change.')
      return
    }

    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, status } : item))
    )

    setSuccess('Request updated.')
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'declined', label: 'Declined' },
    { key: 'cancelled', label: 'Cancelled' },
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
            {tab.label} ({counts[tab.key] ?? 0})
          </button>
        ))}

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by member or professional"
          aria-label="Search requests"
          className="min-w-[240px] flex-1 rounded-full border-2 border-stone-300 bg-white px-4 py-2 text-stone-900 outline-none focus:border-teal-600"
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-stone-700">Loading requests...</p>}

        {!loading && shown.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
            <p className="text-stone-700">No requests match that.</p>
          </div>
        )}

        {shown.map((row) => (
          <div
            key={row.id}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-stone-900">
                  {members[row.user_id] ?? 'Member'}{' '}
                  <span className="font-normal text-stone-600">
                    with {professionals[row.professional_id] ?? 'a professional'}
                  </span>
                </p>

                <p className="text-sm text-stone-600">
                  Requested on{' '}
                  {new Date(row.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <span
                className={[
                  'rounded-full px-3 py-1 text-sm font-medium',
                  statusClass(row.status),
                ].join(' ')}
              >
                {row.status}
              </span>
            </div>

            {row.note && (
              <p className="mt-3 rounded-2xl bg-stone-50 p-3 text-stone-800">
                {row.note}
              </p>
            )}

            {(row.session_date || row.session_time) && (
              <p className="mt-3 text-sm text-stone-700">
                Session: {row.session_date ?? 'date not set'}
                {row.session_time ? ` at ${row.session_time}` : ''}
                {row.session_format ? `, ${row.session_format}` : ''}
                {row.session_location ? `, ${row.session_location}` : ''}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-stone-900">
                Change status
              </label>

              <select
                value={row.status}
                onChange={(event) => changeStatus(row, event.target.value)}
                className="rounded-full border-2 border-stone-300 bg-white px-4 py-1.5 text-sm text-stone-900 outline-none focus:border-teal-600"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RequestsAdminPage() {
  return (
    <AdminShell
      title="Session requests"
      subtitle="Every request between members and professionals."
      crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Session requests' }]}
    >
      <List />
    </AdminShell>
  )
}