'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'

type Report = {
  id: string
  club_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
}

type ClubInfo = {
  name: string
  status: string
}

type Filter = 'open' | 'resolved' | 'all'

function List() {
  const [reports, setReports] = useState<Report[]>([])
  const [clubs, setClubs] = useState<Record<string, ClubInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<Filter>('open')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: loadError } = await supabase
        .from('club_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

      setReports((data ?? []) as Report[])

      const { data: clubData } = await supabase
        .from('clubs')
        .select('id, name, status')

      const lookup: Record<string, ClubInfo> = {}

      ;(clubData ?? []).forEach((club) => {
        lookup[club.id] = { name: club.name, status: club.status }
      })

      setClubs(lookup)
      setLoading(false)
    }

    load()
  }, [])

  const counts = useMemo(
    () => ({
      open: reports.filter((report) => report.status === 'open').length,
      resolved: reports.filter((report) => report.status !== 'open').length,
      all: reports.length,
    }),
    [reports]
  )

  const shown = useMemo(
    () =>
      reports.filter((report) => {
        if (filter === 'open') return report.status === 'open'
        if (filter === 'resolved') return report.status !== 'open'
        return true
      }),
    [reports, filter]
  )

  async function toggleReport(report: Report) {
    setError('')
    setSuccess('')

    const next = report.status === 'open' ? 'resolved' : 'open'
    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('club_reports')
      .update({ status: next })
      .eq('id', report.id)
      .select('id')

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? 'The database did not allow this change.')
      return
    }

    setReports((current) =>
      current.map((item) =>
        item.id === report.id ? { ...item, status: next } : item
      )
    )

    setSuccess(next === 'resolved' ? 'Marked as resolved.' : 'Reopened.')
  }

  async function hideClub(clubId: string) {
    setError('')
    setSuccess('')

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('clubs')
      .update({ status: 'hidden' })
      .eq('id', clubId)
      .select('id')

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? 'The database did not allow this change.')
      return
    }

    setClubs((current) => ({
      ...current,
      [clubId]: { ...current[clubId], status: 'hidden' },
    }))

    setSuccess('The club is now hidden from the directory.')
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'open', label: 'Open', count: counts.open },
    { key: 'resolved', label: 'Resolved', count: counts.resolved },
    { key: 'all', label: 'All', count: counts.all },
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
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-stone-700">Loading reports...</p>}

        {!loading && shown.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
            <p className="text-stone-700">
              {filter === 'open'
                ? 'No open reports. All clear.'
                : 'No reports to show here.'}
            </p>
          </div>
        )}

        {shown.map((report) => {
          const club = clubs[report.club_id]

          return (
            <div
              key={report.id}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    {club ? club.name : 'A club that no longer exists'}
                  </h3>

                  <p className="text-sm text-stone-600">
                    Reported on{' '}
                    {new Date(report.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-sm font-medium',
                    report.status === 'open'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-lime-100 text-lime-800',
                  ].join(' ')}
                >
                  {report.status}
                </span>
              </div>

              <p className="mt-4 font-medium text-stone-900">{report.reason}</p>

              {report.details && (
                <p className="mt-2 rounded-2xl bg-stone-50 p-4 text-stone-800">
                  {report.details}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => toggleReport(report)}
                  className="rounded-full bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800"
                >
                  {report.status === 'open' ? 'Mark resolved' : 'Reopen'}
                </button>

                {club && (
                  <>
                    <a
                      href={`/admin/clubs/${report.club_id}`}
                      className="rounded-full border-2 border-teal-700 px-5 py-2 font-semibold text-teal-800 hover:bg-teal-50"
                    >
                      Open club
                    </a>

                    {club.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => hideClub(report.club_id)}
                        className="rounded-full border-2 border-coral-300 px-5 py-2 font-semibold text-coral-700 hover:bg-coral-50"
                      >
                        Hide club
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ReportsAdminPage() {
  return (
    <AdminShell
      title="Reports"
      subtitle="Concerns members have raised about clubs."
      crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }]}
    >
      <List />
    </AdminShell>
  )
}