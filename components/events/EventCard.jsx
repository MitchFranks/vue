'use client'

import Link from 'next/link'
import { daysOutLabel } from '@/lib/mock/events'
import { openSpots } from '@/lib/format'
import { Icon, StatusBadge } from '@/components/ui'

/* -------------------------------------------------------------- EventCard -- */

export function EventCard({ event, coverage, taskCount = 0, guide = false }) {
  return (
    <Link
      href={`/events/${event.id}`}
      data-guide={guide ? 'events-first' : undefined}
      className="block rounded-md border border-line bg-surface px-6 py-5 shadow-raised transition-colors duration-150 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-heading font-medium text-ink">{event.name}</h3>
            <span className="text-small text-ink-muted">{event.type}</span>
          </div>
          <p className="mt-1 text-small text-ink-muted">
            {event.dateShort} · {event.headline} · {event.guests} expected
          </p>
          <p className="text-small text-ink-muted">{event.spaces}</p>
        </div>
        <Icon name="chevronRight" size={16} className="mt-1 text-ink-muted" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {taskCount > 0 ? (
          <StatusBadge tone="urgent" size="sm">
            {taskCount} in Tasks
          </StatusBadge>
        ) : (
          <StatusBadge tone="done" size="sm">
            All set
          </StatusBadge>
        )}
        {coverage &&
          (coverage.complete ? (
            <StatusBadge tone="done" size="sm">
              Fully staffed
            </StatusBadge>
          ) : (
            <StatusBadge tone="warn" size="sm">
              {openSpots(coverage.short)}
            </StatusBadge>
          ))}
        <span className="ml-auto text-small text-ink-muted">{event.bookingStatus} · {daysOutLabel(event)}</span>
      </div>
    </Link>
  )
}
