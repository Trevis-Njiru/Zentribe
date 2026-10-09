'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lora } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ArrowIcon, Avatar, LineIcon } from '@/lib/ui'
import { primaryButton } from '@/lib/styles'

const serif = Lora({ subsets: ['latin'] })

type RequestRow = {
  id: string
  status: string
  created_at: string
  note: string | null
  professional: {
    id: string
    full_name: string
    professional_type: string | null
    photo_url: string | null
  } | null
}

const statusStyles: Record<string, { label: string; chip: string }> = {
  pending: { label: 'Waiting for a reply', chip: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Accepted', chip: 'bg-lime-100 text-lime-800' },
  completed: { label: 'Completed', chip: 'bg-teal-100 text-teal-800' },
  declined: { label: 'Declined', chip: 'bg-stone-200 text-stone-700' },
  rejected: { label: 'Declined', chip: 'bg-stone-200 text-stone-700' },
  cancelled: { label: 'Cancelled', chip: 'bg-stone-200 text-stone-700' },
}

function statusOf(status: string) {
  return (
    statusStyles[status] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      chip: 'bg-stone-200 text-stone-700',
    }
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function RequestCard({ request }: { request: RequestRow }) {
  const professional = request.professional
  const status = statusOf(request.status)

  const body = (
    <>
      <Avatar
        name={professional?.full_name ?? 'Professional'}
        photoUrl={professional?.photo_url}
        className="h-16 w-16 shrink-0 rounded-2xl"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-stone-900">
          {professional?.full_name ?? 'This professional is no longer listed'}
        </p>

        {professional?.professional_type && (
          <p className="truncate text-sm text-stone-600">
            {professional.professional_type}
          </p>
        )}

        <p className="mt-1 text-xs text-stone-500">
          Requested {formatDate(request.created_at)}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.chip}`}
      >
        {status.label}
      </span>
    </>
  )

  const shared =
    'zt-rise flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/70'

  return professional ? (
    <Link
      href={`/therapist/${professional.id}`}
      className={`${shared} zt-card-hover`}
    >
      {body}
    </Link>
  ) : (
    <div className={shared}>{body}</div>
  )
}

export default function RequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        window.location.replace('/login')
        return
      }

      // Professionals manage requests from their own dashboard.
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (professional) {
        window.location.replace('/professional')
        return
      }

      const { data: rows, error: loadError } = await supabase
        .from('session_requests')
        .select(
          'id, status, created_at, note, professional:professionals (id, full_name, professional_type, photo_url)'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (loadError) {
        setError('We could not load your requests. Please try again.')
        setLoading(false)
        return
      }

      setRequests((rows ?? []) as unknown as RequestRow[])
      setLoading(false)
    }

    load()
  }, [])

  const active = requests.filter(
    (request) => request.status === 'pending' || request.status === 'accepted'
  )
  const past = requests.filter(
    (request) => request.status !== 'pending' && request.status !== 'accepted'
  )

  return (
    <main className="flex-1 bg-stone-50 px-6 pb-20 pt-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="zt-press inline-flex items-center gap-2 text-stone-800"
        >
          <span className="zt-disc flex h-9 w-9 items-center justify-center bg-white text-teal-700">
            <ArrowIcon left className="h-4 w-4" />
          </span>

          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        <p className="zt-eyebrow mt-8 text-stone-600">Your requests</p>

        <h1
          className={`${serif.className} mt-2 text-4xl tracking-[-0.02em] text-stone-900 md:text-5xl`}
        >
          My session requests
        </h1>

        {error && (
          <div
            role="alert"
            className="zt-rise mt-6 rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-800"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 space-y-3" aria-busy="true">
            <span className="sr-only">Loading your requests</span>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 rounded-3xl bg-stone-200/70 motion-safe:animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="zt-rise mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200/70">
            <span className="zt-disc mx-auto flex h-14 w-14 items-center justify-center bg-white text-teal-700">
              <LineIcon name="calendar" className="h-7 w-7" />
            </span>

            <h2 className={`${serif.className} mt-5 text-2xl text-stone-900`}>
              No requests yet
            </h2>

            <p className="zt-lead mx-auto mt-2 max-w-sm text-stone-700">
              When you request a session with a professional, you can follow
              it here.
            </p>

            <Link href="/matches" className={primaryButton + ' mt-7'}>
              See my matches
            </Link>
          </div>
        )}

        {!loading && active.length > 0 && (
          <section className="mt-8" aria-labelledby="active-requests">
            <h2
              id="active-requests"
              className="text-sm font-semibold text-stone-600"
            >
              In progress
            </h2>

            <div className="mt-3 space-y-3">
              {active.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </section>
        )}

        {!loading && past.length > 0 && (
          <section className="mt-10" aria-labelledby="past-requests">
            <h2
              id="past-requests"
              className="text-sm font-semibold text-stone-600"
            >
              Earlier
            </h2>

            <div className="mt-3 space-y-3">
              {past.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
