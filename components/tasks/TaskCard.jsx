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
// Only a manual task (one the venue wrote) can be marked done, reopened or
// edited here, with the Mark Done button under Action (no checkbox). The others are finished where they live (reply, fill the spot,
// sign, record the payment). The main button says "Action" for every task,
// since what the action is has not been decided. Completed tasks of
// every source show here too, under "Show completed".
// ---------------------------------------------------------------------------

import { ClampedText } from '@/components/ui/ClampedText'
import { cx } from '@/lib/cx'
import { eventById } from '@/lib/mock/events'
import { contactName, contactById, coupleById } from '@/lib/mock/records'
import { directoryVendorById as vendorById } from '@/lib/directory/registry'
import { Button, Icon, StatusBadge } from '@/components/ui/primitives'

function Tag({ icon, children }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-line px-2 text-label text-ink">
      <Icon name={icon} size={12} className="text-ink-muted" />
      {children}
    </span>
  )
}

export function TaskCard({ task, first = false, onToggle, onEdit }) {
  const couples = (task.coupleIds || []).map(coupleById).filter(Boolean)
  const contacts = (task.contactIds || []).map(contactById).filter(Boolean)
  const vendors = (task.vendorIds || []).map(vendorById).filter(Boolean)
  const tagged = couples.length + contacts.length + vendors.length > 0

  // The event's own date, so tasks for different weddings are told apart at a glance.
  const eventDate = eventById(task.eventId)?.dateShort

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
              </span>
            </div>

            <h3 className={cx('text-heading font-medium', task.done ? 'text-ink-muted line-through' : 'text-ink')}>
              {task.title}
            </h3>

            {/* The description: a written task's own text, or what the system noticed. */}
            {task.what && <ClampedText className="mt-2">{task.what}</ClampedText>}

            {tagged && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tagged">
                {couples.map((c) => (
                  <li key={c.id}>
                    <Tag icon="heart">{c.name}</Tag>
                  </li>
                ))}
                {contacts.map((c) => (
                  <li key={c.id}>
                    <Tag icon="user">{contactName(c)}</Tag>
                  </li>
                ))}
                {vendors.map((v) => (
                  <li key={v.id}>
                    <Tag icon="truck">{v.name}</Tag>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex shrink-0 items-start gap-2">
            {isTask && !task.done && (
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
