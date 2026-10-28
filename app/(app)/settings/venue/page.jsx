'use client'

// Venue profile: the venue's own details. Lives under Settings, not in the
// main menu, because it is set up once and rarely changed. The primary
// contact is a person from the Staff Directory, not free text.

import { Breadcrumbs, PageHeader, Select, TextInput, Textarea } from '@/components/ui/primitives'
import { FormSection, RecordForm, useRecordForm, Wide } from '@/components/ui/records'
import { fullName, trimStrings, validateVenue } from '@/lib/directory/model'
import { VENUE_TYPES } from '@/lib/mock/directory'
import { useDirectory } from '@/lib/directory/store'
import { useStore } from '@/lib/store'

// The address is nested in the record and flat in the form.
const toForm = (venue) => ({ ...venue, ...venue.address })
const fromForm = (values) => {
  const { street, city, region, postalCode, ...v } = trimStrings(values)
  return { ...v, address: { street, city, region, postalCode } }
}

function VenueForm({ venue }) {
  const { staff, saveVenue } = useDirectory()
  const { toast } = useStore()
  const form = useRecordForm(toForm(venue), { idPrefix: 'venue', validate: validateVenue })
  const { field } = form
  const contacts = staff
    .filter((p) => p.status === 'active' || p.id === venue.primaryContactId)
    .map((p) => ({ value: p.id, label: fullName(p) }))

  return (
    <RecordForm
      onSubmit={form.submit((v) => {
        saveVenue(fromForm(v))
        toast('Venue profile saved.')
      })}
      submitLabel="Save venue profile"
      onCancel={form.dirty ? form.reset : undefined}
    >
      <FormSection title="Venue" icon="home">
        <Wide>
          <TextInput label="Venue name" {...field('name')} />
        </Wide>
        <Select label="Venue type" options={VENUE_TYPES} {...field('venueType')} />
        <Select
          label="Primary manager or contact"
          options={[{ value: '', label: 'No one yet' }, ...contacts]}
          hint="From your Staff Directory."
          {...field('primaryContactId')}
        />
        <Wide>
          <Textarea label="Description" rows={3} hint="Optional. A sentence or two about the venue." {...field('description')} />
        </Wide>
      </FormSection>

      <FormSection title="Address">
        <Wide>
          <TextInput label="Street address" autoComplete="street-address" {...field('street')} />
        </Wide>
        <TextInput label="City" autoComplete="address-level2" {...field('city')} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="State" autoComplete="address-level1" {...field('region')} />
          <TextInput label="ZIP code" autoComplete="postal-code" {...field('postalCode')} />
        </div>
      </FormSection>

      <FormSection title="Main contact details" icon="mail" subtitle="What couples and vendors use to reach the venue.">
        <TextInput label="Main phone" type="tel" {...field('phone')} />
        <TextInput label="Main email" type="email" {...field('email')} />
        <TextInput label="Website" hint="Optional." {...field('website')} />
      </FormSection>
    </RecordForm>
  )
}

export default function VenueProfilePage() {
  const { venue, hydrated } = useDirectory()
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/settings' }, { label: 'Venue profile' }]} />
      <PageHeader title="Venue profile" lead="Your venue's name, address and main contact details." />
      {/* Wait for saved details so the form starts from them, not the sample. */}
      {hydrated && <VenueForm venue={venue} />}
    </div>
  )
}
