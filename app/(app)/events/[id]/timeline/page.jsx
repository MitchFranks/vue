'use client'

// SCREEN 6 — Event Timeline.

import { use } from 'react'
import { timelines } from '@/lib/mock/records'
import { Card, EmptyState, StatusBadge } from '@/components/ui/primitives'

export default function TimelinePage({ params }) {
  const { id } = use(params)
  const timeline = timelines[id] || []

  return (
    <Card title="Run of show" icon="clock" subtitle={`${timeline.length} entries`} bodyClassName="px-0 py-0">
      {timeline.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No timeline yet" body="Add entries once the run-of-show is agreed with the couple." />
        </div>
      ) : (
        <ol>
          {timeline.map((entry) => (
            <li
              key={entry.id}
              className={
                entry.tone === 'urgent'
                  ? 'flex items-start gap-3 border-b border-line-soft bg-urgent-soft px-4 py-3 last:border-b-0'
                  : 'flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-b-0'
              }
            >
              <span className="w-20 shrink-0 text-sm font-semibold tabular-nums text-ink-2">{entry.time}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink">{entry.title}</span>
                {entry.note && <span className="mt-0.5 block text-xs text-muted">{entry.note}</span>}
              </span>
              {entry.tone === 'urgent' && (
                <StatusBadge tone="urgent" size="sm">
                  Change requested
                </StatusBadge>
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
