'use client'

import { cx } from '@/lib/cx'

/* --------------------------------------------------------------- Avatar --- */
// Initials in a circle. No photos of people, no colour per person.

export function Avatar({ initials, size = 'md' }) {
  return (
    <span
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full bg-surface-sunken font-medium tracking-wide text-ink ring-1 ring-line ring-inset',
        size === 'sm' ? 'h-7 w-7 text-label' : 'h-9 w-9 text-label'
      )}
    >
      {initials}
    </span>
  )
}
