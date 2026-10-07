'use client'

// SCREEN 20 — Shift Detail. One assignment, with the accept/decline controls.

import { use } from 'react'
import Link from 'next/link'
import { useStore, hourLabel } from '@/lib/store'
import { segmentById } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Field,
  Icon,
  PageHeader,
  StatusBadge
} from '@/components/ui/primitives'
import { AvailabilityGrid, useConfirm } from '@/components/ui/domain'

export default function ShiftDetailPage({ params }) {
  const { shiftId } = use(params)
  const { assignments, setShiftStatus, removeAssignment, toast } = useStore()
  const { confirm, dialog } = useConfirm()

  const assignment = assignments[shiftId]
  const segmentId = shiftId.split('--')[0]
  const found = segmentById(segmentId)

  if (!assignment || !found) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Weekly Schedule', href: '/schedule' },
            { label: 'Shift' }
          ]}
        />
        <PageHeader title="This shift no longer exists" />
        <EmptyState
          icon="info"
          title="Nothing assigned here"
          body="This assignment has been removed, or was never created. The shift may have been reassigned to someone else."
          action={
            <Button href="/schedule" variant="primary" size="sm">
              Back to the weekly schedule
            </Button>
          }
        />
      </div>
    )
  }

  const { event, segment } = found
  const person = staffById(assignment.staffId)
  const tone =
    assignment.status === 'accepted' ? 'done' : assignment.status === 'declined' ? 'declined' : 'pending'

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Weekly Schedule', href: '/schedule' },
          { label: `${event.name} · ${segment.name}` }
        ]}
      />

      <PageHeader
        title={`${segment.name} — ${person?.name}`}
        lead={`${event.name} · ${event.date}`}
        actions={
          <StatusBadge tone={tone}>
            {assignment.status === 'accepted'
              ? 'Accepted'
              : assignment.status === 'declined'
                ? 'Declined'
                : 'Awaiting reply'}
          </StatusBadge>
        }
      />

      {assignment.status === 'declined' && (
        <Alert tone="urgent" title="This shift is declined and currently uncovered">
          <p className="mt-1">{assignment.declineReason || 'No reason given.'}</p>
          <div className="mt-2">
            <Button
              href={`/schedule/gaps/${segment.id}--${assignment.role.replace(/\s+/g, '-').toLowerCase()}`}
              size="sm"
              variant="primary"
            >
              Find a replacement
              <Icon name="arrowRight" size={13} />
            </Button>
          </div>
        </Alert>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Shift" icon="clock">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Event" >
              <Link href={`/events/${event.id}`} className="text-accent hover:underline">
                {event.name}
              </Link>
            </Field>
            <Field label="Segment" value={segment.name} />
            <Field label="Date" value={event.date} />
            <Field label="Window" value={`${hourLabel(segment.start)} – ${hourLabel(segment.end)}`} />
            <Field label="Role" value={assignment.role} />
            <Field label="Spaces" value={event.spaces} />
          </dl>
          <p className="mt-3 border-t border-line-soft pt-2 text-xs text-muted">{segment.note}</p>
        </Card>

        <Card title="Assigned to" icon="user">
          {person && (
            <>
              <div className="flex items-center gap-3">
                <Avatar initials={person.initials} />
                <div>
                  <Link href={`/staff/${person.id}`} className="text-sm font-medium text-ink hover:text-accent">
                    {person.name}
                  </Link>
                  <div className="text-xs text-muted">{person.role}</div>
                </div>
              </div>
              <dl className="mt-3 space-y-2">
                <Field label="Phone" value={person.phone} />
                <Field label="Email" value={person.email} />
                <Field label="Preferred hours" value={person.preferredHours} />
              </dl>
            </>
          )}
        </Card>
      </div>

      {person && (
        <Card className="mt-4" title={`${person.name}'s availability`} icon="grid">
          <AvailabilityGrid
            person={person}
            highlight={{ day: event.day, start: segment.start, end: segment.end }}
          />
        </Card>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {assignment.status !== 'accepted' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setShiftStatus(shiftId, 'accepted')
              toast(`${person?.name} marked as accepted.`)
            }}
          >
            Mark accepted
          </Button>
        )}
        {assignment.status !== 'declined' && (
          <Button
            variant="danger"
            size="md"
            onClick={() =>
              confirm({
                title: `Record a decline for ${person?.name}?`,
                body: `This opens a coverage gap for ${segment.name} and raises an item in Needs Attention.`,
                confirmLabel: 'Record decline',
                danger: true,
                onConfirm: () => {
                  setShiftStatus(shiftId, 'declined', 'Declined by staff member.')
                  toast(`${person?.name} declined — coverage gap opened.`, 'urgent')
                }
              })
            }
          >
            Record decline
          </Button>
        )}
        <Button
          variant="secondary"
          size="md"
          onClick={() =>
            confirm({
              title: 'Remove this assignment?',
              body: `${person?.name} will be taken off ${segment.name}. If that leaves the segment short, a coverage gap will open.`,
              confirmLabel: 'Remove',
              danger: true,
              onConfirm: () => {
                removeAssignment(shiftId)
                toast(`${person?.name} removed from ${segment.name}.`)
              }
            })
          }
        >
          Remove from shift
        </Button>
        <Button href={`/events/${event.id}/staffing`} variant="secondary" size="md">
          Back to event staffing
        </Button>
      </div>

      {dialog}
    </div>
  )
}
