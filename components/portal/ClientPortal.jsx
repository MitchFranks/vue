'use client'

// ---------------------------------------------------------------------------
// The couple's client portal (/portal?c=<coupleId>). One page with the four
// things the venue would otherwise chase them for: sign, pay, send their
// details, book a meeting. Each card says where it stands; the checklist at
// the top says what is left. Everything they do lands in the couple record
// the manager reads (components/portal/PortalRecord.jsx).
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, EmptyState, Icon, Select, StatusBadge } from '@/components/ui'
import { InquiryFrame } from '@/components/inquiry/InquiryFrame'
import { AppToasts } from '@/components/layout/AppToasts'
import { useDirectory } from '@/lib/directory/store'
import { contactName, contacts, coupleById } from '@/lib/mock/records'
import { eventById } from '@/lib/mock/events'
import { portalSteps } from '@/lib/portal'
import { useStore } from '@/lib/store'
import { cx } from '@/lib/cx'
import { PortalAgreements } from './PortalAgreements'
import { PortalPayments } from './PortalPayments'
import { PortalDetails, PortalDetailsForm } from './PortalDetails'
import { PortalMeeting } from './PortalMeeting'

const NOTE = 'Prototype: what you do here is saved in this browser only, where the venue can see it. No real payment is taken and nothing is emailed.'

export function ClientPortal() {
  const coupleId = useSearchParams().get('c')
  const { venue } = useDirectory()
  const { hydrated, documentList, paymentsForEvent, portalFor } = useStore()
  const couple = coupleById(coupleId)
  const partners = couple ? contacts.filter((c) => c.coupleId === couple.id) : []
  const [whoId, setWhoId] = useState(null)
  const [view, setView] = useState('home')

  const frame = (props) => <InquiryFrame venueName={venue.name} section="Your event" note={NOTE} after={<AppToasts />} {...props} />

  if (!couple) {
    return frame({
      title: 'This link has expired',
      children: <EmptyState icon="search" title="We couldn't find your event" body={`Ask ${venue.name} to send your portal link again.`} />
    })
  }
  // Saved progress loads after the first render; wait so nothing flips from "to do" to "done".
  if (!hydrated) return <div className="min-h-dvh bg-canvas" aria-busy="true" />

  const event = eventById(couple.eventIds[0])
  const me = partners.find((p) => p.id === whoId) || partners.find((p) => p.id === couple.primaryContactId) || partners[0]
  const by = contactName(me)
  const record = portalFor(couple.id)
  const docs = documentList.filter((d) => d.eventId === event?.id && d.signer === 'couple')
  const plan = event ? paymentsForEvent(event.id) : null
  const steps = portalSteps({ docs, plan, record })
  const left = steps.filter((s) => !s.done).length
  const ctx = { couple, event, partners, me, by, record, docs, plan }

  if (view === 'details') {
    return frame({
      title: 'Your details',
      lead: 'What the venue, the staff and the kitchen work from. Change anything later and the venue sees exactly what changed.',
      children: <PortalDetailsForm {...ctx} onDone={() => setView('home')} />
    })
  }

  return frame({
    title: `Hi, ${couple.firstNames}`,
    lead: event ? `${event.name} · ${event.date} · ${event.spaces}` : 'Your event details will appear here once it is booked.',
    children: (
      <>
        {partners.length > 1 && (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Select
              id="portal-who"
              label="Who's here?"
              hint="So the venue knows who signed, paid or changed something."
              options={partners.map((p) => ({ value: p.id, label: contactName(p) }))}
              value={me.id}
              onChange={(e) => setWhoId(e.target.value)}
              className="min-w-[220px]"
            />
          </div>
        )}

        <Card title={left ? `${left} ${left === 1 ? 'thing' : 'things'} left to do` : "You're all set"} icon="check" subtitle="Everything the venue needs from you, in one place." bodyClassName="px-0 py-0">
          <ol>
            {steps.map((s, i) => (
              <li key={s.id}>
                <a href={`#portal-${s.id}`} className="flex items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-sunken/60 sm:px-6">
                  <span
                    className={cx(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full text-label font-medium',
                      s.done ? 'bg-status-clear-soft text-status-clear' : 'bg-surface-sunken text-ink'
                    )}
                    aria-hidden="true"
                  >
                    {s.done ? <Icon name="check" size={14} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx('block font-medium', s.done ? 'text-ink-muted' : 'text-ink')}>{s.label}</span>
                    <span className="block text-small text-ink-muted">{s.status}</span>
                  </span>
                  <StatusBadge tone={s.done ? 'done' : s.tone} size="sm">
                    {s.done ? 'Done' : 'To do'}
                  </StatusBadge>
                </a>
              </li>
            ))}
          </ol>
        </Card>

        <PortalAgreements {...ctx} />
        <PortalPayments {...ctx} />
        <PortalDetails {...ctx} onEdit={() => setView('details')} />
        <PortalMeeting {...ctx} />
      </>
    )
  })
}
