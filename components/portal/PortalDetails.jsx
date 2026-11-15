'use client'

// Your details: guest count, key moment times, the day-of contact, guests'
// needs and outside vendors. The first save sends them; every later save is
// logged as "what changed", which the venue sees as a task until it has read
// it (lib/store.jsx). DetailsSummary is shared with the couple record.

import { Button, Card, EmptyState, Field, TextInput, Textarea } from '@/components/ui'
import { FormSection, RecordForm, useRecordForm, Wide } from '@/components/records'
import { blankDetails, DETAIL_GROUPS, detailText, stamp, validateDetails } from '@/lib/portal'
import { useStore } from '@/lib/store'

/** The details, read-only, grouped as the form groups them. */
export function DetailsSummary({ details }) {
  return (
    <div className="space-y-4">
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

export function PortalDetails({ record, onEdit }) {
  return (
    <section id="portal-details" className="scroll-mt-6">
      <Card
        title="Your details"
        icon="list"
        subtitle={record.details ? `Last updated ${stamp(record.detailsAt)}. Change anything until the week of your event.` : 'The guest count, key moments and who to call on the day.'}
        action={
          record.details && (
            <Button size="sm" onClick={onEdit}>
              Update details
            </Button>
          )
        }
      >
        {record.details ? (
          <DetailsSummary details={record.details} />
        ) : (
          <EmptyState
            icon="list"
            title="Tell us about your day"
            body="It takes about five minutes, and you can change it later."
            action={
              <Button variant="primary" onClick={onEdit}>
                Fill in your details
              </Button>
            }
          />
        )}
      </Card>
    </section>
  )
}

export function PortalDetailsForm({ couple, event, record, by, onDone }) {
  const { portalSaveDetails, toast } = useStore()
  const first = !record.details
  const form = useRecordForm(record.details || { ...blankDetails(), guestCount: event ? String(event.guests) : '' }, {
    idPrefix: 'details',
    validate: validateDetails
  })
  const { field } = form

  const save = form.submit((values) => {
    portalSaveDetails(couple.id, values, by)
    toast(first ? 'Thank you! The venue has your details.' : 'Saved. The venue can see exactly what you changed.')
    onDone()
    window.scrollTo({ top: 0 })
  })

  return (
    <RecordForm onSubmit={save} submitLabel={first ? 'Send to the venue' : 'Save changes'} onCancel={onDone}>
      {DETAIL_GROUPS.map((g) => (
        <FormSection key={g.id} title={g.title} subtitle={g.subtitle} icon={g.icon}>
          {g.fields.map((f) => {
            if (f.kind === 'long') {
              return (
                <Wide key={f.id}>
                  <Textarea label={f.label} hint={f.hint} rows={3} {...field(f.id)} />
                </Wide>
              )
            }
            const type = f.kind === 'number' ? 'text' : f.kind
            return (
              <TextInput
                key={f.id}
                label={f.label}
                hint={f.hint}
                type={type}
                inputMode={f.kind === 'number' ? 'numeric' : undefined}
                {...field(f.id)}
              />
            )
          })}
        </FormSection>
      ))}
    </RecordForm>
  )
}
