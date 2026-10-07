'use client'

// ---------------------------------------------------------------------------
// SCREEN 17 — Staff Availability.
//
// The input side of the scheduling feature: what each person has said they can
// work. Managers read it here; the planner reads the same data to make
// suggestions. Filter by day and role to answer "who can work Saturday
// afternoon?" without opening twelve profiles.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { DAYS, ROLES, formatHour, staff } from '@/lib/mock/staff'
import { Breadcrumbs, Button, Card, EmptyState, PageHeader, Select, StatusBadge } from '@/components/ui/primitives'
import { AvailabilityGrid } from '@/components/ui/domain'

export default function AvailabilityPage() {
  const [day, setDay] = useState('Sat')
  const [role, setRole] = useState('All roles')
  const [expanded, setExpanded] = useState(null)

  const filtered = staff.filter((p) => role === 'All roles' || p.role === role)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Availability' }]} />
      <PageHeader
        title="Staff availability"
        lead="What each person has told us they can work. This is the data the planner uses when it suggests who can cover an open shift."
        actions={
          <Button href="/schedule/planner" variant="secondary" size="sm">
            Open planner
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Select label="Day" id="avail-day" options={DAYS} value={day} onChange={(e) => setDay(e.target.value)} />
        <Select
          label="Role"
          id="avail-role"
          options={['All roles', ...ROLES]}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <Card
        title={`Who can work ${day}`}
        icon="users"
        subtitle={`${filtered.filter((p) => (p.availability[day] || []).length > 0).length} of ${filtered.length} available`}
        bodyClassName="px-0 py-0"
      >
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nobody in this role" />
          </div>
        ) : (
          filtered.map((person) => {
            const windows = person.availability[day] || []
            const open = expanded === person.id
            return (
              <div key={person.id} className="border-b border-line-soft last:border-b-0">
                <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <Link href={`/staff/${person.id}`} className="text-sm font-medium text-ink hover:text-accent">
                      {person.name}
                    </Link>
                    <div className="text-xs text-muted">{person.role}</div>
                  </div>

                  {windows.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {windows.map((w, i) => (
                        <StatusBadge key={i} tone="done" size="sm">
                          {formatHour(w.start)} – {formatHour(w.end)}
                        </StatusBadge>
                      ))}
                    </div>
                  ) : (
                    <StatusBadge tone="empty" size="sm">
                      Not available {day}
                    </StatusBadge>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpanded(open ? null : person.id)}
                    aria-expanded={open}
                  >
                    {open ? 'Hide week' : 'Full week'}
                  </Button>
                </div>

                {open && (
                  <div className="border-t border-line-soft px-4 py-3">
                    <AvailabilityGrid person={person} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </Card>

      <Card className="mt-4" title="How availability is used" icon="info">
        <ul className="space-y-1 text-xs text-muted">
          <li>• Staff submit the windows they can work each week.</li>
          <li>• When a shift needs filling, only people whose window fully covers it are suggested.</li>
          <li>• Anyone already booked on an overlapping segment is filtered out as a clash.</li>
          <li>• You can always override a suggestion — the reason is shown so the trade-off is explicit.</li>
        </ul>
      </Card>
    </div>
  )
}
