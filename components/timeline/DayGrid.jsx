'use client'

// ---------------------------------------------------------------------------
// The run-of-show day grid: the hour labels, the hour and half-hour lines,
// the blocks, and the pointer handling.
//
// Modelled on Google Calendar's day view:
//   • click an empty slot to start a new block, or drag across the grid to
//     make one of exactly the length you want            -> onNew(s, e)
//   • click a block to open its editor                    -> onEdit(row)
//   • drag a block to move it; drag its top or bottom edge to resize it
//                                                         -> onMoved(id, s, e, kind)
//   • overlapping blocks sit side by side
//
// `preview` ({ id | 'draft', s, e }) is owned by the page because the draft
// stays on the grid while the editor for it is open.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react'
import { clockLabel } from '@/lib/format'
import { DEFAULT_LEN, MIN_LEN, PX, SNAP, clamp, landing, packLanes, rangeLabel, span, topFor } from '@/lib/timeline/layout'
import { TimelineBlock } from './TimelineBlock'

export function DayGrid({ rows, win, preview, setPreview, activeId, draftTitle, onStartDrag, onNew, onEdit, onDelete, onMoved }) {
  const { lo, hi, height, hours } = win
  const gridRef = useRef(null)
  const dragRef = useRef(null)
  // The pointer-up handler runs after a drag; it needs the rows as they are then.
  const rowsRef = useRef(rows)
  useEffect(() => {
    rowsRef.current = rows
  }, [rows])

  const minuteAt = (clientY) => lo + ((clientY - gridRef.current.getBoundingClientRect().top) / PX) * 60

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    const rowId = e.target.closest('[data-row]')?.getAttribute('data-row')
    const edge = e.target.closest('[data-edge]')?.getAttribute('data-edge') || null
    const row = rowId && rowId !== 'draft' ? rows.find((r) => r.id === rowId) : null
    const startY = e.clientY
    const m0 = minuteAt(startY)

    if (row) {
      const { s, e: end } = span(row)
      dragRef.current = { kind: edge ? `resize-${edge}` : 'move', id: row.id, startY, m0, s0: s, e0: end, moved: false }
    } else {
      const anchor = clamp(Math.floor(m0 / SNAP) * SNAP, lo, hi - MIN_LEN)
      dragRef.current = { kind: 'create', startY, anchor, moved: false }
    }
    onStartDrag()
    setPreview(null)
    e.preventDefault()

    const onMove = (ev) => {
      const d = dragRef.current
      if (!d) return
      if (Math.abs(ev.clientY - d.startY) > 4) d.moved = true
      if (!d.moved) return
      const { s, e: end } = landing(d, minuteAt(ev.clientY), lo, hi)
      setPreview({ id: d.kind === 'create' ? 'draft' : d.id, s, e: end })
    }

    const onUp = (ev) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const d = dragRef.current
      dragRef.current = null
      if (!d) return

      if (!d.moved) {
        // A plain click.
        if (d.kind === 'create') {
          const s = clamp(Math.floor(d.anchor / 30) * 30, lo, hi - DEFAULT_LEN)
          setPreview({ id: 'draft', s, e: s + DEFAULT_LEN })
          onNew(s, s + DEFAULT_LEN)
        } else {
          const r = rowsRef.current.find((x) => x.id === d.id)
          if (r) onEdit(r)
        }
        return
      }

      const { s, e: end } = landing(d, minuteAt(ev.clientY), lo, hi)
      if (d.kind === 'create') {
        setPreview({ id: 'draft', s, e: end })
        onNew(s, end)
      } else {
        setPreview(null)
        onMoved(d.id, s, end, d.kind)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const shown = rows.map((r) => {
    const base = span(r)
    const p = preview && preview.id === r.id ? preview : null
    return { row: r, s: p ? p.s : base.s, e: p ? p.e : base.e }
  })
  const draft = preview && preview.id === 'draft' ? preview : null
  const positions = packLanes(shown.map((x) => ({ id: x.row.id, s: x.s, e: x.e })))

  return (
    <div className="flex px-3 py-2 sm:px-4">
      <div className="relative w-14 shrink-0" style={{ height }} aria-hidden="true">
        {hours.slice(0, -1).map((h) => (
          <span key={h} className="absolute right-2 -translate-y-1/2 whitespace-nowrap text-label text-ink-muted" style={{ top: topFor(h * 60, lo) }}>
            {clockLabel(h * 60)}
          </span>
        ))}
      </div>

      <div
        ref={gridRef}
        onPointerDown={onPointerDown}
        className="relative flex-1 cursor-cell touch-none border-l border-line"
        style={{ height }}
        role="group"
        aria-label="Run of show day view. Click or drag on empty space to add a block."
      >
        {hours.map((h) => (
          <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line" style={{ top: topFor(h * 60, lo) }} />
        ))}
        {hours.slice(0, -1).map((h) => (
          <div key={`half-${h}`} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/60" style={{ top: topFor(h * 60 + 30, lo) }} />
        ))}

        {shown.map(({ row, s, e }) => (
          <TimelineBlock
            key={row.id}
            row={row}
            s={s}
            e={e}
            lo={lo}
            pos={positions[row.id]}
            active={activeId === row.id || preview?.id === row.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {draft && (
          <div
            data-row="draft"
            className="pointer-events-none absolute inset-x-1 z-20 overflow-hidden rounded-sm border-2 border-dashed border-accent bg-surface-sunken px-2 py-1 text-label font-medium text-accent"
            style={{ top: topFor(draft.s, lo) + 1, height: Math.max(((draft.e - draft.s) / 60) * PX, 20) - 2 }}
          >
            {(draftTitle || '(No title)') + ' · ' + rangeLabel(draft.s, draft.e)}
          </div>
        )}
      </div>
    </div>
  )
}
