'use client'

// SCREEN 30 — Vendor Detail (?id=). Same layout as a staff profile: who they
// are on the left, the events they are booked on (and their messages) on
// the right.

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { events } from '@/lib/mock/events'
import { Breadcrumbs, Button, Card, EmptyState, Field, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { ContactInfo, DetailGrid, QueryRecord, RecordStatusBadge, RecordStatusCard } from '@/components/ui/records'
import { RecordNotFound } from '@/components/directory/RecordNotFound'
import { optionName, tasksNaming, vendorEditHref } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'

function VendorProfile({ id }) {
  const router = useRouter()
  const dir = useDirectory()
  const { messageList, toast, manualTaskList } = useStore()
  const vendor = dir.vendorById(id)

  if (!dir.hydrated) return null
  if (!vendor) return <RecordNotFound noun="vendor" backHref="/vendors" backLabel="Back to vendors" />

  const bookings = dir.bookingsFor(id).filter((b) => events.some((e) => e.id === b.eventId))
  // Messages carry no vendorId (only eventId and coupleId), so a vendor's
  // messages are found by their contact's name in the sender line
  // ("Marla Perez · Harvest Table"). Add a vendorId to the data to retire this.
  const theirMessages = vendor.contactName ? messageList.filter((m) => m.from.includes(vendor.contactName)) : []

  const toggleStatus = () => {
    const status = vendor.status === 'inactive' ? 'active' : 'inactive'
    dir.saveVendor(id, { status })
    toast(status === 'active' ? `${vendor.name} is active again.` : `${vendor.name} is inactive.`)
  }

  const remove = () => {
    dir.deleteVendor(id)
    toast(`Deleted ${vendor.name}.`)
    router.push('/vendors')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vendors', href: '/vendors' }, { label: vendor.name }]} />
      <PageHeader
        title={vendor.name}
        lead={vendor.description}
        actions={
          <>
            {vendor.status === 'inactive' && <RecordStatusBadge status="inactive" />}
            <Button href={vendorEditHref(id)} variant="secondary">
              Edit details
            </Button>
          </>
        }
      />

      <DetailGrid
        aside={
          <>
            <Card title="Contact" icon="truck">
              <ContactInfo
                items={[
                  { label: 'Category', value: optionName(dir.categories, vendor.categoryId) },
                  { label: 'Contact', value: vendor.contactName },
                  { label: 'Phone', value: vendor.phone, type: 'phone' },
                  { label: 'Email', value: vendor.email, type: 'email' },
                  { label: 'Website', value: vendor.website, type: 'website' }
                ]}
              />
            </Card>

            <Card title="Notes" icon="file">
              <dl>
                <Field label="Internal notes">{vendor.notes || <span className="text-ink-muted">None</span>}</Field>
              </dl>
            </Card>

            <RecordStatusCard
              noun="vendor"
              name={vendor.name}
              status={vendor.status}
              onToggleStatus={toggleStatus}
              onDelete={remove}
              deleteBlockedReason={
                bookings.length || tasksNaming(manualTaskList, 'vendor', id).length
                  ? `${vendor.name} is booked on events or named on tasks, so keep the record and mark it inactive instead.`
                  : ''
              }
            />
          </>
        }
      >
        <Card title="Booked on" icon="calendar" subtitle={bookings.length ? `${bookings.length} event${bookings.length === 1 ? '' : 's'}` : undefined} bodyClassName="px-0 py-0">
          {bookings.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Not booked on any events" body="When this vendor is added to an event, it shows here." />
            </div>
          ) : (
            bookings.map((b) => {
              const e = events.find((x) => x.id === b.eventId)
              return (
                <ListRow
                  key={b.id}
                  href={`/events/${e.id}/vendors`}
                  title={e.name}
                  sub={`${e.dateShort} · ${e.type}`}
                  trailing={
                    <StatusBadge tone={b.tone} size="sm">
                      {b.status}
                    </StatusBadge>
                  }
                />
              )
            })
          )}
        </Card>

        {theirMessages.length > 0 && (
          <Card title="Messages" icon="mail" bodyClassName="px-0 py-0">
            {theirMessages.map((m) => (
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
                  ) : m.needsReply ? (
                    <StatusBadge tone={m.priority === 'urgent' ? 'urgent' : 'warn'} size="sm">
                      Needs reply
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="info" size="sm">
                      No reply needed
                    </StatusBadge>
                  )
                }
              />
            ))}
          </Card>
        )}
      </DetailGrid>

      <div className="mt-4">
        <Button href="/vendors" variant="secondary" size="sm">
          Back to vendors
        </Button>
      </div>
    </div>
  )
}

export default function VendorProfilePage() {
  return <QueryRecord render={(id) => <VendorProfile id={id} />} />
}
