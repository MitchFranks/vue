'use client'

import { Button, ClampedText, Icon, StatusBadge } from '@/components/ui'

/* ---------------------------------------------------------- TaskRow --
 *
 * The single most important component in the product. It answers, in order:
 *   how soon  ->  what happened  ->  which event  ->  what to do.
 *
 * Status before detail: the chip says whether it needs the user today
 * (status-now) or this week (status-soon) in words, before the title. Only
 * the first task in a list gets the filled ink button, so one action leads.
 * Lists of these sit in a container with `divide-y divide-line`.
 *
 * The button says "Action" for every task: which action a task needs is not
 * decided yet, so the row does not guess.
 */

export function TaskRow({ task, compact = false, first = false, badge = false }) {
  const urgent = task.tone === 'urgent'
  return (
    <article className="bg-surface px-4 py-4 transition-colors duration-150 hover:bg-surface-sunken/40 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {/* Only where the list is not already grouped under "Do first" / "Coming up". */}
            {badge && (
              <StatusBadge tone={urgent ? 'urgent' : 'warn'} size="sm">
                {urgent ? 'Do first' : 'Coming up'}
              </StatusBadge>
            )}
            <span className="text-small text-ink-muted">
              {task.eventName} · {task.meta}
            </span>
          </div>

          <h3 className="text-heading font-medium text-ink">{task.title}</h3>

          {!compact && <ClampedText className="mt-2">{task.what}</ClampedText>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button href={task.href} variant={first ? 'primary' : 'secondary'} size="sm">
            Action
            <span className="sr-only"> for {task.title}</span>
            <Icon name="arrowRight" size={14} />
          </Button>
        </div>
      </div>
    </article>
  )
}
