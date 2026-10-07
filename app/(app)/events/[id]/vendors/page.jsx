'use client'

// SCREEN 9 — Event Vendors.

import { use } from 'react'
import { vendors } from '@/lib/mock/records'
import { Card, EmptyState, ListRow, StatusBadge } from '@/components/ui/primitives'

export default function EventVendorsPage({ params }) {
  const { id } = use(params)
  const list = vendors.filter((v) => v.eventIds.includes(id))

  return (
    <Card title="Vendors on this event" icon="truck" subtitle={`${list.length} booked`} bodyClassName="px-0 py-0">
      {list.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No vendors booked" body="Vendors attached to this event will show here." />
        </div>
      ) : (
        list.map((v) => (
          <ListRow
            key={v.id}
            href={`/vendors/${v.id}`}
            title={v.name}
            sub={`${v.category} · ${v.contact}`}
            meta={v.note}
            trailing={
              <StatusBadge tone={v.statusTone} size="sm">
                {v.status}
              </StatusBadge>
            }
          />
        ))
      )}
    </Card>
  )
}
