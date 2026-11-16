'use client'

// ---------------------------------------------------------------------------
// TaskCard — one task on the Tasks page. Every task is a task, whether it is
// a message to answer, an open spot to fill, a document to sign or a task
// someone wrote, so they all share this card.
//
// Reads in the same order everywhere: how soon -> what kind of task, which
// event and its date -> the name -> description -> who it is for -> what to do. Couples,
// single contacts and vendors show as tags so a sort by any of them is easy to
// follow down the list.
//
// Every open task can be edited and reassigned here, whether the venue wrote
// it or the product raised it. Only a written task is marked done or reopened
// here (Mark Done under Action, no checkbox). The others are finished where they live (reply, fill the spot,
// sign, record the payment). The main button says "Action" for every task,
// since what the action is has not been decided. Completed tasks of
// every source show here too, under "Show completed".
//
// WHO HAS IT. Every card says who is responsible, and any open task can be
// handed to someone straight from the card (or in the editor). Once a written
// task is done, it says who finished it and when (lib/assignees.js).
// ---------------------------------------------------------------------------

import { ClampedText } from '@/components/ui/ClampedText'
import { cx } from '@/lib/cx'
import { eventById } from '@/lib/mock/events'
import { contactName, contactById, coupleById } from '@/lib/mock/records'
import { directoryVendorById as vendorById } from '@/lib/directory/registry'
import { Avatar, Button, Icon, StatusBadge } from '@/components/ui'
import { assigneeOptions, managerId, personById, personFirst } from '@/lib/assignees'
import { stampLabel } from '@/lib/staffing/derive'

function Tag({ icon, children }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-line px-2 text-label text-ink">
      <Icon name={icon} size={12} className="text-ink-muted" />
      {children}
    </span>
  )
}

/** The couples, contacts and vendors a task is tagged with, as { id, icon, label }. */
export function resolveTaskTags(task) {
  return [
    ...(task.coupleIds || []).map(coupleById).filter(Boolean).map((c) => ({ id: c.id, icon: 'heart', label: c.name })),
    ...(task.contactIds || []).map(contactById).filter(Boolean).map((c) => ({ id: c.id, icon: 'user', label: contactName(c) })),
    ...(task.vendorIds || []).map(vendorById).filter(Boolean).map((v) => ({ id: v.id, icon: 'truck', label: v.name }))
  ]
}

/** Looks up the task's event date and tags, then draws TaskCardView. */
export function TaskCard({ task, ...rest }) {
  // The event's own date, so tasks for different weddings are told apart at a glance.
  const person = personById(task.assigneeId)
  const doneBy = task.completedBy && personById(task.completedBy.by)
  return (
    <TaskCardView
      task={task}
      eventDate={eventById(task.eventId)?.dateShort}
      tags={resolveTaskTags(task)}
      assignee={person ? { name: task.assigneeId === managerId() ? `${person.name} (you)` : person.name, initials: person.initials } : null}
      assigneeChoices={assigneeOptions(task.assigneeId ? [task.assigneeId] : [])}
      doneBy={doneBy ? `Done by ${personFirst(task.completedBy.by)} · ${stampLabel(task.completedBy.at)}` : null}
      {...rest}
    />
  )
}

/** Who has the task. Any open task can be handed to someone from here. */
function Assignee({ task, assignee, choices, onAssign, doneBy }) {
  if (doneBy) return <p className="text-small text-ink-muted">{doneBy}</p>
  const canAssign = !task.done && onAssign
  return (
    <div className="flex items-center gap-2 text-small">
      {assignee ? <Avatar initials={assignee.initials} size="sm" /> : <Icon name="user" size={14} className="text-ink-muted" />}
      {canAssign ? (
        <label className="flex min-w-0 items-center gap-1 text-ink-muted">
          <span className="sr-only">Assigned to</span>
          <select
            value={task.assigneeId || ''}
            onChange={(e) => onAssign(task, e.target.value || null)}
            className="min-w-0 max-w-56 cursor-pointer truncate rounded-sm border border-transparent bg-transparent py-0.5 pr-1 text-small text-ink hover:border-line-strong focus:border-accent"
          >
            <option value="">Unassigned</option>
            {choices.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className={assignee ? 'text-ink' : 'text-ink-muted'}>{assignee ? assignee.name : 'Unassigned'}</span>
      )}
    </div>
  )
}

/**
 * The card itself, props only.
 *   tags       [{ id, icon, label }] from resolveTaskTags
 *   eventDate  "Sat, Jun 14"
 *   assignee   { name, initials } of whoever has it, or null
 *   doneBy     "Done by Caleb · Sat 10:05 AM" for a finished written task
 *   onAssign   (task, staffId | null) to hand the task to someone
 */
export function TaskCardView({ task, eventDate, tags = [], assignee = null, assigneeChoices = [], doneBy = null, first = false, onToggle, onEdit, onAssign }) {
  const isTask = task.source === 'manual'
  const canTick = isTask && !task.input

  return (
    <article className="bg-surface px-4 py-4 transition-colors duration-150 hover:bg-surface-sunken/40 sm:px-6">
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge tone={task.dueTone} size="sm">
                {task.due}
              </StatusBadge>
              <span className="text-small text-ink-muted">
                {task.type}
                {task.eventName && ` · ${task.eventName}`}
                {eventDate && ` · ${eventDate}`}
                {task.template && ` · ${task.template.name}`}
              </span>
            </div>

            <h3 className={cx('text-heading font-medium', task.done ? 'text-ink-muted line-through' : 'text-ink')}>
              {task.title}
            </h3>

            {/* The description: a written task's own text, or what the system noticed. */}
            {task.what && <ClampedText className="mt-2">{task.what}</ClampedText>}

            {tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tagged">
                {tags.map((t) => (
                  <li key={t.id}>
                    <Tag icon={t.icon}>{t.label}</Tag>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3">
              <Assignee task={task} assignee={assignee} choices={assigneeChoices} onAssign={onAssign} doneBy={doneBy} />
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            {!task.done && onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
            )}
            {/* The two buttons are one width, Action above Mark Done. */}
            <div className="flex flex-col gap-2">
              <Button href={task.href} variant={first ? 'primary' : 'secondary'} size="sm">
                Action
                <span className="sr-only"> for {task.title}</span>
                <Icon name="arrowRight" size={14} />
              </Button>
              {canTick && (
                <Button variant="secondary" size="sm" onClick={() => onToggle(task)}>
                  {task.done ? 'Reopen' : 'Mark Done'}
                  <span className="sr-only"> {task.title}</span>
                  <Icon name={task.done ? 'refresh' : 'check'} size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
