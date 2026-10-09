'use client'

import { useEffect, useMemo, useState } from 'react'
import { Lora } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import { ArrowIcon, LineIcon, VerifiedBadge } from '@/lib/ui'
import {
  CategoryIcon,
  ClubCover,
  categoryOf,
  clubCategories,
  costBadge,
  isClubVerified,
  meetsOptions,
  meetsSummary,
} from '@/lib/clubs'
import type { Club } from '@/lib/clubs'
import { counties } from '@/lib/options'

const serif = Lora({ subsets: ['latin'] })

function FilterChip({
  label,
  selected,
  onClick,
  children,
}: {
  label: string
  selected: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        'inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-300',
        selected
          ? 'border-teal-700 bg-teal-700 text-white'
          : 'border-stone-300 bg-white text-stone-800 hover:border-teal-400',
      ].join(' ')}
    >
      {children}
      {label}
    </button>
  )
}

function ClubCard({ club }: { club: Club }) {
  const category = categoryOf(club.category)
  const verified = isClubVerified(club)

  return (
    <a
      href={`/clubs/${club.id}`}
      className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-lg ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative h-44">
        <ClubCover
          category={club.category}
          coverUrl={club.cover_url}
          className="h-full w-full"
        />

        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800 shadow">
          <CategoryIcon name={club.category} className="h-4 w-4" />
          {category.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-2">
          <h3 className={`${serif.className} flex-1 text-xl text-stone-900`}>
            {club.name}
          </h3>

          {verified && <VerifiedBadge />}
        </div>

        {club.tagline && (
          <p className="mt-1 text-sm leading-6 text-stone-700">
            {club.tagline}
          </p>
        )}

        <div className="mt-4 space-y-1.5 text-sm text-stone-700">
          <p className="flex items-center gap-2">
            <LineIcon name="pin" className="h-4 w-4 shrink-0 text-teal-700" />
            {club.county ?? 'Location not shared'}
            {club.area ? `, ${club.area}` : ''}
          </p>

          <p className="flex items-center gap-2">
            <LineIcon name="clock" className="h-4 w-4 shrink-0 text-teal-700" />
            {meetsSummary(club)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-800">
            {costBadge(club)}
          </span>

          {club.beginner_friendly && (
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-800">
              Beginner friendly
            </span>
          )}

          {club.age_group === '18_plus' && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              18+
            </span>
          )}
        </div>

        <span className="mt-5 inline-flex items-center gap-2 font-semibold text-teal-700">
          View club
          <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  )
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [county, setCounty] = useState('')
  const [meets, setMeets] = useState<string[]>([])
  const [cost, setCost] = useState('')
  const [beginnerOnly, setBeginnerOnly] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error: loadError } = await supabase
        .from('clubs')
        .select('*')
        .eq('status', 'approved')

      if (loadError) {
        setError('We could not load the clubs: ' + loadError.message)
        setLoading(false)
        return
      }

      setClubs((data ?? []) as Club[])
      setLoading(false)
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase()

    return clubs
      .filter((club) => {
        if (category && club.category !== category) return false

        if (county && club.county !== county && club.county !== 'Online') {
          return false
        }

        if (
          meets.length > 0 &&
          !(club.meets ?? []).some((value) => meets.includes(value))
        ) {
          return false
        }

        if (cost === 'free' && club.cost_type !== 'free') return false
        if (cost === 'paid' && club.cost_type === 'free') return false
        if (beginnerOnly && !club.beginner_friendly) return false

        if (text) {
          const haystack = [
            club.name,
            club.tagline ?? '',
            club.description ?? '',
            club.area ?? '',
            club.county ?? '',
            ...(club.tags ?? []),
          ]
            .join(' ')
            .toLowerCase()

          if (!haystack.includes(text)) return false
        }

        return true
      })
      .sort(
        (a, b) =>
          Number(isClubVerified(b)) - Number(isClubVerified(a)) ||
          (b.last_confirmed_at ?? '').localeCompare(a.last_confirmed_at ?? '') ||
          a.name.localeCompare(b.name)
      )
  }, [clubs, search, category, county, meets, cost, beginnerOnly])

  const anyFilter =
    !!search ||
    !!category ||
    !!county ||
    meets.length > 0 ||
    !!cost ||
    beginnerOnly

  function clearFilters() {
    setSearch('')
    setCategory('')
    setCounty('')
    setMeets([])
    setCost('')
    setBeginnerOnly(false)
  }

  function toggleMeets(value: string) {
    setMeets((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      <section className="mx-auto max-w-6xl px-6 pb-6 pt-12">
        <p className="text-sm font-semibold tracking-[0.25em] text-stone-600">
          COMMUNITY
        </p>

        <h1
          className={`${serif.className} mt-3 text-5xl leading-tight text-stone-900 md:text-7xl`}
        >
          Find your tribe
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
          Independent clubs across Kenya, all in one place. Find one that feels
          like you, then join on their own channel. No more guessing on social
          media.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clubs, for example running, chess or poetry"
                aria-label="Search clubs"
                className="w-full rounded-full border-2 border-stone-300 bg-white py-3 pl-12 pr-4 text-stone-900 outline-none focus:border-teal-600"
              />
            </div>

            <select
              value={county}
              onChange={(event) => setCounty(event.target.value)}
              aria-label="County"
              className="rounded-full border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-teal-600"
            >
              <option value="">All counties</option>

              {counties.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {county && (
            <p className="mt-2 text-xs text-stone-600">
              Showing clubs in {county}, plus online clubs.
            </p>
          )}

          <div className="zt-no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            <FilterChip
              label="All"
              selected={category === ''}
              onClick={() => setCategory('')}
            />

            {clubCategories.map((item) => (
              <FilterChip
                key={item.key}
                label={item.label}
                selected={category === item.key}
                onClick={() =>
                  setCategory(category === item.key ? '' : item.key)
                }
              >
                <CategoryIcon name={item.key} className="h-4 w-4" />
              </FilterChip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setShowMore((open) => !open)}
              className="text-sm font-semibold text-teal-700 underline"
            >
              {showMore ? 'Fewer filters' : 'More filters'}
            </button>

            {anyFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-stone-700 underline"
              >
                Clear all
              </button>
            )}
          </div>

          {showMore && (
            <div className="mt-4 grid gap-5 border-t border-stone-200 pt-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  When they meet
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {meetsOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={meets.includes(option.value)}
                      onClick={() => toggleMeets(option.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-900">Cost</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <FilterChip
                    label="Any"
                    selected={cost === ''}
                    onClick={() => setCost('')}
                  />

                  <FilterChip
                    label="Free"
                    selected={cost === 'free'}
                    onClick={() => setCost('free')}
                  />

                  <FilterChip
                    label="Paid"
                    selected={cost === 'paid'}
                    onClick={() => setCost('paid')}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-900">
                  Good to know
                </p>

                <div className="mt-2">
                  <FilterChip
                    label="Beginner friendly"
                    selected={beginnerOnly}
                    onClick={() => setBeginnerOnly((value) => !value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-coral-200 bg-coral-50 px-5 py-3 text-coral-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-[2rem] bg-stone-200"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200">
            <h2 className={`${serif.className} text-2xl text-stone-900`}>
              No clubs match that yet
            </h2>

            <p className="mt-2 text-stone-700">
              Try fewer filters, or a different county. New clubs are added
              regularly.
            </p>

            {anyFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 font-medium text-stone-800">
              {filtered.length} {filtered.length === 1 ? 'club' : 'clubs'}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}