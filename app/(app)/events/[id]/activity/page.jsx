'use client'

// SCREEN 13 — Event Activity Log.

import { use } from 'react'
import { activityLog } from '@/lib/mock/records'
import { Card, EmptyState, StatusBadge } from '@/components/ui/primitives'

export default function ActivityLogPage({ params }) {
  const { id } = use(params)
  const entries = activityLog.filter((h) => h.eventId === id)

  return (
    <Card
      title="Activity log"
      icon="clock"
      subtitle="Every change recorded against this event"
      bodyClassName="px-0 py-0"
    >
      {entries.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No changes recorded" body="Changes to this event will be logged here." />
        </div>
      ) : (
        <ol>
          {entries.map((h) => (
            <li key={h.id} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0">
              <span className="w-28 shrink-0 text-label text-ink-muted">{h.when}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-body text-ink">{h.what}</span>
                <span className="mt-0.5 block text-label text-ink-muted">by {h.who}</span>
              </span>
              <StatusBadge tone={h.tone} size="sm">
                {h.tone === 'urgent'
                  ? 'Action'
                  : h.tone === 'warn'
                    ? 'Review'
                    : h.tone === 'done'
                      ? 'Settled'
                      : 'Logged'}
              </StatusBadge>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
