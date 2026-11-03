'use client'

import { cx } from '@/lib/cx'
import { CONTROL, CONTROL_ERROR, FormField, controlProps } from './FormField'

export function Textarea({ label, id, hint, error, className = '', inputClassName = '', ...rest }) {
  return (
    <FormField label={label} id={id} hint={hint} error={error} className={className}>
      <textarea {...controlProps(id, hint, error)} className={cx(CONTROL, 'py-2 leading-6', error && CONTROL_ERROR, inputClassName)} {...rest} />
    </FormField>
  )
}
