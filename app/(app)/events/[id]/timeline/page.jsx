'use client'

// SCREEN 6 — Run of show, as a day calendar.
//
// Modelled on the things people do all day in Google Calendar:
//   • click an empty slot to start a new block, or drag across the grid to
//     make one of exactly the length you want
//   • click a block to open its editor (title, start, end, note, Needs staff)
//   • drag a block to move it; drag its top or bottom edge to resize it
//   • delete from the editor, or focus a block and press Delete; every change
//     drops a toast with an Undo
//   • overlapping blocks sit side by side
// KEYBOARD: "Add block" opens the editor, and every block is focusable: Enter
// edits it, Delete removes it (with Undo).
// A block with Needs staff ticked is also a block in the Staffing Planner.
// Everything snaps to 15 minutes and saves as you go.

import { use, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { newId } from '@/lib/id'
import { events } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { clockLabel } from '@/lib/format'
import { useTimelineEdits } from '@/lib/timelineEdits'
import { DEFAULT_LEN, DEFAULT_VIEW, clamp, sortRows, span, visibleWindow } from '@/lib/timeline/layout'
import { Button, Card, EmptyState, Icon, useConfirm } from '@/components/ui'
import { BlockEditor } from '@/components/timeline/BlockEditor'
import { DayGrid } from '@/components/timeline/DayGrid'
import { RangeButton } from '@/components/timeline/RangeButton'
import { useDayView } from '@/components/timeline/useDayView'

// The grid, its blocks and the pointer handling are in components/timeline/;
// the day-view maths is in lib/timeline/layout.js. This page owns the state:
// which block is being edited, the drag preview, and saving with Undo.

export default function RunOfShowPage({ params }) {
  const { id } = use(params)
  const { version, rowsFor, setRows, resetEvent } = useTimelineEdits()
  const { toast } = useStore()
  const { confirm, dialog } = useConfirm()
  const event = events.find((e) => e.id === id)
  const rows = rowsFor(id)

  const [view, setView] = useDayView()
  const win = visibleWindow(view, rows)
  const { lo, hi } = win

  const [preview, setPreview] = useState(null) // { id|'draft', s, e } while dragging
  const [editor, setEditor] = useState(null) // { id|null, values }
  // Undo puts back the rows as they were when the change was made, and a
  // drag (whose handlers outlive the render that started it) moves the
  // latest rows.
  const rowsRef = useRef(rows)
  useEffect(() => {
    rowsRef.current = rows
  }, [rows])

  /** Save the rows; with a message, say so in a toast that can undo it. */
  const commit = useCallback(
    (next, message) => {
      const before = rowsRef.current
      setRows(id, sortRows(next))
      if (message) toast(message, 'done', { actions: [{ label: 'Undo', onClick: () => setRows(id, before) }] })
    },
    [id, setRows, toast]
  )

  const openNew = (s, e) =>
    setEditor({ id: null, values: { id: newId(`${id}-r`), time: clockLabel(s), end: clockLabel(e), title: '', note: '', needsStaff: false } })

  const openEdit = (r) => setEditor({ id: r.id, values: { ...r, end: r.end || clockLabel(span(r).e), note: r.note || '' } })

  /** Keyboard and button route to a new block: the first free hour after the last one. */
  const addBlock = () => {
    const last = rows.reduce((m, r) => Math.max(m, span(r).e), lo + 8 * 60)
    const s = clamp(Math.ceil(last / 30) * 30, lo, hi - DEFAULT_LEN)
    setPreview({ id: 'draft', s, e: s + DEFAULT_LEN })
    openNew(s, s + DEFAULT_LEN)
  }

  const saveEditor = (values) => {
    const exists = rows.some((r) => r.id === values.id)
    commit(
      exists ? rows.map((r) => (r.id === values.id ? { ...r, ...values } : r)) : [...rows, values],
      exists ? `Saved “${values.title}”.` : `Added “${values.title}” at ${values.time}.`
    )
    setEditor(null)
    setPreview(null)
  }

  const deleteRow = (rowId) => {
    const row = rows.find((r) => r.id === rowId)
    commit(
      rows.filter((r) => r.id !== rowId),
      `Deleted “${row?.title || 'block'}”.`
    )
    setEditor(null)
  }

  const moveRow = (rowId, s, e, kind) =>
    commit(
      rowsRef.current.map((r) => (r.id === rowId ? { ...r, time: clockLabel(s), end: clockLabel(e) } : r)),
      kind === 'move' ? 'Block moved.' : 'Block resized.'
    )

  const askReset = () =>
    confirm({
      title: 'Reset the run of show?',
      body: 'Every change to this event’s run of show goes back to the sample data, including blocks you added or deleted. This can’t be undone.',
      confirmLabel: 'Reset to sample',
      danger: true,
      onConfirm: () => {
        resetEvent(id)
        toast('The run of show is back to the sample data.')
      }
    })

  const closeEditor = useCallback(() => {
    setEditor(null)
    setPreview((p) => (p && p.id === 'draft' ? null : p))
  }, [])

  if (!event) return <EmptyState title="No such event" />

  const staffed = rows.filter((r) => r.needsStaff).length

  return (
    <div className="space-y-3" data-version={version}>
      <Card
        title="Run of show"
        icon="clock"
        subtitle={
          <>
            {rows.length} blocks · {staffed} need staff and appear in the{' '}
            <Link href={`/staffing/${id}`} className="text-ink underline underline-offset-4 hover:text-accent">
              Staffing Planner
            </Link>
            . Click or drag on the grid to add a block; drag a block to move it.
          </>
        }
        action={
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={askReset}>
              Reset to sample
            </Button>
            <Button size="sm" variant="primary" data-guide="run-create" onClick={addBlock}>
              <Icon name="plus" size={13} />
              Add block
            </Button>
          </div>
        }
        bodyClassName="px-0 py-0"
      >
        <div className="px-3 pt-3 sm:px-4">
          <div className="ml-14 pl-3">
            <RangeButton
              label="Display earlier"
              prompt="Show the day from"
              icon="up"
              initial={Math.max(0, lo - 120)}
              options={Array.from({ length: lo / 60 }, (_, i) => ({ value: i * 60, label: clockLabel(i * 60) }))}
              onApply={(start) => setView({ ...view, start })}
              onReset={() => setView(DEFAULT_VIEW)}
              disabled={lo <= 0}
              disabledNote="Already showing from midnight"
            />
          </div>
        </div>

        <DayGrid
          rows={rows}
          win={win}
          preview={preview}
          setPreview={setPreview}
          activeId={editor?.id}
          draftTitle={editor?.values.title}
          onStartDrag={() => setEditor(null)}
          onNew={openNew}
          onEdit={openEdit}
          onDelete={deleteRow}
          onMoved={moveRow}
        />

        <div className="px-3 pb-3 sm:px-4">
          <div className="ml-14 pl-3">
            <RangeButton
              label="Display later"
              prompt="Show the day until"
              icon="down"
              up
              initial={Math.min(1440, hi + 120)}
              options={Array.from({ length: (1440 - hi) / 60 }, (_, i) => ({
                value: hi + (i + 1) * 60,
                label: hi + (i + 1) * 60 === 1440 ? '12:00 AM (midnight)' : clockLabel(hi + (i + 1) * 60)
              }))}
              onApply={(end) => setView({ ...view, end })}
              onReset={() => setView(DEFAULT_VIEW)}
              disabled={hi >= 1440}
              disabledNote="Already showing until midnight"
            />
          </div>
        </div>
      </Card>

      {editor && (
        <BlockEditor
          key={editor.values.id}
          value={editor.values}
          isNew={!editor.id}
          onSave={saveEditor}
          onDelete={() => deleteRow(editor.id)}
          onClose={closeEditor}
        />
      )}

      {dialog}
    </div>
  )
}
