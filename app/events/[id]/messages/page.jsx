'use client'

// SCREEN 11 — Event Messages (the thread list filed to this event).

import { use } from 'react'
import { useStore } from '@/lib/store'
import { Card, EmptyState, ListRow, StatusBadge } from '@/components/ui/primitives'
import { Avatar } from '@/components/ui/primitives'

export default function EventMessagesPage({ params }) {
  const { id } = use(params)
  const { messageList } = useStore()
  const msgs = messageList.filter((m) => m.eventId === id)

  return (
    <Card
      title="Messages filed to this event"
      icon="mail"
      subtitle={`${msgs.length} threads · client, vendor and staff`}
      bodyClassName="px-0 py-0"
    >
      {msgs.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No messages" body="Messages about this event are filed here automatically." />
        </div>
      ) : (
        msgs.map((m) => (
          <ListRow
            key={m.id}
            href={`/messages/${m.id}`}
            leading={<Avatar initials={m.initials} />}
            title={m.subject}
            sub={`${m.from} · ${m.fromRole}`}
            meta={m.received}
            trailing={
              m.replied ? (
                <StatusBadge tone="done" size="sm">
                  Replied
                </StatusBadge>
              ) : m.needsReply ? (
                <StatusBadge tone="urgent" size="sm">
                  Needs reply
                </StatusBadge>
              ) : (
                <StatusBadge tone="info" size="sm">
                  No action
                </StatusBadge>
              )
            }
          />
        ))
      )}
    </Card>
  )
}
