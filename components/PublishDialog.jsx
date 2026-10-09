'use client'

// ---------------------------------------------------------------------------
// Publish and notify (a modal, not a screen). Lists exactly who will be asked
// to accept, split into new and changed, warns about open positions but never
// blocks. Confirming turns every "Not sent" assignment into "Pending".
// Pattern: When I Work "Publish & Notify", Event Staff App "Send Shifts".
// ---------------------------------------------------------------------------

import { events } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { hourLabel, useStore } from '@/lib/store'
import { Alert, Button } from './ui/primitives'
import { Modal } from './ui/domain'

export function PublishDialog({ open, onClose, eventIds }) {
  const { assignmentList, openPositions, publishedEventIds, publishSchedule, toast } = useStore()

  const rows = []
  let unchanged = 0
  for (const id of eventIds) {
    const event = events.find((e) => e.id === id)
    if (!event) continue
    const wasPublished = publishedEventIds.includes(id)
    for (const block of event.blocks) {
      for (const a of assignmentList.filter((x) => x.blockId === block.id)) {
        if (a.status === 'draft') rows.push({ a, event, block, kind: wasPublished ? 'Changed' : 'New' })
        else if (a.status !== 'declined') unchanged += 1
      }
    }
  }
  const people = new Set(rows.map((r) => r.a.staffId)).size
  const stillOpen = openPositions.filter((p) => eventIds.includes(p.eventId))

  function confirm() {
    eventIds.forEach((id) => publishSchedule(id))
    toast(`Published. ${people} ${people === 1 ? 'person' : 'people'} asked to accept.`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish and notify"
      labelledBy="publish-title"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={rows.length === 0} onClick={confirm}>
            Publish and notify {people} {people === 1 ? 'person' : 'people'}
          </Button>
        </>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-ink-2">Nothing to send. Every assignment here has already been published.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-2">
            These people will be asked to accept or decline. In this prototype no real messages are sent.
          </p>
          <ul className="mb-3 divide-y divide-line-soft rounded-2xl border border-line">
            {rows.map(({ a, event, block, kind }) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>
                  <strong className="font-semibold text-ink">{staffById(a.staffId)?.name}</strong>
                  <span className="text-muted">
                    {' '}
                    · {event.name} · {block.name} {hourLabel(block.start)}–{hourLabel(block.end)}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent">
                  {kind}
                </span>
              </li>
            ))}
          </ul>
          {unchanged > 0 && <p className="mb-3 text-xs text-muted">{unchanged} other assignments are unchanged.</p>}
        </>
      )}
      {stillOpen.length > 0 && (
        <Alert tone="warn" title="Some positions are still open">
          {stillOpen.map((p) => `${p.block.name} still needs ${p.short} more ${p.role}`).join('. ')}. You can publish
          anyway.
        </Alert>
      )}
    </Modal>
  )
}
