'use client'

// Edit a staff member (?id=).

import { Breadcrumbs, PageHeader } from '@/components/ui/primitives'
import { QueryRecord } from '@/components/ui/records'
import { StaffForm } from '@/components/directory/StaffForm'
import { RecordNotFound } from '@/components/directory/RecordNotFound'
import { fullName, staffHref } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'

function EditStaff({ id }) {
  const { staffById, hydrated } = useDirectory()
  const person = staffById(id)
  if (!hydrated) return null
  if (!person) return <RecordNotFound noun="staff member" backHref="/staff" backLabel="Back to directory" />
  const name = fullName(person)
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff Directory', href: '/staff' },
          { label: name, href: staffHref(id) },
          { label: 'Edit' }
        ]}
      />
      <PageHeader title={`Edit ${name}`} />
      {/* Keyed so opening another person starts a fresh form. */}
      <StaffForm key={id} person={person} />
    </div>
  )
}

export default function EditStaffPage() {
  return <QueryRecord render={(id) => <EditStaff id={id} />} />
}
