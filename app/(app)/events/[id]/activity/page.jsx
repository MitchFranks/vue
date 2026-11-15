'use client'

// SCREEN 13 — Event Activity log.
// Each entry says in plain words whether it still needs anything from you.
// Detail sheet changes come first, newest first: still "Worth a look" until
// every staff member it was sent to has seen it.

import { use } from 'react'
import { activityLog } from '@/lib/mock/records'
import { useEventSheet } from '@/lib/eventSheetStore'
import { BY_KIND, entryTitle, notSeenBy } from '@/lib/eventSheet'
import { stampLabel } from '@/lib/staffing/derive'
import { Card, EmptyState, ListRow, StatusBadge } from '@/components/ui'

const STATUS_WORDS = {
  urgent: 'Needs you',
  warn: 'Worth a look',
  done: 'Done',
  info: 'No action needed'
}

export default function ActivityLogPage({ params }) {
  const { id } = use(params)
  const { entriesFor } = useEventSheet()
  const changes = entriesFor(id).map((e) => ({
    id: e.id,
    what: e.reason ? `${entryTitle(e)}. Why: ${e.reason}` : entryTitle(e),
    when: stampLabel(e.at),
    who: `${e.by.name} (${BY_KIND[e.by.kind] || 'Venue'}), on the detail sheet`,
    tone: notSeenBy(e).length ? 'warn' : 'done'
  }))
  const entries = [...changes, ...activityLog.filter((h) => h.eventId === id)]

  return (
    <Card title="Activity log" icon="clock" subtitle="Every change recorded against this event" bodyClassName="px-0 py-0">
      {entries.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No changes recorded" body="Changes to this event will be logged here." />
        </div>
      ) : (
        entries.map((h) => (
          <ListRow
            key={h.id}
            title={h.what}
            sub={`${h.when} · by ${h.who}`}
            trailing={
              <StatusBadge tone={h.tone} size="sm">
                {STATUS_WORDS[h.tone] || STATUS_WORDS.info}
              </StatusBadge>
            }
          />
        ))
      )}
    </Card>
  )
}
