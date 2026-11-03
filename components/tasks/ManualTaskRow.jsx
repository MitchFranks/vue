'use client'

import { cx } from '@/lib/cx'
import { StatusBadge } from '@/components/ui'

/* --------------------------------------------------------- ManualTaskRow -- */

export function ManualTaskRow({ task, onToggle }) {
  return (
    <div className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:px-6">
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.done}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cx('block cursor-pointer', task.done ? 'text-ink-muted' : 'text-ink')}
        >
          {task.title}
        </label>
        <p className="text-small text-ink-muted">{task.detail}</p>
        <p className="text-small text-ink-muted">Owner: {task.owner}</p>
      </div>
      <div className="shrink-0">
        {task.done ? (
          <StatusBadge tone="done" size="sm">
            Done
          </StatusBadge>
        ) : (
          <StatusBadge tone={task.dueTone === 'urgent' ? 'urgent' : task.dueTone === 'warn' ? 'warn' : 'info'} size="sm">
            {task.due}
          </StatusBadge>
        )}
      </div>
    </div>
  )
}
