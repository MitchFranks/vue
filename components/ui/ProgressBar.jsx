// A thin bar for "how much is done". The words beside it carry the meaning
// (NEVER COLOUR ALONE); the bar only shows the proportion at a glance.

import { cx } from '@/lib/cx'

export function ProgressBar({ value, max = 100, label, className = '' }) {
  const pct = max ? Math.round((Math.min(value, max) / max) * 100) : 0
  return (
    <div
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-calm" style={{ width: `${pct}%` }} />
    </div>
  )
}
