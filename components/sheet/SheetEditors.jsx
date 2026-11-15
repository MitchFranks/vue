'use client'

// ---------------------------------------------------------------------------
// Editing the sheet in place. Every save is logged as a change and, unless
// the manager says otherwise, sent to the staff working the event.
//
//   SendOptions    "Send this change to the 5 staff working it" (on by
//                  default; off for a typo fix) and an optional reason the
//                  staff see with the change.
//   SectionEditor  one section's fields.
//   RunEditor      the run of show's order, times and names, for the quick
//                  case ("cake cutting moves up an hour"). Drag an item by
//                  its grip (or use the arrow keys on it) and it takes a time
//                  between its new neighbours; type a time and the list
//                  re-sorts. Adding, removing and staffing items stays on the
//                  Run of show tab.
// ---------------------------------------------------------------------------

import { useRef, useState } from 'react'
import Link from 'next/link'
import { fromInputValue, toInputValue } from '@/lib/format'
import { cx } from '@/lib/cx'
import { Button, Icon, TextInput, Textarea } from '@/components/ui'

export function SendOptions({ teamSize, notify, setNotify, reason, setReason, idPrefix }) {
  return (
    <div className="space-y-3 rounded-sm border border-line bg-surface-sunken/50 p-3">
      {teamSize > 0 ? (
        <label className="flex items-start gap-2 text-small text-ink">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
          />
          <span>
            Send this change to the {teamSize} staff working this event
            <span className="block text-label text-ink-muted">Untick for a typo fix: it is still logged, but nobody is texted.</span>
          </span>
        </label>
      ) : (
        <p className="text-small text-ink-muted">No staff are confirmed yet. The change is logged, and anyone confirmed later reads the sheet as it is.</p>
      )}
      <TextInput
        id={`${idPrefix}-reason`}
        label="Why it changed (optional)"
        hint="Staff see this with the change."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </div>
  )
}

function useSendOptions() {
  const [notify, setNotify] = useState(true)
  const [reason, setReason] = useState('')
  return { notify, setNotify, reason, setReason }
}

function Actions({ onCancel }) {
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="submit" variant="primary">
        Save
      </Button>
    </div>
  )
}

export function SectionEditor({ section, values, teamSize, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(section.fields.map((f) => [f.id, values[f.id] || ''])))
  const send = useSendOptions()
  const set = (id) => (e) => setDraft((d) => ({ ...d, [id]: e.target.value }))

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(draft, { notify: send.notify, reason: send.reason.trim() })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {section.fields.map((f) =>
          f.kind === 'long' ? (
            <Textarea
              key={f.id}
              id={`sheet-${f.id}`}
              label={f.label}
              hint={f.hint}
              rows={3}
              value={draft[f.id]}
              onChange={set(f.id)}
              className="sm:col-span-2"
            />
          ) : (
            <TextInput
              key={f.id}
              id={`sheet-${f.id}`}
              label={f.label}
              hint={f.hint}
              type={f.kind === 'tel' ? 'tel' : 'text'}
              value={draft[f.id]}
              onChange={set(f.id)}
            />
          )
        )}
      </div>
      <SendOptions teamSize={teamSize} idPrefix={`sheet-${section.id}`} {...send} />
      <Actions onCancel={onCancel} />
    </form>
  )
}

/* ---- run of show: drag to reorder, and times follow the order ---- */

const pad = (n) => String(n).padStart(2, '0')
/** "19:30" <-> 1170 minutes after midnight. */
const toMin = (v) => {
  const m = /^(\d{2}):(\d{2})$/.exec(v || '')
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}
const toVal = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`

/**
 * After item `i` moves, give it a time that fits its new place: kept if it
 * already sits between its neighbours, otherwise halfway between them
 * (snapped to 5 minutes), or 15 minutes before the first / after the last.
 */
function fitTime(list, i) {
  if (i < 0) return list
  const t = toMin(list[i].time)
  const prev = i > 0 ? toMin(list[i - 1].time) : null
  const next = i < list.length - 1 ? toMin(list[i + 1].time) : null
  if (t != null && (prev == null || t >= prev) && (next == null || t <= next)) return list
  let fit
  if (prev == null && next == null) return list
  if (prev == null) fit = Math.max(0, next - 15)
  else if (next == null) fit = Math.min(23 * 60 + 55, prev + 15)
  else fit = Math.min(Math.max(Math.round((prev + next) / 2 / 5) * 5, prev), next)
  return list.map((r, j) => (j === i ? { ...r, time: toVal(fit) } : r))
}

/** Move the item at `from` to `to`, then fit its time. */
function moveItem(list, from, to) {
  if (to === from || to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return fitTime(next, to)
}

/** Order by time, keeping the current order for equal times. */
const byTime = (list) =>
  list
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (toMin(a.r.time) ?? 0) - (toMin(b.r.time) ?? 0) || a.i - b.i)
    .map((x) => x.r)

export function RunEditor({ rows, teamSize, timelineHref, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => rows.map((r) => ({ id: r.id, time: toInputValue(r.time), title: r.title })))
  const [error, setError] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [said, setSaid] = useState('') // what a move did, for screen readers
  const listRef = useRef(null)
  const send = useSendOptions()
  const original = Object.fromEntries(rows.map((r) => [r.id, r]))
  const nameOf = (id) => original[id]?.title || 'item'
  const set = (id, part) => (e) => setDraft((d) => d.map((r) => (r.id === id ? { ...r, [part]: e.target.value } : r)))

  /** Fit the moved item's time, and say where it went. */
  const settle = (id, list) => {
    const i = list.findIndex((r) => r.id === id)
    const next = fitTime(list, i)
    const after = next[i - 1]
    setSaid(`${nameOf(id)} moved to ${fromInputValue(next[i].time)}${after ? `, after ${after.title}` : ', first'}.`)
    setDraft(next)
  }

  // Pointer drag on the grip: the item follows the pointer through the list,
  // and on release takes a time that fits where it landed. Works for mouse,
  // pen and touch alike (the grip has touch-action: none).
  const onPointerDown = (id) => (e) => {
    if (e.button !== 0) return
    // No text selection while dragging, but keep the grip focused for the arrow keys.
    e.preventDefault()
    e.currentTarget.focus()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragId(id)
  }
  const onPointerMove = (e) => {
    if (!dragId || !listRef.current) return
    const others = [...listRef.current.children].filter((el) => el.dataset.id !== dragId)
    const to = others.filter((el) => {
      const box = el.getBoundingClientRect()
      return e.clientY > box.top + box.height / 2
    }).length
    const from = draft.findIndex((r) => r.id === dragId)
    if (from === to) return
    const next = [...draft]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setDraft(next)
  }
  const onPointerUp = () => {
    if (!dragId) return
    const id = dragId
    setDragId(null)
    settle(id, draft)
  }

  // Keyboard: arrow keys on the grip move the item one place.
  const onGripKey = (id) => (e) => {
    const step = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
    if (!step) return
    e.preventDefault()
    const from = draft.findIndex((r) => r.id === id)
    if (from + step < 0 || from + step >= draft.length) return
    const next = [...draft]
    const [item] = next.splice(from, 1)
    next.splice(from + step, 0, item)
    settle(id, next)
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const bad = draft.find((r) => !fromInputValue(r.time) || !r.title.trim())
        if (bad) {
          setError('Every item needs a time and a name.')
          return
        }
        setError(null)
        // In list order, so items at the same time keep the order they were dragged into.
        onSave(
          draft.map((r) => ({ id: r.id, time: fromInputValue(r.time), title: r.title.trim() })),
          { notify: send.notify, reason: send.reason.trim() }
        )
      }}
    >
      <p className="text-small text-ink-muted">
        Drag <Icon name="grip" size={14} className="inline" /> to change the order: the item takes a time between its new
        neighbours. Or type a time, and the list re-sorts when you leave the box.
      </p>
      <ol ref={listRef} className="space-y-2" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {draft.map((r) => {
          const moved = r.time !== toInputValue(original[r.id]?.time)
          return (
            <li
              key={r.id}
              data-id={r.id}
              className={cx(
                'grid grid-cols-[2.25rem_9.5rem_1fr] items-center gap-2 rounded-sm',
                dragId === r.id && 'bg-surface-sunken shadow-raised ring-1 ring-accent'
              )}
            >
              <button
                type="button"
                aria-label={`Move ${nameOf(r.id)}. Use the up and down arrow keys.`}
                onPointerDown={onPointerDown(r.id)}
                onKeyDown={onGripKey(r.id)}
                className={cx(
                  'grid h-9 w-9 touch-none place-items-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink',
                  dragId === r.id ? 'cursor-grabbing' : 'cursor-grab'
                )}
              >
                <Icon name="grip" size={16} />
              </button>
              <TextInput
                id={`run-${r.id}-time`}
                aria-label={`Time of ${nameOf(r.id)}`}
                type="time"
                value={r.time}
                onChange={set(r.id, 'time')}
                onBlur={() => setDraft((d) => byTime(d))}
                inputClassName={moved ? 'border-status-soon' : ''}
              />
              <TextInput id={`run-${r.id}-title`} aria-label={`Name of ${nameOf(r.id)}`} value={r.title} onChange={set(r.id, 'title')} />
            </li>
          )
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      {error && <p className="text-small text-status-now">{error}</p>}
      <p className="text-small text-ink-muted">
        Moving a staffed block keeps its length. To add, remove or staff an item, use the{' '}
        <Link href={timelineHref} className="underline underline-offset-2 hover:text-ink">
          Run of show
        </Link>{' '}
        tab: those edits are logged here too.
      </p>
      <SendOptions teamSize={teamSize} idPrefix="run" {...send} />
      <Actions onCancel={onCancel} />
    </form>
  )
}
