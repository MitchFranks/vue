'use client'

import { cx } from '@/lib/cx'

/* ---------------------------------------------------------- CheckboxGroup -- */

export const CHECKBOX = 'mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]'

/** options: [{ value, label, disabled? }]; value: string[] */
export function CheckboxGroup({ legend, hint, idPrefix, options, value, onChange }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <fieldset>
      <legend className="mb-1.5 block text-small text-ink-muted">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.value} className={cx('flex items-start gap-2 text-body text-ink', o.disabled ? 'opacity-50' : 'cursor-pointer')}>
            <input
              type="checkbox"
              id={`${idPrefix}-${o.value}`}
              className={CHECKBOX}
              checked={value.includes(o.value)}
              disabled={o.disabled}
              onChange={() => toggle(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-small text-ink-muted">{hint}</p>}
    </fieldset>
  )
}
