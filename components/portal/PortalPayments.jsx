'use client'

// Pay: the balance, the schedule, and paying what is due. Paying here marks
// the installment paid on the venue's Payments tab, clears its task, and
// tells the couple record who paid and how. Prototype checkout: no real card
// is charged.

import { useState } from 'react'
import { Alert, Button, Card, EmptyState, Field, ListRow, Modal, StatusBadge, TextInput } from '@/components/ui'
import { money } from '@/lib/mock/records'
import { useStore } from '@/lib/store'

const STATE = {
  paid: { tone: 'done', label: 'Paid' },
  due: { tone: 'warn', label: 'Due now' },
  scheduled: { tone: 'info', label: 'Scheduled' }
}

export function PortalPayments({ event, plan, by }) {
  const [paying, setPaying] = useState(null)

  if (!plan) {
    return (
      <section id="portal-pay" className="scroll-mt-6">
        <Card title="Payments" icon="dollar">
          <EmptyState title="No payments set up yet" body="Your payment schedule shows up here once the venue sets it up." icon="dollar" />
        </Card>
      </section>
    )
  }

  const left = plan.total - plan.paid
  return (
    <section id="portal-pay" className="scroll-mt-6">
      <Card title="Payments" icon="dollar" subtitle={left ? `${money(left)} left of ${money(plan.total)}` : `Paid in full: ${money(plan.total)}`} bodyClassName="px-0 py-0">
        <dl className="grid grid-cols-3 gap-3 border-b border-line px-4 py-4 sm:px-6">
          <Field label="Total" value={money(plan.total)} />
          <Field label="Paid" value={money(plan.paid)} />
          <Field label="Left to pay">
            <span className={left ? 'font-medium text-status-soon' : 'text-status-clear'}>{money(left)}</span>
          </Field>
        </dl>
        {plan.schedule.map((p) => {
          const s = STATE[p.state] || STATE.scheduled
          return (
            <ListRow
              key={p.id}
              title={`${p.label} · ${money(p.amount)}`}
              meta={p.when}
              trailing={
                p.state === 'due' ? (
                  <Button size="sm" variant="primary" onClick={() => setPaying(p)}>
                    Pay {money(p.amount)}
                  </Button>
                ) : (
                  <StatusBadge tone={s.tone} size="sm">
                    {s.label}
                  </StatusBadge>
                )
              }
            />
          )
        })}
      </Card>
      {paying && <PayDialog payment={paying} event={event} by={by} onClose={() => setPaying(null)} />}
    </section>
  )
}

const digits = (s) => s.replace(/\D/g, '')

function PayDialog({ payment, event, by, onClose }) {
  const { portalPay, toast } = useStore()
  const [card, setCard] = useState({ name: by, number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setCard((c) => ({ ...c, [k]: e.target.value }))

  const pay = (e) => {
    e.preventDefault()
    const found = {}
    if (!card.name.trim()) found.name = 'Enter the name on the card.'
    if (digits(card.number).length < 15) found.number = 'Enter the card number.'
    if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) found.expiry = 'Use MM/YY.'
    if (digits(card.cvc).length < 3) found.cvc = 'Enter the 3 or 4 digit code.'
    setErrors(found)
    if (Object.keys(found).length) return
    portalPay(event.id, payment.id, { by, method: `Card ending ${digits(card.number).slice(-4)}` })
    toast(`Paid ${money(payment.amount)}. Thank you! The venue has been told.`)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Pay ${money(payment.amount)}`}
      subtitle={`${payment.label} · ${event.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="pay-form" variant="primary">
            Pay {money(payment.amount)}
          </Button>
        </>
      }
    >
      <form id="pay-form" onSubmit={pay} noValidate className="space-y-4">
        <Alert tone="info">Prototype checkout: this sample card is filled in for you and nothing is charged.</Alert>
        <TextInput id="pay-name" label="Name on card" autoComplete="cc-name" value={card.name} onChange={set('name')} error={errors.name} />
        <TextInput id="pay-number" label="Card number" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={set('number')} error={errors.number} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput id="pay-expiry" label="Expiry (MM/YY)" autoComplete="cc-exp" value={card.expiry} onChange={set('expiry')} error={errors.expiry} />
          <TextInput id="pay-cvc" label="Security code" inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={set('cvc')} error={errors.cvc} />
        </div>
      </form>
    </Modal>
  )
}
