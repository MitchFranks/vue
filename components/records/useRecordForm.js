'use client'

import { useState } from 'react'

/* ----------------------------------------------------------- useRecordForm -- */
// Values, per-field errors and submit for any record form. `field(name)` gives
// the props a TextInput / Select / Textarea needs, so forms stay declarative.

export function useRecordForm(initial, { idPrefix, validate = () => ({}) }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    setDirty(true)
    if (errors[name]) setErrors(({ [name]: _gone, ...rest }) => rest)
  }

  const field = (name) => ({
    id: `${idPrefix}-${name}`,
    value: values[name] ?? '',
    onChange: (e) => setValue(name, e.target.value),
    error: errors[name]
  })

  /** Validate, focus the first problem, or call onValid(values). */
  const submit = (onValid) => (e) => {
    e?.preventDefault()
    const found = validate(values)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`${idPrefix}-${first}`)?.focus()
      return
    }
    setDirty(false)
    onValid(values)
  }

  return { values, errors, dirty, field, setValue, submit, reset: () => (setValues(initial), setErrors({}), setDirty(false)) }
}
