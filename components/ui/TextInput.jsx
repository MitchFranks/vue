'use client'

import { cx } from '@/lib/cx'
import { CONTROL, CONTROL_ERROR, FormField, controlProps } from './FormField'

export function TextInput({ label, id, hint, error, className = '', inputClassName = '', ...rest }) {
  return (
    <FormField label={label} id={id} hint={hint} error={error} className={className}>
      <input {...controlProps(id, hint, error)} className={cx(CONTROL, 'h-9', error && CONTROL_ERROR, inputClassName)} {...rest} />
    </FormField>
  )
}
