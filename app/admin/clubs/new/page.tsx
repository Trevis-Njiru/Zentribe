'use client'

import { AdminShell } from '@/lib/AdminShell'
import { ClubForm } from '@/lib/AdminClubForm'

export default function NewClubPage() {
  return (
    <AdminShell
      title="Add club"
      subtitle="Fill in the club's details. You can add a cover photo right after saving."
      crumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Clubs', href: '/admin/clubs' },
        { label: 'Add' },
      ]}
    >
      <ClubForm />
    </AdminShell>
  )
}