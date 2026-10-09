'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notice, Section } from '@/lib/AdminShell'
import {
  PhotoField,
  ProfileFields,
  emptyProfileForm,
  formFromProfessional,
  payloadFromForm,
} from '@/lib/ProfileEditor'
import type { ProfileForm } from '@/lib/ProfileEditor'
import { verificationChecks } from '@/lib/matching'
import type { Professional } from '@/lib/matching'

const inputClass =
  'mt-2 w-full rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-teal-600'

export function ProfessionalForm({
  professional,
}: {
  professional?: Professional | null
}) {
  const [fullName, setFullName] = useState(professional?.full_name ?? '')
  const [professionalType, setProfessionalType] = useState(
    professional?.professional_type ?? ''
  )
  const [form, setForm] = useState<ProfileForm>(
    professional ? formFromProfessional(professional) : emptyProfileForm
  )
  const [checks, setChecks] = useState<string[]>(
    professional?.verification_checks ?? []
  )
  const [listing, setListing] = useState(
    professional?.verification_status ?? 'pending'
  )
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    professional?.photo_url ?? null
  )
  const [verifiedAt, setVerifiedAt] = useState<string | null>(
    professional?.verified_at ?? null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('created')) {
      setSuccess('Professional added. You can add a photo below.')
    }
  }, [])

  function toggleCheck(key: string) {
    setChecks((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    )
  }

  async function save() {
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Please enter the professional name.')
      return
    }

    if (!professionalType.trim()) {
      setError('Please enter the professional type.')
      return
    }

    setSaving(true)

    const supabase = createClient()

    const willBeVerified =
      checks.includes('identity') && checks.includes('credentials')

    const payload = {
      full_name: fullName.trim(),
      professional_type: professionalType.trim(),
      ...payloadFromForm(form),
      verification_status: listing,
      verification_checks: checks,
      verified_at: willBeVerified
        ? verifiedAt ?? new Date().toISOString()
        : null,
    }

    if (professional) {
      const { data, error: updateError } = await supabase
        .from('professionals')
        .update(payload)
        .eq('id', professional.id)
        .select('*')
        .single()

      if (updateError || !data) {
        setError(updateError?.message ?? 'The database did not allow this change.')
        setSaving(false)
        return
      }

      setVerifiedAt((data as Professional).verified_at)
      setSuccess('Changes saved.')
      setSaving(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('professionals')
      .insert(payload)
      .select('id')
      .single()

    if (insertError || !data) {
      setError(insertError?.message ?? 'We could not add this professional.')
      setSaving(false)
      return
    }

    window.location.href = `/admin/professionals/${data.id}?created=1`
  }

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}

      <Section title="The basics">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-stone-900">
              Full name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Jane Doe"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-900">
              Professional type
            </label>

            <input
              type="text"
              value={professionalType}
              onChange={(event) => setProfessionalType(event.target.value)}
              placeholder="e.g. Counselling psychologist"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 md:w-1/2">
          <label className="block text-sm font-semibold text-stone-900">
            Listing
          </label>

          <select
            value={listing}
            onChange={(event) => setListing(event.target.value)}
            className={inputClass}
          >
            <option value="pending">Awaiting approval (hidden from members)</option>
            <option value="approved">Listed for members</option>
          </select>
        </div>
      </Section>

      <Section title="Photo">
        {professional ? (
          <PhotoField
            professionalId={professional.id}
            name={fullName || professional.full_name}
            photoUrl={photoUrl}
            onChange={setPhotoUrl}
          />
        ) : (
          <p className="text-sm text-stone-600">
            Save this professional first, and you will be able to upload a
            photo right after.
          </p>
        )}
      </Section>

      <Section
        title="Profile details"
        hint="This is what members see and what the matching uses."
      >
        <ProfileFields form={form} onChange={setForm} />
      </Section>

      <Section title="Verified by Zentribe">
        <p className="text-sm leading-6 text-stone-700">
          Only tick the checks you have actually completed. The badge shows once
          both identity and qualifications are ticked, and members see exactly
          which checks were done.
        </p>

        <div className="mt-4 space-y-3">
          {verificationChecks.map((check) => (
            <label
              key={check.key}
              className="flex cursor-pointer items-start gap-3 text-stone-900"
            >
              <input
                type="checkbox"
                checked={checks.includes(check.key)}
                onChange={() => toggleCheck(check.key)}
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
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving
            ? 'Saving...'
            : professional
              ? 'Save changes'
              : 'Add professional'}
        </button>

        <a
          href="/admin/professionals"
          className="font-semibold text-teal-700 underline"
        >
          Back to all professionals
        </a>
      </div>
    </div>
  )
}