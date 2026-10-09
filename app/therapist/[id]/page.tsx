'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Lora } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ArrowIcon, Avatar, LineIcon, VerifiedBadge } from '@/lib/ui'
import type { IconName } from '@/lib/ui'
import {
  answersFromRow,
  careLabels,
  describeAvailability,
  firstNameOf,
  methodSummary,
  offersInPerson,
  offersOnline,
  professionalSlots,
  readFlowAnswers,
  readPendingAnswers,
  scoreProfessional,
  styleTags,
} from '@/lib/matching'
import type { Answers, Professional } from '@/lib/matching'

const serif = Lora({ subsets: ['latin'] })

function PracticeItem({
  icon,
  label,
  children,
}: {
  icon: IconName
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="zt-disc flex h-14 w-14 shrink-0 items-center justify-center bg-white text-teal-700">
        <LineIcon name={icon} className="h-7 w-7" />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-widest text-stone-900">
          {label}
        </p>

        <div className="mt-2 space-y-1 text-stone-700">{children}</div>
      </div>
    </div>
  )
}

function StyleBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-stone-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-teal-600"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default function TherapistPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [answers, setAnswers] = useState<Answers | null>(null)
  const [status, setStatus] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [showCountyInfo, setShowCountyInfo] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: professionalData } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      setProfessional((professionalData as Professional | null) ?? null)

      let resolved: Answers | null = readFlowAnswers() ?? readPendingAnswers()

      if (!resolved) {
        const { data: row } = await supabase
          .from('support_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        resolved = answersFromRow(row)
      }

      setAnswers(resolved)

      const { data: existing } = await supabase
        .from('session_requests')
        .select('status')
        .eq('user_id', user.id)
        .eq('professional_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing?.status) setStatus(existing.status)

      setLoading(false)
    }

    load()
  }, [id])

  const match = useMemo(() => {
    if (!professional || !answers) return null
    return scoreProfessional(professional, answers)
  }, [professional, answers])

  async function sendRequest() {
    if (!professional) return

    setSending(true)
    setMessage('')

    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase.from('session_requests').insert({
      user_id: user.id,
      professional_id: professional.id,
      status: 'pending',
      note: note.trim() || null,
    })

    if (error) {
      setMessage(
        error.message.toLowerCase().includes('duplicate')
          ? 'You already have a request with this professional.'
          : 'We could not send your request. Please try again.'
      )
      setSending(false)
      return
    }

    setStatus('pending')
    setRequestOpen(false)
    setNote('')
    setMessage('Your request has been sent. You will see updates under My session requests.')
    setSending(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="h-[520px] animate-pulse rounded-[2rem] bg-stone-200" />
        </div>
      </main>
    )
  }

  if (!professional) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="zt-card-shadow w-full max-w-lg rounded-[2.5rem] bg-white p-10 text-center">
          <h1 className={`${serif.className} text-3xl text-stone-900`}>
            We could not find this profile
          </h1>

          <p className="mt-3 text-stone-700">
            It may have been removed, or it is not available yet.
          </p>

          <a
            href="/matches"
            className="mt-8 inline-block rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Back to all practitioners
          </a>
        </div>
      </main>
    )
  }

  const firstName = firstNameOf(professional.full_name)
  const tags = styleTags(professional)
  const methods = methodSummary(professional)
  const slots = professionalSlots(professional)
  const availabilityLines = describeAvailability(slots)
  const specializations = professional.specializations ?? []
  const languages = professional.languages ?? []
  const careTypes = (professional.care_types ?? []).map(
    (type) => careLabels[type] ?? type
  )
  const bioParagraphs = (professional.bio ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const hasActiveRequest = status === 'pending' || status === 'accepted'
  const matchedFocus = (match?.matchedFocus ?? []).map((area) =>
    area.toLowerCase()
  )

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <a
          href="/matches"
          className="inline-flex items-center gap-3 text-stone-800"
        >
          <span className="zt-disc flex h-11 w-11 items-center justify-center bg-white text-teal-700">
            <ArrowIcon left />
          </span>

          <span className="text-base font-medium">Back to all practitioners</span>
        </a>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <div className="self-start lg:sticky lg:top-8">
            <div className="zt-card-shadow relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Avatar
                name={professional.full_name}
                photoUrl={professional.photo_url}
                className="h-full w-full"
              />

              {match && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 font-semibold text-teal-800 shadow">
                  {match.score}% match
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-stone-900/70 px-6 py-4 backdrop-blur-sm">
                <h1 className={`${serif.className} text-2xl text-white`}>
                  {professional.full_name}
                </h1>

                <p className="text-white/80">{professional.professional_type}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {hasActiveRequest ? (
                <div
                  className={[
                    'flex w-full items-center justify-center gap-2 rounded-full px-4 py-4 text-lg font-semibold',
                    status === 'accepted'
                      ? 'bg-lime-100 text-lime-800'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}
                >
                  <LineIcon name="check" className="h-5 w-5" />
                  Request {status}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRequestOpen((open) => !open)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-800 px-4 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-stone-900"
                >
                  <LineIcon name="calendar" className="h-5 w-5" />
                  Request session with {firstName}
                </button>
              )}

              <a
                href="/matches"
                className="flex w-full items-center justify-center rounded-full border-2 border-stone-800 px-4 py-4 text-lg font-semibold text-stone-800 transition-all duration-300 hover:bg-stone-100"
              >
                See other matches
              </a>
            </div>

            {requestOpen && !hasActiveRequest && (
              <div className="mt-5 rounded-[1.5rem] bg-white p-5 shadow-sm">
                <label
                  htmlFor="note"
                  className="block text-sm font-semibold text-stone-900"
                >
                  Add a note for {firstName} (optional)
                </label>

                <textarea
                  id="note"
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Share anything that would help, such as what you would like to talk about."
                  className="mt-2 w-full rounded-xl border-2 border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-teal-600"
                />

                <button
                  type="button"
                  onClick={sendRequest}
                  disabled={sending}
                  className="mt-3 w-full rounded-full bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {sending ? 'Sending...' : 'Send request'}
                </button>
              </div>
            )}

            {message && (
              <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
                {message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <VerifiedBadge className="h-7 w-7" />

              <span className="font-semibold text-stone-900">
                Verified by Zentribe
              </span>
            </div>

            <h2
              className={`${serif.className} mt-6 text-3xl tracking-wide text-stone-900`}
            >
              MESSAGE FROM {firstName.toUpperCase()}
            </h2>

            <div className="mt-4 space-y-4 text-lg leading-8 text-stone-700">
              {bioParagraphs.length > 0 ? (
                bioParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))
              ) : (
                <p>{firstName} has not added a personal message yet.</p>
              )}

              <p>
                If this resonates with you, request your first session to talk
                about how you could work together.
              </p>
            </div>

            <h2
              className={`${serif.className} mt-14 text-3xl tracking-wide text-stone-900`}
            >
              ABOUT {firstName.toUpperCase()}&apos;S PRACTICE
            </h2>

            <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              <PracticeItem icon="calendar" label="AVAILABILITY">
                {availabilityLines.length === 0 ? (
                  <p>Not specified</p>
                ) : (
                  availabilityLines.map((line) => <p key={line}>{line}</p>)
                )}
              </PracticeItem>

              <PracticeItem icon="monitor" label="METHOD">
                <p>In-person available: {offersInPerson(professional) ? 'Yes' : 'No'}</p>
                <p>Virtual available: {offersOnline(professional) ? 'Yes' : 'No'}</p>

                {methods.length === 0 && <p>Not specified</p>}
              </PracticeItem>

              <PracticeItem icon="chat" label="STYLE">
                {tags.length === 0 ? (
                  <p>Not specified</p>
                ) : (
                  tags.map((tag) => <p key={tag}>{tag}</p>)
                )}

                {professional.style_action !== null &&
                  professional.style_relational !== null &&
                  professional.style_creative !== null && (
                    <div className="mt-3 w-full max-w-xs space-y-3">
                      <StyleBar label="Action oriented" value={professional.style_action} />
                      <StyleBar label="Relational and reflective" value={professional.style_relational} />
                      <StyleBar label="Creative and integrative" value={professional.style_creative} />
                    </div>
                  )}
              </PracticeItem>

              <PracticeItem icon="pin" label="COUNTY">
                <p>{professional.location ?? 'Not specified'}</p>

                <button
                  type="button"
                  onClick={() => setShowCountyInfo((open) => !open)}
                  className="text-sm font-semibold text-teal-700 underline"
                >
                  Why county matters
                </button>

                {showCountyInfo && (
                  <p className="rounded-xl bg-teal-50 p-3 text-sm leading-6">
                    Your county shows where in-person sessions are possible.
                    Online sessions can be joined from anywhere.
                  </p>
                )}
              </PracticeItem>

              <PracticeItem icon="lightbulb" label="EXPERTISE">
                {specializations.length === 0 ? (
                  <p>Not specified</p>
                ) : (
                  specializations.map((area) => {
                    const matched = matchedFocus.includes(area.toLowerCase())

                    return (
                      <p
                        key={area}
                        className={
                          matched ? 'font-semibold text-teal-800' : undefined
                        }
                      >
                        {area}
                        {matched && ' ✓'}
                      </p>
                    )
                  })
                )}
              </PracticeItem>

              <PracticeItem icon="users" label="WORKS WITH">
                {careTypes.length === 0 ? (
                  <p>Not specified</p>
                ) : (
                  careTypes.map((type) => <p key={type}>{type}</p>)
                )}
              </PracticeItem>

              <PracticeItem icon="globe" label="LANGUAGES">
                {languages.length === 0 ? (
                  <p>Not specified</p>
                ) : (
                  languages.map((language) => <p key={language}>{language}</p>)
                )}
              </PracticeItem>
            </div>

            {match && (
              <div className="zt-card-shadow mt-14 rounded-[2rem] bg-white p-8">
                <div className="flex items-center gap-5">
                  <span className="zt-disc flex h-20 w-20 shrink-0 items-center justify-center bg-white text-2xl font-bold text-teal-700">
                    {match.score}%
                  </span>

                  <div>
                    <h3 className={`${serif.className} text-2xl text-stone-900`}>
                      How you match with {firstName}
                    </h3>

                    <p className="mt-1 text-stone-700">
                      Based on the answers you gave, weighted by your priorities.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[...match.breakdown]
                    .sort((a, b) => b.max - a.max)
                    .map((item) => (
                      <div key={item.key}>
                        <div className="flex justify-between text-sm font-medium text-stone-800">
                          <span>{item.label}</span>
                          <span>
                            {item.earned} / {item.max}
                          </span>
                        </div>

                        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full rounded-full bg-teal-600"
                            style={{
                              width: `${item.max === 0 ? 0 : (item.earned / item.max) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {match.reasons.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {match.reasons.map((reason) => (
                      <li
                        key={reason}
                        className="flex items-start gap-2 text-stone-800"
                      >
                        <LineIcon
                          name="check"
                          className="mt-1 h-4 w-4 shrink-0 text-lime-600"
                        />
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}