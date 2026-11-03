'use client'

import { useState } from 'react'
import { Select, TextInput } from '@/components/ui'

/* ------------------------------------------------------------ ListToolbar -- */
// Search plus any number of select filters, in one wrapping row.

export function useListFilters(defaults) {
  const [values, setValues] = useState(defaults)
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))
  const clear = () => setValues(defaults)
  return { values, set, clear }
}

/**
 * search  { id, label, placeholder, value, onChange }
 * filters [{ id, label, options, value, onChange }]
 */
export function ListToolbar({ search, filters = [] }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-2">
      {search && <TextInput type="search" label="Search" className="min-w-[180px] flex-1" {...search} />}
      {filters.map((f) => (
        <Select key={f.id} {...f} />
      ))}
    </div>
  )
}
