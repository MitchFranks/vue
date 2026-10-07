'use client'

// ---------------------------------------------------------------------------
// SCREEN 18 — Weekly Schedule.
//
// Every segment across every event, laid out by day. This is the "zoomed out"
// view of staffing and another independent route into a gap.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useStore, hourLabel } from '@/lib/store'
import { DAYS } from '@/lib/mock/staff'
import { allSegments } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { Breadcrumbs, Button, Card, Icon, PageHeader, StatusBadge } from '@/components/ui/primitives'

export default function WeeklySchedulePage() {
  const { shiftsForSegment, gaps, publishedEventIds } = useStore()
  const segments = allSegments()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Weekly Schedule' }]} />
      <PageHeader
        title="Weekly schedule"
        lead="Every event segment that needs staff, grouped by day. Segments missing confirmed cover are flagged."
        actions={
          <div className="flex gap-2">
            <Button href="/schedule/gaps" variant="secondary" size="sm">
              Coverage gaps ({gaps.length})
            </Button>
            <Button href="/schedule/publish" variant="primary" size="sm">
              Publish
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {DAYS.map((day) => {
          const dayed = segments.filter(({ event }) => event.day === day)
          if (dayed.length === 0) return null
          return (
            <section key={day}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                {day}
                <span className="text-xs font-normal text-faint">
                  {dayed.length} segment{dayed.length === 1 ? '' : 's'}
                </span>
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {dayed.map(({ event, segment }) => {
                  const assignments = shiftsForSegment(segment.id)
                  const segGaps = gaps.filter((g) => g.segment.id === segment.id)
                  const accepted = assignments.filter((a) => a.status === 'accepted')
                  const pending = assignments.filter((a) => a.status === 'pending')
                  const published = publishedEventIds.includes(event.id)
                  return (
                    <div
                      key={segment.id}
                      className={
                        segGaps.length
                          ? 'rounded-box border border-urgent-line bg-paper p-3'
                          : 'rounded-box border border-line bg-paper p-3'
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/events/${event.id}/staffing`}
                            className="block truncate text-sm font-medium text-ink hover:text-accent"
                          >
                            {event.name}
                          </Link>
                          <div className="text-xs text-muted">
                            {segment.name} · {hourLabel(segment.start)}–{hourLabel(segment.end)}
                          </div>
                        </div>
                        {segGaps.length ? (
                          <StatusBadge tone="urgent" size="sm">
                            -{segGaps.reduce((n, g) => n + g.short, 0)}
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="done" size="sm">
                            OK
                          </StatusBadge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {accepted.map((a) => {
                          const p = staffById(a.staffId)
                          return (
                            <span
                              key={a.id}
                              className="rounded border border-done-line bg-done-soft px-1.5 py-0.5 text-[11px] text-done"
                            >
                              {p?.initials}
                            </span>
                          )
                        })}
                        {pending.map((a) => {
                          const p = staffById(a.staffId)
                          return (
                            <span
                              key={a.id}
                              className="rounded border border-pending-line bg-pending-soft px-1.5 py-0.5 text-[11px] text-pending"
                            >
                              {p?.initials}?
                            </span>
                          )
                        })}
                        {segGaps.map((g) =>
                          Array.from({ length: g.short }).map((_, i) => (
                            <span
                              key={`${g.id}-${i}`}
                              className="rounded border border-dashed border-urgent-line px-1.5 py-0.5 text-[11px] text-urgent"
                            >
                              ?
                            </span>
                          ))
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-line-soft pt-2">
                        <span className="text-[11px] text-faint">
                          {published ? 'Published' : 'Draft'} · {event.dateShort}
                        </span>
                        {segGaps.length > 0 && (
                          <Link
                            href={`/schedule/gaps/${segGaps[0].id}`}
                            className="text-[11px] font-medium text-accent underline-offset-2 hover:underline"
                          >
                            Fill gap
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <Card className="mt-5" title="Key" icon="info">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded border border-done-line bg-done-soft px-1.5 py-0.5 text-done">XX — accepted</span>
          <span className="rounded border border-pending-line bg-pending-soft px-1.5 py-0.5 text-pending">
            XX? — awaiting reply
          </span>
          <span className="rounded border border-dashed border-urgent-line px-1.5 py-0.5 text-urgent">
            ? — unfilled
          </span>
        </div>
      </Card>
    </div>
  )
}
