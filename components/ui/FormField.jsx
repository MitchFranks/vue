'use client'

import { Icon } from './Icon'

/* ------------------------------------------------------------ Form bits --- */

const LABEL = 'mb-1.5 block text-small text-ink-muted'
export const CONTROL =
  'block w-full rounded-sm border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-muted/70 transition-colors focus:border-accent focus-visible:outline-offset-0'
// A missing or invalid field also gets the light red wash, not just a red edge.
export const CONTROL_ERROR = 'border-status-now bg-status-now-soft! focus:border-status-now'
const HINT = 'mt-1.5 text-small text-ink-muted'
const ERROR = 'mt-1.5 flex items-center gap-1 text-small text-status-now'

/**
 * Label, control, then either an error (status-now, with a glyph, announced)
 * or a hint. Pass `error` to show a validation message; it replaces the hint.
 * `label` may be omitted only when `aria-label` is passed instead.
 */
export function FormField({ label, id, hint, error, className, children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className={ERROR} role="alert">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={HINT}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function controlProps(id, hint, error) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined
  }
}
