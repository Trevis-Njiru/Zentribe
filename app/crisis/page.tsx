'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Professional = {
  id: string
  full_name: string
  professional_type: string | null
  specializations: string[]
  languages: string[]
  session_types: string[]
  availability: string[]
  location: string | null
  bio: string | null
  verification_status: string
}

type SessionRequest = {
  id: string
  user_id: string
  professional_id: string
  note: string | null
  status: string
  created_at: string
  professional?: {
    full_name: string
    professional_type: string | null
  } | null
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [requests, setRequests] = useState<SessionRequest[]>([])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [fullName, setFullName] = useState('')
  const [professionalType, setProfessionalType] = useState('')
  const [specializations, setSpecializations] = useState('')
  const [languages, setLanguages] = useState('')
  const [sessionTypes, setSessionTypes] = useState('')
  const [availability, setAvailability] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadAdminPage() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (profile?.role !== 'admin') {
        setAuthorized(false)
        setLoading(false)
        return
      }

      setAuthorized(true)

      await Promise.all([
        loadProfessionals(),
        loadRequests(),
      ])
    }

    loadAdminPage()
  }, [])

  async function loadProfessionals() {
    const supabase = createClient()

    const { data, error: professionalsError } = await supabase
      .from('professionals')
      .select('*')
      .order('full_name')

    if (professionalsError) {
      setError(professionalsError.message)
      setLoading(false)
      return
    }

    setProfessionals(data || [])
    setLoading(false)
  }

  async function loadRequests() {
    const supabase = createClient()

    const { data, error: requestsError } = await supabase
      .from('session_requests')
      .select(`
        id,
        user_id,
        professional_id,
        note,
        status,
        created_at,
        professional:professionals (
          full_name,
          professional_type
        )
      `)
      .order('created_at', { ascending: false })

    if (requestsError) {
      setError(requestsError.message)
      return
    }

    setRequests(data || [])
  }

  function convertToArray(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function startEditing(professional: Professional) {
    setEditingId(professional.id)

    setFullName(professional.full_name)
    setProfessionalType(professional.professional_type || '')
    setSpecializations(
      professional.specializations?.join(', ') || ''
    )
    setLanguages(
      professional.languages?.join(', ') || ''
    )
    setSessionTypes(
      professional.session_types?.join(', ') || ''
    )
    setAvailability(
      professional.availability?.join(', ') || ''
    )
    setLocation(professional.location || '')
    setBio(professional.bio || '')

    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function clearForm() {
    setEditingId(null)
    setFullName('')
    setProfessionalType('')
    setSpecializations('')
    setLanguages('')
    setSessionTypes('')
    setAvailability('')
    setLocation('')
    setBio('')
  }

  async function saveProfessional() {
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

    const professionalData = {
      full_name: fullName.trim(),
      professional_type: professionalType.trim(),
      specializations: convertToArray(specializations),
      languages: convertToArray(languages),
      session_types: convertToArray(sessionTypes),
      availability: convertToArray(availability),
      location: location.trim() || null,
      bio: bio.trim() || null,
    }

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from('professionals')
        .update(professionalData)
        .eq('id', editingId)
        .select('*')
        .single()

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      setProfessionals((current) =>
        current
          .map((professional) =>
            professional.id === editingId
              ? data
              : professional
          )
          .sort((a, b) =>
            a.full_name.localeCompare(b.full_name)
          )
      )

      setSuccess('Professional updated successfully.')
      clearForm()
    } else {
      const { data, error: insertError } = await supabase
        .from('professionals')
        .insert({
          ...professionalData,
          verification_status: 'pending',
        })
        .select('*')
        .single()

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }

      setProfessionals((current) =>
        [...current, data].sort((a, b) =>
          a.full_name.localeCompare(b.full_name)
        )
      )

      setSuccess('Professional added successfully.')
      clearForm()
    }

    setSaving(false)
  }

  async function toggleApproval(professional: Professional) {
    setError('')
    setSuccess('')

    const newStatus =
      professional.verification_status === 'approved'
        ? 'pending'
        : 'approved'

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('professionals')
      .update({
        verification_status: newStatus,
      })
      .eq('id', professional.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setProfessionals((current) =>
      current.map((item) =>
        item.id === professional.id
          ? {
              ...item,
              verification_status: newStatus,
            }
          : item
      )
    )

    setSuccess(
      newStatus === 'approved'
        ? `${professional.full_name} has been approved.`
        : `${professional.full_name} has been moved back to pending.`
    )
  }

  async function updateRequestStatus(
    requestId: string,
    newStatus: string
  ) {
    setError('')
    setSuccess('')

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('session_requests')
      .update({
        status: newStatus,
      })
      .eq('id', requestId)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
            }
          : request
      )
    )

    setSuccess(`Request marked as ${newStatus}.`)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-black">
          Loading admin dashboard...
        </p>
      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-black">
            Access denied
          </h1>

          <p className="mt-3 text-stone-700">
            You do not have permission to access the admin dashboard.
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-full bg-teal-800 px-6 py-3 font-semibold text-white"
          >
            Back to home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-teal-800">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-stone-700">
          Manage Zentribe professionals and session requests.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-black">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-black">
            {success}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black">
            {editingId
              ? 'Edit Professional'
              : 'Add Professional'}
          </h2>

          <p className="mt-1 text-sm text-stone-600">
            Separate multiple items with commas.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black">
                Full name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="e.g. Jane Doe"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Professional type
              </label>

              <input
                type="text"
                value={professionalType}
                onChange={(e) =>
                  setProfessionalType(e.target.value)
                }
                placeholder="e.g. Counsellor"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Specializations
              </label>

              <input
                type="text"
                value={specializations}
                onChange={(e) =>
                  setSpecializations(e.target.value)
                }
                placeholder="e.g. Anxiety, Stress, Relationships"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Languages
              </label>

              <input
                type="text"
                value={languages}
                onChange={(e) =>
                  setLanguages(e.target.value)
                }
                placeholder="e.g. English, Kiswahili"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Session types
              </label>

              <input
                type="text"
                value={sessionTypes}
                onChange={(e) =>
                  setSessionTypes(e.target.value)
                }
                placeholder="e.g. Online, In-person"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Availability
              </label>

              <input
                type="text"
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value)
                }
                placeholder="e.g. Weekdays, Evenings"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="e.g. Nairobi"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                placeholder="Short professional bio"
                rows={4}
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-black outline-none focus:border-teal-700"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveProfessional}
                disabled={saving}
                className="rounded-full bg-teal-800 px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Add Professional'}
              </button>

              {editingId && (
                <button
                  onClick={clearForm}
                  disabled={saving}
                  className="rounded-full border border-stone-400 px-6 py-3 font-semibold text-stone-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-black">
            Session Requests
          </h2>

          <p className="mt-1 text-sm text-stone-600">
            Review and manage requests submitted by members.
          </p>

          <div className="mt-4 space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
                No session requests yet.
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        {request.professional?.full_name ||
                          'Unknown professional'}
                      </h3>

                      <p className="text-stone-700">
                        {request.professional?.professional_type ||
                          'Professional'}
                      </p>
                    </div>

                    <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-stone-600">
                    <p>
                      Member ID: {request.user_id}
                    </p>

                    <p>
                      Requested: {formatDate(request.created_at)}
                    </p>

                    {request.note && (
                      <p>
                        Note: {request.note}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              'accepted'
                            )
                          }
                          className="rounded-full bg-teal-800 px-5 py-2 font-semibold text-white"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              'declined'
                            )
                          }
                          className="rounded-full border border-red-400 px-5 py-2 font-semibold text-red-700"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {request.status === 'accepted' && (
                      <button
                        onClick={() =>
                          updateRequestStatus(
                            request.id,
                            'cancelled'
                          )
                        }
                        className="rounded-full border border-stone-400 px-5 py-2 font-semibold text-stone-700"
                      >
                        Cancel
                      </button>
                    )}

                    {(request.status === 'declined' ||
                      request.status === 'cancelled') && (
                      <button
                        onClick={() =>
                          updateRequestStatus(
                            request.id,
                            'pending'
                          )
                        }
                        className="rounded-full border border-teal-700 px-5 py-2 font-semibold text-teal-800"
                      >
                        Move to Pending
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-black">
            Professionals
          </h2>

          <div className="mt-4 space-y-4">
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-bold text-black">
                  {professional.full_name}
                </h3>

                <p className="text-stone-700">
                  {professional.professional_type}
                </p>

                <p className="mt-2 text-sm text-stone-600">
                  Status:{' '}
                  {professional.verification_status}
                </p>

                <p className="mt-2 text-sm text-stone-600">
                  Specializations:{' '}
                  {professional.specializations?.join(', ') ||
                    'None'}
                </p>

                <p className="mt-1 text-sm text-stone-600">
                  Languages:{' '}
                  {professional.languages?.join(', ') ||
                    'None'}
                </p>

                <p className="mt-1 text-sm text-stone-600">
                  Sessions:{' '}
                  {professional.session_types?.join(', ') ||
                    'None'}
                </p>

                <p className="mt-1 text-sm text-stone-600">
                  Availability:{' '}
                  {professional.availability?.join(', ') ||
                    'None'}
                </p>

                <p className="mt-1 text-sm text-stone-600">
                  Location:{' '}
                  {professional.location ||
                    'Not provided'}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      startEditing(professional)
                    }
                    className="rounded-full border border-teal-700 px-5 py-2 font-semibold text-teal-800"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      toggleApproval(professional)
                    }
                    className="rounded-full bg-teal-800 px-5 py-2 font-semibold text-white"
                  >
                    {professional.verification_status ===
                    'approved'
                      ? 'Move to Pending'
                      : 'Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <a
            href="/dashboard"
            className="rounded-full border border-teal-700 px-6 py-3 font-semibold text-teal-800"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  )
}