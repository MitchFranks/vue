'use client'

// SCREEN 27 — Clients.

import { clients } from '@/lib/mock/records'
import { events } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { Avatar, Breadcrumbs, Card, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'

export default function ClientsPage() {
  const { attentionForEvent } = useStore()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Clients' }]} />
      <PageHeader title="Clients" lead={`${clients.length} clients with an event on the books.`} />

      <Card bodyClassName="px-0 py-0">
        {clients.map((c) => {
          const theirEvents = events.filter((e) => c.eventIds.includes(e.id))
          const needs = theirEvents.reduce((n, e) => n + attentionForEvent(e.id).length, 0)
          return (
            <ListRow
              key={c.id}
              href={`/clients/${c.id}`}
              leading={<Avatar initials={c.initials} />}
              title={c.name}
              sub={`${c.primary} · ${c.email}`}
              meta={theirEvents.map((e) => e.name).join(', ')}
              trailing={
                needs > 0 ? (
                  <StatusBadge tone="urgent" size="sm">
                    {needs} open
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="done" size="sm">
                    Clear
                  </StatusBadge>
                )
              }
            />
          )
        })}
      </Card>
    </div>
  )
}
