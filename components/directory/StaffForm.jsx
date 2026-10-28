'use client'

// Create or edit a staff member. One form for both, built from the shared
// record patterns (components/ui/records.jsx) and the availability editor.

import { useRouter } from 'next/navigation'
import { useDirectory } from '@/lib/directory/store'
import { useStore } from '@/lib/store'
import { blankStaff, formToStaff, fullName, staffHref, STATUS_OPTIONS, staffToForm, validateStaff } from '@/lib/directory/model'
import { Select, TextInput, Textarea } from '@/components/ui/primitives'
import { CheckboxGroup, FormSection, RecordForm, useRecordForm, Wide } from '@/components/ui/records'
import { AvailabilityEditor, availabilityIsValid } from './Availability'

export function StaffForm({ person }) {
  const router = useRouter()
  const { roles, saveStaff } = useDirectory()
  const { toast } = useStore()
  const form = useRecordForm(person ? staffToForm(person) : blankStaff(roles), {
    idPrefix: 'staff',
    validate: (v) => ({
      ...validateStaff(v),
      ...(!availabilityIsValid(v.availability) && { availability: 'A day ends before it starts.' })
    })
  })
  const { field, values, setValue, errors } = form
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  const onValid = (v) => {
    const fields = formToStaff(v)
    const id = saveStaff(person?.id, fields)
    toast(person ? `Saved ${fullName(fields)}.` : `Added ${fullName(fields)} to your staff.`)
    router.push(staffHref(id))
  }

  return (
    <RecordForm
      onSubmit={form.submit(onValid)}
      submitLabel={person ? 'Save changes' : 'Add staff member'}
      cancelHref={person ? staffHref(person.id) : '/staff'}
    >
      <FormSection title="Contact" icon="user">
        <TextInput label="First name" autoComplete="off" {...field('firstName')} />
        <TextInput label="Last name" autoComplete="off" {...field('lastName')} />
        <TextInput label="Phone" type="tel" placeholder="(555) 555-0100" {...field('phone')} />
        <TextInput label="Email" type="email" placeholder="name@example.com" {...field('email')} />
      </FormSection>

      <FormSection title="Role and status" icon="users" subtitle="The main role is what they are usually scheduled as.">
        <Select label="Main role" options={roleOptions} {...field('primaryRoleId')} />
        <Select label="Status" options={STATUS_OPTIONS} hint="Inactive staff are not offered for new events." {...field('status')} />
        <Wide>
          <CheckboxGroup
            legend="Can also work as"
            idPrefix="staff-other-role"
            options={roleOptions.map((o) => ({ ...o, disabled: o.value === values.primaryRoleId }))}
            value={values.otherRoleIds}
            onChange={(ids) => setValue('otherRoleIds', ids)}
          />
        </Wide>
      </FormSection>

      <FormSection title="Availability" icon="calendar" subtitle="Their usual week. The Staffing Planner uses this to suggest who can cover a shift.">
        <Wide>
          <AvailabilityEditor
            idPrefix="staff-availability"
            value={values.availability}
            onChange={(a) => setValue('availability', a)}
            status={values.availabilityStatus}
            onStatusChange={(s) => setValue('availabilityStatus', s)}
          />
          {errors.availability && <p className="mt-2 text-small text-status-now">{errors.availability}</p>}
        </Wide>
        <TextInput label="Preferred hours" placeholder="20–30/week" hint="Optional." {...field('preferredHours')} />
      </FormSection>

      <FormSection title="Notes" icon="file">
        <Wide>
          <TextInput label="Skills or qualifications" hint="Optional. Separate with commas." placeholder="Bar setup, Alcohol service certified" {...field('skills')} />
        </Wide>
        <Wide>
          <Textarea label="Notes" rows={3} hint="Only you can see these." {...field('notes')} />
        </Wide>
      </FormSection>
    </RecordForm>
  )
}
