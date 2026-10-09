'use client'

import { ReactNode, useState } from 'react'
import type { ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { removeClubCover, uploadClubCover } from '@/lib/clubPhotos'

export type Club = {
  id: string
  name: string
  tagline: string | null
  description: string | null
  category: string
  tags: string[] | null
  county: string | null
  area: string | null
  meets: string[] | null
  schedule_text: string | null
  cost_type: string
  cost_note: string | null
  beginner_friendly: boolean
  age_group: string
  member_count: number | null
  join_url: string | null
  instagram_url: string | null
  website_url: string | null
  cover_url: string | null
  verification_checks: string[] | null
  last_confirmed_at: string | null
  status: string
  created_at: string
}

export type CategoryKey =
  | 'sports'
  | 'outdoors'
  | 'books'
  | 'arts'
  | 'music'
  | 'games'
  | 'career'
  | 'volunteering'
  | 'wellbeing'
  | 'food'

export const clubCategories: {
  key: CategoryKey
  label: string
  from: string
  to: string
}[] = [
  { key: 'sports', label: 'Sports and fitness', from: '#31bfcc', to: '#0b7f8b' },
  { key: 'outdoors', label: 'Outdoors and adventure', from: '#a4d35f', to: '#568022' },
  { key: 'books', label: 'Books and writing', from: '#fbbd54', to: '#b06b10' },
  { key: 'arts', label: 'Arts and creativity', from: '#f4817f', to: '#b53836' },
  { key: 'music', label: 'Music and dance', from: '#7a8b92', to: '#33414a' },
  { key: 'games', label: 'Games and hobbies', from: '#61ccd7', to: '#0a646e' },
  { key: 'career', label: 'Careers and networking', from: '#0f9aa8', to: '#0a4d56' },
  { key: 'volunteering', label: 'Volunteering and climate', from: '#8bc53f', to: '#44651d' },
  { key: 'wellbeing', label: 'Wellbeing and mindfulness', from: '#9adfe6', to: '#0f9aa8' },
  { key: 'food', label: 'Food and culture', from: '#f8ad33', to: '#8a5413' },
]

export const meetsOptions = [
  { value: 'weekday_daytime', label: 'Weekday daytime' },
  { value: 'weekday_evenings', label: 'Weekday evenings' },
  { value: 'weekends', label: 'Weekends' },
]

export const clubChecks = [
  {
    key: 'organizer',
    title: 'Organizer confirmed',
    detail: 'Zentribe spoke to the person who runs this club.',
  },
  {
    key: 'active',
    title: 'Meetings confirmed',
    detail: 'Zentribe confirmed that the club meets regularly.',
  },
  {
    key: 'venue',
    title: 'Public meeting place',
    detail: 'The club meets in a public venue or online.',
  },
]

export function categoryOf(key: string) {
  return clubCategories.find((category) => category.key === key) ?? clubCategories[0]
}

export function isClubVerified(club: Club) {
  const checks = club.verification_checks ?? []

  return checks.includes('organizer') && checks.includes('active')
}

export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url.trim())

    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.toString()
      : null
  } catch {
    return null
  }
}

export function joinLabel(url: string | null) {
  const safe = safeUrl(url)

  if (!safe) return 'Join'

  const host = new URL(safe).hostname.toLowerCase()

  if (host.includes('whatsapp.com') || host === 'wa.me') return 'Join on WhatsApp'
  if (host.includes('instagram.com')) return 'Follow on Instagram'
  if (host === 't.me' || host.includes('telegram')) return 'Join on Telegram'
  if (host.includes('facebook.com') || host === 'fb.me') return 'Join on Facebook'
  if (host.includes('discord')) return 'Join on Discord'

  return 'Visit their page'
}

export function costBadge(club: Club) {
  if (club.cost_type === 'free') return 'Free'
  if (club.cost_type === 'donation') return 'Pay what you can'

  return 'Paid'
}

export function costText(club: Club) {
  if (club.cost_type === 'free') return 'Free'
  if (club.cost_type === 'donation') return club.cost_note || 'Pay what you can'

  return club.cost_note || 'Paid'
}

export function meetsSummary(club: Club) {
  if (club.schedule_text) return club.schedule_text

  const labels = (club.meets ?? []).map(
    (value) =>
      meetsOptions.find((option) => option.value === value)?.label ?? value
  )

  return labels.length > 0 ? labels.join(', ') : 'Schedule not shared'
}

export function ageText(club: Club) {
  if (club.age_group === '18_plus') return '18 and over'
  if (club.age_group === 'youth') return 'Young people under 18'

  return 'Open to everyone'
}

export function freshness(club: Club) {
  if (!club.last_confirmed_at) return null

  return new Date(club.last_confirmed_at).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

const categoryIconPaths: Record<CategoryKey, ReactNode> = {
  sports: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4M12 13v4M9 20h6" />
    </>
  ),
  outdoors: <path d="M3 19l6-11 4 6 3-4 5 9z" />,
  books: (
    <>
      <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h10" />
    </>
  ),
  arts: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-5-4-11-8-11z" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16" cy="10" r="1" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  games: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1" />
      <circle cx="15" cy="9" r="1" />
      <circle cx="9" cy="15" r="1" />
      <circle cx="15" cy="15" r="1" />
    </>
  ),
  career: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  volunteering: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  ),
  wellbeing: (
    <>
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <path d="M5 19c3-5 6-8 10-10" />
    </>
  ),
  food: (
    <>
      <path d="M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" />
      <path d="M17 9h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2" />
    </>
  ),
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const key = categoryOf(name).key

  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-6 w-6'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {categoryIconPaths[key]}
    </svg>
  )
}

export function ClubCover({
  category,
  coverUrl,
  className,
}: {
  category: string
  coverUrl: string | null
  className?: string
}) {
  const style = categoryOf(category)

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        background: `linear-gradient(145deg, ${style.from}, ${style.to})`,
      }}
    >
      <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <span className="absolute -bottom-14 -right-8 h-52 w-52 rounded-full bg-white/10" />

      <span className="absolute inset-0 flex items-center justify-center text-white/80">
        <CategoryIcon name={category} className="h-20 w-20" />
      </span>

      {coverUrl && (
        <img
          src={coverUrl}
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}

export function CoverField({
  clubId,
  category,
  coverUrl,
  onChange,
}: {
  clubId: string
  category: string
  coverUrl: string | null
  onChange: (url: string | null) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setBusy(true)
    setError('')

    const supabase = createClient()

    try {
      const url = await uploadClubCover(supabase, clubId, file)

      const { data, error: updateError } = await supabase
        .from('clubs')
        .update({ cover_url: url })
        .eq('id', clubId)
        .select('id')

      if (updateError) throw new Error(updateError.message)

      if (!data || data.length === 0) {
        throw new Error('The database did not allow this change.')
      }

      await removeClubCover(supabase, coverUrl)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The upload failed.')
    }

    setBusy(false)
  }

  async function handleRemove() {
    setBusy(true)
    setError('')

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('clubs')
      .update({ cover_url: null })
      .eq('id', clubId)
      .select('id')

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? 'The database did not allow this change.')
      setBusy(false)
      return
    }

    await removeClubCover(supabase, coverUrl)
    onChange(null)
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <ClubCover
        category={category}
        coverUrl={coverUrl}
        className="h-28 w-48 shrink-0 rounded-2xl"
      />

      <div>
        <p className="text-sm font-semibold text-stone-900">Cover photo</p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-stone-600">
          A wide photo of the club in action works best. We crop it and keep
          the file small.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <label
            className={[
              'inline-flex cursor-pointer items-center rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800',
              busy ? 'pointer-events-none opacity-60' : '',
            ].join(' ')}
          >
            {busy ? 'Working...' : coverUrl ? 'Change photo' : 'Upload photo'}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {coverUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="rounded-full border-2 border-stone-300 px-5 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-coral-700">{error}</p>}
      </div>
    </div>
  )
}