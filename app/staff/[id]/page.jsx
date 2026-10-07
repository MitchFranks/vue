'use client'

// SCREEN 16 — Staff Member Detail.
// Accept/decline here is the same action as on the event — a fifth route into
// the staffing loop.

import { use } from 'react'
import { useStore } from '@/lib/store'
import { staffById } from '@/lib/mock/staff'
import {
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  StatusBadge
} from '@/components/ui/primitives'
import { AvailabilityGrid, ShiftCard, useConfirm } from '@/components/ui/domain'

export default function StaffDetailPage({ params }) {
  const { id } = use(params)
  const person = staffById(id)
  const { shiftsForStaff, setShiftStatus, toast } = useStore()
  const { confirm, dialog } = useConfirm()

  if (!person) return <EmptyState title="No such staff member" />

  const shifts = shiftsForStaff(person.id)
  const accepted = shifts.filter((s) => s.status === 'accepted')
  const pending = shifts.filter((s) => s.status === 'pending')
  const declined = shifts.filter((s) => s.status === 'declined')

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff Directory', href: '/staff' },
          { label: person.name }
        ]}
      />

      <PageHeader
        title={person.name}
        lead={person.note}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">{person.role}</StatusBadge>
            {declined.length > 0 && <StatusBadge tone="declined">{declined.length} declined</StatusBadge>}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Contact" icon="user">
          <div className="mb-3 flex items-center gap-3">
            <Avatar initials={person.initials} />
            <div>
              <div className="text-sm font-medium text-ink">{person.name}</div>
              <div className="text-xs text-muted">{person.role}</div>
            </div>
          </div>
          <dl className="space-y-2">
            <Field label="Phone" value={person.phone} />
            <Field label="Email" value={person.email} />
            <Field label="Preferred hours" value={person.preferredHours} />
            <Field label="Shifts this week" value={`${shifts.length}`} />
          </dl>
        </Card>

        <Card title="Stated availability" icon="grid" subtitle="Submitted by the staff member">
          <AvailabilityGrid person={person} />
        </Card>
      </div>

      <div className="mt-4 space-y-4">
        <Card
          title="Shifts"
          icon="clock"
          subtitle={`${accepted.length} accepted · ${pending.length} pending · ${declined.length} declined`}
          bodyClassName="px-0 py-0"
        >
          {shifts.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No shifts assigned" body="This person has nothing on the schedule right now." />
            </div>
          ) : (
            shifts.map((s) => (
              <ShiftCard
                key={s.id}
                assignment={s}
                event={s.event}
                segment={s.segment}
                showActions
                onAccept={() => {
                  setShiftStatus(s.id, 'accepted')
                  toast(`${person.name} accepted ${s.segment.name} on ${s.event.name}.`)
                }}
                onDecline={() =>
                  confirm({
                    title: `Record a decline for ${person.name}?`,
                    body: `This opens a coverage gap for ${s.segment.name} on ${s.event.name} and raises an item in Needs Attention.`,
                    confirmLabel: 'Record decline',
                    danger: true,
                    onConfirm: () => {
                      setShiftStatus(s.id, 'declined', 'Declined by staff member.')
                      toast(`${person.name} declined — coverage gap opened.`, 'urgent')
                    }
                  })
                }
              />
            ))
          )}
        </Card>
      </div>

      <div className="mt-4">
        <Button href="/staff" variant="secondary" size="sm">
          Back to directory
        </Button>
      </div>

      {dialog}
    </div>
  )
}
