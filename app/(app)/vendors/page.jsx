'use client'

// SCREEN 29 — Vendors. Every supplier the venue works with, kept in the venue
// directory (lib/directory). A vendor's place on an event is a booking, so
// the badge shows how their bookings stand.

import { Breadcrumbs, Button, Icon, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { EntityList, ListToolbar, RecordStatusBadge, useListFilters } from '@/components/ui/records'
import { ManageOptionsButton } from '@/components/directory/ManageOptions'
import { matchesQuery, optionName, STATUS_FILTERS, vendorHref } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'

// The booking that most needs attention speaks for the vendor in the list.
const TONE_ORDER = ['urgent', 'declined', 'warn', 'pending', 'info', 'empty', 'done']

export default function VendorsPage() {
  const { vendors, categories, bookingsFor } = useDirectory()
  const filters = useListFilters({ query: '', category: 'all', status: 'active' })
  const { query, category, status } = filters.values

  const filtered = vendors
    .filter(
      (v) =>
        (status === 'all' || v.status === status) &&
        (category === 'all' || v.categoryId === category) &&
        matchesQuery(query, [v.name, v.contactName, v.email, v.phone, optionName(categories, v.categoryId)])
    )
    .sort((a, b) => a.name.localeCompare(b.name))
  const activeCount = vendors.filter((v) => v.status === 'active').length

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vendors' }]} />
      <PageHeader
        title="Vendors"
        lead={`${activeCount} active supplier${activeCount === 1 ? '' : 's'} you can book for events.`}
        actions={
          <>
            <ManageOptionsButton kind="categories" />
            <Button href="/vendors/new" variant="primary">
              <Icon name="plus" size={14} />
              Add vendor
            </Button>
          </>
        }
      />

      <ListToolbar
        search={{ id: 'vendor-search', placeholder: 'Company, contact, email or phone', value: query, onChange: filters.set('query') }}
        filters={[
          {
            id: 'vendor-category',
            label: 'Category',
            options: [{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
            value: category,
            onChange: filters.set('category')
          },
          { id: 'vendor-status', label: 'Status', options: STATUS_FILTERS, value: status, onChange: filters.set('status') }
        ]}
      />

      <EntityList
        items={filtered}
        emptyTitle="No vendors match"
        emptyBody="Try a different category or status, or clear the search."
        onClear={filters.clear}
        renderRow={(v) => {
          const bookings = bookingsFor(v.id)
          const lead = [...bookings].sort((a, b) => TONE_ORDER.indexOf(a.tone) - TONE_ORDER.indexOf(b.tone))[0]
          return (
            <ListRow
              key={v.id}
              href={vendorHref(v.id)}
              title={v.name}
              sub={[optionName(categories, v.categoryId), v.contactName].filter(Boolean).join(' · ')}
              meta={bookings.length ? `On ${bookings.length} event${bookings.length === 1 ? '' : 's'}` : 'Not on any events yet'}
              trailing={
                <>
                  {v.status === 'inactive' && <RecordStatusBadge status="inactive" size="sm" />}
                  {lead && (
                    <StatusBadge tone={lead.tone} size="sm">
                      {lead.status}
                    </StatusBadge>
                  )}
                </>
              }
            />
          )
        }}
      />
    </div>
  )
}
