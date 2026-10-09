'use client'

// ---------------------------------------------------------------------------
// Staff Planner · Team availability.
//
// A week grid: one row per person (grouped by role), one column per day. Each
// cell shows the window they said they can work; the blocks they are assigned
// to that week sit on top as small chips, flagged when an assignment falls
// outside the window. Replaces the old Availability stage.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { ROLES, isAvailable, staff } from '@/lib/mock/staff'
import { blockById } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { THIS_WEEK, WEEKDAYS, addDays, dayLabel, shortHour } from '@/lib/weeks'
import { Avatar, Button, Card, Icon, PageHeader } from '@/components/ui/primitives'
import { WeekPicker } from '@/components/WeekPicker'
import { AvailabilityGrid } from '@/components/ui/domain'
import { cx } from '@/lib/cx'

export default function TeamAvailabilityPage() {
  const { assignmentList } = useStore()
  const [weekKey, setWeekKey] = useState(THIS_WEEK)
  const [expanded, setExpanded] = useState(null)

  const days = WEEKDAYS.map((name, i) => ({ name, key: addDays(weekKey, i) }))

  return (
    <div>
      <PageHeader
        title="Team availability"
        lead="What each person told us they can work, with their assignments for the week on top. A flag means an assignment falls outside their stated hours."
        actions={<WeekPicker weekKey={weekKey} onChange={setWeekKey} />}
      />

      <Card bodyClassName="px-0 py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-[12px]">
            <caption className="sr-only">Team availability and assignments for the week</caption>
            <thead>
              <tr className="border-b border-line bg-wash/60 text-left text-muted">
                <th scope="col" className="w-48 px-4 py-2.5 font-semibold">
                  Person
                </th>
                {days.map((d) => (
                  <th key={d.key} scope="col" className="px-2 py-2.5 font-semibold">
                    {d.name}
                    <span className="block text-[11px] font-normal text-faint">{dayLabel(d.key)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            {ROLES.map((role) => {
              const people = staff.filter((p) => p.role === role)
              if (!people.length) return null
              return (
                <tbody key={role} className="border-b border-line-soft last:border-b-0">
                  <tr>
                    <th colSpan={8} scope="colgroup" className="bg-accent-soft/50 px-4 py-1.5 text-left text-[12px] font-bold text-accent">
                      {role}
                    </th>
                  </tr>
                  {people.map((person) => (
                    <PersonRow
                      key={person.id}
                      person={person}
                      days={days}
                      assignmentList={assignmentList}
                      open={expanded === person.id}
                      onToggle={() => setExpanded(expanded === person.id ? null : person.id)}
                    />
                  ))}
                </tbody>
              )
            })}
          </table>
        </div>
      </Card>

      <p className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-done-soft ring-1 ring-done-line" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-wash ring-1 ring-line" /> Not available
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="alert" size={12} className="text-warn" /> Assigned outside stated hours
        </span>
      </p>
    </div>
  )
}

function PersonRow({ person, days, assignmentList, open, onToggle }) {
  return (
    <>
      <tr className="border-t border-line-soft align-top">
        <th scope="row" className="px-4 py-2.5 text-left font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar initials={person.initials} size="sm" />
            <div className="min-w-0">
              <Link href={`/staff/${person.id}`} className="block truncate text-[13px] font-semibold text-ink hover:text-accent">
                {person.name}
              </Link>
              <button type="button" onClick={onToggle} aria-expanded={open} className="text-[11px] text-accent hover:underline">
                {open ? 'Hide week' : 'Full week'}
              </button>
            </div>
          </div>
        </th>
        {days.map((d) => {
          const windows = person.availability[d.name] || []
          const mine = assignmentList
            .filter((a) => a.staffId === person.id && a.status !== 'declined')
            .map((a) => ({ a, found: blockById(a.blockId) }))
            .filter((x) => x.found && x.found.event.dateKey === d.key)
          return (
            <td key={d.key} className="px-1.5 py-1.5">
              <div
                className={cx(
                  'rounded-xl px-2 py-1 text-[11px] font-medium',
                  windows.length ? 'bg-done-soft text-done' : 'bg-wash text-faint'
                )}
              >
                {windows.length ? windows.map((w) => `${shortHour(w.start)}–${shortHour(w.end)}`).join(', ') : 'Not available'}
              </div>
              {mine.map(({ a, found }) => {
                const outside = !isAvailable(person, d.name, found.block.start, found.block.end)
                return (
                  <Link
                    key={a.id}
                    href={`/staffing/${found.event.id}?block=${found.block.id}&role=${encodeURIComponent(a.role)}`}
                    className={cx(
                      'mt-1 flex items-center gap-1 truncate rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors hover:bg-accent-soft',
                      outside ? 'border-warn-line bg-warn-soft text-warn' : 'border-accent-line bg-surface text-accent'
                    )}
                    title={`${found.event.name} · ${found.block.name}`}
                  >
                    {outside && <Icon name="alert" size={10} />}
                    <span className="truncate">
                      {found.event.name.split(' ')[0]} {found.block.name}
                    </span>
                  </Link>
                )
              })}
            </td>
          )
        })}
      </tr>
      {open && (
        <tr>
          <td colSpan={8} className="border-t border-line-soft bg-wash/40 px-4 py-3">
            <AvailabilityGrid person={person} />
            <div className="mt-2">
              <Button href={`/staff/${person.id}`} variant="ghost" size="sm">
                Open profile
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
