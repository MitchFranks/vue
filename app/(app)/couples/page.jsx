'use client'

// SCREEN 27 — Couples. Each row says how far the couple is through their
// client portal and flags details they changed that you haven't read.

import { couples } from '@/lib/mock/records'
import { events } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { portalSteps } from '@/lib/portal'
import { Avatar, Breadcrumbs, Card, ListRow, PageHeader, StatusBadge } from '@/components/ui'

export default function CouplesPage() {
  const { tasksForEvent, documentList, paymentsForEvent, portalFor } = useStore()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Couples' }]} />
      <PageHeader
        title="Couples"
        lead={`Your ${couples.length} couples. Click one to see what they have signed, paid and sent.`}
      />

      <Card bodyClassName="px-0 py-0">
        {couples.map((c) => {
          const theirEvents = events.filter((e) => c.eventIds.includes(e.id))
          const event = theirEvents[0]
          const needs = theirEvents.reduce((n, e) => n + tasksForEvent(e.id).length, 0)
          const record = portalFor(c.id)
          const steps = portalSteps({
            docs: documentList.filter((d) => d.eventId === event?.id && d.signer === 'couple'),
            plan: event ? paymentsForEvent(event.id) : null,
            record
          })
          const done = steps.filter((s) => s.done).length
          const unread = record.history.length > record.seen
          return (
            <ListRow
              key={c.id}
              href={`/couples/${c.id}`}
              leading={<Avatar initials={c.initials} />}
              title={c.name}
              sub={[c.primaryContact, c.email].filter(Boolean).join(' · ')}
              meta={theirEvents.length ? theirEvents.map((e) => e.name).join(', ') : 'No wedding booked yet'}
              trailing={
                <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
                  {unread && (
                    <StatusBadge tone="urgent" size="sm">
                      New details
                    </StatusBadge>
                  )}
                  <StatusBadge tone={done === steps.length ? 'done' : 'pending'} size="sm">
                    Portal {done} of {steps.length}
                  </StatusBadge>
                  {needs > 0 ? (
                    <StatusBadge tone="urgent" size="sm">
                      {needs} in Tasks
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="done" size="sm">
                      All set
                    </StatusBadge>
                  )}
                </div>
              }
            />
          )
        })}
      </Card>
    </div>
  )
}
