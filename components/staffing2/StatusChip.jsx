'use client'

// The B.0 vocabulary: six indicators, each an icon and a word, plus the two
// marks that can sit beside a status ("Check" and "OK'd").

import { cx } from '@/lib/cx'
import { Icon, StatusBadge } from '@/components/ui/primitives'
import { displayStatus } from '@/lib/staffing2/derive'

export function RequestStatus({ request, st, size = 'sm', showNote = true }) {
  const s = displayStatus(request, st)
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <StatusBadge tone={s.tone} size={size}>
        {s.label}
      </StatusBadge>
      {showNote && s.note && <span className="text-[11px] text-muted">{s.note}</span>}
    </span>
  )
}

/** Small pill with an icon and a word, in a status tone. */
const CHIP_TONES = {
  done: 'bg-done-soft text-done border-done-line',
  pending: 'bg-pending-soft text-pending border-pending-line',
  warn: 'bg-warn-soft text-warn border-warn-line',
  info: 'bg-info-soft text-info border-info-line',
  empty: 'bg-wash-deep text-muted border-line',
  neutral: 'bg-surface text-ink-2 border-line'
}

export function Chip({ tone = 'neutral', icon, title, children, className = '' }) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        CHIP_TONES[tone],
        className
      )}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  )
}

/** "Check" mark: soft and hard rule issues. Hover shows every issue. */
export function CheckMark({ issues }) {
  const real = issues.filter((i) => i.severity === 'soft' || i.severity === 'hard')
  if (!real.length) return null
  const hard = real.find((i) => i.severity === 'hard')
  const first = hard || real[0]
  return (
    <span
      title={real.map((i) => i.message).join('\n')}
      className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-warn-line bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn"
    >
      <Icon name="alert" size={11} className="mt-[2px]" />
      <span className="min-w-0 whitespace-normal">
        {hard ? 'Needs a reason' : 'Check'}: {first.message}
        {real.length > 1 && ` (+${real.length - 1})`}
      </span>
    </span>
  )
}

/** "OK'd" mark: an override that has been recorded. Hover shows the reason. */
export function OkdMark({ overrides }) {
  if (!overrides?.length) return null
  return (
    <span
      title={overrides.map((o) => `${o.message}${o.reason ? ` · OK because: ${o.reason}` : ''}`).join('\n')}
      className="inline-flex items-center gap-1 text-[11px] text-faint"
    >
      <Icon name="check" size={11} />
      OK&apos;d
    </span>
  )
}

/** Open spot: a derived gap, never a person. Neutral and dashed, never red. */
export function OpenSpotChip({ count = 1 }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-faint bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted">
      <Icon name="plus" size={11} />
      {count > 1 ? `${count} open spots` : 'Open spot'}
    </span>
  )
}
