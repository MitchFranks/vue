'use client'

// ---------------------------------------------------------------------------
// TaskCard — one task on the Tasks page. Every task is a task, whether it is
// a message to answer, an open spot to fill, a document to sign or a task
// someone wrote, so they all share this card.
//
// User test v4: the main button names what it does ("Reply", "Answer
// request", from lib/taskAction.js) instead of "Action"; "Assigned to" is a
// labelled dropdown that looks like one; Edit is a real button.
//
// Reads in the same order everywhere: how soon -> what kind of task, which
// event and its date -> the name -> description -> who it is for -> what to do. Couples,
// single contacts and vendors show as tags so a sort by any of them is easy to
// follow down the list.
//
// Every open task can be edited and reassigned here, whether the venue wrote
// it or the product raised it. Only a written task is marked done or reopened
// here (Mark done under the main button, no checkbox). The others are finished
// where they live (reply, fill the spot, sign, record the payment). Completed
// tasks of every source show here too, under the Status filter.
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
import { actionLabel } from '@/lib/taskAction'

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

/**
 * Who has the task. Any open task can be handed to someone from here: a
 * labelled dropdown that looks like one (user test v4: the old borderless
 * picker read as plain text, so nobody found how to hand a to-do on).
 */
function Assignee({ task, assignee, choices, onAssign, doneBy }) {
  if (doneBy) return <p className="text-small text-ink-muted">{doneBy}</p>
  const canAssign = !task.done && onAssign
  return (
    <div className="flex flex-wrap items-center gap-2 text-small">
      <span className="text-ink-muted">Assigned to</span>
      {canAssign ? (
        <label className="relative inline-flex min-w-0 items-center">
          <span className="sr-only">Assigned to (choose someone to hand it to)</span>
          <span className="pointer-events-none absolute left-1.5">
            {assignee ? <Avatar initials={assignee.initials} size="sm" /> : <Icon name="user" size={14} className="ml-1 text-ink-muted" />}
          </span>
          <select
            value={task.assigneeId || ''}
            onChange={(e) => onAssign(task, e.target.value || null)}
            className="h-8 min-w-0 max-w-64 cursor-pointer appearance-none truncate rounded-sm border border-line-strong bg-surface py-0 pr-8 pl-9 text-small font-medium text-ink hover:bg-surface-sunken focus:border-accent"
          >
            <option value="">Unassigned</option>
            {choices.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={14} className="pointer-events-none absolute right-2.5 text-ink-muted" />
        </label>
      ) : (
        <span className={cx('inline-flex items-center gap-2', assignee ? 'text-ink' : 'text-ink-muted')}>
          {assignee && <Avatar initials={assignee.initials} size="sm" />}
          {assignee ? assignee.name : 'Unassigned'}
        </span>
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

          {/* One column of same-width buttons: what to do, then Mark done, then Edit. */}
          <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:w-44 sm:flex-col">
            <Button href={task.href} variant={first ? 'primary' : 'secondary'} size="sm" className="sm:w-full">
              {actionLabel(task)}
              <span className="sr-only">: {task.title}</span>
              <Icon name="arrowRight" size={14} />
            </Button>
            {canTick && (
              <Button variant="secondary" size="sm" className="sm:w-full" onClick={() => onToggle(task)}>
                <Icon name={task.done ? 'refresh' : 'check'} size={14} />
                {task.done ? 'Reopen' : 'Mark done'}
                <span className="sr-only">: {task.title}</span>
              </Button>
            )}
            {!task.done && onEdit && (
              <Button variant="ghost" size="sm" className="sm:w-full" onClick={() => onEdit(task)}>
                <Icon name="pencil" size={14} />
                Edit details
                <span className="sr-only">: {task.title}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
