'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminShell, Notice } from '@/lib/AdminShell'
import { ProfessionalForm } from '@/lib/AdminProfessionalForm'
import type { Professional } from '@/lib/matching'

function Editor() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      setProfessional((data as Professional | null) ?? null)
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return <p className="text-stone-700">Loading...</p>

  if (!professional) {
    return <Notice kind="error">We could not find this professional.</Notice>
  }

  return <ProfessionalForm key={professional.id} professional={professional} />
}

export default function EditProfessionalPage() {
  return (
    <AdminShell
      title="Edit professional"
      subtitle="Update their profile, photo and verification."
      crumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Professionals', href: '/admin/professionals' },
        { label: 'Edit' },
      ]}
    >
      <Editor />
    </AdminShell>
  )
}