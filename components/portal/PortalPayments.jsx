'use client'

// Step: pay. The amount due, large, with what it is for; the card (a sample
// is filled in, nothing is charged); one "Pay $4,600" button. The schedule
// below shows where the rest stands. Paying marks it paid on the venue's
// Payments tab and clears its task.

import { useState } from 'react'
import { Alert, Button, Card, EmptyState, ListRow, ProgressBar, StatusBadge, TextInput } from '@/components/ui'
import { money } from '@/lib/mock/records'
import { STEP_COPY } from '@/lib/portal'
import { useStore } from '@/lib/store'

const STATE = {
  paid: { tone: 'done', label: 'Paid' },
  due: { tone: 'warn', label: 'Due now' },
  scheduled: { tone: 'info', label: 'Later' }
}

const digits = (s) => s.replace(/\D/g, '')

function Schedule({ plan }) {
  const left = plan.total - plan.paid
  return (
    <Card title="Your payments" icon="dollar" subtitle={left ? `${money(plan.paid)} of ${money(plan.total)} paid` : `Paid in full: ${money(plan.total)}`} bodyClassName="px-0 py-0">
      <div className="border-b border-line px-4 py-4 sm:px-6">
        <ProgressBar value={plan.paid} max={plan.total} label="Share of the total paid" />
      </div>
      {plan.schedule.map((p) => {
        const s = STATE[p.state] || STATE.scheduled
        return (
          <ListRow
            key={p.id}
            title={`${p.label} · ${money(p.amount)}`}
            meta={p.when}
            trailing={
              <StatusBadge tone={s.tone} size="sm">
                {s.label}
              </StatusBadge>
            }
          />
        )
      })}
    </Card>
  )
}

export function PayStep({ event, plan, by, screen, complete }) {
  const { portalPay, toast } = useStore()
  const [card, setCard] = useState({ name: by, number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setCard((c) => ({ ...c, [k]: e.target.value }))

  if (!plan) {
    return screen('pay', {
      title: 'Your payments',
      children: <EmptyState icon="dollar" title="No payments set up yet" body="Your payment schedule shows up here once the venue sets it up." />
    })
  }

  const due = plan.schedule.filter((p) => p.state === 'due')
  const payment = due[0]
  const later = plan.schedule.find((p) => p.state === 'scheduled')

  if (!payment) {
    return screen('pay', {
      title: 'Your payments',
      lead: plan.total === plan.paid ? 'You have paid in full. Thank you!' : `Nothing is due right now.${later ? ` Next: ${later.label.toLowerCase()} of ${money(later.amount)}, ${later.when.replace(/^Due /, 'due ')}.` : ''}`,
      children: <Schedule plan={plan} />
    })
  }

  const pay = (e) => {
    e.preventDefault()
    const found = {}
    if (!card.name.trim()) found.name = 'Enter the name on the card.'
    if (digits(card.number).length < 15) found.number = 'Enter the card number.'
    if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) found.expiry = 'Use MM/YY, for example 12/28.'
    if (digits(card.cvc).length < 3) found.cvc = 'Enter the 3 or 4 digit code on the back.'
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`pay-${Object.keys(found)[0]}`)?.focus()
      return
    }
    const last4 = digits(card.number).slice(-4)
    portalPay(event.id, payment.id, { by, method: `Card ending ${last4}` })
    const left = plan.total - plan.paid - payment.amount
    if (due.length > 1) toast(`Paid ${money(payment.amount)}.`)
    else complete('pay', `${money(payment.amount)} paid with the card ending ${last4}. ${left ? `${money(left)} left to pay later.` : 'You have paid in full.'}`)
  }

  return screen('pay', {
    title: STEP_COPY.pay.title,
    lead: STEP_COPY.pay.lead,
    children: (
      <>
        <div className="surface-card px-4 py-5 sm:px-6">
          <p className="text-small text-ink-muted">Amount due</p>
          <p className="mt-1 text-display font-light tabular-nums text-ink">{money(payment.amount)}</p>
          <p className="mt-1 text-body text-ink-muted">
            {payment.label} for the {event.name} · {payment.when}
          </p>
        </div>

        <Card title="Card details" icon="dollar">
          <form onSubmit={pay} noValidate className="space-y-4">
            <Alert tone="info">Prototype: a sample card is filled in for you. Nothing is charged.</Alert>
            <TextInput id="pay-name" label="Name on card" autoComplete="cc-name" value={card.name} onChange={set('name')} error={errors.name} />
            <TextInput id="pay-number" label="Card number" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={set('number')} error={errors.number} />
            <div className="grid grid-cols-2 gap-4">
              <TextInput id="pay-expiry" label="Expiry (MM/YY)" autoComplete="cc-exp" value={card.expiry} onChange={set('expiry')} error={errors.expiry} />
              <TextInput id="pay-cvc" label="Security code" inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={set('cvc')} error={errors.cvc} />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
              Pay {money(payment.amount)}
            </Button>
          </form>
        </Card>

        <Schedule plan={plan} />
      </>
    )
  })
}
