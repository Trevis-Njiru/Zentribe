'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'
import { ClubForm } from '@/lib/AdminClubForm'
import type { Club } from '@/lib/clubs'

function Editor() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <p className="text-stone-700">Loading...</p>

  if (!club) {
    return <Notice kind="error">We could not find this club.</Notice>
  }

  return <ClubForm key={club.id} club={club} />
}

export default function EditClubPage() {
  return (
    <AdminShell
      title="Edit club"
      subtitle="Update the details, cover photo and verification."
      crumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Clubs', href: '/admin/clubs' },
        { label: 'Edit' },
      ]}
    >
      <Editor />
    </AdminShell>
  )
}