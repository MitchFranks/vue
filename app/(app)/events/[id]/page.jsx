'use client'

// SCREEN 5 — Event Overview.
//
// The same queue as the Tasks page, scoped to this one event: what to do
// first, and what is coming up, for this wedding only. "Hide" works the same
// in both groups and can be undone; staffing items can't be hidden.

import { use, useState } from 'react'
import { useStore } from '@/lib/store'
import { Button, EmptyState, FilterChip, FilterGroup, Icon } from '@/components/ui/primitives'
import { TaskRow, openSpots, useHideWithUndo } from '@/components/ui/domain'

const SOURCES = [
  { id: 'all', label: 'Everything' },
  { id: 'staffing', label: 'Staffing' },
  { id: 'message', label: 'Messages' },
  { id: 'manual', label: 'Added tasks' },
  { id: 'document', label: 'Documents' },
  { id: 'payment', label: 'Payments' }
]

export default function EventOverviewPage({ params }) {
  const { id } = use(params)
  const store = useStore()
  const { tasksForEvent, hiddenTasks, coverageForEvent, unhideTask, toast } = store
  const hide = useHideWithUndo(store)
  const [source, setSource] = useState('all')

  const all = tasksForEvent(id)
  const coverage = coverageForEvent(id)
  const hidden = hiddenTasks.filter((a) => a.eventId === id).map((a) => a.id)
  const filtered = all.filter((a) => source === 'all' || a.source === source)
  const urgent = filtered.filter((a) => a.tone === 'urgent')
  const rest = filtered.filter((a) => a.tone !== 'urgent')

  const showHidden = () => {
    hidden.forEach(unhideTask)
    toast(`Showing ${hidden.length} hidden ${hidden.length === 1 ? 'item' : 'items'} again.`)
  }

  const hiddenNote = hidden.length > 0 && (
    <p className="mt-4 flex flex-wrap items-center gap-2 text-small text-ink-muted">
      {hidden.length} hidden
      <Button variant="ghost" size="sm" onClick={showHidden}>
        Show hidden
      </Button>
    </p>
  )

  if (all.length === 0) {
    return (
      <div>
        {coverage.complete ? (
          <EmptyState
            title={hidden.length ? 'Nothing else needs you' : 'All caught up'}
            body={
              hidden.length
                ? `${hidden.length} hidden ${hidden.length === 1 ? 'item is' : 'items are'} still open.`
                : 'Nothing needs you on this event right now. New items appear here as soon as something changes.'
            }
            action={
              hidden.length > 0 && (
                <Button variant="secondary" size="sm" onClick={showHidden}>
                  Show hidden
                </Button>
              )
            }
          />
        ) : (
          // Never "caught up" while the header still shows open spots.
          <EmptyState
            icon="alert"
            title={`Staffing still has ${openSpots(coverage.short)}`}
            body="Replies and unsent texts are tracked in the Staffing Planner."
            action={
              <Button href={`/staffing/${id}`} variant="primary" size="sm">
                Open the Staffing Planner
                <Icon name="arrowRight" size={14} />
              </Button>
            }
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <FilterGroup label="Show">
          {SOURCES.map((k) => {
            const n = k.id === 'all' ? all.length : all.filter((a) => a.source === k.id).length
            if (k.id !== 'all' && n === 0) return null
            return (
              <FilterChip key={k.id} pressed={source === k.id} count={n} onClick={() => setSource(k.id)}>
                {k.label}
              </FilterChip>
            )
          })}
        </FilterGroup>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing in this view"
          body="Switch back to Everything to see the rest."
          action={
            <Button variant="secondary" size="sm" onClick={() => setSource('all')}>
              Show everything
            </Button>
          }
        />
      ) : (
        <>
          {urgent.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-2 flex items-center gap-2 text-body font-medium text-ink">
                <Icon name="alert" size={15} className="text-status-now" />
                Do first ({urgent.length})
              </h2>
              <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
                {urgent.map((item, i) => (
                  <TaskRow key={item.id} task={item} first={i === 0} onHide={hide} />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-body font-medium text-ink">
                <Icon name="clock" size={15} className="text-status-soon" />
                Coming up ({rest.length})
              </h2>
              <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
                {rest.map((item, i) => (
                  <TaskRow key={item.id} task={item} first={urgent.length === 0 && i === 0} onHide={hide} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {hiddenNote}
    </div>
  )
}
