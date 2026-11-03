'use client'

// [label, value] rows as a description list. Used for the client's review
// step and for the inquiry detail screen, so both read the same way.

import { Field } from '@/components/ui'

export function SummaryList({ rows }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <Field
          key={label}
          label={label}
          // Long answers (a question, a message) get the full width.
          className={String(value).length > 60 ? 'sm:col-span-2' : undefined}
        >
          <span className="whitespace-pre-line">{value}</span>
        </Field>
      ))}
    </dl>
  )
}
