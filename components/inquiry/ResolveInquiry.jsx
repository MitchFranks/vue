'use client'

// The manager's one main action on an inquiry, as a dialog. What it asks
// depends on the kind:
//
//   walkthrough / call  a date and time (prefilled from what the client asked
//                       for). Saving also adds a dated task to Tasks.
//   quote               an optional amount and note
//   services            an optional note
//
// Saving resolves the inquiry, so its task moves to Completed. The toast's
// Undo reopens it and removes any task the booking added.

import { useState } from 'react'
import { BOOKS_A_TIME, bookedTask, dateLabel, moneyInput, outcomeLabel, suggestedTime } from '@/lib/inquiries'
import { TODAY_KEY } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { Button, Modal, Textarea, TextInput } from '@/components/ui'

/** The button label for the main action on each kind. */
export function resolveLabel(inq) {
  switch (inq.kind) {
    case 'walkthrough':
      return 'Book walkthrough'
    case 'call':
      return inq.format === 'video' ? 'Book video tour' : 'Book call'
    case 'quote':
      return 'Mark quote sent'
    default:
      return 'Mark answered'
  }
}

/** Render with `key={inquiry.id}` so each opening starts from the client's request. */
export function ResolveInquiry({ inquiry, onClose }) {
  const { editableTaskTypes, resolveInquiry, reopenInquiry, toast } = useStore()
  const books = BOOKS_A_TIME.includes(inquiry.kind)
  const [draft, setDraft] = useState({
    date: inquiry.preferredDate || '',
    time: suggestedTime(inquiry.timeOfDay),
    amount: '',
    note: ''
  })
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function save(e) {
    e.preventDefault()
    const next = {}
    if (books && !draft.date) next.date = 'Choose the day.'
    else if (books && draft.date < TODAY_KEY) next.date = 'Choose today or a later date.'
    if (books && !draft.time) next.time = 'Choose a time.'
    const amount = moneyInput(draft.amount)
    if (draft.amount.trim() && !amount) next.amount = 'Enter an amount like 12,500, or leave it blank.'
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) {
      document.getElementById(`resolve-${first}`)?.focus()
      return
    }

    const outcome = { label: outcomeLabel(inquiry, { ...draft, amount }), amount, note: draft.note.trim() }
    const task = books ? bookedTask(inquiry, draft, editableTaskTypes) : null
    resolveInquiry(inquiry.id, outcome, task)
    toast(task ? `${outcome.label.replace(/\.$/, '')}. Added "${task.title}" to Tasks.` : outcome.label, 'done', {
      actions: [{ label: 'Undo', onClick: () => reopenInquiry(inquiry.id) }]
    })
    onClose()
  }

  const asked = inquiry.preferredDate
    ? `They asked for ${dateLabel(inquiry.preferredDate)} · ${inquiry.timeOfDay}${inquiry.backupDate ? `, or ${dateLabel(inquiry.backupDate)}` : ''}.`
    : undefined

  return (
    <Modal
      open
      onClose={onClose}
      title={resolveLabel(inquiry)}
      subtitle={asked}
      labelledBy="resolve-inquiry-title"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="resolve-inquiry-form" variant="primary">
            {books ? 'Book and add to Tasks' : 'Save'}
          </Button>
        </>
      }
    >
      <form id="resolve-inquiry-form" onSubmit={save} noValidate className="space-y-4">
        {books && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Date" id="resolve-date" type="date" min={TODAY_KEY} value={draft.date} onChange={set('date')} error={errors.date} data-autofocus />
            <TextInput label="Time" id="resolve-time" type="time" value={draft.time} onChange={set('time')} error={errors.time} />
          </div>
        )}
        {inquiry.kind === 'quote' && (
          <TextInput
            label="Amount quoted (optional)"
            id="resolve-amount"
            inputMode="decimal"
            placeholder="12,500"
            value={draft.amount}
            onChange={set('amount')}
            error={errors.amount}
            data-autofocus
          />
        )}
        <Textarea
          label="Note (optional)"
          id="resolve-note"
          rows={3}
          value={draft.note}
          onChange={set('note')}
          hint={books ? 'Saved on the inquiry. The new task says who is coming and how to reach them.' : 'Saved on the inquiry.'}
          {...(inquiry.kind === 'services' && { 'data-autofocus': true })}
        />
      </form>
    </Modal>
  )
}
