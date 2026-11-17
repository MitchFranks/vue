'use client'

// Step: details. One form, already filled in with anything sent before:
// guest count, key times, the day-of contact, guests' needs and outside
// vendors. The first save sends them; every later save is logged as what
// changed, which the venue sees until it has read it. DetailsSummary is the
// read-only version, shared with the couple record.

import { Field, TextInput, Textarea } from '@/components/ui'
import { FormSection, RecordForm, useRecordForm, Wide } from '@/components/records'
import { blankDetails, cleanDetails, DETAIL_FIELDS, DETAIL_GROUPS, detailText, diffDetails, STEP_COPY, validateDetails } from '@/lib/portal'
import { useStore } from '@/lib/store'
import { useEventSheet } from '@/lib/eventSheetStore'
import { SHEET_FIELDS } from '@/lib/eventSheet'

// The fields the portal and the Detail sheet share, by id.
const SHARED_FIELDS = SHEET_FIELDS.map((f) => f.id).filter((id) => DETAIL_FIELDS.some((f) => f.id === id))

/** The details, read-only, grouped as the form groups them. */
export function DetailsSummary({ details }) {
  return (
    <div className="space-y-5">
      {DETAIL_GROUPS.map((g) => (
        <div key={g.id}>
          <h3 className="mb-2 text-small font-medium text-ink">{g.title}</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            {g.fields.map((f) => {
              const text = detailText(f.id, details[f.id])
              return (
                <Field key={f.id} label={f.label} className={f.kind === 'long' ? 'sm:col-span-2' : ''}>
                  <span className={text === 'Not given' ? 'text-ink-muted' : 'whitespace-pre-line'}>{text}</span>
                </Field>
              )
            })}
          </dl>
        </div>
      ))}
    </div>
  )
}

export function DetailsStep({ couple, event, record, by, venue, screen, complete, back }) {
  const { portalSaveDetails, toast } = useStore()
  const { saveFields } = useEventSheet()
  const first = !record.details
  const form = useRecordForm(record.details || { ...blankDetails(), guestCount: event ? String(event.guests) : '' }, {
    idPrefix: 'details',
    validate: validateDetails
  })
  const { field } = form

  // Send what the couple changed to the event's Detail sheet, logged as a
  // change by the couple, so it reaches the staff. Only fields they changed
  // (on a first save, the ones they filled in) are sent, so a blank in the
  // portal never wipes what the venue already has.
  const toSheet = (values) => {
    if (!event) return
    const before = record.details ? cleanDetails(record.details) : {}
    const after = cleanDetails(values)
    const patch = Object.fromEntries(
      SHARED_FIELDS.filter((id) => (record.details ? after[id] !== before[id] : after[id])).map((id) => [id, after[id]])
    )
    if (Object.keys(patch).length) saveFields(event.id, 'Details from the couple', patch, { by: { name: by, kind: 'couple' } })
  }

  const save = form.submit((values) => {
    if (first) {
      portalSaveDetails(couple.id, values, by)
      toSheet(values)
      complete('details', `${venue.name} has your guest count, key times and day-of contact.`)
      return
    }
    const changes = diffDetails(record.details, cleanDetails(values))
    if (!changes.length) {
      toast('Nothing changed, so there was nothing to save.', 'info')
      back()
      return
    }
    portalSaveDetails(couple.id, values, by)
    toSheet(values)
    complete('details', `${changes.length} ${changes.length === 1 ? 'change' : 'changes'} saved. ${venue.name} sees exactly what you changed.`, 'Changes saved')
  })

  return screen('details', {
    title: first ? STEP_COPY.details.title : 'Your details',
    lead: first
      ? 'Skip anything you do not know yet. You can change it all until the week of your event.'
      : 'Change anything, then save. The venue sees exactly what you changed.',
    children: (
      <RecordForm onSubmit={save} submitLabel={first ? `Send to ${venue.name}` : 'Save changes'}>
        {DETAIL_GROUPS.map((g) => (
          <FormSection key={g.id} title={g.title} subtitle={g.subtitle} icon={g.icon}>
            {g.fields.map((f) =>
              f.kind === 'long' ? (
                <Wide key={f.id}>
                  <Textarea label={f.label} hint={f.hint} rows={3} {...field(f.id)} />
                </Wide>
              ) : (
                <TextInput
                  key={f.id}
                  label={f.label}
                  hint={f.hint}
                  type={f.kind === 'number' ? 'text' : f.kind}
                  inputMode={f.kind === 'number' ? 'numeric' : undefined}
                  {...field(f.id)}
                />
              )
            )}
          </FormSection>
        ))}
      </RecordForm>
    )
  })
}
