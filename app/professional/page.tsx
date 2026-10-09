'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, LineIcon, VerifiedBadge } from '@/lib/ui'
import {
  PhotoField,
  ProfileFields,
  formFromProfessional,
  payloadFromForm,
} from '@/lib/ProfileEditor'
import type { ProfileForm } from '@/lib/ProfileEditor'
import { isVerified, verificationChecks } from '@/lib/matching'
import type { Professional } from '@/lib/matching'

type SessionRequest = {
  id: string
  user_id: string
  professional_id: string
  note: string | null
  status: string
  created_at: string
  session_date: string | null
  session_time: string | null
  session_format: string | null
  session_location: string | null
  professional_note: string | null
  member: {
    display_name: string | null
  } | null
}

type SessionDetails = {
  date: string
  time: string
  format: string
  location: string
  note: string
}

function completeness(p: Professional) {
  const checks = [
    !!p.photo_url,
    (p.bio ?? '').trim().length >= 60,
    (p.specializations ?? []).length > 0,
    (p.languages ?? []).length > 0,
    (p.session_types ?? []).length > 0,
    (p.availability ?? []).length > 0,
    !!p.location,
    (p.care_types ?? []).length > 0,
    !!p.gender,
    !!p.age_group,
  ]

  const done = checks.filter(Boolean).length

  return Math.round((done / checks.length) * 100)
}

function statusClass(status: string) {
  if (status === 'accepted') return 'bg-lime-100 text-lime-800'
  if (status === 'declined') return 'bg-coral-100 text-coral-800'
  if (status === 'cancelled') return 'bg-stone-100 text-stone-700'
  return 'bg-amber-100 text-amber-800'
}

const fieldClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-500'

export default function ProfessionalPage() {
  const supabase = createClient()

  const [professional, setProfessional] = useState<Professional | null>(null)
  const [requests, setRequests] = useState<SessionRequest[]>([])
  const [sessionDetails, setSessionDetails] = useState<
    Record<string, SessionDetails>
  >({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    loadProfessional()
  }, [])

  async function loadProfessional() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      window.location.href = '/login'
      return
    }

    const { data: professionalData, error: professionalError } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (professionalError || !professionalData) {
      console.error('Professional error:', professionalError)
      setProfessional(null)
      setLoading(false)
      return
    }

    setProfessional(professionalData as Professional)

    await loadRequests(professionalData.id)

    setLoading(false)
  }

  async function loadRequests(professionalId: string) {
    const { data, error } = await supabase
      .from('session_requests')
      .select(
        `
          id,
          user_id,
          professional_id,
          note,
          status,
          created_at,
          session_date,
          session_time,
          session_format,
          session_location,
          professional_note,
          member:profiles (
            display_name
          )
        `
      )
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Request error:', error)
      setRequests([])
      return
    }

    const loaded = (data || []) as unknown as SessionRequest[]

    setRequests(loaded)

    const details: Record<string, SessionDetails> = {}

    loaded.forEach((request) => {
      details[request.id] = {
        date: request.session_date || '',
        time: request.session_time || '',
        format: request.session_format || '',
        location: request.session_location || '',
        note: request.professional_note || '',
      }
    })

    setSessionDetails(details)
  }

  function startEditing() {
    if (!professional) return

    setForm(formFromProfessional(professional))
    setMessage('')
    setEditing(true)
  }

  async function saveProfile() {
    if (!professional || !form) return

    setSavingProfile(true)
    setMessage('Saving your profile...')

    const { data, error } = await supabase
      .from('professionals')
      .update(payloadFromForm(form))
      .eq('id', professional.id)
      .select('*')
      .single()

    if (error || !data) {
      setMessage(
        'Unable to save your profile: ' +
          (error?.message || 'the database did not allow this update.')
      )
      setSavingProfile(false)
      return
    }

    setProfessional(data as Professional)
    setEditing(false)
    setMessage('Your profile has been updated.')
    setSavingProfile(false)
  }

  function updateSessionField(
    requestId: string,
    field: keyof SessionDetails,
    value: string
  ) {
    setSessionDetails((current) => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        [field]: value,
      },
    }))
  }

  async function updateRequestStatus(requestId: string, status: string) {
    setMessage('')

    const { error } = await supabase
      .from('session_requests')
      .update({ status })
      .eq('id', requestId)

    if (error) {
      setMessage(`Unable to update request: ${error.message}`)
      return
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    )

    setMessage('Request updated successfully.')
  }

  async function saveSessionDetails(requestId: string) {
    const details = sessionDetails[requestId]

    if (!details) {
      setMessage('No session details were found to save.')
      return
    }

    setSavingId(requestId)
    setMessage('Saving session details...')

    const updateData = {
      session_date: details.date || null,
      session_time: details.time || null,
      session_format: details.format || null,
      session_location: details.location || null,
      professional_note: details.note || null,
    }

    try {
      const result = await Promise.race([
        supabase
          .from('session_requests')
          .update(updateData)
          .eq('id', requestId)
          .select('id'),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
      ])

      if (result === null) {
        setMessage(
          'Saving timed out. Refresh the page (Ctrl + Shift + R) and try again.'
        )
      } else if (result.error) {
        setMessage('Unable to save session details: ' + result.error.message)
      } else if (!result.data || result.data.length === 0) {
        setMessage('Nothing was saved. The database did not allow this update.')
      } else {
        setMessage('Session details saved successfully.')
      }
    } catch {
      setMessage('Something went wrong while saving. Please try again.')
    }

    setSavingId(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-stone-700">Loading professional dashboard...</p>
        </div>
      </main>
    )
  }

  if (!professional) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-stone-900">
              Professional account not connected
            </h1>

            <p className="mt-3 text-stone-700">
              Your account is not currently connected to a professional
              profile.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/dashboard'
              }}
              className="mt-6 rounded-full bg-teal-700 px-6 py-3 font-medium text-white hover:bg-teal-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  const percent = completeness(professional)
  const verified = isVerified(professional)
  const doneChecks = verificationChecks.filter((check) =>
    (professional.verification_checks ?? []).includes(check.key)
  )

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-teal-700">
            Professional Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Welcome, {professional.full_name}
          </h1>

          <p className="mt-2 text-stone-700">
            Manage your public profile and your members&apos; session requests.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
            {message}
          </div>
        )}

        <section className="zt-card-shadow mb-8 rounded-[2rem] bg-white p-6">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar
              name={professional.full_name}
              photoUrl={professional.photo_url}
              className="h-44 w-36 shrink-0 rounded-2xl text-xs"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-stone-900">
                  {professional.full_name}
                </h2>

                {verified && <VerifiedBadge className="h-7 w-7" />}
              </div>

              <p className="text-stone-700">{professional.professional_type}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    'rounded-full px-3 py-1 text-sm font-medium',
                    professional.verification_status === 'approved'
                      ? 'bg-lime-100 text-lime-800'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}
                >
                  {professional.verification_status === 'approved'
                    ? 'Listed for members'
                    : 'Waiting for approval'}
                </span>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-sm font-medium',
                    verified
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-stone-100 text-stone-700',
                  ].join(' ')}
                >
                  {verified ? 'Verified by Zentribe' : 'Verification in progress'}
                </span>
              </div>

              {doneChecks.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-stone-700">
                  {doneChecks.map((check) => (
                    <li key={check.key} className="flex items-center gap-2">
                      <LineIcon
                        name="check"
                        className="h-4 w-4 text-lime-600"
                      />
                      {check.title}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 max-w-sm">
                <div className="flex justify-between text-sm font-medium text-stone-800">
                  <span>Profile completeness</span>
                  <span>{percent}%</span>
                </div>

                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="mt-1 text-xs text-stone-600">
                  Complete profiles are matched more accurately.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="mt-5 rounded-full bg-teal-700 px-6 py-2.5 font-semibold text-white hover:bg-teal-800"
                >
                  Edit my profile
                </button>
              )}
            </div>
          </div>

          {editing && form && (
            <div className="mt-8 border-t border-stone-200 pt-6">
              <PhotoField
                professionalId={professional.id}
                name={professional.full_name}
                photoUrl={professional.photo_url}
                onChange={(url) =>
                  setProfessional({ ...professional, photo_url: url })
                }
              />

              <p className="mt-6 text-sm text-stone-600">
                Your name, professional type, approval and verification are
                managed by Zentribe, so they cannot be changed here.
              </p>

              <div className="mt-4">
                <ProfileFields form={form} onChange={setForm} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={saveProfile}
                  className="rounded-full bg-teal-700 px-8 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {savingProfile ? 'Saving...' : 'Save my profile'}
                </button>

                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => setEditing(false)}
                  className="rounded-full border-2 border-stone-300 px-8 py-3 font-semibold text-stone-800 hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-stone-900">
              Session Requests
            </h2>

            <p className="mt-1 text-stone-700">
              Review and manage requests from members.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-stone-700">
                You do not have any session requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => {
                const details = sessionDetails[request.id] || {
                  date: '',
                  time: '',
                  format: '',
                  location: '',
                  note: '',
                }

                const isSaving = savingId === request.id

                return (
                  <div
                    key={request.id}
                    className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                          {request.member?.display_name || 'Member'}
                        </h3>

                        <p className="mt-1 text-sm text-stone-600">
                          Requested on{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={[
                          'inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium',
                          statusClass(request.status),
                        ].join(' ')}
                      >
                        {request.status}
                      </span>
                    </div>

                    {request.note && (
                      <div className="mt-5 rounded-2xl bg-stone-50 p-4">
                        <p className="text-sm font-medium text-stone-700">
                          Member message
                        </p>

                        <p className="mt-1 text-stone-900">{request.note}</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {request.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              updateRequestStatus(request.id, 'accepted')
                            }
                            className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateRequestStatus(request.id, 'declined')
                            }
                            className="rounded-full border border-coral-300 bg-white px-5 py-2 text-sm font-medium text-coral-700 hover:bg-coral-50"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {request.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(request.id, 'cancelled')
                          }
                          className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                        >
                          Cancel Session
                        </button>
                      )}

                      {(request.status === 'declined' ||
                        request.status === 'cancelled') && (
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(request.id, 'pending')
                          }
                          className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
                        >
                          Move to Pending
                        </button>
                      )}
                    </div>

                    {request.status === 'accepted' && (
                      <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
                        <h4 className="text-lg font-semibold text-stone-900">
                          Session Details
                        </h4>

                        <p className="mt-1 text-sm text-stone-700">
                          Add the details the member will use for the session.
                        </p>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-stone-900">
                              Session Date
                            </label>

                            <input
                              type="date"
                              value={details.date}
                              onChange={(event) =>
                                updateSessionField(
                                  request.id,
                                  'date',
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-stone-900">
                              Session Time
                            </label>

                            <input
                              type="time"
                              value={details.time}
                              onChange={(event) =>
                                updateSessionField(
                                  request.id,
                                  'time',
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-stone-900">
                              Session Format
                            </label>

                            <select
                              value={details.format}
                              onChange={(event) =>
                                updateSessionField(
                                  request.id,
                                  'format',
                                  event.target.value
                                )
                              }
                              className={fieldClass}
                            >
                              <option value="">Select session format</option>
                              <option value="In person">In person</option>
                              <option value="Video call">Video call</option>
                              <option value="Phone call">Phone call</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-stone-900">
                              Location / Meeting Link
                            </label>

                            <input
                              type="text"
                              value={details.location}
                              onChange={(event) =>
                                updateSessionField(
                                  request.id,
                                  'location',
                                  event.target.value
                                )
                              }
                              placeholder="e.g. Online session or meeting link"
                              className={fieldClass}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-1 block text-sm font-medium text-stone-900">
                            Message to Member
                          </label>

                          <textarea
                            rows={4}
                            value={details.note}
                            onChange={(event) =>
                              updateSessionField(
                                request.id,
                                'note',
                                event.target.value
                              )
                            }
                            placeholder="Add any instructions or information for the member..."
                            className={fieldClass}
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => saveSessionDetails(request.id)}
                          className="mt-5 rounded-full bg-teal-700 px-6 py-3 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? 'Saving...' : 'Save Session Details'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}