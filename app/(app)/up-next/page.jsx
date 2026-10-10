'use client'

// ---------------------------------------------------------------------------
// SCREEN 2 — Up Next Center.
//
// The full queue, filterable by kind and by event. This is the "second route"
// to every problem in the product: anything reachable from the dashboard, an
// event page or the schedule is also reachable from here.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { events } from '@/lib/mock/events'
import { Breadcrumbs, Button, Card, EmptyState, Icon, PageHeader } from '@/components/ui/primitives'
import { UpNextItem } from '@/components/ui/domain'
import { FirstCoupleItem } from '@/components/onboarding/FirstCoupleItem'

const KINDS = [
  { id: 'all', label: 'Everything' },
  { id: 'staffing', label: 'Staffing' },
  { id: 'message', label: 'Messages' },
  { id: 'task', label: 'Tasks' },
  { id: 'document', label: 'Documents' }
]

export default function UpNextPage() {
  const { attention, dismissAttention, toast } = useStore()
  const [kind, setKind] = useState('all')
  const [eventFilter, setEventFilter] = useState('all')

  const filtered = attention.filter(
    (a) => (kind === 'all' || a.kind === kind) && (eventFilter === 'all' || a.eventId === eventFilter)
  )
  const urgent = filtered.filter((a) => a.tone === 'urgent')
  const rest = filtered.filter((a) => a.tone !== 'urgent')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Up Next' }]} />
      <PageHeader
        title="Up next"
        lead="Everything worth doing next, with the most useful first. Nothing here was entered by hand — each item is generated from the current state of your events, assignments, messages and documents."
      />

      {/* A new venue's first item: add a couple (the first-run guide lands here). */}
      <FirstCoupleItem />

      {/* Filters — PROGRESSIVE DISCLOSURE for a long queue. */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => {
            const n = k.id === 'all' ? attention.length : attention.filter((a) => a.kind === k.id).length
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                aria-pressed={kind === k.id}
                className={
                  kind === k.id
                    ? 'rounded-box border border-accent bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent'
                    : 'rounded-box border border-line bg-surface px-2.5 py-1 text-xs text-ink-2 hover:bg-wash-deep'
                }
              >
                {k.label} ({n})
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setEventFilter('all')}
            aria-pressed={eventFilter === 'all'}
            className={
              eventFilter === 'all'
                ? 'rounded-box border border-accent bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent'
                : 'rounded-box border border-line bg-surface px-2.5 py-1 text-xs text-ink-2 hover:bg-wash-deep'
            }
          >
            All events
          </button>
          {events.map((e) => {
            const n = attention.filter((a) => a.eventId === e.id).length
            if (!n) return null
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEventFilter(e.id)}
                aria-pressed={eventFilter === e.id}
                className={
                  eventFilter === e.id
                    ? 'rounded-box border border-accent bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent'
                    : 'rounded-box border border-line bg-surface px-2.5 py-1 text-xs text-ink-2 hover:bg-wash-deep'
                }
              >
                {e.name} ({n})
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing in this view"
          body="Either everything here is resolved, or the filters above are hiding it. Try switching back to Everything."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setKind('all')
                setEventFilter('all')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {urgent.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-accent">
                <Icon name="check" size={15} />
                Do first ({urgent.length})
              </h2>
              <div className="overflow-hidden rounded-box border border-line">
                {urgent.map((item, i) => (
                  <div key={item.id} className="relative">
                    <UpNextItem item={item} first={i === 0} />
                    <button
                      type="button"
                      onClick={() => {
                        dismissAttention(item.id)
                        toast('Moved out of Up Next.')
                      }}
                      className="absolute bottom-2 right-3 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted hover:bg-accent-soft hover:text-accent"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted">
                <Icon name="clock" size={15} />
                Coming up ({rest.length})
              </h2>
              <div className="overflow-hidden rounded-box border border-line">
                {rest.map((item, i) => (
                  <UpNextItem key={item.id} item={item} first={urgent.length === 0 && i === 0} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Card className="mt-5" title="How this list is put together" icon="info">
        <ul className="space-y-1.5 text-xs text-muted">
          <li>• An assignment that is declined or unfilled becomes an open position, and every open position appears here.</li>
          <li>• A couple or vendor message with no reply appears here until you answer it.</li>
          <li>• A task that is due or overdue appears here until it is ticked off.</li>
          <li>• A document awaiting signature appears here until it is signed.</li>
        </ul>
      </Card>
    </div>
  )
}
