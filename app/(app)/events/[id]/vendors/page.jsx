'use client'

// SCREEN 9 — Event Vendors. The vendor bookings on this event, read from the
// venue directory so a vendor edited there reads the same here.

import { use } from 'react'
import { useDirectory } from '@/lib/directory/store'
import { optionName, vendorHref } from '@/lib/directory/model'
import { Card, EmptyState, ListRow, StatusBadge } from '@/components/ui/primitives'

export default function EventVendorsPage({ params }) {
  const { id } = use(params)
  const { bookingsOnEvent, vendorById, categories } = useDirectory()
  const list = bookingsOnEvent(id)
    .map((b) => ({ booking: b, vendor: vendorById(b.vendorId) }))
    .filter((x) => x.vendor)

  return (
    <Card title="Vendors on this event" icon="truck" subtitle={`${list.length} booked`} bodyClassName="px-0 py-0">
      {list.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No vendors booked" body="Vendors attached to this event will show here." />
        </div>
      ) : (
        list.map(({ booking, vendor: v }) => (
          <ListRow
            key={booking.id}
            href={vendorHref(v.id)}
            title={v.name}
            sub={[optionName(categories, v.categoryId), v.contactName].filter(Boolean).join(' · ')}
            meta={v.notes}
            trailing={
              <StatusBadge tone={booking.tone} size="sm">
                {booking.status}
              </StatusBadge>
            }
          />
        ))
      )}
    </Card>
  )
}
