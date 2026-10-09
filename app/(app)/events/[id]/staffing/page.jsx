'use client'

// ---------------------------------------------------------------------------
// SCREEN 8 — Event Staffing (read-only summary).
//
// Who is on each timeline block at a glance. Planning happens in the Staff
// Planner, so every action here is a link into the event's board there.
// ---------------------------------------------------------------------------

import { use } from 'react'
import { useStore, hourLabel } from '@/lib/store'
import { eventById } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { Alert, Button, Card, Icon, StatusBadge } from '@/components/ui/primitives'

const STATUS = {
  accepted: { tone: 'done', label: 'Accepted' },
  pending: { tone: 'pending', label: 'Pending' },
  draft: { tone: 'info', label: 'Not sent' },
  declined: { tone: 'declined', label: 'Declined' }
}

export default function EventStaffingPage({ params }) {
  const { id } = use(params)
  const event = eventById(id)
  const { assignmentsForBlock, openPositions, coverageForEvent, publishedEventIds } = useStore()

  if (!event) return null
  const eventPositions = openPositions.filter((p) => p.eventId === id)
  const coverage = coverageForEvent(id)
  const published = publishedEventIds.includes(id)

  return (
    <div className="space-y-4">
      {eventPositions.length > 0 ? (
        <Alert
          tone="warn"
          title={`This event needs ${coverage.short} more ${coverage.short === 1 ? 'person' : 'people'}`}
          action={
            <Button href={`/staffing/${id}`} size="sm" variant="primary">
              Open in Staff Planner
              <Icon name="arrowRight" size={13} />
            </Button>
          }
        >
          <p className="mt-1">
            {eventPositions
              .map((p) => `${p.short} ${p.role}${p.short > 1 ? 's' : ''} for ${p.block.name}`)
              .join(', ')}
            .
          </p>
        </Alert>
      ) : (
        <Alert
          tone="done"
          title="Every timeline block on this event is staffed"
          action={
            <Button href={`/staffing/${id}`} size="sm" variant="secondary">
              Open in Staff Planner
            </Button>
          }
        >
          Schedule status: {published ? 'Published' : 'Draft'}.
        </Alert>
      )}

      {event.blocks.map((block) => {
        const here = assignmentsForBlock(block.id)
        return (
          <Card
            key={block.id}
            title={block.name}
            subtitle={`${hourLabel(block.start)} – ${hourLabel(block.end)}`}
            action={
              <Button
                href={`/staffing/${id}`}
                size="sm"
                variant="ghost"
              >
                Plan
              </Button>
            }
            bodyClassName="px-0 py-0"
          >
            {block.requirements.map((req) => {
              const people = here.filter((a) => a.role === req.role)
              const accepted = people.filter((a) => a.status === 'accepted').length
              return (
                <div key={req.role} className="flex flex-wrap items-center gap-2 border-b border-line-soft px-5 py-3 last:border-b-0">
                  <span className="w-28 text-[13px] font-bold text-ink">{req.role}</span>
                  <span className="text-xs text-muted">
                    {accepted} of {req.count} accepted
                  </span>
                  <span className="ml-2 flex flex-wrap gap-1.5">
                    {people.map((a) => {
                      const s = STATUS[a.status] || STATUS.draft
                      return (
                        <StatusBadge key={a.id} tone={s.tone} size="sm">
                          {staffById(a.staffId)?.name} · {s.label}
                        </StatusBadge>
                      )
                    })}
                  </span>
                </div>
              )
            })}
          </Card>
        )
      })}
    </div>
  )
}
