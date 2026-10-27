'use client'

// ---------------------------------------------------------------------------
// TaskEditor — add a task, or edit one, in a side sheet. Pass `task={null}`
// to add.
//
// Required: Task name, Due date, Event. Optional: Due time, Type,
// Description, who it is for, Vendor tags.
//
// COUPLE and VENDORS are searchable pickers (components/ui/SearchPicker.jsx),
// so they work the same with 2 couples or 200 vendors. The couple picker
// offers couples; "Tag individual contact instead of couple" (WhoPicker)
// switches it to contacts. A couple and one of its own partners cannot both
// be picked, because the couple already covers both (see whoOptions in
// lib/tasks.js), so a task never tags "the Johnsons" and "Emily" at once.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { events } from '@/lib/mock/events'
import { splitWho, vendorOptions, whoKey, whoOptions } from '@/lib/tasks'
import { Modal } from '@/components/ui/domain'
import { SearchPicker } from '@/components/ui/SearchPicker'
import { WhoPicker } from './WhoPicker'
import { Button, Select, TextInput, Textarea } from '@/components/ui/primitives'

// A new task starts empty, so the required fields are the user's to fill.
const BLANK = { title: '', dueDate: '', type: 'Other' }

function draftFrom(task) {
  return {
    eventId: task.eventId || '',
    title: task.title,
    dueDate: task.dueDate,
    dueTime: task.dueTime || '',
    type: task.type || 'Other',
    detail: task.detail || '',
    who: [
      ...(task.coupleIds || []).map((id) => whoKey('couple', id)),
      ...(task.contactIds || []).map((id) => whoKey('contact', id))
    ],
    vendorIds: task.vendorIds || []
  }
}

/** Render with `key={task.id}` (or a fixed key when adding) so each task starts a fresh draft. */
export function TaskEditor({ task, onClose, onSave }) {
  const adding = !task
  const { taskTypes } = useStore()
  const [draft, setDraft] = useState(() => draftFrom(task || BLANK))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function save(e) {
    e.preventDefault()
    const next = {}
    if (!draft.title.trim()) next.title = 'Give the task a name.'
    if (!draft.dueDate) next.dueDate = 'Choose the date it is due.'
    if (!draft.eventId) next.eventId = 'Choose the event this task is for.'
    setErrors(next)
    if (Object.keys(next).length) return

    onSave({
      eventId: draft.eventId,
      title: draft.title.trim(),
      dueDate: draft.dueDate,
      dueTime: draft.dueTime || null,
      type: draft.type,
      detail: draft.detail.trim(),
      ...splitWho(draft.who),
      vendorIds: draft.vendorIds
    })
  }

  const whoChoices = useMemo(() => whoOptions(draft.who), [draft.who])

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      title={adding ? 'New task' : 'Edit task'}
      subtitle={adding ? undefined : task.title}
      labelledBy="task-editor-title"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="task-editor-form" variant="primary">
            Save
          </Button>
        </>
      }
    >
      <form id="task-editor-form" onSubmit={save} noValidate className="space-y-4">
        <TextInput
          label="Task name"
          id="task-title"
          value={draft.title}
          onChange={set('title')}
          error={errors.title}
          data-autofocus
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Due date"
            id="task-due-date"
            type="date"
            value={draft.dueDate}
            onChange={set('dueDate')}
            error={errors.dueDate}
          />
          <TextInput
            label="Due time (optional)"
            id="task-due-time"
            type="time"
            value={draft.dueTime}
            onChange={set('dueTime')}
            hint="Leave empty for any time that day."
          />
        </div>

        <div>
          <Select
            label="Task type"
            id="task-type"
            options={taskTypes.includes(draft.type) ? taskTypes : [...taskTypes, draft.type]}
            value={draft.type}
            onChange={set('type')}
          />
          <p className="mt-1 text-label text-ink-muted">
            Need another type?{' '}
            <Link href="/tasks/types" className="underline underline-offset-2 hover:text-ink">
              Manage task types
            </Link>
          </p>
        </div>

        <Select
          label="Event"
          id="task-event"
          error={errors.eventId}
          options={[
            { value: '', label: 'Choose an event' },
            ...events.map((e) => ({ value: e.id, label: `${e.name} · ${e.dateShort}` }))
          ]}
          value={draft.eventId}
          onChange={set('eventId')}
        />

        <Textarea
          label="Description (optional)"
          id="task-detail"
          rows={3}
          value={draft.detail}
          onChange={set('detail')}
        />

        <WhoPicker
          label="People Tag (optional)"
          id="task-who"
          options={whoChoices}
          value={draft.who}
          onChange={(who) => setDraft((d) => ({ ...d, who }))}
        />

        <SearchPicker
          label="Vendor tags (optional)"
          id="task-vendors"
          options={vendorOptions}
          value={draft.vendorIds}
          onChange={(vendorIds) => setDraft((d) => ({ ...d, vendorIds }))}
          placeholder="Search vendors"
          noun="vendors"
        />
      </form>
    </Modal>
  )
}
