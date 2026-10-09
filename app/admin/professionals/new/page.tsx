'use client'

import { AdminShell } from '@/lib/AdminShell'
import { ProfessionalForm } from '@/lib/AdminProfessionalForm'

export default function NewProfessionalPage() {
  return (
    <AdminShell
      title="Add professional"
      subtitle="Fill in their details. You can add a photo right after saving."
      crumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Professionals', href: '/admin/professionals' },
        { label: 'Add' },
      ]}
    >
      <ProfessionalForm />
    </AdminShell>
  )
}