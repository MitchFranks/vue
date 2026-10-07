'use client'

// ---------------------------------------------------------------------------
// SCREEN 3 — Calendar.
//
// A deliberately plain month grid. In a low-fidelity prototype a calendar's job
// is to show WHEN things sit relative to each other, not to be a scheduling
// surface — so each day is a box with chips in it, and the chips are links.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { events } from '@/lib/mock/events'
import { Breadcrumbs, Card, Icon, PageHeader, StatusBadge } from '@/components/ui/primitives'

// September 2026: the 1st is a Tuesday. Grid starts Monday.
const MONTH_DAYS = 30
const LEADING_BLANKS = 1
const TODAY = 17

const EVENTS_BY_DAY = {
  19: ['johnson', 'taylor'],
  24: ['acme']
}

export default function CalendarPage() {
  const { coverageForEvent, attentionForEvent } = useStore()
  const cells = []
  for (let i = 0; i < LEADING_BLANKS; i += 1) cells.push(null)
  for (let d = 1; d <= MONTH_DAYS; d += 1) cells.push(d)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Calendar' }]} />
      <PageHeader
        title="Calendar"
        lead="September 2026. Events are colour-flagged by whether anything about them still needs your attention."
      />

      <Card bodyClassName="px-2 py-2 sm:px-3 sm:py-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-faint">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`blank-${i}`} className="min-h-[72px] rounded border border-transparent" />
            const ids = EVENTS_BY_DAY[day] || []
            const isToday = day === TODAY
            return (
              <div
                key={day}
                className={
                  isToday
                    ? 'min-h-[72px] rounded border-2 border-accent bg-accent-soft p-1'
                    : 'min-h-[72px] rounded border border-line bg-paper p-1'
                }
              >
                <div className={isToday ? 'text-[11px] font-bold text-accent' : 'text-[11px] text-faint'}>
                  {day}
                  {isToday && <span className="ml-1 font-semibold">Today</span>}
                </div>
                <div className="mt-1 space-y-1">
                  {ids.map((id) => {
                    const event = events.find((e) => e.id === id)
                    const needs = attentionForEvent(id).length
                    return (
                      <Link
                        key={id}
                        href={`/events/${id}`}
                        className={
                          needs
                            ? 'block truncate rounded border border-urgent-line bg-urgent-soft px-1 py-0.5 text-[10px] font-medium text-urgent hover:bg-urgent-soft/70'
                            : 'block truncate rounded border border-done-line bg-done-soft px-1 py-0.5 text-[10px] font-medium text-done'
                        }
                        title={event.name}
                      >
                        {event.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card title="Later in the season" icon="calendar">
          <ul className="space-y-2">
            {events
              .filter((e) => !['johnson', 'taylor', 'acme'].includes(e.id))
              .map((e) => (
                <li key={e.id}>
                  <Link href={`/events/${e.id}`} className="flex items-center gap-2 text-sm hover:text-accent">
                    <Icon name="chevronRight" size={13} className="text-faint" />
                    <span className="font-medium">{e.name}</span>
                    <span className="text-xs text-muted">{e.dateShort}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </Card>

        <Card title="Key" icon="info">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="urgent" size="sm">
              Needs attention
            </StatusBadge>
            <StatusBadge tone="done" size="sm">
              Nothing outstanding
            </StatusBadge>
            <span className="inline-flex items-center gap-1 rounded-pill border-2 border-accent px-2 py-0.5 text-xs text-accent">
              Today
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            This month is the only one populated in the prototype. Other months would work the same way.
          </p>
        </Card>
      </div>
    </div>
  )
}
