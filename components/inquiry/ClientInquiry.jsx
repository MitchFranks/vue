'use client'

// ---------------------------------------------------------------------------
// The public inquiry form at /inquire: what a potential client fills in to
// book a walkthrough, ask for a quote, ask about services or set up a call.
//
//   kind  ->  details  ->  review  ->  sent
//
// Sending saves the inquiry in the store, which turns it into a task in the
// manager's Tasks (lib/store.jsx, "client inquiries"). ?type=<kind> skips
// step 1, so each button on a venue website can link straight to its form.
// Spec: docs/INQUIRY-FLOW-SPEC.md.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { aboutRows, blankInquiry, cleanInquiry, inquiryRows, kindOf, validateInquiry } from '@/lib/inquiries'
import { ACTIVE_ACCOUNT } from '@/lib/account/session'
import { venue } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { Alert, Button, Card, Icon } from '@/components/ui'
import { useRecordForm } from '@/components/records'
import { InquiryFrame } from './InquiryFrame'
import { InquiryFields } from './InquiryFields'
import { KindPicker } from './KindPicker'
import { SummaryList } from './SummaryList'

const top = () => window.scrollTo({ top: 0 })

export function ClientInquiry() {
  const linked = kindOf(useSearchParams().get('type'))?.value || ''
  const { submitInquiry } = useStore()
  // The signed-in venue's name, else the sample venue's (signed out, the form sends to the demo).
  const venueName = ACTIVE_ACCOUNT?.venueName || venue.name

  const [step, setStep] = useState(linked ? 'details' : 'kind')
  const [kindError, setKindError] = useState(null)
  const [sent, setSent] = useState(null)
  const form = useRecordForm(blankInquiry(linked), { idPrefix: 'inq', validate: validateInquiry })
  const kind = kindOf(form.values.kind)

  const go = (next) => {
    setStep(next)
    top()
  }

  if (step === 'sent' && sent) {
    return (
      <InquiryFrame venueName={venueName} title={`Thanks, ${sent.name.split(' ')[0]}.`}>
        <Alert tone="done" title="Your inquiry is on its way">
          {venueName} will get back to you within one business day by {sent.contactPref === 'Email' ? 'email' : sent.contactPref === 'Text' ? 'text' : 'phone'}.
        </Alert>
        <Card title="What happens next" icon="info">
          <ol className="list-decimal space-y-1.5 pl-4 text-ink">
            <li>{kindOf(sent.kind).next}</li>
            <li>If anything is unclear, we&apos;ll ask before we reply.</li>
          </ol>
          <p className="mt-4 text-small text-ink-muted">
            Your reference: <span className="font-mono text-ink">{sent.id}</span>
          </p>
        </Card>
        <Button
          variant="secondary"
          onClick={() => {
            form.reset()
            setSent(null)
            go('kind')
          }}
        >
          Send another inquiry
        </Button>
      </InquiryFrame>
    )
  }

  if (step === 'kind') {
    return (
      <InquiryFrame
        venueName={venueName}
        title="How can we help?"
        lead={`Tell ${venueName} what you're planning. It takes about two minutes.`}
      >
        <KindPicker
          value={form.values.kind}
          error={kindError}
          onChange={(k) => {
            form.setValue('kind', k)
            setKindError(null)
          }}
        />
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => {
              if (!form.values.kind) {
                setKindError('Choose what you would like help with.')
                document.getElementById('inq-kind')?.focus()
                return
              }
              go('details')
            }}
          >
            Continue
            <Icon name="arrowRight" size={14} />
          </Button>
        </div>
      </InquiryFrame>
    )
  }

  if (step === 'review') {
    const clean = cleanInquiry(form.values)
    return (
      <InquiryFrame venueName={venueName} title="Check your inquiry" lead="Nothing is sent until you press Send inquiry.">
        <Card title="About you" icon="user" action={<EditButton onClick={() => go('details')} />}>
          <SummaryList rows={aboutRows(clean)} />
        </Card>
        <Card title={kind.label} icon={kind.icon} action={<EditButton onClick={() => go('details')} />}>
          <SummaryList rows={inquiryRows(clean).slice(1)} />
        </Card>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="primary"
            onClick={() => {
              const id = submitInquiry(form.values)
              setSent({ ...clean, id })
              go('sent')
            }}
          >
            Send inquiry
            <Icon name="send" size={14} />
          </Button>
          <Button variant="secondary" onClick={() => go('details')}>
            Back
          </Button>
        </div>
      </InquiryFrame>
    )
  }

  return (
    <InquiryFrame venueName={venueName} title={kind.label} lead={kind.blurb}>
      <form onSubmit={form.submit(() => go('review'))} noValidate className="space-y-4">
        <InquiryFields form={form} />
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" variant="primary">
            Review
            <Icon name="arrowRight" size={14} />
          </Button>
          <Button variant="secondary" onClick={() => go('kind')}>
            <Icon name="arrowLeft" size={14} />
            Choose something else
          </Button>
        </div>
      </form>
    </InquiryFrame>
  )
}

function EditButton({ onClick }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      Edit
    </Button>
  )
}
