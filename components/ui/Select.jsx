'use client'

import { cx } from '@/lib/cx'
import { CONTROL, CONTROL_ERROR, FormField, controlProps } from './FormField'

/** `options` may be strings or { value, label } objects. */
export function Select({ label, id, options = [], hint, error, className = '', inputClassName = '', ...rest }) {
  return (
    <FormField label={label} id={id} hint={hint} error={error} className={className}>
      <select {...controlProps(id, hint, error)} className={cx(CONTROL, 'h-9', error && CONTROL_ERROR, inputClassName)} {...rest}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          )
        })}
      </select>
    </FormField>
  )
}
