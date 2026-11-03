'use client'

import { cx } from '@/lib/cx'

/** A small number that announces hidden content. `urgent` when the number is the reason to look. */
export function Count({ tone, children }) {
  return (
    <span
      className={cx(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-label tabular-nums',
        tone === 'urgent' ? 'bg-status-now-soft text-status-now' : 'bg-surface-sunken text-ink-muted'
      )}
    >
      {children}
    </span>
  )
}
