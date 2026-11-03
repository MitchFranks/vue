'use client'

import Link from 'next/link'
import { cx } from '@/lib/cx'

/* ----------------------------------------------------------- MetricTile --- */
// One number that matters, set large and light. The label carries the
// meaning; an urgent or done tone only tints the number.

export function MetricTile({ label, value, tone, sub, href }) {
  const body = (
    <>
      <div className="text-small text-ink-muted">{label}</div>
      <div
        className={cx(
          'mt-2 text-display font-light tabular-nums',
          tone === 'urgent' ? 'text-status-now' : tone === 'done' ? 'text-status-clear' : 'text-ink'
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-2 text-small text-ink-muted">{sub}</div>}
    </>
  )
  const cls = cx(
    'block rounded-md border border-line bg-surface px-6 py-4 shadow-raised',
    href && 'transition-colors duration-150 hover:border-line-strong'
  )
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
