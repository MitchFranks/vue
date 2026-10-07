'use client'

// SCREEN 28 — Client Detail.

import { use } from 'react'
import { useStore } from '@/lib/store'
import { clientById } from '@/lib/mock/records'
import { events } from '@/lib/mock/events'
import {
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Field,
  ListRow,
  PageHeader,
  StatusBadge
} from '@/components/ui/primitives'

export default function ClientDetailPage({ params }) {
  const { id } = use(params)
  const client = clientById(id)
  const { messageList, attentionForEvent, coverageForEvent } = useStore()

  if (!client) return <EmptyState title="No such client" />

  const theirEvents = events.filter((e) => client.eventIds.includes(e.id))
  const theirMessages = messageList.filter((m) => m.clientId === client.id)

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: client.name }
        ]}
      />
      <PageHeader title={client.name} lead={client.note} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Contact" icon="user">
          <div className="mb-3 flex items-center gap-3">
            <Avatar initials={client.initials} />
            <div>
              <div className="text-sm font-medium text-ink">{client.primary}</div>
              <div className="text-xs text-muted">Primary contact</div>
            </div>
          </div>
          <dl className="space-y-2">
            <Field label="Email" value={client.email} />
            <Field label="Phone" value={client.phone} />
            <Field label="Relationship" value={client.since} />
          </dl>
        </Card>

        <div className="space-y-4">
          <Card title="Their events" icon="calendar" bodyClassName="px-0 py-0">
            {theirEvents.map((e) => {
              const needs = attentionForEvent(e.id).length
              const cov = coverageForEvent(e.id)
              return (
                <ListRow
                  key={e.id}
                  href={`/events/${e.id}`}
                  title={e.name}
                  sub={`${e.dateShort} · ${e.type} · ${e.guests} guests`}
                  trailing={
                    <div className="hidden gap-1.5 sm:flex">
                      {needs > 0 && (
                        <StatusBadge tone="urgent" size="sm">
                          {needs}
                        </StatusBadge>
                      )}
                      {!cov.complete && (
                        <StatusBadge tone="urgent" size="sm">
                          Short {cov.short}
                        </StatusBadge>
                      )}
                    </div>
                  }
                />
              )
            })}
          </Card>

          <Card title="Messages" icon="mail" bodyClassName="px-0 py-0">
            {theirMessages.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted">No messages from this client.</p>
            ) : (
              theirMessages.map((m) => (
                <ListRow
                  key={m.id}
                  href={`/messages/${m.id}`}
                  title={m.subject}
                  sub={m.received}
                  trailing={
                    m.replied ? (
                      <StatusBadge tone="done" size="sm">
                        Replied
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="urgent" size="sm">
                        Needs reply
                      </StatusBadge>
                    )
                  }
                />
              ))
            )}
          </Card>
        </div>
      </div>

      <div className="mt-4">
        <Button href="/clients" variant="secondary" size="sm">
          Back to clients
        </Button>
      </div>
    </div>
  )
}
