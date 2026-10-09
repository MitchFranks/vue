'use client'

// ---------------------------------------------------------------------------
// Staff Planner · Staff replies.
//
// Where answers come back. Declines stay visible until someone replaces them
// (Sling); pending assignments can be marked accepted or declined, which
// simulates the staff member's phone in this prototype; open offers can be
// "claimed" by one of the people they went to (When I Work open shifts).
// Replaces the old assignment detail and staffing request pages.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { blockById } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { hourLabel, positionIdFor, useStore } from '@/lib/store'
import { Avatar, Button, Card, EmptyState, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { DeclineDialog } from '@/components/DeclineDialog'

export default function StaffRepliesPage() {
  const {
    assignmentList,
    openPositions,
    offers,
    setAssignmentStatus,
    candidatesForSlot,
    offerPosition,
    claimOffer,
    toast
  } = useStore()
  const [declining, setDeclining] = useState(null)

  const withContext = (list) =>
    list
      .map((a) => ({ a, found: blockById(a.blockId), person: staffById(a.staffId) }))
      .filter((x) => x.found && x.person)

  const declined = withContext(assignmentList.filter((a) => a.status === 'declined'))
  const pending = withContext(assignmentList.filter((a) => a.status === 'pending'))
  const openOffers = Object.entries(offers)
    .map(([positionId, o]) => ({ position: openPositions.find((p) => p.id === positionId), positionId, staffIds: o.staffIds }))
    .filter((o) => o.position)

  const slotText = ({ found }) =>
    `${found.event.name} · ${found.block.name} ${hourLabel(found.block.start)}–${hourLabel(found.block.end)}`
  const boardLink = ({ a, found }) =>
    `/staffing/${found.event.id}?block=${found.block.id}&role=${encodeURIComponent(a.role)}`

  return (
    <div>
      <PageHeader
        title="Staff replies"
        lead="Declines, unanswered requests and open offers in one place. In this prototype you can record a reply on a staff member's behalf."
      />

      <div className="space-y-5">
        <Card
          title="Declined"
          icon="alert"
          subtitle={declined.length ? 'These positions are open again' : undefined}
          bodyClassName="px-0 py-0"
        >
          {declined.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No declines" body="Everyone who answered said yes." />
            </div>
          ) : (
            declined.map((row) => {
              const open = openPositions.find((p) => p.id === positionIdFor(row.a.blockId, row.a.role))
              return (
                <ListRow
                  key={row.a.id}
                  leading={<Avatar initials={row.person.initials} />}
                  title={`${row.person.name} declined ${row.found.block.name}`}
                  sub={slotText(row)}
                  meta={row.a.declineReason ? `Reason: ${row.a.declineReason}` : undefined}
                  trailing={
                    open ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button href={boardLink(row)} variant="primary" size="sm">
                          Replace
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const ids = candidatesForSlot(row.found.block, row.a.role)
                              .filter((c) => c.eligible && !c.alreadyOnBlock)
                              .map((c) => c.person.id)
                            offerPosition(open.id, ids)
                            toast(`Offered to ${ids.length} eligible ${ids.length === 1 ? 'person' : 'people'}.`)
                          }}
                        >
                          Offer to eligible staff
                        </Button>
                      </div>
                    ) : (
                      <StatusBadge tone="done" size="sm">
                        Replaced
                      </StatusBadge>
                    )
                  }
                />
              )
            })
          )}
        </Card>

        <Card
          title="Waiting for a reply"
          icon="clock"
          subtitle={pending.length ? `${pending.length} asked, not yet answered` : undefined}
          bodyClassName="px-0 py-0"
        >
          {pending.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Nobody is waiting" body="Publish an event to ask people to accept." />
            </div>
          ) : (
            pending.map((row) => (
              <ListRow
                key={row.a.id}
                leading={<Avatar initials={row.person.initials} />}
                title={row.person.name}
                sub={slotText(row)}
                meta={`Role: ${row.a.role}`}
                trailing={
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setAssignmentStatus(row.a.id, 'accepted')
                        toast(`${row.person.name} accepted ${row.found.block.name}.`)
                      }}
                    >
                      Mark accepted
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeclining(row)}>
                      Mark declined
                    </Button>
                  </div>
                }
              />
            ))
          )}
        </Card>

        <Card title="Open offers" icon="send" subtitle="Positions offered to several people" bodyClassName="px-0 py-0">
          {openOffers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No open offers"
                body="Use “Offer to everyone eligible” in the assign panel, or on a decline above."
              />
            </div>
          ) : (
            openOffers.map(({ position, positionId, staffIds }) => (
              <div key={positionId} className="border-b border-line-soft px-4 py-3 last:border-b-0">
                <p className="text-[14px] font-semibold text-ink">
                  {position.block.name}: {position.role} · {position.event.name}
                </p>
                <p className="mb-2 text-xs text-muted">
                  Offered to {staffIds.length}. The first to claim it is assigned and the position closes.
                </p>
                <div className="flex flex-wrap gap-2">
                  {staffIds.map((id) => {
                    const person = staffById(id)
                    return (
                      <Button
                        key={id}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          claimOffer(positionId, id)
                          toast(`${person?.name} claimed ${position.block.name}. Position filled.`)
                        }}
                      >
                        Simulate claim: {person?.name}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      <DeclineDialog
        open={!!declining}
        personName={declining?.person.name}
        slotLabel={declining ? declining.a.role : ''}
        onClose={() => setDeclining(null)}
        onConfirm={(reason) => {
          setAssignmentStatus(declining.a.id, 'declined', reason)
          toast(`${declining.person.name} declined. The position is open again.`, 'urgent')
          setDeclining(null)
        }}
      />
    </div>
  )
}
