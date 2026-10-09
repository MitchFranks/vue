'use client'

// ---------------------------------------------------------------------------
// Staff Planner · Week.
//
// The entry point. It answers "which events need people?" for one week: each
// event with its staffing badge, whether changes are unsent, a coverage strip
// per timeline block, and its open positions as links straight into the
// Event board. Replaces the old Weekly schedule and Open positions screens.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { events } from '@/lib/mock/events'
import { useStore, hourLabel } from '@/lib/store'
import { THIS_WEEK, weekStart } from '@/lib/weeks'
import { Button, Card, EmptyState, Icon, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { PublishDialog } from '@/components/PublishDialog'
import { WeekPicker } from '@/components/WeekPicker'
import { cx } from '@/lib/cx'

export default function WeekPage() {
  const { openPositions, coverageForEvent, assignmentList, publishedEventIds } = useStore()
  const [weekKey, setWeekKey] = useState(THIS_WEEK)
  const [onlyNeeds, setOnlyNeeds] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const inWeek = events.filter((e) => weekStart(e.dateKey) === weekKey)
  const shown = onlyNeeds ? inWeek.filter((e) => !coverageForEvent(e.id).complete) : inWeek

  const draftsFor = (event) =>
    assignmentList.filter((a) => a.status === 'draft' && event.blocks.some((b) => b.id === a.blockId)).length
  const withDrafts = inWeek.filter((e) => draftsFor(e) > 0)

  return (
    <div>
      <PageHeader
        title="Staff Planner"
        lead="Get the right people into the right roles at the right times. Pick an event to plan it, or see who is free on the Team availability tab."
        actions={
          <Button variant="primary" size="md" disabled={withDrafts.length === 0} onClick={() => setPublishing(true)}>
            <Icon name="send" size={14} />
            Publish all drafts{withDrafts.length ? ` (${withDrafts.length})` : ''}
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <WeekPicker weekKey={weekKey} onChange={setWeekKey} />
        <button
          type="button"
          onClick={() => setOnlyNeeds((v) => !v)}
          aria-pressed={onlyNeeds}
          className={cx(
            'rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors',
            onlyNeeds
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line bg-surface text-ink-2 hover:bg-accent-soft hover:text-accent'
          )}
        >
          Needs people
        </button>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={inWeek.length === 0 ? 'No events this week' : 'Everyone is staffed'}
          body={
            inWeek.length === 0
              ? 'Use the arrows to find the next week with an event.'
              : 'Every event this week has the people it needs.'
          }
        />
      ) : (
        <div className="space-y-4">
          {shown.map((event) => {
            const coverage = coverageForEvent(event.id)
            const drafts = draftsFor(event)
            const positions = openPositions.filter((p) => p.eventId === event.id)
            return (
              <Card
                key={event.id}
                title={event.name}
                subtitle={`${event.couple} · ${event.date}`}
                icon="calendar"
                action={
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {coverage.complete ? (
                      <StatusBadge tone="done" size="sm">
                        Fully staffed
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="warn" size="sm">
                        Needs {coverage.short} more
                      </StatusBadge>
                    )}
                    {drafts > 0 ? (
                      <StatusBadge tone="pending" size="sm">
                        {drafts} not sent
                      </StatusBadge>
                    ) : publishedEventIds.includes(event.id) ? (
                      <StatusBadge tone="info" size="sm">
                        Published
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="info" size="sm">
                        Draft
                      </StatusBadge>
                    )}
                  </div>
                }
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  {event.blocks.map((block) => {
                    const assigned = assignmentList.filter((a) => a.blockId === block.id)
                    const need = block.requirements.reduce((n, r) => n + r.count, 0)
                    const have = block.requirements.reduce(
                      (n, r) =>
                        n +
                        Math.min(
                          r.count,
                          assigned.filter((a) => a.role === r.role && a.status === 'accepted').length
                        ),
                      0
                    )
                    return (
                      <span
                        key={block.id}
                        className={cx(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold',
                          have >= need ? 'bg-done-soft text-done' : 'bg-warn-soft text-warn'
                        )}
                        title={`${hourLabel(block.start)} – ${hourLabel(block.end)}`}
                      >
                        <Icon name={have >= need ? 'check' : 'clock'} size={11} />
                        {block.name} {have}/{need}
                      </span>
                    )
                  })}
                </div>

                {positions.length > 0 && (
                  <ul className="mb-3 space-y-1.5">
                    {positions.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/staffing/${event.id}?block=${p.block.id}&role=${encodeURIComponent(p.role)}`}
                          className="inline-flex items-center gap-2 rounded-full border border-dashed border-accent-line px-3 py-1 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft"
                        >
                          <Icon name="plus" size={12} />
                          {p.block.name}: {p.role}, needs {p.short} more
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Button href={`/staffing/${event.id}`} variant="secondary" size="sm">
                  Open board
                  <Icon name="arrowRight" size={13} />
                </Button>
              </Card>
            )
          })}
        </div>
      )}

      <PublishDialog open={publishing} onClose={() => setPublishing(false)} eventIds={withDrafts.map((e) => e.id)} />
    </div>
  )
}
