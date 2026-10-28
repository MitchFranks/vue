'use client'

// Add a staff member.

import { Breadcrumbs, PageHeader } from '@/components/ui/primitives'
import { StaffForm } from '@/components/directory/StaffForm'

export default function NewStaffPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Staff Directory', href: '/staff' }, { label: 'Add staff member' }]} />
      <PageHeader title="Add staff member" lead="Contact details, role and usual hours. You can change any of it later." />
      <StaffForm />
    </div>
  )
}
