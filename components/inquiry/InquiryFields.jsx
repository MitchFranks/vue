'use client'

// Step 2 of the client form: "About you" (the same for every kind), then the
// fields the chosen kind needs. `form` is a useRecordForm over blankInquiry(),
// with idPrefix 'inq', so `form.field(name)` gives each control its id,
// value, onChange and error. Rules are in lib/inquiries.js validateInquiry.

import { CALL_FORMATS, CONTACT_PREFS, QUESTION_MAX, SERVICES, TIMES_OF_DAY } from '@/lib/inquiries'
import { EVENT_TYPES, TODAY_KEY } from '@/lib/mock/events'
import { Icon, Select, Textarea, TextInput } from '@/components/ui'
import { CHECKBOX, CheckboxGroup, FormSection, Wide } from '@/components/records'

const choose = (label) => [{ value: '', label }]

/** CheckboxGroup with an error under it, focusable by id so submit can move to it. */
function Checkboxes({ form, name, legend, hint }) {
  const error = form.errors[name]
  return (
    <div id={`inq-${name}`} tabIndex={-1} className="rounded-sm">
      <CheckboxGroup
        legend={legend}
        hint={error ? undefined : hint}
        idPrefix={`inq-${name}`}
        options={SERVICES}
        value={form.values[name]}
        onChange={(v) => form.setValue(name, v)}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-small text-status-now" role="alert">
          <Icon name="alert" size={13} />
          {error}
        </p>
      )}
    </div>
  )
}

function WhenFields({ form }) {
  return (
    <>
      <TextInput label="Preferred date" type="date" min={TODAY_KEY} {...form.field('preferredDate')} />
      <Select label="Time of day" options={[...choose('Choose…'), ...TIMES_OF_DAY.map((t) => t.value)]} {...form.field('timeOfDay')} />
    </>
  )
}

function MessageField({ form, label }) {
  return (
    <Wide>
      <Textarea label={label} rows={3} maxLength={QUESTION_MAX} {...form.field('message')} />
    </Wide>
  )
}

export function InquiryFields({ form }) {
  const { kind, contactPref, format, flexible, question } = form.values
  const phoneHint =
    kind === 'call' && format === 'phone' ? 'Needed so we can call you.' : contactPref === 'Email' ? 'Optional.' : `Needed so we can ${contactPref === 'Text' ? 'text' : 'call'} you.`

  return (
    <>
      <FormSection title="About you" icon="user">
        <TextInput label="Your name" autoComplete="name" data-autofocus {...form.field('name')} />
        <TextInput label="Partner's name (optional)" {...form.field('partnerName')} />
        <TextInput label="Email" type="email" autoComplete="email" {...form.field('email')} />
        <TextInput label="Phone" type="tel" autoComplete="tel" hint={phoneHint} {...form.field('phone')} />
        <Select label="Best way to reach you" options={CONTACT_PREFS} {...form.field('contactPref')} />
      </FormSection>

      {kind === 'walkthrough' && (
        <FormSection title="Your visit" icon="home" subtitle="A request: we'll confirm the exact time with you.">
          <WhenFields form={form} />
          <TextInput label="Backup date (optional)" type="date" min={TODAY_KEY} {...form.field('backupDate')} />
          <Select label="How many people are coming" options={['1', '2', '3', '4', '5', '6']} {...form.field('attendees')} />
          <MessageField form={form} label="Anything we should know (optional)" />
        </FormSection>
      )}

      {kind === 'call' && (
        <FormSection title="Your call" icon="phone" subtitle="A request: we'll confirm the exact time with you.">
          <Wide>
            <Select
              label="Phone call or video tour"
              options={[...choose('Choose…'), ...CALL_FORMATS]}
              hint="A video tour walks you through the spaces on a video call."
              {...form.field('format')}
            />
          </Wide>
          <WhenFields form={form} />
          <MessageField form={form} label="Anything you'd like to cover (optional)" />
        </FormSection>
      )}

      {kind === 'quote' && (
        <FormSection title="Your event" icon="calendar">
          <Select label="Type of event" options={EVENT_TYPES} {...form.field('eventType')} />
          <TextInput label="Estimated guests" type="number" min="1" max="500" inputMode="numeric" {...form.field('guests')} />
          {flexible ? (
            <TextInput label="Month you're thinking of (optional)" type="month" min={TODAY_KEY.slice(0, 7)} {...form.field('month')} />
          ) : (
            <TextInput label="Event date" type="date" min={TODAY_KEY} {...form.field('eventDate')} />
          )}
          <label className="flex cursor-pointer items-start gap-2 self-end pb-2 text-body text-ink">
            <input
              type="checkbox"
              id="inq-flexible"
              className={CHECKBOX}
              checked={flexible}
              onChange={(e) => form.setValue('flexible', e.target.checked)}
            />
            We&apos;re flexible on the date
          </label>
          <Wide>
            <Checkboxes form={form} name="services" legend="Services you're interested in (optional)" />
          </Wide>
          <MessageField form={form} label="Anything else (optional)" />
        </FormSection>
      )}

      {kind === 'services' && (
        <FormSection title="Your question" icon="info">
          <Wide>
            <Checkboxes form={form} name="services" legend="Services you're asking about" />
          </Wide>
          <Wide>
            <Textarea
              label="Your question"
              rows={4}
              maxLength={QUESTION_MAX}
              hint={`${question.trim().length} of ${QUESTION_MAX} characters`}
              {...form.field('question')}
            />
          </Wide>
          <TextInput label="Event date, if you have one" type="date" min={TODAY_KEY} {...form.field('eventDate')} />
        </FormSection>
      )}
    </>
  )
}
