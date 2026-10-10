'use client'

// Add an away date: a date (or all day), optional From–To, optional reason.
// Shared by Team (addedBy manager) and the Staff phone (addedBy staff).

import { useState } from 'react'
import { TODAY_KEY } from '@/lib/mock/events'
import { Button, TextInput } from '@/components/ui/primitives'
import { fmtH } from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'

const HALF_HOURS = Array.from({ length: 49 }, (_, i) => i / 2)
const selectCls =
  'mt-1.5 block w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink focus:border-accent'

export function AwayDateForm({ staffId, addedBy = 'manager', idPrefix = 'away' }) {
  const { addAway } = useStaffing2()
  const [dateKey, setDateKey] = useState(TODAY_KEY)
  const [allDay, setAllDay] = useState(true)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(16)
  const [reason, setReason] = useState('')
  const valid = dateKey && (allDay || end > start)

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    addAway({ staffId, dateKey, ...(allDay ? {} : { start, end }), reason: reason.trim() || null, addedBy })
    setReason('')
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-line bg-surface-sunken/50 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label="Date" id={`${idPrefix}-date`} type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
        <div>
          <span className="eyebrow block text-ink">Time</span>
          <div className="mt-1.5 flex gap-2" role="group" aria-label="All day or part of the day">
            {[
              [true, 'All day'],
              [false, 'Part of the day']
            ].map(([v, label]) => (
              <button
                key={label}
                type="button"
                aria-pressed={allDay === v}
                onClick={() => setAllDay(v)}
                className={`rounded-full border px-3 py-2 text-label font-medium ${allDay === v ? 'border-accent bg-surface-sunken text-accent' : 'border-line bg-surface text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {!allDay && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${idPrefix}-from`} className="eyebrow block text-ink">
              From
            </label>
            <select id={`${idPrefix}-from`} className={selectCls} value={start} onChange={(e) => setStart(Number(e.target.value))}>
              {HALF_HOURS.slice(0, -1).map((h) => (
                <option key={h} value={h}>
                  {h === 0 ? 'Start of day' : fmtH(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${idPrefix}-to`} className="eyebrow block text-ink">
              To
            </label>
            <select id={`${idPrefix}-to`} className={selectCls} value={end} onChange={(e) => setEnd(Number(e.target.value))}>
              {HALF_HOURS.slice(1).map((h) => (
                <option key={h} value={h}>
                  {h === 24 ? 'End of day' : fmtH(h)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <TextInput label="Reason (optional)" id={`${idPrefix}-reason`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Class, family, another job…" />
      <div className="flex items-center justify-between gap-2">
        {!valid ? <p className="text-label text-ink-muted">&quot;To&quot; must be after &quot;From&quot;.</p> : <span />}
        <Button type="submit" size="sm" disabled={!valid}>
          Add away date
        </Button>
      </div>
    </form>
  )
}
