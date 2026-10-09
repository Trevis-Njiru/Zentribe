'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notice, Section } from '@/lib/AdminShell'
import {
  CoverField,
  clubCategories,
  clubChecks,
  meetsOptions,
  safeUrl,
} from '@/lib/clubs'
import type { Club } from '@/lib/clubs'
import { counties } from '@/lib/options'

type ClubFormState = {
  name: string
  tagline: string
  description: string
  category: string
  tags: string
  county: string
  area: string
  meets: string[]
  schedule_text: string
  cost_type: string
  cost_note: string
  beginner_friendly: boolean
  age_group: string
  member_count: string
  join_url: string
  instagram_url: string
  website_url: string
  checks: string[]
  confirmedNow: boolean
  status: string
}

const emptyForm: ClubFormState = {
  name: '',
  tagline: '',
  description: '',
  category: 'sports',
  tags: '',
  county: 'Nairobi',
  area: '',
  meets: [],
  schedule_text: '',
  cost_type: 'free',
  cost_note: '',
  beginner_friendly: true,
  age_group: 'all',
  member_count: '',
  join_url: '',
  instagram_url: '',
  website_url: '',
  checks: [],
  confirmedNow: false,
  status: 'approved',
}

function formFromClub(club: Club): ClubFormState {
  return {
    name: club.name,
    tagline: club.tagline ?? '',
    description: club.description ?? '',
    category: club.category,
    tags: (club.tags ?? []).join(', '),
    county: club.county ?? '',
    area: club.area ?? '',
    meets: club.meets ?? [],
    schedule_text: club.schedule_text ?? '',
    cost_type: club.cost_type,
    cost_note: club.cost_note ?? '',
    beginner_friendly: club.beginner_friendly,
    age_group: club.age_group,
    member_count: club.member_count === null ? '' : String(club.member_count),
    join_url: club.join_url ?? '',
    instagram_url: club.instagram_url ?? '',
    website_url: club.website_url ?? '',
    checks: club.verification_checks ?? [],
    confirmedNow: false,
    status: club.status,
  }
}

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

const inputClass =
  'mt-2 w-full rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-teal-600'

const labelClass = 'block text-sm font-semibold text-stone-900'

export function ClubForm({ club }: { club?: Club | null }) {
  const [form, setForm] = useState<ClubFormState>(
    club ? formFromClub(club) : emptyForm
  )
  const [coverUrl, setCoverUrl] = useState<string | null>(
    club?.cover_url ?? null
  )
  const [lastConfirmed, setLastConfirmed] = useState<string | null>(
    club?.last_confirmed_at ?? null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('created')) {
      setSuccess('Club added. You can add a cover photo below.')
    }
  }, [])

  function update<K extends keyof ClubFormState>(
    key: K,
    value: ClubFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('Please enter the club name.')
      return
    }

    const joinUrl = safeUrl(form.join_url)

    if (!joinUrl) {
      setError(
        'Please add a valid link, starting with https://, where people can join.'
      )
      return
    }

    if (form.instagram_url.trim() && !safeUrl(form.instagram_url)) {
      setError('The Instagram link is not a valid web address.')
      return
    }

    if (form.website_url.trim() && !safeUrl(form.website_url)) {
      setError('The website link is not a valid web address.')
      return
    }

    const memberCount = form.member_count.trim()
      ? Number(form.member_count)
      : null

    if (memberCount !== null && (Number.isNaN(memberCount) || memberCount < 0)) {
      setError('Member count must be a number.')
      return
    }

    setSaving(true)

    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      category: form.category,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      county: form.county || null,
      area: form.area.trim() || null,
      meets: form.meets,
      schedule_text: form.schedule_text.trim() || null,
      cost_type: form.cost_type,
      cost_note: form.cost_note.trim() || null,
      beginner_friendly: form.beginner_friendly,
      age_group: form.age_group,
      member_count: memberCount === null ? null : Math.round(memberCount),
      join_url: joinUrl,
      instagram_url: safeUrl(form.instagram_url),
      website_url: safeUrl(form.website_url),
      verification_checks: form.checks,
      last_confirmed_at: form.confirmedNow
        ? new Date().toISOString()
        : lastConfirmed,
      status: form.status,
    }

    if (club) {
      const { data, error: updateError } = await supabase
        .from('clubs')
        .update(payload)
        .eq('id', club.id)
        .select('*')
        .single()

      if (updateError || !data) {
        setError(updateError?.message ?? 'The database did not allow this change.')
        setSaving(false)
        return
      }

      setLastConfirmed((data as Club).last_confirmed_at)
      update('confirmedNow', false)
      setSuccess('Changes saved.')
      setSaving(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('clubs')
      .insert(payload)
      .select('id')
      .single()

    if (insertError || !data) {
      setError(insertError?.message ?? 'We could not add this club.')
      setSaving(false)
      return
    }

    window.location.href = `/admin/clubs/${data.id}?created=1`
  }

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}

      <Section title="The basics">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Club name</label>

            <input
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>

            <select
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              className={inputClass}
            >
              {clubCategories.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Short tagline</label>

          <input
            type="text"
            value={form.tagline}
            onChange={(event) => update('tagline', event.target.value)}
            placeholder="One line that makes someone curious"
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label className={labelClass}>Description</label>

          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="What the club does and what a first visit is like. Leave a blank line between paragraphs."
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label className={labelClass}>Tags (separate with commas)</label>

          <input
            type="text"
            value={form.tags}
            onChange={(event) => update('tags', event.target.value)}
            placeholder="running, fitness, early mornings"
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Cover photo">
        {club ? (
          <CoverField
            clubId={club.id}
            category={form.category}
            coverUrl={coverUrl}
            onChange={setCoverUrl}
          />
        ) : (
          <p className="text-sm text-stone-600">
            Save this club first, and you will be able to upload a cover photo
            right after.
          </p>
        )}
      </Section>

      <Section title="Where and when">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>County</label>

            <select
              value={form.county}
              onChange={(event) => update('county', event.target.value)}
              className={inputClass}
            >
              <option value="">Not shared</option>
              <option value="Online">Online</option>

              {counties.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Area or neighbourhood</label>

            <input
              type="text"
              value={form.area}
              onChange={(event) => update('area', event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className={labelClass}>When they meet</p>

          <div className="mt-2 flex flex-wrap gap-2">
            {meetsOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={form.meets.includes(option.value)}
                onClick={() => update('meets', toggle(form.meets, option.value))}
                className={[
                  'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-300',
                  form.meets.includes(option.value)
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-stone-300 bg-white text-stone-800 hover:border-teal-400',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={form.schedule_text}
            onChange={(event) => update('schedule_text', event.target.value)}
            placeholder="Exact schedule, for example Saturdays, 6:30am"
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Cost and who it is for">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Cost</label>

            <select
              value={form.cost_type}
              onChange={(event) => update('cost_type', event.target.value)}
              className={inputClass}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="donation">Pay what you can</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Cost note</label>

            <input
              type="text"
              value={form.cost_note}
              onChange={(event) => update('cost_note', event.target.value)}
              placeholder="For example KES 500 per session"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Who it is for</label>

            <select
              value={form.age_group}
              onChange={(event) => update('age_group', event.target.value)}
              className={inputClass}
            >
              <option value="all">Open to everyone</option>
              <option value="18_plus">18 and over</option>
              <option value="youth">Young people under 18</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Approximate members</label>

            <input
              type="number"
              min={0}
              value={form.member_count}
              onChange={(event) => update('member_count', event.target.value)}
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 pt-8 text-stone-900">
            <input
              type="checkbox"
              checked={form.beginner_friendly}
              onChange={(event) =>
                update('beginner_friendly', event.target.checked)
              }
              className="h-4 w-4 accent-teal-700"
            />
            Beginner friendly
          </label>
        </div>
      </Section>

      <Section
        title="How to join"
        hint="Clubs stay independent, so these links take members to the club's own page or group."
      >
        <div>
          <label className={labelClass}>
            Join link (WhatsApp, Instagram, Telegram or website)
          </label>

          <input
            type="text"
            value={form.join_url}
            onChange={(event) => update('join_url', event.target.value)}
            placeholder="https://"
            className={inputClass}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Instagram (optional)</label>

            <input
              type="text"
              value={form.instagram_url}
              onChange={(event) => update('instagram_url', event.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Website (optional)</label>

            <input
              type="text"
              value={form.website_url}
              onChange={(event) => update('website_url', event.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Verified by Zentribe">
        <p className="text-sm leading-6 text-stone-700">
          Only tick the checks you have really done. The badge shows once the
          organizer and the meetings are both confirmed.
        </p>

        <div className="mt-4 space-y-3">
          {clubChecks.map((check) => (
            <label
              key={check.key}
              className="flex cursor-pointer items-start gap-3 text-stone-900"
            >
              <input
                type="checkbox"
                checked={form.checks.includes(check.key)}
                onChange={() => update('checks', toggle(form.checks, check.key))}
                className="mt-1 h-4 w-4 accent-teal-700"
              />

              <span>
                <span className="font-medium">{check.title}</span>

                <span className="block text-sm text-stone-600">
                  {check.detail}
                </span>
              </span>
            </label>
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-stone-900">
          <input
            type="checkbox"
            checked={form.confirmedNow}
            onChange={(event) => update('confirmedNow', event.target.checked)}
            className="h-4 w-4 accent-teal-700"
          />
          I confirmed this club is active today
        </label>
      </Section>

      <Section title="Listing">
        <select
          value={form.status}
          onChange={(event) => update('status', event.target.value)}
          className={inputClass}
        >
          <option value="approved">Listed in the directory</option>
          <option value="pending">Pending (not shown)</option>
          <option value="hidden">Hidden (not shown)</option>
        </select>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? 'Saving...' : club ? 'Save changes' : 'Add club'}
        </button>

        <a href="/admin/clubs" className="font-semibold text-teal-700 underline">
          Back to all clubs
        </a>
      </div>
    </div>
  )
}