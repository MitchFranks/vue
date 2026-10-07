'use client'

// ---------------------------------------------------------------------------
// SCREEN 21 — Publish Schedule.
//
// ERROR PREVENTION: publishing is the step that notifies real people, so it
// gets a review screen first — what will be sent, to whom, and a warning if the
// event still has gaps.
// ---------------------------------------------------------------------------

import { useStore, hourLabel } from '@/lib/store'
import { events } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { Alert, Breadcrumbs, Button, Card, Icon, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { useConfirm } from '@/components/ui/domain'

export default function PublishPage() {
  const { publishedEventIds, publishSchedule, coverageForEvent, shiftsForSegment, gaps, toast } = useStore()
  const { confirm, dialog } = useConfirm()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Publish Schedule' }]} />
      <PageHeader
        title="Publish schedules"
        lead="Publishing sends every assigned person their shift and asks them to accept or decline. Anything they decline comes straight back to you as a coverage gap."
      />

      <Alert tone="info" title="Nothing is actually sent">
        This is a prototype. Publishing changes the status here so you can see the rest of the flow, but no
        notification leaves the browser.
      </Alert>

      <div className="mt-4 space-y-3">
        {events.map((event) => {
          const published = publishedEventIds.includes(event.id)
          const coverage = coverageForEvent(event.id)
          const eventGaps = gaps.filter((g) => g.eventId === event.id)
          const people = new Set()
          for (const segment of event.segments) {
            for (const a of shiftsForSegment(segment.id)) {
              if (a.status !== 'declined') people.add(a.staffId)
            }
          }

          return (
            <Card
              key={event.id}
              title={event.name}
              subtitle={`${event.date} · ${people.size} people assigned`}
              icon="calendar"
              tone={eventGaps.length ? 'urgent' : undefined}
              action={
                published ? (
                  <StatusBadge tone="done" size="sm">
                    Published
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="warn" size="sm">
                    Draft
                  </StatusBadge>
                )
              }
            >
              <div className="mb-3 flex flex-wrap gap-1.5">
                {[...people].map((id) => {
                  const p = staffById(id)
                  if (!p) return null
                  return (
                    <span
                      key={id}
                      className="rounded border border-line bg-sunken px-1.5 py-0.5 text-[11px] text-ink-2"
                    >
                      {p.name}
                    </span>
                  )
                })}
                {people.size === 0 && <span className="text-xs text-muted">Nobody assigned yet.</span>}
              </div>

              {eventGaps.length > 0 && (
                <p className="mb-3 rounded-box border border-urgent-line bg-urgent-soft px-2.5 py-1.5 text-xs text-urgent">
                  <Icon name="alert" size={12} className="mr-1 inline" />
                  This event still has {eventGaps.length} unfilled role
                  {eventGaps.length === 1 ? '' : 's'}. You can publish anyway, but the gap will remain.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={published ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={people.size === 0}
                  onClick={() =>
                    confirm({
                      title: published ? `Re-publish ${event.name}?` : `Publish ${event.name}?`,
                      body: `${people.size} people will be asked to confirm their shifts.${
                        eventGaps.length ? ' This event still has unfilled roles.' : ''
                      }`,
                      confirmLabel: published ? 'Re-publish' : 'Publish',
                      onConfirm: () => {
                        publishSchedule(event.id)
                        toast(`${event.name} schedule published to ${people.size} people.`)
                      }
                    })
                  }
                >
                  {published ? 'Re-publish' : 'Publish schedule'}
                </Button>
                <Button href={`/events/${event.id}/staffing`} variant="secondary" size="sm">
                  Review staffing
                </Button>
                {eventGaps.length > 0 && (
                  <Button href={`/schedule/gaps/${eventGaps[0].id}`} variant="secondary" size="sm">
                    Fill gaps first
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {dialog}
    </div>
  )
}
