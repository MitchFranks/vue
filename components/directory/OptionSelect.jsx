'use client'

// A role or category picker that also takes a new one. The last choice,
// "Other: add a new …", opens a text box; the form creates the entry when
// it saves (resolveOption below), or reuses one that already has the name.
// Used by the staff form (roles) and the vendor form (categories).

import { Select, TextInput } from '@/components/ui/primitives'
import { CUSTOM_OPTION } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'

const NOUN = { roles: 'role', categories: 'category' }

/** `field` and `customField` are useRecordForm field props for `x` and `xCustom`. */
export function OptionSelect({ kind, label, hint, field, customField }) {
  const dir = useDirectory()
  const noun = NOUN[kind]
  const options = [...dir[kind].map((o) => ({ value: o.id, label: o.name })), { value: CUSTOM_OPTION, label: `Other: add a new ${noun}…` }]
  return (
    <>
      <Select label={label} hint={hint} options={options} {...field} />
      {field.value === CUSTOM_OPTION && (
        <TextInput label={`New ${noun} name`} hint={`Saved to your ${noun === 'role' ? 'roles' : 'categories'} for next time.`} autoFocus {...customField} />
      )}
    </>
  )
}

/** The id to store for a picker's value: an existing id, or the new entry it names. */
export function useResolveOption() {
  const { ensureOption } = useDirectory()
  return (kind, value, customName) => (value === CUSTOM_OPTION ? ensureOption(kind, customName) : value)
}
