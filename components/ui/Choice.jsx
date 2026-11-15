// Pick one from a few options, drawn as large cards or compact pills instead
// of a dropdown, so every option is visible and one tap away. Real radio
// buttons underneath: arrow keys move between options and the label is the
// whole card. A chosen option takes an ink border and a filled dot.

import { cx } from '@/lib/cx'
import { Icon } from './Icon'

function ChoiceError({ id, error }) {
  if (!error) return null
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-small text-status-now" role="alert">
      <Icon name="alert" size={14} />
      {error}
    </p>
  )
}

/** options: [{ value, label, blurb?, icon?, meta? }] */
export function ChoiceCards({ name, legend, options, value, onChange, error, columns = 1 }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-small text-ink-muted">{legend}</legend>
      <div className={cx('grid gap-3', columns === 2 && 'sm:grid-cols-2', columns === 3 && 'sm:grid-cols-3')}>
        {options.map((o, i) => {
          const checked = value === o.value
          return (
            <label
              key={o.value}
              className={cx(
                'flex cursor-pointer items-start gap-3 rounded-md border bg-surface p-4 transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                checked ? 'border-ink shadow-raised' : 'border-line hover:border-line-strong'
              )}
            >
              <input
                type="radio"
                name={name}
                id={i === 0 ? `${name}-first` : undefined}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
                aria-describedby={error ? `${name}-error` : undefined}
              />
              {o.icon && (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-surface-sunken text-ink">
                  <Icon name={o.icon} size={16} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{o.label}</span>
                {o.blurb && <span className="mt-0.5 block text-small text-ink-muted">{o.blurb}</span>}
                {o.meta && <span className="mt-1 block text-label text-ink-muted">{o.meta}</span>}
              </span>
              <span
                aria-hidden="true"
                className={cx('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border', checked ? 'border-ink bg-ink text-on-ink' : 'border-line-strong')}
              >
                {checked && <Icon name="check" size={11} />}
              </span>
            </label>
          )
        })}
      </div>
      <ChoiceError id={`${name}-error`} error={error} />
    </fieldset>
  )
}

/** Short options (times, sizes) as a wrapping row of pills. options: [{ value, label }] */
export function ChoicePills({ name, legend, options, value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-small text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const checked = value === o.value
          return (
            <label
              key={o.value}
              className={cx(
                'inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-small font-medium transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                checked ? 'border-ink bg-ink text-on-ink' : 'border-line bg-surface text-ink hover:border-line-strong'
              )}
            >
              <input
                type="radio"
                name={name}
                id={i === 0 ? `${name}-first` : undefined}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
                aria-describedby={error ? `${name}-error` : undefined}
              />
              {o.label}
            </label>
          )
        })}
      </div>
      <ChoiceError id={`${name}-error`} error={error} />
    </fieldset>
  )
}
