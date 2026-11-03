'use client'

import { cx } from '@/lib/cx'
import { Icon } from './Icon'

/* ------------------------------------------------------------------ Card -- */
// COMMON REGION: one card = one subject inside a hairline boundary. The
// border never takes a status colour; urgency lives in the rows, not the frame.

export function Card({ title, subtitle, icon, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={cx('overflow-hidden rounded-md border border-line bg-surface shadow-raised', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-heading font-medium text-ink">
              {icon && <Icon name={icon} size={16} className="text-ink-muted" />}
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-small text-ink-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cx('px-4 py-4 sm:px-6', bodyClassName)}>{children}</div>
    </section>
  )
}
