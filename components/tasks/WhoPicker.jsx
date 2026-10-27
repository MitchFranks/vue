'use client'

// ---------------------------------------------------------------------------
// WhoPicker — choose the couples (or, on request, single contacts) a task is
// for. Used by the task editor and the Tasks filter.
//
// Couples are the default: most tasks are about the couple as a whole, so the
// list offers couples only. "Tag individual contact instead of couple" is an
// advanced option: it reveals a Couple / Individual contact switch and moves
// the list to contacts. The switch only changes what the list OFFERS, so
// anything already chosen stays visible as a chip and nothing is lost when
// the mode changes. A couple and one of its own partners still exclude each
// other (see whoOptions in lib/tasks.js).
//
// Gender-agnostic by design: contacts are people, listed by name with their
// couple beneath, never by role.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { cx } from '@/lib/cx'
import { SearchPicker } from '@/components/ui/SearchPicker'

const MODES = [
  { value: 'Couples', label: 'Couple', noun: 'couples', placeholder: 'Search couples' },
  { value: 'Contacts', label: 'Individual contact', noun: 'contacts', placeholder: 'Search contacts' }
]

/** `options` come from whoOptions(value), optionally marked with counts. */
export function WhoPicker({ options, value, onChange, label, id, hint, ariaLabel, className = '' }) {
  const hasContact = value.some((v) => v.startsWith('contact:'))
  const [revealed, setRevealed] = useState(hasContact)
  const [group, setGroup] = useState(hasContact ? 'Contacts' : 'Couples')
  const mode = MODES.find((m) => m.value === group)

  const offered = options.map((o) => ({ ...o, hidden: o.group !== group }))

  return (
    <div className={className}>
      <SearchPicker
        label={label}
        ariaLabel={ariaLabel}
        id={id}
        options={offered}
        value={value}
        onChange={onChange}
        placeholder={mode.placeholder}
        noun={mode.noun}
        hint={hint}
      />

      {revealed ? (
        <div role="group" aria-label="Tag a couple or an individual contact" className="mt-2 inline-flex rounded-sm border border-line-strong p-0.5">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={group === m.value}
              onClick={() => setGroup(m.value)}
              className={cx(
                'h-7 rounded-sm px-3 text-small transition-colors duration-150',
                group === m.value ? 'bg-ink font-medium text-on-ink' : 'text-ink hover:bg-surface-sunken'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setRevealed(true)
            setGroup('Contacts')
          }}
          className="mt-2 text-small text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          Tag individual contact instead of couple
        </button>
      )}
    </div>
  )
}
