'use client'

import { cx } from '@/lib/cx'
import { Icon } from './Icon'

/* ----------------------------------------------------------- StatusBadge -- */
// The triage language. NEVER COLOUR ALONE: tone -> {colours, glyph, default
// label}. Callers may pass their own words but can never drop the glyph.
//
// One vocabulary, product-wide (see docs/STYLE-GUIDE.md):
//   a staff request is   Not sent · Waiting · Confirmed · Can't make it
//   an unfilled role is  an "open spot"; a count reads "N open spots";
//                        a fully covered event reads "Fully staffed".
//   urgent   status-now    act today or it slips
//   warn     status-soon   coming up this week
//   done     status-clear  handled or on track
//   pending / info / empty  neutral: plain information, waiting, nothing yet

export const TONES = {
  urgent: { cls: 'bg-status-now-soft text-status-now', icon: 'alert', label: 'Urgent' },
  warn: { cls: 'bg-status-soon-soft text-status-soon', icon: 'clock', label: 'Due soon' },
  pending: { cls: 'bg-surface-sunken text-ink-muted', icon: 'clock', label: 'Waiting' },
  done: { cls: 'bg-status-clear-soft text-status-clear', icon: 'check', label: 'Confirmed' },
  info: { cls: 'bg-surface-sunken text-ink-muted', icon: 'info', label: 'Info' },
  declined: { cls: 'bg-status-now-soft text-status-now', icon: 'x', label: "Can't make it" },
  empty: { cls: 'bg-surface-sunken text-ink-muted', icon: 'dash', label: 'Unassigned' }
}

export function StatusBadge({ tone = 'info', children, size = 'md', className = '' }) {
  const t = TONES[tone] || TONES.info
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full text-label font-medium',
        size === 'sm' ? 'h-5 px-2' : 'h-6 pl-2 pr-2.5',
        t.cls,
        className
      )}
    >
      <Icon name={t.icon} size={size === 'sm' ? 12 : 13} />
      {children || t.label}
    </span>
  )
}
