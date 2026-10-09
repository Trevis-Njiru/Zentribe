'use client'

import { ReactNode, useState } from 'react'
import type { ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, LineIcon } from '@/lib/ui'
import { removeTherapistPhoto, uploadTherapistPhoto } from '@/lib/photos'
import { professionalSlots } from '@/lib/matching'
import type { Professional } from '@/lib/matching'
import {
  ageGroupOptions,
  careOptions,
  counties,
  focusAreaOptions,
  languageOptions,
  professionalGenderOptions,
  sessionTypeOptions,
  weekdaySlotOptions,
  weekendSlotOptions,
} from '@/lib/options'

export type ProfileForm = {
  bio: string
  specializations: string[]
  languages: string[]
  session_types: string[]
  availability: string[]
  location: string
  care_types: string[]
  gender: string
  age_group: string
  style_action: number
  style_relational: number
  style_creative: number
}

export const emptyProfileForm: ProfileForm = {
  bio: '',
  specializations: [],
  languages: ['English'],
  session_types: [],
  availability: [],
  location: '',
  care_types: ['individual'],
  gender: '',
  age_group: '',
  style_action: 50,
  style_relational: 50,
  style_creative: 50,
}

export function formFromProfessional(p: Professional): ProfileForm {
  return {
    bio: p.bio ?? '',
    specializations: p.specializations ?? [],
    languages: p.languages ?? [],
    session_types: p.session_types ?? [],
    availability: professionalSlots(p),
    location: p.location ?? '',
    care_types: p.care_types ?? [],
    gender: p.gender ?? '',
    age_group: p.age_group ?? '',
    style_action: p.style_action ?? 50,
    style_relational: p.style_relational ?? 50,
    style_creative: p.style_creative ?? 50,
  }
}

export function payloadFromForm(form: ProfileForm) {
  return {
    bio: form.bio.trim() || null,
    specializations: form.specializations,
    languages: form.languages,
    session_types: form.session_types,
    availability: form.availability,
    location: form.location || null,
    care_types: form.care_types,
    gender: form.gender || null,
    age_group: form.age_group || null,
    style_action: form.style_action,
    style_relational: form.style_relational,
    style_creative: form.style_creative,
  }
}

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        'rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all duration-300',
        selected
          ? 'border-teal-700 bg-teal-700 text-white'
          : 'border-stone-300 bg-white text-stone-800 hover:border-teal-400',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-stone-900">{label}</p>

      {hint && <p className="mt-0.5 text-xs text-stone-600">{hint}</p>}

      <div className="mt-2">{children}</div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border-2 border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none focus:border-teal-600'

export function ProfileFields({
  form,
  onChange,
}: {
  form: ProfileForm
  onChange: (next: ProfileForm) => void
}) {
  const [search, setSearch] = useState('')

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    onChange({ ...form, [key]: value })
  }

  const allAreas = Array.from(
    new Set([...focusAreaOptions, ...form.specializations])
  ).sort((a, b) => a.localeCompare(b))

  const shownAreas = allAreas.filter((area) =>
    area.toLowerCase().includes(search.trim().toLowerCase())
  )

  const styleSliders: {
    key: 'style_action' | 'style_relational' | 'style_creative'
    label: string
  }[] = [
    { key: 'style_action', label: 'Action oriented' },
    { key: 'style_relational', label: 'Relational and reflective' },
    { key: 'style_creative', label: 'Creative and integrative' },
  ]

  return (
    <div className="space-y-6">
      <Field
        label="Message to members"
        hint="This appears on your profile. Leave a blank line between paragraphs."
      >
        <textarea
          rows={6}
          value={form.bio}
          onChange={(event) => update('bio', event.target.value)}
          placeholder="Introduce yourself and how you work."
          className={inputClass}
        />
      </Field>

      <Field label="Types of care you offer">
        <div className="flex flex-wrap gap-2">
          {careOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={form.care_types.includes(option.value)}
              onClick={() =>
                update('care_types', toggle(form.care_types, option.value))
              }
            />
          ))}
        </div>
      </Field>

      <Field
        label="Areas of expertise"
        hint={`${form.specializations.length} selected. Members are matched on these.`}
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search areas, for example anxiety or grief"
          className={inputClass}
        />

        <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-xl bg-stone-50 p-3">
          {shownAreas.map((area) => (
            <Chip
              key={area}
              label={area}
              selected={form.specializations.includes(area)}
              onClick={() =>
                update('specializations', toggle(form.specializations, area))
              }
            />
          ))}

          {shownAreas.length === 0 && (
            <p className="text-sm text-stone-600">Nothing matches that.</p>
          )}
        </div>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Languages">
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set([...languageOptions, ...form.languages])
            ).map((language) => (
              <Chip
                key={language}
                label={language}
                selected={form.languages.includes(language)}
                onClick={() =>
                  update('languages', toggle(form.languages, language))
                }
              />
            ))}
          </div>
        </Field>

        <Field label="Session types">
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set([...sessionTypeOptions, ...form.session_types])
            ).map((type) => (
              <Chip
                key={type}
                label={type}
                selected={form.session_types.includes(type)}
                onClick={() =>
                  update('session_types', toggle(form.session_types, type))
                }
              />
            ))}
          </div>
        </Field>
      </div>

      <Field
        label="Availability"
        hint="Members choose the times that suit them, and we match on these."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-stone-50 p-3">
            <p className="text-sm font-semibold text-stone-800">Weekdays</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {weekdaySlotOptions.map((slot) => (
                <Chip
                  key={slot.value}
                  label={slot.label}
                  selected={form.availability.includes(slot.value)}
                  onClick={() =>
                    update('availability', toggle(form.availability, slot.value))
                  }
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 p-3">
            <p className="text-sm font-semibold text-stone-800">Weekends</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {weekendSlotOptions.map((slot) => (
                <Chip
                  key={slot.value}
                  label={slot.label}
                  selected={form.availability.includes(slot.value)}
                  onClick={() =>
                    update('availability', toggle(form.availability, slot.value))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </Field>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label="County" hint="Choose Online if you only meet online.">
          <select
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            <option value="Online">Online</option>

            {counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(event) => update('gender', event.target.value)}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>

            {professionalGenderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Age group">
          <select
            value={form.age_group}
            onChange={(event) => update('age_group', event.target.value)}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>

            {ageGroupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Your style"
        hint="Slide toward Yes where this describes how you work."
      >
        <div className="space-y-4 rounded-xl bg-stone-50 p-4">
          {styleSliders.map((slider) => (
            <div key={slider.key}>
              <div className="flex justify-between text-sm text-stone-800">
                <span>{slider.label}</span>
                <span>{form[slider.key]}%</span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form[slider.key]}
                onChange={(event) =>
                  update(slider.key, Number(event.target.value))
                }
                aria-label={slider.label}
                className="mt-1 h-2 w-full cursor-pointer accent-teal-700"
              />
            </div>
          ))}
        </div>
      </Field>
    </div>
  )
}

export function PhotoField({
  professionalId,
  name,
  photoUrl,
  onChange,
}: {
  professionalId: string
  name: string
  photoUrl: string | null
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
      const url = await uploadTherapistPhoto(supabase, professionalId, file)

      const { data, error: updateError } = await supabase
        .from('professionals')
        .update({ photo_url: url })
        .eq('id', professionalId)
        .select('id')

      if (updateError) throw new Error(updateError.message)

      if (!data || data.length === 0) {
        throw new Error('The database did not allow this change.')
      }

      await removeTherapistPhoto(supabase, photoUrl)
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
      .from('professionals')
      .update({ photo_url: null })
      .eq('id', professionalId)
      .select('id')

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? 'The database did not allow this change.')
      setBusy(false)
      return
    }

    await removeTherapistPhoto(supabase, photoUrl)
    onChange(null)
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar
        name={name}
        photoUrl={photoUrl}
        className="h-40 w-32 shrink-0 rounded-2xl text-xs"
      />

      <div>
        <p className="text-sm font-semibold text-stone-900">Profile photo</p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-stone-600">
          A clear, friendly photo works best. We crop it to a portrait shape and
          keep the file small.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <label
            className={[
              'inline-flex cursor-pointer items-center gap-2 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800',
              busy ? 'pointer-events-none opacity-60' : '',
            ].join(' ')}
          >
            <LineIcon name="user" className="h-4 w-4" />
            {busy ? 'Working...' : photoUrl ? 'Change photo' : 'Upload photo'}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {photoUrl && (
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