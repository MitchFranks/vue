'use client'

// Create or edit a vendor. Same record patterns as the staff form.

import { useRouter } from 'next/navigation'
import { useDirectory } from '@/lib/directory/store'
import { useStore } from '@/lib/store'
import { blankVendor, STATUS_OPTIONS, trimStrings, validateVendor, vendorHref } from '@/lib/directory/model'
import { Select, TextInput, Textarea } from '@/components/ui/primitives'
import { FormSection, RecordForm, useRecordForm, Wide } from '@/components/ui/records'

export function VendorForm({ vendor }) {
  const router = useRouter()
  const { categories, saveVendor } = useDirectory()
  const { toast } = useStore()
  const form = useRecordForm(vendor || blankVendor(categories), { idPrefix: 'vendor', validate: validateVendor })
  const { field } = form

  const onValid = (v) => {
    const { id: _id, venueId: _venue, createdAt: _created, updatedAt: _updated, ...fields } = trimStrings(v)
    const id = saveVendor(vendor?.id, fields)
    toast(vendor ? `Saved ${fields.name}.` : `Added ${fields.name} to your vendors.`)
    router.push(vendorHref(id))
  }

  return (
    <RecordForm onSubmit={form.submit(onValid)} submitLabel={vendor ? 'Save changes' : 'Add vendor'} cancelHref={vendor ? vendorHref(vendor.id) : '/vendors'}>
      <FormSection title="Company" icon="truck">
        <Wide>
          <TextInput label="Company name" autoComplete="off" {...field('name')} />
        </Wide>
        <Select label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} {...field('categoryId')} />
        <Select label="Status" options={STATUS_OPTIONS} hint="Inactive vendors stay on file but are not offered for new events." {...field('status')} />
      </FormSection>

      <FormSection title="Contact" icon="user">
        <TextInput label="Contact name" hint="The person you deal with." {...field('contactName')} />
        <TextInput label="Phone" type="tel" placeholder="(555) 555-0100" {...field('phone')} />
        <TextInput label="Email" type="email" placeholder="name@example.com" {...field('email')} />
        <TextInput label="Website" placeholder="example.com" hint="Optional." {...field('website')} />
      </FormSection>

      <FormSection title="About" icon="file">
        <Wide>
          <Textarea label="Description" rows={3} hint="What they provide, for anyone booking them." {...field('description')} />
        </Wide>
        <Wide>
          <Textarea label="Notes" rows={3} hint="Load-in times, deadlines, preferences. Only you can see these." {...field('notes')} />
        </Wide>
      </FormSection>
    </RecordForm>
  )
}
