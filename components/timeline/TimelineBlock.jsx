'use client'

// One block on the run-of-show grid. Absolutely placed by DayGrid; shows more
// detail as it gets taller. Focusable: Enter edits it, Delete removes it.
// The data-row / data-edge attributes are what DayGrid's pointer handling
// reads to tell a move from a resize.

import { cx } from '@/lib/cx'
import { clockRange } from '@/lib/format'
import { PX, topFor } from '@/lib/timeline/layout'
import { Icon } from '@/components/ui'

const TONES = {
  urgent: 'border-status-now-soft bg-status-now-soft text-status-now',
  staff: 'border-accent bg-surface text-accent',
  plain: 'border-line bg-surface-sunken text-ink'
}

/**
 * row   { id, title, note, needsStaff, tone }
 * s, e  where it is drawn (minutes), which may be a drag preview
 * lo    the first minute the grid shows
 * pos   { lane, lanes } from packLanes
 */
export function TimelineBlock({ row, s, e, lo, pos = { lane: 0, lanes: 1 }, active = false, onEdit, onDelete }) {
  const h = Math.max(((e - s) / 60) * PX, 20)
  const tone = row.tone === 'urgent' ? 'urgent' : row.needsStaff ? 'staff' : 'plain'
  const title = row.title || '(No title)'
  return (
    <div
      data-row={row.id}
      role="button"
      tabIndex={0}
      aria-label={`${title}, ${clockRange(s, e)}${row.needsStaff ? ', needs staff' : ''}. Enter to edit, Delete to remove.`}
      onKeyDown={(ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault()
          onEdit(row.id)
        } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
          ev.preventDefault()
          onDelete(row.id)
        }
      }}
      title={`${title}, ${clockRange(s, e)}`}
      className={cx(
        'absolute cursor-grab select-none overflow-hidden rounded-md border px-2 py-1 text-left text-label leading-tight transition-shadow active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
        TONES[tone],
        active ? 'z-20 ring-2 ring-accent' : 'z-10 hover:shadow-raised'
      )}
      style={{
        top: topFor(s, lo) + 1,
        height: h - 2,
        left: `calc(${(pos.lane / pos.lanes) * 100}% + 2px)`,
        width: `calc(${100 / pos.lanes}% - 5px)`
      }}
    >
      <span data-edge="top" className="absolute inset-x-0 top-0 h-2 cursor-ns-resize" />
      <span className="block truncate font-medium">{title}</span>
      {h >= 38 && <span className="block truncate opacity-85">{clockRange(s, e)}</span>}
      {h >= 56 && row.needsStaff && (
        <span className="mt-0.5 flex items-center gap-1 text-label font-medium opacity-90">
          <Icon name="users" size={11} /> Needs staff
        </span>
      )}
      {h >= 74 && row.note && <span className="mt-0.5 block truncate text-label opacity-80">{row.note}</span>}
      <span data-edge="bottom" className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize" />
    </div>
  )
}
