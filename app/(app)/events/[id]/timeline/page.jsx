'use client'

// SCREEN 6 — Run of show.
//
// One list for the whole day. A row that "Needs staff" is also a block in the
// Staffing Planner. Rows can be dragged into a new order, added below any row
// with +, deleted with − (after a small confirmation), and selected with the
// checkbox on the left for a bulk move or delete. Edits save as you make them.

import { use, useEffect, useRef, useState } from 'react'
import { events } from '@/lib/mock/events'
import { clockLabel, fromInputValue, parseClock, toInputValue, useTimelineEdits } from '@/lib/timelineEdits'
import { Button, Card, EmptyState, Icon, StatusBadge } from '@/components/ui/primitives'

const INPUT =
  'w-full rounded-2xl border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft'
const ICON_BTN =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-accent-line hover:bg-accent-soft hover:text-accent'

/** A small pop-up that sits under its button. Esc or a click elsewhere closes it. */
function Popover({ onClose, children, align = 'right' }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && onClose()
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])
  return (
    <div
      ref={ref}
      role="dialog"
      className={`absolute top-full z-30 mt-1.5 w-60 rounded-2xl border border-line bg-surface p-3 shadow-pop ${align === 'right' ? 'right-0' : 'left-0'}`}
    >
      {children}
    </div>
  )
}

function ConfirmDelete({ text, onCancel, onConfirm, align }) {
  return (
    <Popover onClose={onCancel} align={align}>
      <p className="text-[13px] font-semibold text-ink">{text}</p>
      <div className="mt-2.5 flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" variant="danger" onClick={onConfirm} autoFocus>
          Delete
        </Button>
      </div>
    </Popover>
  )
}

function Row({ row, guide, selected, focus, dropMark, onSelect, onChange, onAddBelow, onAskDelete, confirming, onCancelDelete, onConfirmDelete, drag }) {
  return (
    <li
      onDragOver={drag.over}
      onDrop={drag.drop}
      className={[
        'relative border-b border-line-soft px-3 py-3 last:border-b-0',
        row.needsStaff ? 'bg-accent-soft/30' : '',
        row.tone === 'urgent' ? 'bg-urgent-soft' : '',
        dropMark === 'before' ? 'shadow-[inset_0_3px_0_0_var(--color-accent)]' : '',
        dropMark === 'after' ? 'shadow-[inset_0_-3px_0_0_var(--color-accent)]' : ''
      ].join(' ')}
    >
      <div className="grid items-end gap-2 sm:grid-cols-[auto_120px_120px_1.2fr_1.2fr_auto_auto_auto]">
        <div className="flex items-center gap-2 self-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            aria-label={`Select ${row.title || 'row'}`}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span
            draggable
            onDragStart={drag.start}
            onDragEnd={drag.end}
            title="Drag to move this row"
            aria-label="Drag to move this row"
            className="grid h-9 w-6 cursor-grab place-items-center text-faint hover:text-accent active:cursor-grabbing"
          >
            <Icon name="grip" size={18} />
          </span>
        </div>

        <div>
          <label htmlFor={`time-${row.id}`} className="mb-1 block text-xs font-semibold text-ink-2">
            {row.needsStaff ? 'Starts' : 'Time'}
          </label>
          <input
            id={`time-${row.id}`}
            type="time"
            key={`${row.id}-${row.time}`}
            defaultValue={toInputValue(row.time)}
            onBlur={(e) => {
              const label = fromInputValue(e.target.value)
              if (label && label !== row.time) onChange({ time: label })
            }}
            className={INPUT}
          />
        </div>

        <div>
          {row.needsStaff && (
            <>
              <label htmlFor={`end-${row.id}`} className="mb-1 block text-xs font-semibold text-ink-2">
                Ends
              </label>
              <input
                id={`end-${row.id}`}
                type="time"
                key={`${row.id}-end-${row.end}`}
                defaultValue={toInputValue(row.end)}
                onBlur={(e) => {
                  const label = fromInputValue(e.target.value)
                  if (label && label !== row.end) onChange({ end: label })
                }}
                className={INPUT}
              />
            </>
          )}
        </div>

        <div>
          <label htmlFor={`title-${row.id}`} className="mb-1 block text-xs font-semibold text-ink-2">
            What happens
          </label>
          <input
            id={`title-${row.id}`}
            autoFocus={focus}
            key={`${row.id}-title-${row.title}`}
            defaultValue={row.title}
            placeholder="Describe this moment"
            onBlur={(e) => e.target.value !== row.title && onChange({ title: e.target.value.trim() })}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor={`note-${row.id}`} className="mb-1 block text-xs font-semibold text-ink-2">
            Note
          </label>
          <input
            id={`note-${row.id}`}
            key={`${row.id}-note-${row.note}`}
            defaultValue={row.note}
            placeholder="Optional"
            onBlur={(e) => e.target.value !== (row.note || '') && onChange({ note: e.target.value.trim() })}
            className={INPUT}
          />
        </div>

        <label
          data-guide={guide ? 'needs-staff' : undefined}
          className="flex items-center gap-2 self-center whitespace-nowrap rounded-full pb-0.5 text-[13px] font-medium text-ink-2 sm:pt-5"
        >
          <input
            type="checkbox"
            checked={row.needsStaff}
            onChange={(e) => {
              const needsStaff = e.target.checked
              const start = parseClock(row.time)
              onChange({ needsStaff, ...(needsStaff && !row.end && start != null ? { end: clockLabel(start + 60) } : {}) })
            }}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Needs staff
        </label>

        <button type="button" onClick={onAddBelow} className={ICON_BTN} title="Add a row below" aria-label="Add a row below">
          <Icon name="plus" size={15} />
        </button>

        <div className="relative">
          <button type="button" onClick={onAskDelete} className={ICON_BTN} title="Delete this row" aria-label={`Delete ${row.title || 'this row'}`}>
            <Icon name="minus" size={15} />
          </button>
          {confirming && (
            <ConfirmDelete
              text={`Delete ${row.title ? `“${row.title}”` : 'this row'}?${row.needsStaff ? ' It also leaves the Staffing Planner.' : ''}`}
              onCancel={onCancelDelete}
              onConfirm={onConfirmDelete}
            />
          )}
        </div>
      </div>
      {row.tone === 'urgent' && (
        <div className="mt-2 pl-12">
          <StatusBadge tone="urgent" size="sm">
            Change requested
          </StatusBadge>
        </div>
      )}
    </li>
  )
}

export default function TimelinePage({ params }) {
  const { id } = use(params)
  const { version, rowsFor, setRows, resetEvent } = useTimelineEdits()
  const event = events.find((e) => e.id === id)
  const rows = rowsFor(id)
  // The events guide points at the first row that is not staffed yet.
  const guideRowId = (rows.find((r) => !r.needsStaff) || rows[0])?.id

  const [selected, setSelected] = useState([])
  const [confirmId, setConfirmId] = useState(null) // a row id, or 'bulk'
  const [moving, setMoving] = useState(false)
  const [shift, setShift] = useState({ minutes: 30, dir: 1 })
  const [focusId, setFocusId] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [over, setOver] = useState(null) // { id, after }

  const update = (next) => setRows(id, next)
  const change = (rowId, patch) => update(rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))

  const newRow = (time) => ({ id: `${id}-r-${Date.now().toString(36)}`, time, end: null, title: '', note: '', needsStaff: false })

  const addBelow = (rowId) => {
    const at = rows.findIndex((r) => r.id === rowId)
    const base = rows[at]
    const row = newRow((base?.needsStaff && base.end) || base?.time || '12:00 PM')
    setFocusId(row.id)
    update([...rows.slice(0, at + 1), row, ...rows.slice(at + 1)])
  }
  const addFirst = () => {
    const row = newRow('9:00 AM')
    setFocusId(row.id)
    update([...rows, row])
  }

  const remove = (ids) => {
    update(rows.filter((r) => !ids.includes(r.id)))
    setSelected((s) => s.filter((x) => !ids.includes(x)))
    setConfirmId(null)
  }

  // Bulk move: shift the time (and end time) of every selected row.
  const applyShift = () => {
    const delta = shift.minutes * shift.dir
    update(
      rows.map((r) => {
        if (!selected.includes(r.id)) return r
        const t = parseClock(r.time)
        const e = parseClock(r.end)
        return { ...r, time: t == null ? r.time : clockLabel(t + delta), end: e == null ? r.end : clockLabel(e + delta) }
      })
    )
    setMoving(false)
  }

  const toggle = (rowId) => setSelected((s) => (s.includes(rowId) ? s.filter((x) => x !== rowId) : [...s, rowId]))
  const allOn = rows.length > 0 && selected.length === rows.length

  // ---- drag to reorder: the row lands wherever the mouse lets go ----
  const dragFor = (rowId) => ({
    start: (e) => {
      setDragId(rowId)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', rowId)
      const li = e.currentTarget.closest('li')
      if (li) e.dataTransfer.setDragImage(li, 20, 20)
    },
    end: () => {
      setDragId(null)
      setOver(null)
    },
    over: (e) => {
      if (!dragId) return
      e.preventDefault()
      const box = e.currentTarget.getBoundingClientRect()
      const after = e.clientY > box.top + box.height / 2
      setOver((o) => (o && o.id === rowId && o.after === after ? o : { id: rowId, after }))
    },
    drop: (e) => {
      if (!dragId) return
      e.preventDefault()
      const target = over && over.id === rowId ? over : { id: rowId, after: false }
      const moved = rows.find((r) => r.id === dragId)
      if (moved && dragId !== rowId) {
        const rest = rows.filter((r) => r.id !== dragId)
        const at = rest.findIndex((r) => r.id === rowId)
        rest.splice(target.after ? at + 1 : at, 0, moved)
        update(rest)
      }
      setDragId(null)
      setOver(null)
    }
  })

  if (!event) return <EmptyState title="No such event" />

  return (
    <div className="space-y-3" data-version={version}>
      <Card
        title="Run of show"
        icon="clock"
        subtitle={`${rows.length} rows · ${rows.filter((r) => r.needsStaff).length} need staff and appear in the Staffing Planner`}
        action={
          <Button size="sm" variant="ghost" onClick={() => resetEvent(id)}>
            Reset to sample
          </Button>
        }
        bodyClassName="px-0 py-0"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-line-soft bg-wash/50 px-4 py-2.5">
          <label className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
            <input
              type="checkbox"
              checked={allOn}
              onChange={() => setSelected(allOn ? [] : rows.map((r) => r.id))}
              className="h-4 w-4 accent-[var(--color-accent)]"
              aria-label="Select all rows"
            />
            {selected.length ? `${selected.length} selected` : 'Select all'}
          </label>
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Button size="sm" variant="secondary" onClick={() => setMoving((v) => !v)}>
                  Move
                </Button>
                {moving && (
                  <Popover onClose={() => setMoving(false)} align="left">
                    <p className="text-[13px] font-semibold text-ink">Move {selected.length} selected by</p>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={shift.dir}
                        onChange={(e) => setShift((s) => ({ ...s, dir: Number(e.target.value) }))}
                        className={INPUT}
                        aria-label="Earlier or later"
                      >
                        <option value={-1}>Earlier</option>
                        <option value={1}>Later</option>
                      </select>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={shift.minutes}
                        onChange={(e) => setShift((s) => ({ ...s, minutes: Math.max(5, Number(e.target.value) || 5) }))}
                        className={INPUT}
                        aria-label="Minutes"
                      />
                      <span className="text-[13px] text-muted">min</span>
                    </div>
                    <div className="mt-2.5 flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setMoving(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="primary" onClick={applyShift}>
                        Move
                      </Button>
                    </div>
                  </Popover>
                )}
              </div>
              <div className="relative">
                <Button size="sm" variant="secondary" onClick={() => setConfirmId('bulk')}>
                  Delete
                </Button>
                {confirmId === 'bulk' && (
                  <ConfirmDelete
                    text={`Delete ${selected.length} selected row${selected.length === 1 ? '' : 's'}?`}
                    align="left"
                    onCancel={() => setConfirmId(null)}
                    onConfirm={() => remove(selected)}
                  />
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nothing in the run of show yet"
              body="Add the moments of the day. Tick Needs staff on the ones you will staff."
              action={
                <Button variant="primary" onClick={addFirst}>
                  <Icon name="plus" size={14} />
                  Add a row
                </Button>
              }
            />
          </div>
        ) : (
          <ol>
            {rows.map((row) => (
              <Row
                key={row.id}
                row={row}
                guide={row.id === guideRowId}
                selected={selected.includes(row.id)}
                focus={focusId === row.id}
                dropMark={over && over.id === row.id && dragId && dragId !== row.id ? (over.after ? 'after' : 'before') : null}
                onSelect={() => toggle(row.id)}
                onChange={(patch) => change(row.id, patch)}
                onAddBelow={() => addBelow(row.id)}
                onAskDelete={() => setConfirmId(row.id)}
                confirming={confirmId === row.id}
                onCancelDelete={() => setConfirmId(null)}
                onConfirmDelete={() => remove([row.id])}
                drag={dragFor(row.id)}
              />
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}
