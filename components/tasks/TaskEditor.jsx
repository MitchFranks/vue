'use client'

// ---------------------------------------------------------------------------
// TaskEditor — edit a task's card data in a side sheet.
//
// Required: Task name, Due date. Optional: Due time, Type, Description, who
// it is for, Vendor tags.
//
// WHO IT IS FOR lists every couple with its two contacts. For each couple the
// choice is one of: not tagged, the whole couple, or one partner. Making it a
// single choice per couple means a task never tags "the Johnsons" and "Emily"
// at once, which would read as two different people.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { cx } from '@/lib/cx'
import { contactById, contactName, couples } from '@/lib/mock/records'
import { TASK_TYPES, vendorOptions } from '@/lib/tasks'
import { Modal } from '@/components/ui/domain'
import { Button, Select, TextInput, Textarea } from '@/components/ui/primitives'

/** For each couple: '' (not tagged), 'couple', or a contact id. */
function whoFromTask(task) {
  const who = {}
  for (const c of couples) {
    if (task.coupleIds?.includes(c.id)) who[c.id] = 'couple'
    else who[c.id] = c.contactIds.find((id) => task.contactIds?.includes(id)) || ''
  }
  return who
}

function draftFrom(task) {
  return {
    title: task.title,
    dueDate: task.dueDate,
    dueTime: task.dueTime || '',
    type: task.type || 'Other',
    detail: task.detail || '',
    who: whoFromTask(task),
    vendorIds: task.vendorIds || []
  }
}

function WhoChoice({ couple, value, onChange }) {
  const partners = couple.contactIds
    .map(contactById)
    .filter(Boolean)
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
  const options = [
    { value: '', label: 'Not tagged' },
    { value: 'couple', label: 'The couple' },
    ...partners.map((p) => ({ value: p.id, label: `${p.firstName} only` }))
  ]
  return (
    <fieldset className="rounded-sm border border-line px-3 py-2">
      <legend className="px-1 text-small font-medium text-ink">{couple.name}</legend>
      <div className="flex flex-wrap gap-1.5" role="radiogroup">
        {options.map((o) => {
          const checked = value === o.value
          return (
            <label
              key={o.value || 'none'}
              className={cx(
                'inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-small transition-colors duration-150',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
                checked ? 'border-accent bg-surface-sunken text-accent' : 'border-line text-ink hover:border-line-strong'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={`who-${couple.id}`}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          )
        })}
      </div>
      {value && value !== 'couple' && (
        <p className="mt-1.5 text-label text-ink-muted">Tags {contactName(contactById(value))} on their own.</p>
      )}
    </fieldset>
  )
}

/** Render with `key={task.id}` so a new task starts a fresh draft. */
export function TaskEditor({ task, onClose, onSave }) {
  const [draft, setDraft] = useState(() => draftFrom(task))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function save(e) {
    e.preventDefault()
    const next = {}
    if (!draft.title.trim()) next.title = 'Give the task a name.'
    if (!draft.dueDate) next.dueDate = 'Choose the date it is due.'
    setErrors(next)
    if (Object.keys(next).length) return

    const picks = Object.entries(draft.who).filter(([, v]) => v)
    onSave({
      title: draft.title.trim(),
      dueDate: draft.dueDate,
      dueTime: draft.dueTime || null,
      type: draft.type,
      detail: draft.detail.trim(),
      coupleIds: picks.filter(([, v]) => v === 'couple').map(([coupleId]) => coupleId),
      contactIds: picks.filter(([, v]) => v !== 'couple').map(([, contactId]) => contactId),
      vendorIds: draft.vendorIds
    })
  }

  const toggleVendor = (id) =>
    setDraft((d) => ({
      ...d,
      vendorIds: d.vendorIds.includes(id) ? d.vendorIds.filter((v) => v !== id) : [...d.vendorIds, id]
    }))

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      title="Edit task"
      subtitle={task.title}
      labelledBy="task-editor-title"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="task-editor-form" variant="primary">
            Save task
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

        <Select label="Task type" id="task-type" options={TASK_TYPES} value={draft.type} onChange={set('type')} />

        <Textarea
          label="Description (optional)"
          id="task-detail"
          rows={3}
          value={draft.detail}
          onChange={set('detail')}
        />

        <div>
          <p className="mb-1 text-small font-medium text-ink">Who it is for (optional)</p>
          <p className="mb-2 text-label text-ink-muted">Tag the whole couple, or one partner on their own.</p>
          <div className="space-y-2">
            {couples.map((c) => (
              <WhoChoice
                key={c.id}
                couple={c}
                value={draft.who[c.id] || ''}
                onChange={(v) => setDraft((d) => ({ ...d, who: { ...d.who, [c.id]: v } }))}
              />
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-small font-medium text-ink">Vendor tags (optional)</legend>
          <div className="space-y-1.5">
            {vendorOptions.map((v) => (
              <label key={v.value} className="flex cursor-pointer items-center gap-2 text-body text-ink">
                <input
                  type="checkbox"
                  checked={draft.vendorIds.includes(v.value)}
                  onChange={() => toggleVendor(v.value)}
                  className="h-4 w-4 accent-[var(--ink)]"
                />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
