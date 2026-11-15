'use client'

// Step: sign. One agreement at a time: what you are agreeing to, then your
// typed name and one "Sign agreement" button. Signed ones are listed below,
// each with its terms a tap away. The venue's Documents tab and the couple
// record show who signed and when.

import { useState } from 'react'
import { Button, Card, EmptyState, Icon, StatusBadge, TextInput } from '@/components/ui'
import { CHECKBOX } from '@/components/records'
import { contactName, money } from '@/lib/mock/records'
import { STEP_COPY, validateSignature } from '@/lib/portal'
import { useStore } from '@/lib/store'

/** The agreement's own terms, or the main booking terms for the venue contract. */
function termsOf(doc, event, plan) {
  return (
    doc.terms ||
    [
      `${event.name} on ${event.date}, in ${event.spaces}.`,
      `Up to ${event.guests} guests.`,
      plan ? `Total ${money(plan.total)}, paid on the schedule in your portal.` : null,
      'Final guest count due 10 days before the event.'
    ].filter(Boolean)
  )
}

function Terms({ terms }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-body leading-relaxed text-ink marker:text-ink-muted">
      {terms.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ol>
  )
}

export function SignStep({ couple, event, partners, docs, plan, venue, screen, complete }) {
  const { portalSign, toast } = useStore()
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const toSign = docs.filter((d) => d.tone !== 'done')
  const signed = docs.filter((d) => d.tone === 'done')
  const doc = toSign[0]
  const names = partners.map(contactName)

  const sign = (e) => {
    e.preventDefault()
    const found = validateSignature({ name, agree }, names)
    setErrors(found)
    if (Object.keys(found).length) return
    const who = names.find((n) => n.toLowerCase() === name.trim().toLowerCase())
    portalSign(couple.id, doc.id, who)
    setName('')
    setAgree(false)
    if (toSign.length > 1) {
      toast(`Signed "${doc.name}". One more to go.`)
      window.scrollTo({ top: 0 })
    } else {
      complete('sign', `Signed by ${who}. ${venue.name} has a copy.`)
    }
  }

  return screen('sign', {
    title: doc ? STEP_COPY.sign.title : 'Your agreements',
    lead: doc ? STEP_COPY.sign.lead : 'Everything is signed. Open any agreement to read it again.',
    children: (
      <>
        {doc && (
          <>
            <Card
              title={doc.name}
              icon="file"
              subtitle={`${toSign.length > 1 ? `Agreement 1 of ${toSign.length} · ` : ''}From ${venue.name}, ${doc.updated}`}
            >
              <h3 className="mb-3 text-small font-medium text-ink-muted">What you are agreeing to</h3>
              <Terms terms={termsOf(doc, event, plan)} />
            </Card>

            <Card title="Sign" icon="check">
              <form onSubmit={sign} noValidate className="space-y-4">
                <TextInput
                  id="sign-name"
                  label="Your full name"
                  hint={`Type it exactly as on the agreement: ${names.join(' or ')}.`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  autoComplete="name"
                />
                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-body text-ink">
                    <input
                      id="sign-agree"
                      type="checkbox"
                      className={CHECKBOX}
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      aria-invalid={errors.agree ? true : undefined}
                    />
                    I have read this agreement and agree to its terms.
                  </label>
                  {errors.agree && (
                    <p className="mt-1.5 flex items-center gap-1 text-small text-status-now" role="alert">
                      <Icon name="alert" size={13} />
                      {errors.agree}
                    </p>
                  )}
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                  Sign agreement
                </Button>
              </form>
            </Card>
          </>
        )}

        {signed.length > 0 ? (
          <Card title="Already signed" icon="check" bodyClassName="px-0 py-0">
            {signed.map((d) => (
              <details key={d.id} className="group border-b border-line last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken/60 sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{d.name}</span>
                    <span className="block text-small text-ink-muted">
                      Signed by {d.signedBy || couple.primaryContact}, {d.signedOn || d.updated}
                    </span>
                  </span>
                  <StatusBadge tone="done" size="sm">
                    Signed
                  </StatusBadge>
                  <span className="flex items-center gap-1 text-small font-medium text-ink-muted">
                    <span className="group-open:hidden">Read</span>
                    <span className="hidden group-open:inline">Hide</span>
                    <Icon name="chevronDown" size={14} className="transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="px-4 pb-4 sm:px-6">
                  <Terms terms={termsOf(d, event, plan)} />
                </div>
              </details>
            ))}
          </Card>
        ) : (
          !doc && <EmptyState icon="file" title="Nothing to sign yet" body={`When ${venue.name} sends you an agreement, it shows up here.`} />
        )}
      </>
    )
  })
}
