'use client'

import { cx } from '@/lib/cx'

/* ------------------------------------------------------------ FilterChip -- */
// A toggle in a row of filters. Pills mean state: a pressed chip takes the
// accent (border and text on a sunken fill), an unpressed one is a quiet
// outline. Always a real button with aria-pressed.

export function FilterChip({ pressed = false, onClick, count, children, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-small font-medium transition-colors duration-150',
        pressed ? 'border-accent bg-surface-sunken text-accent' : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-sunken',
        className
      )}
    >
      {children}
      {count != null && <span className="font-mono tabular-nums opacity-70">{count}</span>}
    </button>
  )
}

/** A labelled row of FilterChips. */
export function FilterGroup({ label, children }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-small text-ink-muted">{label}</span>
      {children}
    </div>
  )
}
