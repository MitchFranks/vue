'use client'

// Step 1 of the client form: what can we help with? One radio group drawn as
// large cards. Arrow keys move between them (native radio behaviour), and the
// whole card is the label, so it is one big target.

import { cx } from '@/lib/cx'
import { INQUIRY_KINDS } from '@/lib/inquiries'
import { Icon } from '@/components/ui'

export function KindPicker({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="sr-only">What can we help with?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {INQUIRY_KINDS.map((k, i) => {
          const checked = value === k.value
          return (
            <label
              key={k.value}
              className={cx(
                'flex cursor-pointer items-start gap-3 rounded-md border bg-surface p-4 shadow-raised transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                checked ? 'border-ink' : 'border-line hover:bg-surface-sunken'
              )}
            >
              <input
                type="radio"
                name="inquiry-kind"
                id={i === 0 ? 'inq-kind' : undefined}
                value={k.value}
                checked={checked}
                onChange={() => onChange(k.value)}
                className="sr-only"
                aria-describedby={error ? 'inq-kind-error' : undefined}
              />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-surface-sunken text-ink">
                <Icon name={k.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-heading font-medium text-ink">{k.label}</span>
                <span className="mt-0.5 block text-small text-ink-muted">{k.blurb}</span>
              </span>
              <span
                aria-hidden="true"
                className={cx(
                  'mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                  checked ? 'border-ink bg-ink text-on-ink' : 'border-line-strong'
                )}
              >
                {checked && <Icon name="check" size={10} />}
              </span>
            </label>
          )
        })}
      </div>
      {error && (
        <p id="inq-kind-error" className="mt-2 flex items-center gap-1.5 text-small text-status-now" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </fieldset>
  )
}
