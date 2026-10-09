'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'
import { Avatar, VerifiedBadge } from '@/lib/ui'
import { isVerified } from '@/lib/matching'
import type { Professional } from '@/lib/matching'

type Filter = 'all' | 'pending' | 'approved'

function List() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: loadError } = await supabase
        .from('professionals')
        .select('*')
        .order('full_name')

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

      setProfessionals((data ?? []) as Professional[])
      setLoading(false)
    }

    load()
  }, [])

  const counts = useMemo(
    () => ({
      all: professionals.length,
      pending: professionals.filter((p) => p.verification_status !== 'approved')
        .length,
      approved: professionals.filter((p) => p.verification_status === 'approved')
        .length,
    }),
    [professionals]
  )

  const shown = useMemo(() => {
    const text = search.trim().toLowerCase()

    return professionals.filter((p) => {
      if (filter === 'pending' && p.verification_status === 'approved') {
        return false
      }

      if (filter === 'approved' && p.verification_status !== 'approved') {
        return false
      }

      if (text) {
        const haystack = [
          p.full_name,
          p.professional_type ?? '',
          p.location ?? '',
          ...(p.specializations ?? []),
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(text)) return false
      }

      return true
    })
  }, [professionals, filter, search])

  async function toggleApproval(professional: Professional) {
    setError('')
    setSuccess('')

    const newStatus =
      professional.verification_status === 'approved' ? 'pending' : 'approved'

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('professionals')
      .update({ verification_status: newStatus })
      .eq('id', professional.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setProfessionals((current) =>
      current.map((item) =>
        item.id === professional.id
          ? { ...item, verification_status: newStatus }
          : item
      )
    )

    setSuccess(
      newStatus === 'approved'
        ? `${professional.full_name} is now listed for members.`
        : `${professional.full_name} was moved back to awaiting approval.`
    )
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Awaiting approval', count: counts.pending },
    { key: 'approved', label: 'Listed', count: counts.approved },
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
          placeholder="Search by name, type, county or expertise"
          aria-label="Search professionals"
          className="min-w-[240px] flex-1 rounded-full border-2 border-stone-300 bg-white px-4 py-2 text-stone-900 outline-none focus:border-teal-600"
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-stone-700">Loading professionals...</p>}

        {!loading && shown.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
            <p className="text-stone-700">
              No professionals match that. Try another filter or search.
            </p>
          </div>
        )}

        {shown.map((professional) => (
          <div
            key={professional.id}
            className="flex flex-wrap items-start gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
          >
            <Avatar
              name={professional.full_name}
              photoUrl={professional.photo_url}
              className="h-28 w-24 shrink-0 rounded-2xl text-[10px]"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">
                  {professional.full_name}
                </h3>

                {isVerified(professional) && <VerifiedBadge />}
              </div>

              <p className="text-stone-700">{professional.professional_type}</p>

              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span
                  className={[
                    'rounded-full px-3 py-0.5 font-medium',
                    professional.verification_status === 'approved'
                      ? 'bg-lime-100 text-lime-800'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}
                >
                  {professional.verification_status === 'approved'
                    ? 'Listed'
                    : 'Awaiting approval'}
                </span>

                <span className="rounded-full bg-stone-100 px-3 py-0.5 text-stone-700">
                  {isVerified(professional) ? 'Verified' : 'Not verified'}
                </span>
              </div>

              <p className="mt-2 text-sm text-stone-600">
                Care: {(professional.care_types ?? []).join(', ') || 'None'}
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Expertise:{' '}
                {(professional.specializations ?? []).join(', ') || 'None'}
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Location: {professional.location || 'Not provided'}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`/admin/professionals/${professional.id}`}
                  className="rounded-full border-2 border-teal-700 px-5 py-2 font-semibold text-teal-800 hover:bg-teal-50"
                >
                  Edit
                </a>

                <button
                  type="button"
                  onClick={() => toggleApproval(professional)}
                  className="rounded-full bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800"
                >
                  {professional.verification_status === 'approved'
                    ? 'Move to awaiting approval'
                    : 'Approve'}
                </button>

                <a
                  href={`/therapist/${professional.id}`}
                  className="rounded-full border-2 border-stone-300 px-5 py-2 font-semibold text-stone-800 hover:bg-stone-100"
                >
                  Preview profile
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfessionalsAdminPage() {
  return (
    <AdminShell
      title="Professionals"
      subtitle="Everyone who can be matched with members."
      crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Professionals' }]}
      actions={
        <a
          href="/admin/professionals/new"
          className="rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Add professional
        </a>
      }
    >
      <List />
    </AdminShell>
  )
}