'use client'

import { Icon } from './Icon'

/* ------------------------------------------------------------ EmptyState -- */

export function EmptyState({ title, body, action, icon = 'check' }) {
  return (
    <div className="rounded-md border border-dashed border-line-strong px-4 py-12 text-center">
      <Icon name={icon} size={20} className="mx-auto mb-3 text-ink-muted" />
      <p className="text-heading font-medium text-ink">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-prose text-small text-ink-muted">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
