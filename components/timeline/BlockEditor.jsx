'use client'

// ---------------------------------------------------------------------------
// The editor for one run-of-show block.
//
// The library Modal, so it behaves like every other dialog: focus moves in,
// Escape closes, focus returns to the block. Nothing is fixed silently: a
// blank title or an end before the start is shown as an error on the field.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { clockLabel, fromInputValue, parseClock, toInputValue } from '@/lib/format'
import { endMinutes } from '@/lib/timeline/layout'
import { CHECKBOX } from '@/components/records'
import { Button, Icon, Modal, Textarea, TextInput } from '@/components/ui'

/** Field errors for a block, keyed by field. Empty when it can be saved. */
export function blockErrors(form) {
  const s = parseClock(form.time)
  const e = endMinutes(form.end)
  const errors = {}
  if (!form.title.trim()) errors.title = 'Give the block a title.'
  if (s == null) errors.time = 'Enter a start time.'
  if (e == null) errors.end = 'Enter an end time.'
  else if (s != null && e <= s) errors.end = `Ends before it starts. Pick a time after ${clockLabel(s)}.`
  return errors
}

/**
 * value   { id, time, end, title, note, needsStaff }  times as "4:00 PM"
 * isNew   a new block has no Delete
 */
export function BlockEditor({ value, isNew = false, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(value)
  const [errors, setErrors] = useState({})
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    const next = blockErrors(form)
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({ ...form, time: clockLabel(parseClock(form.time)), end: clockLabel(endMinutes(form.end)), title: form.title.trim() })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New block' : 'Edit block'}
      labelledBy="block-editor-title"
      footer={
        <>
          {!isNew && (
            <Button variant="danger" onClick={onDelete} className="mr-auto">
              <Icon name="trash" size={15} />
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="space-y-3"
      >
        <TextInput
          label="Title"
          id="blk-title"
          data-autofocus
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="e.g. First dance"
          error={errors.title}
        />

        <div className="grid grid-cols-2 gap-2">
          <TextInput
            label="Starts"
            id="blk-start"
            type="time"
            value={toInputValue(form.time)}
            onChange={(e) => set({ time: fromInputValue(e.target.value) || '' })}
            error={errors.time}
          />
          <TextInput
            label="Ends"
            id="blk-end"
            type="time"
            value={toInputValue(form.end)}
            onChange={(e) => set({ end: fromInputValue(e.target.value) || '' })}
            error={errors.end}
          />
        </div>

        <label className="flex items-start gap-2.5 rounded-sm border border-line px-3 py-2.5">
          <input type="checkbox" checked={form.needsStaff} onChange={(e) => set({ needsStaff: e.target.checked })} className={CHECKBOX} />
          <span>
            <span className="block text-small font-medium text-ink">Needs staff</span>
            <span className="block text-small text-ink-muted">Shows up in the Staffing Planner so you can fill it.</span>
          </span>
        </label>

        <Textarea label="Note" id="blk-note" rows={2} value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="Optional" />

        {/* Enter in a field saves, like the Save button. */}
        <button type="submit" className="sr-only" tabIndex={-1}>
          Save
        </button>
      </form>
    </Modal>
  )
}
