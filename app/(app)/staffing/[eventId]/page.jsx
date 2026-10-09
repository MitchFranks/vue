'use client'

// ---------------------------------------------------------------------------
// Staff Planner · Event board. The primary screen.
//
// One row per timeline block; inside it, one group per required role with that
// many slots. A slot is Open, Not sent, Pending, Accepted or Declined, and every
// state carries an icon and a word. Clicking an open slot opens the assign
// panel; clicking a person opens their actions (Mark accepted/declined,
// Replace, Remove). Structure follows Planning Center's per-event "needed
// positions"; see docs/STAFF-PLANNER-SPEC.md.
// ---------------------------------------------------------------------------

import { Suspense, use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { events, eventById } from '@/lib/mock/events'
import { staffById } from '@/lib/mock/staff'
import { hourLabel, positionIdFor, useStore } from '@/lib/store'
import { Alert, Breadcrumbs, Button, Card, EmptyState, Icon, PageHeader, Select, StatusBadge } from '@/components/ui/primitives'
import { AssignPanel } from '@/components/AssignPanel'
import { DeclineDialog } from '@/components/DeclineDialog'
import { PublishDialog } from '@/components/PublishDialog'
import { LAST_EVENT_KEY } from '@/components/StaffTabs'
import { cx } from '@/lib/cx'

const CHIP = {
  draft: { cls: 'border-accent-line bg-surface text-ink-2', icon: 'dash', label: 'Not sent' },
  pending: { cls: 'border-accent-line bg-accent-soft text-accent', icon: 'clock', label: 'Pending' },
  accepted: { cls: 'border-done-line bg-done-soft text-done', icon: 'check', label: 'Accepted' },
  declined: { cls: 'border-urgent-line bg-urgent-soft text-urgent', icon: 'x', label: 'Declined' }
}

function Board({ eventId }) {
  const router = useRouter()
  const params = useSearchParams()
  const event = eventById(eventId)
  const {
    assignmentList,
    openPositions,
    coverageForEvent,
    publishedEventIds,
    setAssignmentStatus,
    removeAssignment,
    copyStaffing,
    toast
  } = useStore()

  const [panel, setPanel] = useState(null) // { blockId, role, replaceId }
  const [selected, setSelected] = useState(null) // assignment id whose actions are showing
  const [declining, setDeclining] = useState(null) // assignment being declined
  const [publishing, setPublishing] = useState(false)
  const [copyFrom, setCopyFrom] = useState('')

  // Remember the board for the tab bar's "Event board" link.
  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_EVENT_KEY, eventId)
    } catch {
      /* ignore */
    }
  }, [eventId])

  // Deep link: /staffing/<event>?block=<blockId>&role=<role> opens the panel on that slot.
  const wantBlock = params.get('block')
  const wantRole = params.get('role')
  useEffect(() => {
    if (wantBlock && wantRole) setPanel({ blockId: wantBlock, role: wantRole, replaceId: null })
  }, [wantBlock, wantRole])

  if (!event) return <EmptyState title="No such event" />

  const coverage = coverageForEvent(eventId)
  const eventPositions = openPositions.filter((p) => p.eventId === eventId)
  const drafts = assignmentList.filter((a) => a.status === 'draft' && event.blocks.some((b) => b.id === a.blockId))
  const published = publishedEventIds.includes(eventId)
  const emptyBlocks = event.blocks.filter(
    (b) => !assignmentList.some((a) => a.blockId === b.id && a.status !== 'declined')
  )
  const panelBlock = panel ? event.blocks.find((b) => b.id === panel.blockId) : null

  const closePanel = () => {
    setPanel(null)
    // Drop the deep-link params so a refresh does not reopen the panel.
    if (wantBlock || wantRole) router.replace(`/staffing/${eventId}`)
  }

  return (
    <div>
      <Breadcrumbs
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Staff Planner', href: '/staffing' }, { label: event.name }]}
      />
      <PageHeader
        title={event.name}
        lead={`${event.couple} · ${event.date} · ${event.spaces}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {coverage.complete ? (
              <StatusBadge tone="done">Fully staffed</StatusBadge>
            ) : (
              <StatusBadge tone="warn">Needs {coverage.short} more</StatusBadge>
            )}
            {drafts.length > 0 ? (
              <StatusBadge tone="pending">{drafts.length} not sent</StatusBadge>
            ) : (
              <StatusBadge tone="info">{published ? 'Published' : 'Draft'}</StatusBadge>
            )}
            <Button variant="primary" size="md" onClick={() => setPublishing(true)}>
              <Icon name="send" size={14} />
              Publish and notify
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Select
          label="Event"
          id="board-event"
          options={events.map((e) => e.name)}
          value={event.name}
          onChange={(e) => {
            const next = events.find((x) => x.name === e.target.value)
            if (next) router.push(`/staffing/${next.id}`)
          }}
        />
        {emptyBlocks.length > 0 && (
          <div className="flex flex-wrap items-end gap-2">
            <Select
              label="Copy staffing from"
              id="board-copy"
              options={['Choose an event', ...events.filter((e) => e.id !== eventId).map((e) => e.name)]}
              value={copyFrom || 'Choose an event'}
              onChange={(e) => setCopyFrom(e.target.value === 'Choose an event' ? '' : e.target.value)}
            />
            <Button
              variant="secondary"
              size="md"
              disabled={!copyFrom}
              onClick={() => {
                const from = events.find((e) => e.name === copyFrom)
                const n = from ? copyStaffing(from.id, eventId) : 0
                toast(n ? `Copied ${n} assignments from ${copyFrom}. Saved as not sent.` : 'Nothing matching to copy.')
                setCopyFrom('')
              }}
            >
              Copy
            </Button>
          </div>
        )}
      </div>

      {eventPositions.length === 0 && (
        <div className="mb-5">
          <Alert tone="done" title="Every timeline block has the people it needs">
            Publish when you are ready so the team can accept.
          </Alert>
        </div>
      )}

      <div className="space-y-4">
        {event.blocks.map((block) => {
          const here = assignmentList.filter((a) => a.blockId === block.id)
          return (
            <Card
              key={block.id}
              title={block.name}
              subtitle={`${hourLabel(block.start)} – ${hourLabel(block.end)}${
                block.kind === 'setup' ? ' · Load-in / setup (operations)' : block.kind === 'teardown' ? ' · Teardown (operations)' : ''
              }`}
            >
              {block.note && <p className="mb-3 text-xs text-muted">{block.note}</p>}
              <div className="space-y-4">
                {block.requirements.map((req) => {
                  const people = here.filter((a) => a.role === req.role)
                  const occupying = people.filter((a) => a.status !== 'declined')
                  const declined = people.filter((a) => a.status === 'declined')
                  const openSlots = Math.max(0, req.count - occupying.length)
                  const accepted = people.filter((a) => a.status === 'accepted').length
                  const short = req.count - accepted
                  const sel = people.find((a) => a.id === selected)
                  return (
                    <div key={req.role}>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-bold text-ink">{req.role}</span>
                        <span className="text-xs text-muted">
                          {accepted} of {req.count} accepted
                        </span>
                        {short > 0 ? (
                          <StatusBadge tone="warn" size="sm">
                            Needs {short} more
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="done" size="sm">
                            Fully staffed
                          </StatusBadge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[...occupying, ...declined].map((a) => {
                          const person = staffById(a.staffId)
                          const c = CHIP[a.status] || CHIP.draft
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setSelected(selected === a.id ? null : a.id)}
                              aria-expanded={selected === a.id}
                              title={
                                a.status === 'declined' && a.declineReason
                                  ? `Declined: ${a.declineReason}`
                                  : a.overridden
                                    ? `Assigned despite: ${a.warning}`
                                    : undefined
                              }
                              className={cx(
                                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors hover:shadow-card',
                                c.cls,
                                selected === a.id && 'ring-4 ring-accent-soft'
                              )}
                            >
                              <Icon name={c.icon} size={12} />
                              <span className={cx('font-semibold', a.status === 'declined' && 'line-through')}>
                                {person?.name}
                              </span>
                              <span className="text-[11px] font-bold">{c.label}</span>
                              {a.overridden && <Icon name="alert" size={12} className="text-warn" />}
                            </button>
                          )
                        })}

                        {Array.from({ length: openSlots }).map((_, i) => (
                          <button
                            key={`open-${i}`}
                            type="button"
                            onClick={() => setPanel({ blockId: block.id, role: req.role, replaceId: null })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent-line px-3.5 py-1.5 text-[13px] font-semibold text-accent transition-colors hover:bg-accent-soft"
                          >
                            <Icon name="plus" size={12} />
                            Open: {req.role}
                          </button>
                        ))}
                      </div>

                      {sel && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-2xl bg-wash px-4 py-3">
                          <span className="mr-1 text-[13px] font-semibold text-ink">{staffById(sel.staffId)?.name}</span>
                          {sel.status === 'declined' && sel.declineReason && (
                            <span className="text-xs text-urgent">Reason: {sel.declineReason}</span>
                          )}
                          {sel.overridden && <span className="text-xs text-warn">Assigned despite: {sel.warning}</span>}
                          <span className="ml-auto flex flex-wrap gap-2">
                            {sel.status !== 'accepted' && sel.status !== 'declined' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setAssignmentStatus(sel.id, 'accepted')
                                  toast(`${staffById(sel.staffId)?.name} accepted ${block.name}.`)
                                  setSelected(null)
                                }}
                              >
                                Mark accepted
                              </Button>
                            )}
                            {sel.status !== 'declined' && (
                              <Button size="sm" variant="danger" onClick={() => setDeclining(sel)}>
                                Mark declined
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPanel({ blockId: block.id, role: req.role, replaceId: sel.id })}
                            >
                              Replace
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                removeAssignment(sel.id)
                                toast(`${staffById(sel.staffId)?.name} removed from ${block.name}.`)
                                setSelected(null)
                              }}
                            >
                              Remove
                            </Button>
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-muted">
        Only <strong>accepted</strong> people count toward a block. Not sent and pending assignments stay open until the
        person says yes.
      </p>

      <AssignPanel
        open={!!panel && !!panelBlock}
        onClose={closePanel}
        event={event}
        block={panelBlock}
        role={panel?.role}
        replaceId={panel?.replaceId}
      />
      <DeclineDialog
        open={!!declining}
        personName={declining ? staffById(declining.staffId)?.name : ''}
        slotLabel={declining ? `${declining.role}` : ''}
        onClose={() => setDeclining(null)}
        onConfirm={(reason) => {
          setAssignmentStatus(declining.id, 'declined', reason)
          toast(`${staffById(declining.staffId)?.name} declined. The position is open again.`, 'urgent')
          setDeclining(null)
          setSelected(null)
        }}
      />
      <PublishDialog open={publishing} onClose={() => setPublishing(false)} eventIds={[eventId]} />
    </div>
  )
}

export default function EventBoardPage({ params }) {
  const { eventId } = use(params)
  return (
    <Suspense fallback={null}>
      <Board eventId={eventId} />
    </Suspense>
  )
}
