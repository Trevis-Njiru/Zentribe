'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Lora } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ArrowIcon, LineIcon, VerifiedBadge } from '@/lib/ui'
import type { IconName } from '@/lib/ui'
import {
  CategoryIcon,
  ClubCover,
  ageText,
  categoryOf,
  clubChecks,
  costText,
  freshness,
  isClubVerified,
  joinLabel,
  meetsSummary,
  safeUrl,
} from '@/lib/clubs'
import type { Club } from '@/lib/clubs'

const serif = Lora({ subsets: ['latin'] })

const reportReasons = [
  'It looks like a scam or asks for money upfront',
  'It feels unsafe or inappropriate',
  'The club is not active any more',
  'The information is wrong or misleading',
  'Something else',
]

function DetailItem({
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

export default function ClubPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState<Club | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reportMessage, setReportMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      setClub((data as Club | null) ?? null)
      setLoading(false)
    }

    load()
  }, [id])

  function recordJoin() {
    if (!club) return

    const clubId = club.id
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      supabase
        .from('club_join_clicks')
        .insert({ club_id: clubId, user_id: data.session?.user.id ?? null })
        .then(() => undefined)
    })
  }

  function share() {
    if (!club) return

    const text = `Found this club on Zentribe: ${club.name} ${window.location.href}`

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  async function sendReport() {
    if (!club) return

    if (!reason) {
      setReportMessage('Please choose a reason.')
      return
    }

    setReporting(true)
    setReportMessage('')

    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) {
      setReportMessage('Please log in to send a report.')
      setReporting(false)
      return
    }

    const { error } = await supabase.from('club_reports').insert({
      club_id: club.id,
      user_id: user.id,
      reason,
      details: details.trim() || null,
    })

    if (error) {
      setReportMessage('We could not send your report. Please try again.')
      setReporting(false)
      return
    }

    setReportMessage(
      'Thank you. Our team will look into this club.'
    )
    setReportOpen(false)
    setReason('')
    setDetails('')
    setReporting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="h-96 animate-pulse rounded-[2rem] bg-stone-200" />
        </div>
      </main>
    )
  }

  if (!club) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="zt-card-shadow w-full max-w-lg rounded-[2.5rem] bg-white p-10 text-center">
          <h1 className={`${serif.className} text-3xl text-stone-900`}>
            We could not find this club
          </h1>

          <p className="mt-3 text-stone-700">
            It may have been removed, or it is not listed yet.
          </p>

          <a
            href="/clubs"
            className="mt-8 inline-block rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Back to all clubs
          </a>
        </div>
      </main>
    )
  }

  const category = categoryOf(club.category)
  const verified = isClubVerified(club)
  const joinUrl = safeUrl(club.join_url)
  const instagramUrl = safeUrl(club.instagram_url)
  const websiteUrl = safeUrl(club.website_url)
  const confirmed = freshness(club)
  const doneChecks = clubChecks.filter((check) =>
    (club.verification_checks ?? []).includes(check.key)
  )
  const paragraphs = (club.description ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <a href="/clubs" className="inline-flex items-center gap-3 text-stone-800">
          <span className="zt-disc flex h-11 w-11 items-center justify-center bg-white text-teal-700">
            <ArrowIcon left />
          </span>

          <span className="text-base font-medium">Back to all clubs</span>
        </a>

        <div className="zt-card-shadow relative mt-6 h-72 overflow-hidden rounded-[2rem] md:h-96">
          <ClubCover
            category={club.category}
            coverUrl={club.cover_url}
            className="h-full w-full"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/80 to-transparent px-6 pb-6 pt-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800">
              <CategoryIcon name={club.category} className="h-4 w-4" />
              {category.label}
            </span>

            <div className="mt-3 flex items-center gap-3">
              <h1
                className={`${serif.className} text-3xl text-white md:text-5xl`}
              >
                {club.name}
              </h1>

              {verified && <VerifiedBadge className="h-8 w-8" />}
            </div>

            {club.tagline && (
              <p className="mt-2 text-lg text-white/90">{club.tagline}</p>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <h2
              className={`${serif.className} text-3xl tracking-wide text-stone-900`}
            >
              ABOUT THIS CLUB
            </h2>

            <div className="mt-4 space-y-4 text-lg leading-8 text-stone-700">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))
              ) : (
                <p>This club has not added a description yet.</p>
              )}
            </div>

            {(club.tags ?? []).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {(club.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2
              className={`${serif.className} mt-14 text-3xl tracking-wide text-stone-900`}
            >
              THE DETAILS
            </h2>

            <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              <DetailItem icon="calendar" label="WHEN">
                <p>{meetsSummary(club)}</p>
              </DetailItem>

              <DetailItem icon="pin" label="WHERE">
                <p>{club.county ?? 'Not shared'}</p>

                {club.area && <p>{club.area}</p>}
              </DetailItem>

              <DetailItem icon="bolt" label="COST">
                <p>{costText(club)}</p>
              </DetailItem>

              <DetailItem icon="users" label="WHO IT IS FOR">
                <p>{ageText(club)}</p>

                <p>
                  {club.beginner_friendly
                    ? 'Beginners are welcome'
                    : 'Best for people with some experience'}
                </p>
              </DetailItem>

              {club.member_count !== null && (
                <DetailItem icon="heart" label="SIZE">
                  <p>About {club.member_count} members</p>
                </DetailItem>
              )}

              {confirmed && (
                <DetailItem icon="clock" label="LAST CONFIRMED ACTIVE">
                  <p>{confirmed}</p>
                </DetailItem>
              )}
            </div>

            <div className="mt-14 rounded-[2rem] bg-teal-50 p-8">
              <div className="flex items-center gap-4">
                <span className="zt-disc flex h-14 w-14 shrink-0 items-center justify-center bg-white text-teal-700">
                  <LineIcon name="shield" className="h-7 w-7" />
                </span>

                <h3 className={`${serif.className} text-2xl text-stone-900`}>
                  What Zentribe checked
                </h3>
              </div>

              {doneChecks.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {doneChecks.map((check) => (
                    <li key={check.key} className="flex items-start gap-3">
                      <LineIcon
                        name="check"
                        className="mt-1 h-5 w-5 shrink-0 text-lime-600"
                      />

                      <span className="text-stone-800">
                        <span className="font-semibold">{check.title}.</span>{' '}
                        {check.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-stone-700">
                  Zentribe has not completed its checks for this club yet.
                  Please use the tips below when you go.
                </p>
              )}
            </div>

            <div className="mt-8 rounded-[2rem] bg-white p-8 ring-1 ring-stone-200">
              <h3 className={`${serif.className} text-2xl text-stone-900`}>
                Before you go
              </h3>

              <ul className="mt-4 space-y-2 text-stone-700">
                <li>Meet in a public place the first time.</li>
                <li>Tell a friend where you are going.</li>
                <li>
                  Be careful with anyone who asks for money before you have met
                  the group.
                </li>
                <li>You can leave a club at any time.</li>
              </ul>
            </div>
          </div>

          <div className="self-start lg:sticky lg:top-8">
            <div className="zt-card-shadow rounded-[2rem] bg-white p-6">
              <h2 className={`${serif.className} text-2xl text-stone-900`}>
                Join this club
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-700">
                Clubs run independently. The button below takes you to their
                own page or group, where they will welcome you.
              </p>

              {joinUrl ? (
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={recordJoin}
                  className="zt-lift mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-4 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-teal-800"
                >
                  {joinLabel(joinUrl)}
                  <ArrowIcon className="h-5 w-5" />
                </a>
              ) : (
                <p className="mt-5 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
                  This club has not shared a way to join yet.
                </p>
              )}

              {(instagramUrl || websiteUrl) && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border-2 border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
                    >
                      Instagram
                    </a>
                  )}

                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border-2 border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={share}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-stone-800 px-4 py-3 font-semibold text-stone-800 transition-all duration-300 hover:bg-stone-100"
              >
                <LineIcon name="chat" className="h-5 w-5" />
                Share on WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setReportOpen((open) => !open)}
                className="mt-5 block text-sm font-semibold text-stone-600 underline"
              >
                Report this club
              </button>

              {reportOpen && (
                <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                  <label
                    htmlFor="reason"
                    className="block text-sm font-semibold text-stone-900"
                  >
                    What is the problem?
                  </label>

                  <select
                    id="reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="mt-2 w-full rounded-xl border-2 border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-teal-600"
                  >
                    <option value="">Choose a reason</option>

                    {reportReasons.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <textarea
                    rows={3}
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="Anything else we should know (optional)"
                    className="mt-3 w-full rounded-xl border-2 border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-teal-600"
                  />

                  <button
                    type="button"
                    onClick={sendReport}
                    disabled={reporting}
                    className="mt-3 w-full rounded-full bg-stone-800 px-4 py-2.5 font-semibold text-white hover:bg-stone-900 disabled:opacity-60"
                  >
                    {reporting ? 'Sending...' : 'Send report'}
                  </button>
                </div>
              )}

              {reportMessage && (
                <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">
                  {reportMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}