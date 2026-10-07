'use client'

// ---------------------------------------------------------------------------
// SCREEN 19 — Event Staffing Planner.
//
// The "smart scheduling" surface: pick an event, and for every unfilled role
// the planner proposes the people whose stated availability actually covers
// that window and who are not already booked elsewhere. One click assigns.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { useStore, hourLabel } from '@/lib/store'
import { events } from '@/lib/mock/events'
import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Icon,
  PageHeader,
  Select,
  StatusBadge
} from '@/components/ui/primitives'
import { useConfirm } from '@/components/ui/domain'
import { pluralRole } from '@/lib/mock/staff'

export default function PlannerPage() {
  const { gaps, replacementsForGap, assignStaff, coverageForEvent, toast } = useStore()
  const { confirm, dialog } = useConfirm()
  const [eventId, setEventId] = useState('johnson')

  const event = events.find((e) => e.id === eventId)
  const eventGaps = gaps.filter((g) => g.eventId === eventId)
  const coverage = coverageForEvent(eventId)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Staffing Planner' }]} />
      <PageHeader
        title="Staffing planner"
        lead="Pick an event and fill its open roles. Suggestions come from each person's stated availability, with anyone already booked at an overlapping time filtered out."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select
          label="Event"
          id="planner-event"
          options={events.map((e) => e.name)}
          value={event?.name}
          onChange={(e) => {
            const found = events.find((x) => x.name === e.target.value)
            if (found) setEventId(found.id)
          }}
          className="min-w-[220px]"
        />
        <div className="pb-1">
          {coverage.complete ? (
            <StatusBadge tone="done">Fully staffed</StatusBadge>
          ) : (
            <StatusBadge tone="urgent">
              {coverage.filled} of {coverage.required} confirmed
            </StatusBadge>
          )}
        </div>
        <div className="pb-1">
          <Button href={`/events/${eventId}/staffing`} variant="secondary" size="sm">
            Open event staffing
          </Button>
        </div>
      </div>

      {eventGaps.length === 0 ? (
        <EmptyState
          icon="check"
          title={`${event?.name} is fully staffed`}
          body="Every segment has the confirmed people it needs. Pick another event above, or check the coverage gap list for the rest of the season."
          action={
            <Button href="/schedule/gaps" variant="secondary" size="sm">
              All coverage gaps
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Alert tone="urgent" title={`${eventGaps.length} role${eventGaps.length === 1 ? '' : 's'} still to fill`}>
            <p className="mt-1">Assigning from here marks the person as confirmed straight away.</p>
          </Alert>

          {eventGaps.map((gap) => {
            const candidates = replacementsForGap(gap).filter((c) => c.eligible)
            return (
              <Card
                key={gap.id}
                tone="urgent"
                title={`${gap.segment.name} — needs ${gap.short} more ${pluralRole(gap.role, gap.short)}`}
                subtitle={`${hourLabel(gap.segment.start)} – ${hourLabel(gap.segment.end)} · ${gap.accepted} of ${gap.required} confirmed`}
                icon="users"
                action={
                  <Button href={`/schedule/gaps/${gap.id}`} size="sm" variant="secondary">
                    Full view
                  </Button>
                }
                bodyClassName="px-0 py-0"
              >
                {candidates.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">
                    Nobody with the {gap.role} role is free for this window.{' '}
                    <Link href={`/schedule/gaps/${gap.id}`} className="text-accent hover:underline">
                      See everyone and override
                    </Link>
                    .
                  </p>
                ) : (
                  candidates.map(({ person }) => (
                    <div
                      key={person.id}
                      className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
                    >
                      <Avatar initials={person.initials} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/staff/${person.id}`} className="text-sm font-medium text-ink hover:text-accent">
                          {person.name}
                        </Link>
                        <div className="text-xs text-muted">{person.preferredHours}</div>
                      </div>
                      <StatusBadge tone="done" size="sm">
                        Available
                      </StatusBadge>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          confirm({
                            title: `Assign ${person.name}?`,
                            body: `${person.name} will be confirmed for ${gap.segment.name} on ${gap.event.name}.`,
                            confirmLabel: 'Assign',
                            onConfirm: () => {
                              assignStaff(gap.segment.id, person.id, gap.role)
                              toast(`${person.name} assigned to ${gap.segment.name}.`)
                            }
                          })
                        }
                      >
                        Assign
                      </Button>
                    </div>
                  ))
                )}
              </Card>
            )
          })}
        </div>
      )}

      {dialog}
    </div>
  )
}
