'use client'

// ---------------------------------------------------------------------------
// Your day: the couple's view of their run of show, and where they ask for
// changes (?view=day). This is where the venue captures the couple's
// expectations: every request says, in their words, what they expect.
//
// Each item has "Ask for a change": a different time, take it out, or
// something else. "Add something to your day" asks for a new item. A request
// goes to the venue's Detail sheet and Tasks; the venue accepts (it goes on
// the run of show and to the staff) or declines with a reply, and the answer
// shows here under the item. A request still waiting can be taken back.
// Rules: lib/eventSheet.js.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useEventSheet } from '@/lib/eventSheetStore'
import { REQUEST_STATUS, requestLine } from '@/lib/eventSheet'
import { useTimelineEdits } from '@/lib/timelineEdits'
import { fromInputValue, toInputValue } from '@/lib/format'
import { useUndoable } from '@/lib/undo'
import { Button, ChoiceCards, Icon, StatusBadge, Textarea, TextInput } from '@/components/ui'

const KINDS = [
  { value: 'move', label: 'A different time', blurb: 'Move it earlier or later.', icon: 'clock' },
  { value: 'remove', label: 'Take it out', blurb: 'You would rather not have it.', icon: 'x' },
  { value: 'other', label: 'Something else', blurb: 'Tell us in your own words.', icon: 'list' }
]

const EXPECT_HINT = 'What should it look like on the day? The more you tell us, the better we get it right.'

/** The card on the portal home that opens Your day: see the plan, ask for a change. */
export function RunOfShowCard({ event, venue, onOpen }) {
  const { requestsFor } = useEventSheet()
  if (!event) return null
  const requests = requestsFor(event.id)
  const waiting = requests.filter((r) => r.status === 'waiting').length
  const answered = requests.filter((r) => r.status !== 'waiting').length
  return (
    <div className="surface-card flex flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
        <Icon name="clock" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">Your day’s schedule</p>
        <p className="text-small text-ink-muted">
          {waiting
            ? `${waiting} ${waiting === 1 ? 'request' : 'requests'} waiting for ${venue.name}. Their answer shows up there.`
            : answered
              ? `${venue.name} answered your ${answered === 1 ? 'request' : 'requests'}. See the plan, or ask for another change.`
              : `See the plan for your day. Need a different time for something? Ask here and ${venue.name} answers.`}
        </p>
      </div>
      <Button variant="secondary" onClick={onOpen}>
        See your day and ask for a change
        <Icon name="arrowRight" size={14} />
      </Button>
    </div>
  )
}

function RequestStatus({ r, onWithdraw }) {
  const status = REQUEST_STATUS[r.status]
  return (
    <div className="mt-2 space-y-1 rounded-sm bg-surface-sunken px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={status.tone} size="sm">
          {status.label}
        </StatusBadge>
        <span className="text-small text-ink">{requestLine(r)}</span>
      </div>
      {r.note && <p className="text-small text-ink-muted">You said: “{r.note}”</p>}
      {r.reply && <p className="text-small text-ink">Their reply: {r.reply}</p>}
      {r.status === 'waiting' && (
        <button type="button" onClick={() => onWithdraw(r)} className="text-small text-ink-muted underline underline-offset-2 hover:text-ink">
          Take back this request
        </button>
      )}
    </div>
  )
}

/** Ask to change one item (`row`), or to add one (no row). */
function RequestForm({ row, onCancel, onSend }) {
  const [kind, setKind] = useState(row ? 'move' : 'add')
  const [time, setTime] = useState(row ? toInputValue(row.time) : '')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const id = row ? row.id : 'new'

  function submit(e) {
    e.preventDefault()
    const next = {}
    if ((kind === 'move' || kind === 'add') && !fromInputValue(time)) next.time = 'Choose a time.'
    if (kind === 'move' && fromInputValue(time) === row.time) next.time = 'Pick a time different from now.'
    if (kind === 'add' && !title.trim()) next.title = 'Say what you would like to add.'
    if (!note.trim()) next.note = 'Tell us what you expect, so we get it right.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSend({
      kind,
      rowId: row?.id || null,
      rowTitle: row?.title || '',
      fromTime: row?.time || '',
      toTime: kind === 'move' || kind === 'add' ? fromInputValue(time) : '',
      title: title.trim(),
      note: note.trim()
    })
  }

  return (
    <form onSubmit={submit} noValidate className="mt-3 space-y-4 rounded-md border border-line-strong bg-surface p-4">
      {row ? (
        <ChoiceCards name={`kind-${id}`} legend={`What would you like to change about ${row.title}?`} options={KINDS} value={kind} onChange={setKind} />
      ) : (
        <TextInput id={`title-${id}`} label="What would you like to add?" placeholder="For example, a last dance or a toast" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} data-autofocus />
      )}
      {(kind === 'move' || kind === 'add') && (
        <TextInput id={`time-${id}`} label={kind === 'move' ? 'New time' : 'At what time?'} type="time" value={time} onChange={(e) => setTime(e.target.value)} error={errors.time} className="max-w-48" />
      )}
      <Textarea id={`note-${id}`} label="What do you expect?" hint={EXPECT_HINT} rows={3} value={note} onChange={(e) => setNote(e.target.value)} error={errors.note} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary">
          Send request
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export function RunOfShowScreen({ event, by, venue, frame, back }) {
  const { requestsFor, submitRequest, withdrawRequest } = useEventSheet()
  const { rowsFor } = useTimelineEdits()
  const undoable = useUndoable()
  const [asking, setAsking] = useState(null) // a row id, 'add', or null

  // The moments of the day; staffing blocks (setup, service shifts) are the venue's.
  const rows = rowsFor(event.id).filter((r) => !r.needsStaff)
  const requests = requestsFor(event.id)
  const forRow = (rowId) => requests.filter((r) => r.rowId === rowId)
  // Additions, and requests about an item no longer on the day (taken out since).
  const added = requests.filter((r) => !r.rowId || !rows.some((x) => x.id === r.rowId))

  const send = (fields) => {
    undoable(() => submitRequest(event.id, { ...fields, by }), `Sent to ${venue.name}. They see it right away, and their answer will show up here.`, {
      undone: 'Undone. Your request wasn’t sent.'
    })
    setAsking(null)
  }
  const withdraw = (r) => {
    undoable(() => withdrawRequest(r.id), 'Request taken back.', { undone: 'Undone. Your request is with the venue again.' })
  }

  return frame({
    above: (
      <div className="mb-6">
        <button type="button" onClick={back} className="inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-ink-muted transition-colors hover:text-ink">
          <Icon name="arrowLeft" size={14} />
          Your checklist
        </button>
      </div>
    ),
    title: 'Your day',
    lead: `${event.date}. Ask for any change and tell us what you expect. ${venue.name} will answer here.`,
    children: (
      <>
        <ol className="surface-card divide-y divide-line overflow-hidden">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <span className="w-20 shrink-0 font-mono text-small tabular-nums text-ink">{r.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{r.title}</p>
                  {r.note && <p className="mt-0.5 text-small text-ink-muted">{r.note}</p>}
                </div>
                {asking !== r.id && (
                  <Button variant="secondary" size="sm" onClick={() => setAsking(r.id)}>
                    <Icon name="pencil" size={13} />
                    Ask for a change
                    <span className="sr-only"> to {r.title}</span>
                  </Button>
                )}
              </div>
              {forRow(r.id).map((q) => (
                <RequestStatus key={q.id} r={q} onWithdraw={withdraw} />
              ))}
              {asking === r.id && <RequestForm row={r} onCancel={() => setAsking(null)} onSend={send} />}
            </li>
          ))}
        </ol>

        <div className="surface-card px-4 py-4 sm:px-6">
          <p className="font-medium text-ink">Something missing?</p>
          <p className="text-small text-ink-muted">A toast, a special dance, a moment you want us to plan for.</p>
          {added.map((q) => (
            <RequestStatus key={q.id} r={q} onWithdraw={withdraw} />
          ))}
          {asking === 'add' ? (
            <RequestForm row={null} onCancel={() => setAsking(null)} onSend={send} />
          ) : (
            <Button className="mt-3" onClick={() => setAsking('add')}>
              <Icon name="plus" size={14} />
              Add something to your day
            </Button>
          )}
        </div>
      </>
    )
  })
}
