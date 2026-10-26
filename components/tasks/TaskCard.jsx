'use client'

// ---------------------------------------------------------------------------
// TaskCard — one task in the Up Next task view.
//
// Reads in the same order as UpNextItem: how soon -> what -> who it is for ->
// what to do. The due badge leads, then the task type and event, then the
// name. Couples, single contacts and vendors show as tags under the
// description so a sort by any of them is easy to follow down the list.
//
// A task that is finished by entering something (the catering guarantee) has
// no checkbox: it links to the event's Tasks tab, where the form is.
// ---------------------------------------------------------------------------

import { cx } from '@/lib/cx'
import { contactName } from '@/lib/mock/records'
import { taskTags } from '@/lib/tasks'
import { Button, Icon, StatusBadge } from '@/components/ui/primitives'

function Tag({ icon, children }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-line px-2 text-label text-ink">
      <Icon name={icon} size={12} className="text-ink-muted" />
      {children}
    </span>
  )
}

export function TaskCard({ task, eventName, first = false, onToggle, onEdit }) {
  const { couples, contacts, vendors } = taskTags(task)
  const needsInput = !!task.input && !task.done
  const tagged = couples.length + contacts.length + vendors.length > 0

  return (
    <article className="bg-surface px-4 py-4 transition-colors duration-150 hover:bg-surface-sunken/40 sm:px-6">
      <div className="flex gap-3">
        {needsInput ? (
          <span className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <input
            type="checkbox"
            id={`upnext-task-${task.id}`}
            checked={task.done}
            onChange={() => onToggle(task)}
            aria-label={task.done ? `Reopen "${task.title}"` : `Complete "${task.title}"`}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge tone={task.dueTone} size="sm">
                {task.due}
              </StatusBadge>
              <span className="text-small text-ink-muted">
                {task.type}
                {eventName && ` · ${eventName}`}
              </span>
            </div>

            <h3 className={cx('text-heading font-medium', task.done ? 'text-ink-muted line-through' : 'text-ink')}>
              {task.title}
            </h3>
            {task.detail && <p className="mt-1 text-small text-ink-muted">{task.detail}</p>}

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

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
              Edit
            </Button>
            {needsInput ? (
              <Button href={`/events/${task.eventId}/tasks`} variant={first ? 'primary' : 'secondary'} size="sm">
                Enter the count
                <Icon name="arrowRight" size={14} />
              </Button>
            ) : (
              task.eventId && (
                <Button href={`/events/${task.eventId}/tasks`} variant={first ? 'primary' : 'secondary'} size="sm">
                  Open event
                  <Icon name="arrowRight" size={14} />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
