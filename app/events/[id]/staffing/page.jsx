'use client'

// ---------------------------------------------------------------------------
// SCREEN 8 — Event Staffing.
//
// This is where the two headline features meet. Each segment shows what it
// requires and who is on it. Declining a shift here immediately:
//   1. drops that person out of the accepted count,
//   2. opens a coverage gap,
//   3. makes a Needs Attention item appear on the dashboard and attention list.
// Assigning a replacement reverses all three.
// ---------------------------------------------------------------------------

import { use } from 'react'
import Link from 'next/link'
import { useStore, hourLabel } from '@/lib/store'
import { eventById } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { Alert, Button, Card, Icon, StatusBadge } from '@/components/ui/primitives'
import { Avatar } from '@/components/ui/primitives'
import { EventSegment, useConfirm } from '@/components/ui/domain'

export default function EventStaffingPage({ params }) {
  const { id } = use(params)
  const event = eventById(id)
  const {
    shiftsForSegment,
    gaps,
    coverageForEvent,
    setShiftStatus,
    removeAssignment,
    publishedEventIds,
    publishSchedule,
    toast
  } = useStore()
  const { confirm, dialog } = useConfirm()

  const eventGaps = gaps.filter((g) => g.eventId === id)
  const coverage = coverageForEvent(id)
  const published = publishedEventIds.includes(id)

  return (
    <div className="space-y-4">
      {eventGaps.length > 0 ? (
        <Alert tone="urgent" title={`This event is short ${coverage.short} staff`}>
          <p className="mt-1">
            {eventGaps
              .map((g) => `${g.short} ${g.role}${g.short > 1 ? 's' : ''} for ${g.segment.name}`)
              .join(', ')}
            .
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {eventGaps.map((g) => (
              <Button key={g.id} href={`/schedule/gaps/${g.id}`} size="sm" variant="primary">
                Find cover for {g.segment.name}
                <Icon name="arrowRight" size={13} />
              </Button>
            ))}
          </div>
        </Alert>
      ) : (
        <Alert tone="done" title="Every segment on this event is covered">
          <p className="mt-1">
            {coverage.filled} of {coverage.required} roles confirmed
            {coverage.pending > 0 && ` · ${coverage.pending} still awaiting a reply`}.
          </p>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-line bg-paper px-3 py-2.5">
        <div className="text-sm">
          <span className="font-medium text-ink">Schedule status: </span>
          {published ? (
            <StatusBadge tone="done" size="sm">
              Published to staff
            </StatusBadge>
          ) : (
            <StatusBadge tone="warn" size="sm">
              Draft — not sent
            </StatusBadge>
          )}
        </div>
        <div className="flex gap-2">
          <Button href="/schedule/planner" size="sm" variant="secondary">
            Open planner
          </Button>
          {!published && (
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                confirm({
                  title: 'Publish this schedule?',
                  body: 'Everyone assigned will be notified and asked to accept or decline their shift. In this prototype no real messages are sent.',
                  confirmLabel: 'Publish',
                  onConfirm: () => {
                    publishSchedule(id)
                    toast('Schedule published. Staff have been asked to confirm.')
                  }
                })
              }
            >
              Publish schedule
            </Button>
          )}
        </div>
      </div>

      {event.segments.map((segment) => {
        const assignments = shiftsForSegment(segment.id)
        return (
          <EventSegment key={segment.id} event={event} segment={segment} assignments={assignments} gaps={eventGaps}>
            <div>
              {assignments.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">Nobody assigned to this segment yet.</p>
              ) : (
                assignments.map((a) => {
                  const person = staffById(a.staffId)
                  if (!person) return null
                  const tone =
                    a.status === 'accepted' ? 'done' : a.status === 'declined' ? 'declined' : 'pending'
                  return (
                    <div
                      key={a.id}
                      className="flex flex-wrap items-center gap-2 border-b border-line-soft px-4 py-2.5 last:border-b-0"
                    >
                      <Avatar initials={person.initials} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/staff/${person.id}`} className="text-sm font-medium text-ink hover:text-accent">
                          {person.name}
                        </Link>
                        <div className="text-xs text-muted">{a.role}</div>
                        {a.status === 'declined' && a.declineReason && (
                          <div className="mt-0.5 text-[11px] text-urgent">{a.declineReason}</div>
                        )}
                      </div>

                      <StatusBadge tone={tone} size="sm">
                        {a.status === 'accepted' ? 'Accepted' : a.status === 'declined' ? 'Declined' : 'Pending'}
                      </StatusBadge>

                      <div className="flex gap-1.5">
                        <Button href={`/schedule/shifts/${a.id}`} size="sm" variant="ghost">
                          Detail
                        </Button>
                        {a.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setShiftStatus(a.id, 'accepted')
                              toast(`${person.name} accepted the ${segment.name} shift.`)
                            }}
                          >
                            Mark accepted
                          </Button>
                        )}
                        {a.status !== 'declined' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              confirm({
                                title: `Record a decline for ${person.name}?`,
                                body: `This will open a coverage gap for ${segment.name} and raise an item in Needs Attention.`,
                                confirmLabel: 'Record decline',
                                danger: true,
                                onConfirm: () => {
                                  setShiftStatus(a.id, 'declined', 'Declined by staff member.')
                                  toast(`${person.name} declined — coverage gap opened.`, 'urgent')
                                }
                              })
                            }
                          >
                            Decline
                          </Button>
                        )}
                        {a.status === 'declined' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              removeAssignment(a.id)
                              toast(`${person.name} removed from ${segment.name}.`)
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </EventSegment>
        )
      })}

      {dialog}
    </div>
  )
}
