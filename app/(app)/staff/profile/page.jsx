'use client'

// SCREEN 16 — Staff Member Detail (?id=). Profile, contact and weekly hours
// from the venue directory, plus every event this person has been asked to
// work, read from the Staffing Planner with its real status. Recording an
// answer here is the planner's own recordReply, so the event page and Tasks
// update at once, and the toast offers Undo.

import { useState } from 'react'
import { TODAY_KEY } from '@/lib/mock/events'
import { Avatar, Breadcrumbs, Button, Card, EmptyState, Field, Icon, PageHeader } from '@/components/ui/primitives'
import { Modal, useConfirm } from '@/components/ui/domain'
import { ContactInfo, DetailGrid, QueryRecord, RecordStatusBadge, RecordStatusCard } from '@/components/ui/records'
import { AvailabilityEditor, AvailabilitySummary, availabilityIsValid } from '@/components/directory/Availability'
import { RecordNotFound } from '@/components/directory/RecordNotFound'
import { RequestStatus } from '@/components/staffing/StatusChip'
import { fullName, initialsOf, optionName, staffEditHref, tasksNaming } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'
import { useStore } from '@/lib/store'
import { WORLD } from '@/lib/staffing/adapter'
import { awayDateText, dayLine, requestList } from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'
import { useRouter } from 'next/navigation'

const STATUS_ORDER = { pending: 0, draft: 1, accepted: 2, backup: 3, declined: 4, cancelled: 5 }

function StaffProfile({ id }) {
  const router = useRouter()
  const dir = useDirectory()
  const { toast, manualTaskList } = useStore()
  const { state, hydrated, recordReply, openPhone } = useStaffing2()
  const { confirm, dialog } = useConfirm()
  const [editingHours, setEditingHours] = useState(false)
  const person = dir.staffById(id)

  if (!dir.hydrated) return null
  if (!person) return <RecordNotFound noun="staff member" backHref="/staff" backLabel="Back to directory" />

  const name = fullName(person)
  const first = person.firstName
  const roleNames = person.roleIds.map((rid) => optionName(dir.roles, rid)).filter(Boolean)
  const credentials = WORLD.staffMap[id]?.credentials || []
  // Everything the planner has on file for this person, past and future, decides whether they can be deleted.
  const anyRequests = requestList(state).some((r) => r.staffId === id)
  const onTasks = tasksNaming(manualTaskList, 'staff', id).length
  const signsIn = !!person.accountId
  const requests = requestList(state)
    .filter((r) => r.staffId === id && r.status !== 'cancelled' && WORLD.eventMap[r.eventId])
    .filter((r) => WORLD.eventMap[r.eventId].dateKey >= TODAY_KEY)
    .sort((a, b) => {
      const da = WORLD.eventMap[a.eventId].dateKey
      const db = WORLD.eventMap[b.eventId].dateKey
      return da < db ? -1 : da > db ? 1 : STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    })
  const count = (s) => requests.filter((r) => r.status === s).length
  const away = state.away.filter((a) => a.staffId === id && (a.endDateKey || a.dateKey) >= TODAY_KEY)
  const teamHref = `/staffing/team?who=${id}`

  const recordNo = (r, ev) =>
    confirm({
      title: `Record that ${first} can't make it?`,
      body: `${first}'s spot as ${r.role} at the ${ev.name} opens again and shows in Tasks as an open spot to fill. You can undo this from the message that appears.`,
      confirmLabel: `Record: can't make it`,
      danger: true,
      onConfirm: () => recordReply(r.id, false)
    })

  const toggleStatus = () => {
    const status = person.status === 'inactive' ? 'active' : 'inactive'
    dir.saveStaff(id, { status })
    toast(status === 'active' ? `${name} is active again.` : `${name} is inactive and won't be suggested for new shifts.`)
  }

  const remove = () => {
    dir.deleteStaff(id)
    toast(`Deleted ${name}.`)
    router.push('/staff')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Staff Directory', href: '/staff' }, { label: name }]} />

      <PageHeader
        title={name}
        lead={roleNames.join(' · ')}
        actions={
          <>
            {person.status === 'inactive' && <RecordStatusBadge status="inactive" />}
            <Button href={staffEditHref(id)} variant="secondary">
              Edit details
            </Button>
          </>
        }
      />

      <DetailGrid
        aside={
          <>
            <Card title="Contact" icon="user">
              <div className="mb-4 flex items-center gap-3">
                <Avatar initials={initialsOf(person)} />
                <div className="min-w-0">
                  <div className="text-body font-medium text-ink">{name}</div>
                  <div className="text-small text-ink-muted">{roleNames.join(' · ')}</div>
                </div>
              </div>
              <ContactInfo
                items={[
                  { label: 'Phone', value: person.phone, type: 'phone' },
                  { label: 'Email', value: person.email, type: 'email' }
                ]}
              />
            </Card>

            <Card title="Profile" icon="file">
              <dl className="space-y-3">
                <Field label="Main role" value={roleNames[0] || 'None'} />
                {roleNames.length > 1 && <Field label="Can also work as" value={roleNames.slice(1).join(', ')} />}
                <Field label="Preferred hours" value={person.preferredHours || 'Not set'} />
                <Field label="Skills or qualifications" value={person.skills?.length ? person.skills.join(', ') : 'None added'} />
                {credentials.length > 0 && (
                  <Field label="Certificates" value={credentials.map((c) => `Alcohol service (expires ${c.expiresOn})`).join(', ')} />
                )}
                <Field label="Notes">{person.notes || <span className="text-ink-muted">None</span>}</Field>
              </dl>
            </Card>

            <RecordStatusCard
              noun="staff member"
              name={name}
              status={person.status}
              onToggleStatus={toggleStatus}
              onDelete={remove}
              deleteBlockedReason={
                signsIn
                  ? `${first} owns this workspace's account, so the record stays.`
                  : anyRequests || onTasks
                    ? `${first} has been asked to work events or is on tasks, so keep the record and mark them inactive instead.`
                    : ''
              }
              inactiveNote={`${first} stays on file, and on any events already planned, but is not suggested for new shifts.`}
            />
          </>
        }
      >
        <Card
          title="Weekly availability"
          icon="calendar"
          subtitle="Their usual week. The Staffing Planner suggests people by it."
          action={
            <Button size="sm" onClick={() => setEditingHours(true)}>
              Edit hours
            </Button>
          }
        >
          <AvailabilitySummary availability={person.availability} status={person.availabilityStatus} />
          <div className="mt-4 border-t border-line pt-4">
            <dl>
              <Field label="Away dates">
                {!hydrated ? '…' : away.length ? (
                  <ul className="space-y-1">
                    {away.map((a) => (
                      <li key={a.id}>{awayDateText(a)}</li>
                    ))}
                  </ul>
                ) : (
                  'None coming up'
                )}
              </Field>
            </dl>
            <div className="mt-3">
              <Button href={teamHref} size="sm" variant="ghost">
                <Icon name="clock" size={13} />
                Away dates in Team
              </Button>
            </div>
          </div>
        </Card>

        <Card
          title="Events asked to work"
          icon="list"
          subtitle={
            hydrated
              ? `${count('accepted')} confirmed · ${count('pending')} waiting · ${count('draft')} not sent · ${count('declined')} can't make it`
              : undefined
          }
          bodyClassName="px-0 py-0"
        >
          {!hydrated ? null : requests.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Not asked to work any upcoming events" body={`When you ask ${first} to work an event in the Staffing Planner, it shows here.`} />
            </div>
          ) : (
            requests.map((r) => {
              const ev = WORLD.eventMap[r.eventId]
              const boardHref = `/staffing/${ev.id}?block=${r.blockIds[0]}&role=${encodeURIComponent(r.role)}`
              return (
                <div key={r.id} className="border-b border-line px-4 py-3 last:border-b-0 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">
                        {ev.name} <span className="font-normal text-ink-muted">· {ev.dateShort}</span>
                      </p>
                      <p className="text-small text-ink-muted">
                        {r.role} · {dayLine(r)}
                      </p>
                      {r.status === 'declined' && r.reason && <p className="mt-1 text-small text-ink-muted">Reason: {r.reason}</p>}
                    </div>
                    <RequestStatus request={r} st={state} />
                  </div>

                  {r.status === 'pending' && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-small text-ink-muted">{first} told you their answer another way?</span>
                      <Button size="sm" onClick={() => recordReply(r.id, true)}>
                        Record: said yes
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => recordNo(r, ev)}>
                        Record: can&apos;t make it
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openPhone(id)}>
                        <Icon name="phone" size={13} />
                        Open {first}&apos;s phone (prototype)
                      </Button>
                    </div>
                  )}

                  <div className="mt-2">
                    <Button href={boardHref} size="sm" variant="ghost">
                      Open in the Staffing Planner
                      <Icon name="arrowRight" size={13} />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </Card>
      </DetailGrid>

      <div className="mt-4">
        <Button href="/staff" variant="secondary" size="sm">
          Back to directory
        </Button>
      </div>

      {editingHours && <HoursModal person={person} onClose={() => setEditingHours(false)} />}
      {dialog}
    </div>
  )
}

/** Edit weekly hours without leaving the profile. */
function HoursModal({ person, onClose }) {
  const { saveStaff } = useDirectory()
  const { toast } = useStore()
  const [availability, setAvailability] = useState(person.availability)
  const [status, setStatus] = useState(person.availabilityStatus)
  const valid = availabilityIsValid(availability)

  const save = () => {
    saveStaff(person.id, { availability, availabilityStatus: status })
    toast(`Saved ${person.firstName}'s weekly hours.`)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Weekly availability"
      subtitle={fullName(person)}
      variant="sheet"
      width="sm:w-[560px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!valid}>
            Save hours
          </Button>
        </>
      }
    >
      <AvailabilityEditor idPrefix="hours" value={availability} onChange={setAvailability} status={status} onStatusChange={setStatus} />
    </Modal>
  )
}

export default function StaffProfilePage() {
  return <QueryRecord render={(id) => <StaffProfile id={id} />} />
}
