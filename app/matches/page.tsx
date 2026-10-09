'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Lora } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ArrowIcon, Avatar, LineIcon, VerifiedBadge } from '@/lib/ui'
import type { IconName } from '@/lib/ui'
import {
  ageLabels,
  answersFromRow,
  careLabels,
  clearFlowAnswers,
  clearPendingAnswers,
  describeAvailability,
  firstNameOf,
  genderLabels,
  isVerified,
  memberStyleTags,
  methodSummary,
  professionalSlots,
  rankProfessionals,
  readFlowAnswers,
  readPendingAnswers,
  rowFromAnswers,
  savePendingAnswers,
  styleTags,
  timingLabels,
} from '@/lib/matching'
import type { Answers, MatchResult, Professional } from '@/lib/matching'

const serif = Lora({ subsets: ['latin'] })

function FeatureItem({
  icon,
  label,
  children,
}: {
  icon: IconName
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="zt-disc flex h-8 w-8 shrink-0 items-center justify-center bg-white text-teal-700">
        <LineIcon name={icon} className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-widest text-stone-500">
          {label}
        </p>

        <div className="mt-0.5 text-xs leading-4 text-stone-900">
          {children}
        </div>
      </div>
    </div>
  )
}

function MatchCard({
  result,
  recommended,
  status,
  requesting,
  onRequest,
  focusAreas,
}: {
  result: MatchResult
  recommended: boolean
  status?: string
  requesting: boolean
  onRequest: () => void
  focusAreas: string[]
}) {
  const p = result.professional
  const firstName = firstNameOf(p.full_name)
  const methods = methodSummary(p)
  const tags = styleTags(p)
  const availabilityLines = describeAvailability(professionalSlots(p))
  const specializations = p.specializations ?? []
  const careTypes = (p.care_types ?? []).map((type) => careLabels[type] ?? type)
  const hasActiveRequest = status === 'pending' || status === 'accepted'

  return (
    <article
      className={[
        'zt-hover-lift relative flex w-[270px] shrink-0 snap-start flex-col rounded-[1.5rem] bg-white shadow-lg',
        recommended ? 'ring-2 ring-coral-400' : 'ring-1 ring-stone-200',
      ].join(' ')}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-1/2 z-20 -translate-x-1/2 -rotate-2 bg-teal-700 px-3 py-1 text-[11px] font-bold tracking-widest text-white shadow">
          RECOMMENDED
        </span>
      )}

      <div className="relative h-56 overflow-hidden rounded-t-[1.5rem]">
        <Avatar
          name={p.full_name}
          photoUrl={p.photo_url}
          className="h-full w-full"
        />

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-teal-800 shadow">
          {result.score}% match
        </span>

        <div className="absolute inset-x-0 bottom-0 bg-stone-900/65 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <h3 className={`${serif.className} text-base text-white`}>
              {p.full_name}
            </h3>

            {isVerified(p) && <VerifiedBadge className="h-3.5 w-3.5" />}
          </div>

          <p className="text-xs text-white/80">{p.professional_type}</p>
        </div>
      </div>

      <div className="space-y-2 px-4 pt-4">
        {hasActiveRequest ? (
          <div
            className={[
              'flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold',
              status === 'accepted'
                ? 'bg-lime-100 text-lime-800'
                : 'bg-amber-100 text-amber-800',
            ].join(' ')}
          >
            <LineIcon name="check" className="h-4 w-4" />
            Request {status}
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequest}
            disabled={requesting}
            className="zt-press flex w-full items-center justify-center gap-2 rounded-full bg-stone-800 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-60"
          >
            <LineIcon name="calendar" className="h-4 w-4" />
            {requesting ? 'Sending...' : `Request with ${firstName}`}
          </button>
        )}

        <Link
          href={`/therapist/${p.id}`}
          className="zt-press flex w-full items-center justify-center rounded-full border-2 border-stone-800 px-3 py-1.5 text-sm font-semibold text-stone-800 hover:bg-stone-100"
        >
          View profile
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4 px-4 py-4">
        <FeatureItem icon="monitor" label="METHOD">
          {methods.length > 0 ? methods.join(', ') : 'Not specified'}
        </FeatureItem>

        <FeatureItem icon="pin" label="COUNTY">
          {p.location ?? 'Not specified'}
        </FeatureItem>

        <FeatureItem icon="lightbulb" label="EXPERTISE">
          {specializations.length === 0 ? (
            'Not specified'
          ) : (
            <>
              {specializations.slice(0, 3).map((area) => (
                <span key={area} className="block">
                  {area}
                </span>
              ))}

              {specializations.length > 3 && (
                <span className="block text-stone-500">
                  + {specializations.length - 3} more
                </span>
              )}
            </>
          )}
        </FeatureItem>

        <FeatureItem icon="chat" label="STYLE">
          {tags.length === 0
            ? 'Not specified'
            : tags.map((tag) => (
                <span key={tag} className="block">
                  {tag}
                </span>
              ))}
        </FeatureItem>

        <FeatureItem icon="calendar" label="AVAILABILITY">
          {availabilityLines.length === 0
            ? 'Not specified'
            : availabilityLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
        </FeatureItem>

        <FeatureItem icon="users" label="WORKS WITH">
          {careTypes.length === 0
            ? 'Not specified'
            : careTypes.map((type) => (
                <span key={type} className="block">
                  {type}
                </span>
              ))}
        </FeatureItem>
      </div>

      <div className="mt-auto rounded-b-[1.5rem] border-t border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-[10px] font-semibold tracking-widest text-stone-500">
          WHY THIS MATCH
        </p>

        <ul className="mt-1.5 space-y-1">
          {result.reasons.slice(0, 3).map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-1.5 text-xs text-stone-800"
            >
              <LineIcon
                name="check"
                className="mt-0.5 h-3 w-3 shrink-0 text-lime-600"
              />
              {reason}
            </li>
          ))}

          {result.reasons.length === 0 && (
            <li className="text-xs text-stone-600">
              Partly matches your answers.
            </li>
          )}
        </ul>

        {focusAreas.length > 0 && result.matchedFocus.length === 0 && (
          <p className="mt-1.5 text-[11px] text-stone-500">
            No direct match on your focus areas yet.
          </p>
        )}
      </div>
    </article>
  )
}

function PreferenceItem({
  icon,
  label,
  children,
}: {
  icon: IconName
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="zt-disc flex h-11 w-11 shrink-0 items-center justify-center bg-white text-teal-700">
        <LineIcon name={icon} className="h-5 w-5" />
      </span>

      <div>
        <p className="text-xs font-semibold tracking-widest text-stone-900">
          {label}
        </p>

        <div className="mt-1 text-sm text-stone-700">{children}</div>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  const [loading, setLoading] = useState(true)
  const [needsAccount, setNeedsAccount] = useState(false)
  const [answers, setAnswers] = useState<Answers | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      const fresh = readFlowAnswers()

      if (!user) {
        if (fresh) savePendingAnswers(fresh)
        setNeedsAccount(true)
        setLoading(false)
        return
      }

      let resolved: Answers | null = fresh ?? readPendingAnswers()

      if (resolved) {
        const payload = rowFromAnswers(resolved)

        const { data: existing } = await supabase
          .from('support_preferences')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

        const saveResult = existing
          ? await supabase
              .from('support_preferences')
              .update(payload)
              .eq('user_id', user.id)
          : await supabase
              .from('support_preferences')
              .insert({ user_id: user.id, ...payload })

        if (saveResult.error) {
          console.error('Saving answers failed:', saveResult.error)
          setNotice(
            'We could not save your answers to your account yet, but your matches below still reflect them.'
          )
        } else {
          clearFlowAnswers()
          clearPendingAnswers()
        }
      } else {
        const { data: row } = await supabase
          .from('support_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        resolved = answersFromRow(row)
      }

      setAnswers(resolved)

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.display_name && profile.display_name !== 'Member') {
        setDisplayName(profile.display_name.split(' ')[0])
      }

      const { data: professionalData, error: professionalError } =
        await supabase
          .from('professionals')
          .select('*')
          .eq('verification_status', 'approved')

      if (professionalError) {
        setError(
          'We could not load the professionals: ' + professionalError.message
        )
        setLoading(false)
        return
      }

      setProfessionals((professionalData ?? []) as Professional[])

      const { data: requests } = await supabase
        .from('session_requests')
        .select('professional_id, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const latest: Record<string, string> = {}

      ;(requests ?? []).forEach((request) => {
        if (!latest[request.professional_id]) {
          latest[request.professional_id] = request.status
        }
      })

      setStatuses(latest)
      setLoading(false)
    }

    load()
  }, [])

  const ranked = useMemo(() => {
    if (!answers) return null
    return rankProfessionals(professionals, answers)
  }, [answers, professionals])

  async function requestSession(professionalId: string) {
    setRequestingId(professionalId)
    setError('')
    setNotice('')

    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) {
      window.location.href = '/login'
      return
    }

    // Show the request as sent immediately; undo it below if saving fails.
    setStatuses((current) => ({ ...current, [professionalId]: 'pending' }))

    const { error: requestError } = await supabase
      .from('session_requests')
      .insert({
        user_id: user.id,
        professional_id: professionalId,
        status: 'pending',
      })

    if (requestError) {
      setError(
        requestError.message.toLowerCase().includes('duplicate')
          ? 'You already have a request with this professional.'
          : 'We could not send your request. Please try again.'
      )
      setStatuses((current) => {
        const next = { ...current }
        delete next[professionalId]
        return next
      })
      setRequestingId(null)
      return
    }

    setStatuses((current) => ({ ...current, [professionalId]: 'pending' }))
    setNotice('Your session request has been sent.')
    setRequestingId(null)
  }

  function scrollTrack(direction: number) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    trackRef.current?.scrollBy({
      left: direction * 300,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  if (loading) {
    return (
      <main className="flex-1 bg-stone-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-stone-600">
            MATCH RESULTS
          </p>

          <p className={`${serif.className} mt-3 text-3xl text-stone-900`}>
            Finding your best matches...
          </p>

          <div className="mt-8 flex gap-5 overflow-hidden">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-[440px] w-[270px] shrink-0 motion-safe:animate-pulse rounded-[1.5rem] bg-stone-200"
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (needsAccount) {
    return (
      <main className="flex flex-1 items-center justify-center bg-stone-50 px-6">
        <div className="zt-card-shadow w-full max-w-lg rounded-[2.5rem] bg-white p-10 text-center">
          <span className="zt-disc mx-auto flex h-14 w-14 items-center justify-center bg-white text-teal-700">
            <LineIcon name="shield" className="h-7 w-7" />
          </span>

          <h1 className={`${serif.className} mt-5 text-3xl text-stone-900`}>
            Your matches are ready
          </h1>

          <p className="mt-3 leading-7 text-stone-700">
            Create a free account, or log in, to see the professionals who fit
            your answers. Your answers are saved on this device.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="zt-press rounded-full bg-teal-700 px-8 py-3 text-center font-semibold text-white hover:bg-teal-800"
            >
              Create account
            </Link>

            <Link
              href="/login"
              className="zt-press rounded-full border-2 border-teal-700 px-8 py-3 text-center font-semibold text-teal-800 hover:bg-teal-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!answers || !ranked) {
    return (
      <main className="flex flex-1 items-center justify-center bg-stone-50 px-6">
        <div className="zt-card-shadow w-full max-w-lg rounded-[2.5rem] bg-white p-10 text-center">
          <h1 className={`${serif.className} text-3xl text-stone-900`}>
            Let&apos;s find your match
          </h1>

          <p className="mt-3 leading-7 text-stone-700">
            Answer a few short questions and we will rank the professionals who
            fit you best.
          </p>

          <Link
            href="/find-support"
            className="zt-press mt-8 inline-block rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Start now
          </Link>
        </div>
      </main>
    )
  }

  const topStyle = memberStyleTags(answers.style_scores)
  const availabilityLines = describeAvailability(answers.availability_slots)

  return (
    <main className="flex-1 bg-stone-50">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="zt-press inline-flex items-center gap-2 text-stone-800"
          >
            <span className="zt-disc flex h-9 w-9 items-center justify-center bg-white text-teal-700">
              <ArrowIcon left className="h-4 w-4" />
            </span>

            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          <Link
            href="/requests"
            className="zt-press rounded-full border-2 border-stone-800 px-4 py-1.5 text-sm font-semibold text-stone-800 hover:bg-stone-100"
          >
            My session requests
          </Link>
        </div>

        <p className="mt-8 text-xs font-semibold tracking-[0.25em] text-stone-600">
          MATCH RESULTS
        </p>

        <h1
          className={`${serif.className} mt-2 text-4xl leading-tight text-stone-900 md:text-5xl`}
        >
          {displayName ? `Made for ${displayName}` : 'Made for you'}
        </h1>

        {error && (
          <div role="alert" className="zt-rise mt-5 rounded-2xl border border-coral-200 bg-coral-50 px-4 py-2.5 text-sm text-coral-800">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="zt-rise mt-5 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-2.5 text-sm text-lime-800">
            {notice}
          </div>
        )}

        {ranked.careFallback && answers.care_type && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            We do not have a professional for{' '}
            {careLabels[answers.care_type] ?? answers.care_type} care yet, so
            these are the closest matches.
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm text-lime-900">
              <LineIcon name="heart" className="h-4 w-4" />

              <span className="font-semibold">
                {ranked.results.length}{' '}
                {ranked.results.length === 1 ? 'professional' : 'professionals'}{' '}
                matched
              </span>
            </div>

            <h2 className={`${serif.className} mt-6 text-2xl text-stone-900`}>
              Your next step:
            </h2>

            <div className="mt-4 flex items-start gap-3">
              <span className="zt-disc flex h-11 w-11 shrink-0 items-center justify-center bg-white text-coral-500">
                <LineIcon name="phone" className="h-5 w-5" />
              </span>

              <div>
                <p className={`${serif.className} text-lg text-stone-900`}>
                  Schedule with your preferred provider!
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-700">
                  We ranked these professionals using your answers, so the best
                  fit comes first. Request a session with the one you like, or
                  open a profile to read more first.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-w-0">
            {ranked.results.length === 0 ? (
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <p className="text-stone-700">
                  There are no approved professionals yet. Please check again
                  soon.
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={trackRef}
                  className="zt-no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 pt-5"
                >
                  {ranked.results.map((result, index) => (
                    <MatchCard
                      key={result.professional.id}
                      result={result}
                      recommended={index === 0}
                      status={statuses[result.professional.id]}
                      requesting={requestingId === result.professional.id}
                      onRequest={() => requestSession(result.professional.id)}
                      focusAreas={answers.focus_areas}
                    />
                  ))}
                </div>

                {ranked.results.length > 1 && (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => scrollTrack(-1)}
                      aria-label="Previous matches"
                      className="zt-disc zt-press flex h-11 w-11 items-center justify-center bg-white text-stone-800"
                    >
                      <ArrowIcon left className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollTrack(1)}
                      aria-label="More matches"
                      className="zt-disc zt-press flex h-11 w-11 items-center justify-center bg-stone-800 text-white"
                    >
                      <ArrowIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-t-[2.5rem] bg-teal-50 px-6 pb-16 pt-12">
        <div className="mx-auto max-w-5xl">
          <h2
            className={`${serif.className} text-center text-2xl text-stone-900 md:text-3xl`}
          >
            The above matches are based on your preferences:
          </h2>

          <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            <PreferenceItem icon="users" label="CARE TYPE">
              {answers.care_type
                ? careLabels[answers.care_type] ?? answers.care_type
                : 'Not chosen'}
            </PreferenceItem>

            <PreferenceItem icon="pin" label="COUNTY">
              {answers.county ?? 'Not chosen'}
            </PreferenceItem>

            <PreferenceItem icon="calendar" label="AVAILABILITY">
              {availabilityLines.length === 0
                ? 'Not chosen'
                : availabilityLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
            </PreferenceItem>

            <PreferenceItem icon="bolt" label="STARTING">
              {answers.start_timing
                ? timingLabels[answers.start_timing] ?? answers.start_timing
                : 'Not chosen'}
            </PreferenceItem>

            <PreferenceItem icon="lightbulb" label="FOCUS AREAS">
              {answers.focus_areas.length === 0
                ? 'Not chosen'
                : answers.focus_areas.map((area) => (
                    <span key={area} className="block">
                      {area}
                    </span>
                  ))}
            </PreferenceItem>

            <PreferenceItem icon="chat" label="STYLE">
              {topStyle.length === 0
                ? 'Not chosen'
                : topStyle.map((tag) => (
                    <span key={tag} className="block">
                      {tag}
                    </span>
                  ))}
            </PreferenceItem>

            <PreferenceItem icon="user" label="GENDER">
              {answers.gender_pref
                ? genderLabels[answers.gender_pref] ?? answers.gender_pref
                : 'Not chosen'}
            </PreferenceItem>

            <PreferenceItem icon="clock" label="AGE">
              {answers.age_pref
                ? ageLabels[answers.age_pref] ?? answers.age_pref
                : 'Not chosen'}
            </PreferenceItem>
          </div>

          {answers.priorities.length > 0 && (
            <div className="mx-auto mt-10 max-w-md rounded-[1.5rem] bg-white p-5 shadow-sm">
              <PreferenceItem
                icon="list"
                label="YOUR PRIORITIES, MOST IMPORTANT FIRST"
              >
                <ol className="mt-1 list-inside list-decimal space-y-0.5">
                  {answers.priorities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </PreferenceItem>
            </div>
          )}

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-6 text-stone-700">
            Matches are scored out of 100. The things you ranked highest count
            the most, and a therapist who does not offer your type of care is
            never shown first.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/find-support"
              className="zt-press inline-block rounded-full bg-coral-300 px-7 py-3 font-semibold text-stone-900 shadow-lg hover:bg-coral-400"
            >
              Need to update your preferences?
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}