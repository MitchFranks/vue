'use client'

// SCREEN 15 — Staff Directory. The people view: who works here, their role
// and how to reach them, with request counts read from the Staffing Planner.
// Staff are kept in the venue directory (lib/directory); weekly hours are
// edited on each profile, away dates in Staffing Planner > Team.

import { TODAY_KEY } from '@/lib/mock/events'
import { Avatar, Breadcrumbs, Button, Icon, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { EntityList, ListToolbar, RecordStatusBadge, useListFilters } from '@/components/ui/records'
import { ManageOptionsButton } from '@/components/directory/ManageOptions'
import { availabilitySummary, fullName, initialsOf, matchesQuery, optionName, staffHref, STATUS_FILTERS } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'
import { WORLD } from '@/lib/staffing/adapter'
import { requestList } from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'

/** Planner requests for upcoming events, counted by status. */
function countsFor(staffId, st) {
  const rs = requestList(st).filter((r) => r.staffId === staffId && WORLD.eventMap[r.eventId]?.dateKey >= TODAY_KEY)
  return {
    confirmed: rs.filter((r) => r.status === 'accepted').length,
    waiting: rs.filter((r) => r.status === 'pending').length,
    declined: rs.filter((r) => r.status === 'declined').length
  }
}

export default function StaffDirectoryPage() {
  const { state, hydrated } = useStaffing2()
  const { staff, roles } = useDirectory()
  const filters = useListFilters({ query: '', role: 'all', status: 'active' })
  const { query, role, status } = filters.values

  const roleNames = (p) => p.roleIds.map((id) => optionName(roles, id)).filter(Boolean)
  const filtered = staff
    .filter(
      (p) =>
        (status === 'all' || p.status === status) &&
        (role === 'all' || p.roleIds.includes(role)) &&
        matchesQuery(query, [fullName(p), p.email, p.phone, ...roleNames(p), ...(p.skills || [])])
    )
    .sort((a, b) => fullName(a).localeCompare(fullName(b)))

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Staff Directory' }]} />
      <PageHeader
        title="Staff directory"
        lead="Everyone who works here and how to reach them. Open a person for their profile, weekly hours and the events they've been asked to work."
        actions={
          <>
            <Button href="/staffing/team" variant="secondary" size="md" data-guide="view-availability">
              <Icon name="clock" size={14} />
              Availability and away dates
            </Button>
            <ManageOptionsButton kind="roles" />
            <Button href="/staff/new" variant="primary">
              <Icon name="plus" size={14} />
              Add staff member
            </Button>
          </>
        }
      />

      <ListToolbar
        search={{ id: 'staff-search', placeholder: 'Name, email, phone or skill', value: query, onChange: filters.set('query') }}
        filters={[
          { id: 'staff-role', label: 'Role', options: [{ value: 'all', label: 'All roles' }, ...roles.map((r) => ({ value: r.id, label: r.name }))], value: role, onChange: filters.set('role') },
          { id: 'staff-status', label: 'Status', options: STATUS_FILTERS, value: status, onChange: filters.set('status') }
        ]}
      />

      <EntityList
        items={filtered}
        emptyTitle="No one matches"
        emptyBody="Try a different role or status, or clear the search."
        onClear={filters.clear}
        renderRow={(person) => {
          const n = hydrated ? countsFor(person.id, state) : null
          return (
            <ListRow
              key={person.id}
              href={staffHref(person.id)}
              leading={<Avatar initials={initialsOf(person)} />}
              title={fullName(person)}
              sub={[roleNames(person).join(' · '), person.phone].filter(Boolean).join(' · ')}
              meta={[person.email, availabilitySummary(person)].filter(Boolean).join(' · ')}
              trailing={
                <div className="hidden gap-1.5 sm:flex">
                  {person.status === 'inactive' && <RecordStatusBadge status="inactive" size="sm" />}
                  {person.availabilityStatus === 'pending' && (
                    <StatusBadge tone="pending" size="sm">
                      Hours pending
                    </StatusBadge>
                  )}
                  {n?.confirmed > 0 && (
                    <StatusBadge tone="done" size="sm">
                      {n.confirmed} confirmed
                    </StatusBadge>
                  )}
                  {n?.waiting > 0 && (
                    <StatusBadge tone="pending" size="sm">
                      {n.waiting} waiting
                    </StatusBadge>
                  )}
                  {n?.declined > 0 && (
                    <StatusBadge tone="declined" size="sm">
                      {n.declined} can&apos;t make it
                    </StatusBadge>
                  )}
                </div>
              }
            />
          )
        }}
      />
    </div>
  )
}
