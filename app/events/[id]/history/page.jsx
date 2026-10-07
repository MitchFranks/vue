'use client'

// SCREEN 13 — Event Change History.

import { use } from 'react'
import { history } from '@/lib/mock/records'
import { Card, EmptyState, StatusBadge } from '@/components/ui/primitives'

export default function HistoryPage({ params }) {
  const { id } = use(params)
  const entries = history.filter((h) => h.eventId === id)

  return (
    <Card
      title="Change history"
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
            <li key={h.id} className="flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-b-0">
              <span className="w-28 shrink-0 text-xs text-faint">{h.when}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink">{h.what}</span>
                <span className="mt-0.5 block text-xs text-muted">by {h.who}</span>
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
