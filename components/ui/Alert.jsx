'use client'

import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import { TONES } from './StatusBadge'

/* ----------------------------------------------------------------- Alert -- */
// An inline moment placed where the user is looking. Tones follow StatusBadge.

const ALERT_TONES = {
  urgent: ['bg-status-now-soft', 'text-status-now'],
  declined: ['bg-status-now-soft', 'text-status-now'],
  warn: ['bg-status-soon-soft', 'text-status-soon'],
  done: ['bg-status-clear-soft', 'text-status-clear'],
  pending: ['bg-surface-sunken', 'text-ink-muted'],
  info: ['bg-surface-sunken', 'text-ink-muted'],
  empty: ['bg-surface-sunken', 'text-ink-muted']
}

export function Alert({ tone = 'info', title, children, action }) {
  const t = TONES[tone] || TONES.info
  const [bg, fg] = ALERT_TONES[tone] || ALERT_TONES.info
  return (
    <div className={cx('flex flex-wrap items-start gap-3 rounded-md px-4 py-3', bg)} role={tone === 'urgent' ? 'alert' : 'status'}>
      <Icon name={t.icon} size={16} className={cx('mt-0.5', fg)} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className={cx('text-small', title ? 'mt-0.5 text-ink-muted' : 'text-ink')}>{children}</div>}
      </div>
      {action}
    </div>
  )
}
