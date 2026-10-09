'use client'

// Small controls shared by the Ask panel and Change times: block toggle chips
// and the call-time select.

import { cx } from '@/lib/cx'
import { Icon } from '@/components/ui/primitives'
import { fmtH, rangeLabel } from '@/lib/staffing/derive'

export function BlockToggles({ blocks, selected, onChange, gaps = {} }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return // at least one must stay selected
      onChange(selected.filter((x) => x !== id))
    } else onChange([...selected, id])
  }
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Blocks">
      {blocks.map((b) => {
        const on = selected.includes(b.id)
        return (
          <button
            key={b.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(b.id)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
              on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:border-accent-line'
            )}
          >
            <Icon name={on ? 'check' : 'plus'} size={12} />
            {b.name} {rangeLabel(b.start, b.end)}
            {gaps[b.id] ? <span className="font-normal text-muted">· {gaps[b.id]} open</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export const CALL_OFFSETS = [0, -15, -30, -60]

export function callOptionLabel(offset, startH) {
  const t = fmtH(startH + offset / 60)
  if (offset === 0) return `On time (${t})`
  if (offset === -60) return `1 hour early (${t})`
  return `${-offset} min early (${t})`
}

export function CallTimeSelect({ id = 'call-time', startH, value, onChange }) {
  const opts = CALL_OFFSETS.includes(value) ? CALL_OFFSETS : [...CALL_OFFSETS, value].sort((a, b) => b - a)
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-ink-2">
        Call time
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 block w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft"
      >
        {opts.map((o) => (
          <option key={o} value={o}>
            {callOptionLabel(o, startH)}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Pill quick-pick chips (reasons). */
export function PickChips({ options, value, onChange, label }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value === o
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? '' : o)}
            className={cx(
              'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
              on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-ink-2 hover:border-accent-line'
            )}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}
