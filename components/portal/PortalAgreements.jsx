'use client'

// Sign: the event's agreements that need the couple. Reading the terms and
// typing a name signs it; the venue's Documents tab and the couple record
// then show who signed and when.

import { useState } from 'react'
import { Alert, Button, Card, EmptyState, ListRow, Modal, StatusBadge, TextInput } from '@/components/ui'
import { CHECKBOX } from '@/components/records'
import { contactName, money } from '@/lib/mock/records'
import { validateSignature } from '@/lib/portal'
import { useStore } from '@/lib/store'

export function PortalAgreements({ couple, event, partners, docs, plan }) {
  const [open, setOpen] = useState(null)
  const waiting = docs.filter((d) => d.tone !== 'done').length

  return (
    <section id="portal-sign" className="scroll-mt-6">
      <Card title="Agreements" icon="file" subtitle={waiting ? `${waiting} waiting for your signature` : 'Everything is signed.'} bodyClassName="px-0 py-0">
        {docs.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nothing to sign yet" body="When the venue sends you an agreement, it shows up here." icon="file" />
          </div>
        ) : (
          docs.map((d) => (
            <ListRow
              key={d.id}
              title={d.name}
              meta={d.tone === 'done' ? `Signed by ${d.signedBy || couple.primaryContact} on ${d.signedOn || d.updated}` : `Sent ${d.updated}`}
              trailing={
                d.tone === 'done' ? (
                  <>
                    <StatusBadge tone="done" size="sm">
                      Signed
                    </StatusBadge>
                    <Button size="sm" variant="ghost" onClick={() => setOpen(d)}>
                      View
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="primary" onClick={() => setOpen(d)}>
                    Read and sign
                  </Button>
                )
              }
            />
          ))
        )}
      </Card>
      {open && <SignDialog doc={open} couple={couple} event={event} partners={partners} plan={plan} onClose={() => setOpen(null)} />}
    </section>
  )
}

function SignDialog({ doc, couple, event, partners, plan, onClose }) {
  const { portalSign, toast } = useStore()
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const names = partners.map(contactName)
  const signed = doc.tone === 'done'

  const sign = (e) => {
    e.preventDefault()
    const found = validateSignature({ name, agree }, names)
    setErrors(found)
    if (Object.keys(found).length) return
    const who = names.find((n) => n.toLowerCase() === name.trim().toLowerCase())
    portalSign(couple.id, doc.id, who)
    toast(`Signed. ${doc.name} is with the venue.`)
    onClose()
  }

  // The agreement's own terms, or the main booking terms for the venue contract.
  const terms = doc.terms || [
    `${event.name} on ${event.date}, in ${event.spaces}.`,
    `Up to ${event.guests} guests.`,
    plan ? `Total ${money(plan.total)}, paid on the schedule in your portal.` : null,
    'Final guest count due 10 days before the event.'
  ].filter(Boolean)

  return (
    <Modal
      open
      onClose={onClose}
      title={doc.name}
      subtitle={`${event.name} · ${event.dateShort}`}
      variant="sheet"
      width="sm:w-[560px]"
      footer={
        signed ? (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Not now
            </Button>
            <Button type="submit" form="sign-form" variant="primary">
              Sign
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {signed && (
          <Alert tone="done" title={`Signed by ${doc.signedBy || couple.primaryContact}`}>
            On {doc.signedOn || doc.updated}.
          </Alert>
        )}
        <div>
          <h3 className="mb-2 text-small font-medium text-ink">What you are agreeing to</h3>
          <ol className="list-decimal space-y-2 pl-5 text-body text-ink">
            {terms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
        {!signed && (
          <form id="sign-form" onSubmit={sign} noValidate className="space-y-4 border-t border-line pt-4">
            <TextInput
              id="sign-name"
              label="Type your full name to sign"
              hint={`As it appears on the agreement: ${names.join(' or ')}.`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
            <div>
              <label className="flex items-start gap-2 text-body text-ink">
                <input id="sign-agree" type="checkbox" className={CHECKBOX} checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={errors.agree ? true : undefined} />
                I have read this agreement and agree to its terms.
              </label>
              {errors.agree && <p className="mt-1.5 text-small text-status-now">{errors.agree}</p>}
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
