'use client'

// ---------------------------------------------------------------------------
// Weekly availability: a read-only summary and the editor behind it.
//
// Each day is one of: unavailable, all day, or a from–to window (an end of
// midnight covers "available after 4 PM"). The stored shape is the planner's
// { Mon: [{ start, end }] } in decimal hours, so these edits are what the
// Staffing Planner ranks with. See lib/directory/model.js.
// ---------------------------------------------------------------------------

import { DAYS, DAY_NAMES, describeWindows, hoursToTime, timeToHours } from '@/lib/directory/model'
import { Alert, Select, TextInput } from '@/components/ui/primitives'

const MODES = [
  { value: 'off', label: 'Unavailable' },
  { value: 'all', label: 'All day' },
  { value: 'hours', label: 'Set hours' }
]

const AVAILABILITY_STATUS = [
  { value: 'confirmed', label: 'Known: these are their usual hours' },
  { value: 'pending', label: 'Pending: still waiting to hear from them' }
]

const modeOf = (windows = []) => (!windows.length ? 'off' : windows[0].start <= 0 && windows[0].end >= 24 ? 'all' : 'hours')

/** Read-only: one row per day. */
export function AvailabilitySummary({ availability, status }) {
  if (status === 'pending') {
    return (
      <Alert tone="pending" title="Availability pending">
        Their weekly hours have not been collected yet. Until then the Staffing Planner treats them as open.
      </Alert>
    )
  }
  return (
    <dl className="divide-y divide-line">
      {DAYS.map((d) => {
        const windows = availability?.[d] || []
        return (
          <div key={d} className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
            <dt className="text-small text-ink-muted">{DAY_NAMES[d]}</dt>
            <dd className={windows.length ? 'text-right text-ink' : 'text-right text-ink-muted'}>{describeWindows(windows)}</dd>
          </div>
        )
      })}
    </dl>
  )
}

/** Controlled editor. value = availability, status = availabilityStatus. */
export function AvailabilityEditor({ idPrefix, value, onChange, status, onStatusChange }) {
  const setDay = (day, windows) => onChange({ ...value, [day]: windows })

  const setMode = (day, mode) => {
    if (mode === 'off') setDay(day, [])
    else if (mode === 'all') setDay(day, [{ start: 0, end: 24 }])
    else setDay(day, [{ start: 9, end: 17 }])
  }

  const setTime = (day, key, text) => {
    const h = timeToHours(text, { isEnd: key === 'end' })
    if (h == null) return
    const [w, ...rest] = value[day]
    setDay(day, [{ ...w, [key]: h }, ...rest])
  }

  return (
    <div className="space-y-4">
      <Select
        id={`${idPrefix}-status`}
        label="Are their hours known?"
        options={AVAILABILITY_STATUS}
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      />

      <fieldset disabled={status === 'pending'} className="disabled:opacity-50">
        <legend className="mb-1.5 block text-small text-ink-muted">Usual weekly hours</legend>
        <ul className="divide-y divide-line rounded-sm border border-line">
          {DAYS.map((d) => {
            const windows = value[d] || []
            const mode = modeOf(windows)
            const w = windows[0]
            const invalid = mode === 'hours' && w.end <= w.start
            return (
              <li key={d} className="grid items-start gap-2 px-3 py-2.5 sm:grid-cols-[7rem_9rem_1fr] sm:items-center">
                <span className="text-body font-medium text-ink sm:font-normal">{DAY_NAMES[d]}</span>
                <Select
                  id={`${idPrefix}-${d}-mode`}
                  aria-label={`${DAY_NAMES[d]} availability`}
                  options={MODES}
                  value={mode}
                  onChange={(e) => setMode(d, e.target.value)}
                />
                {mode === 'hours' && (
                  <div className="flex flex-wrap items-start gap-2">
                    <TextInput
                      type="time"
                      id={`${idPrefix}-${d}-start`}
                      aria-label={`${DAY_NAMES[d]} from`}
                      value={hoursToTime(w.start)}
                      onChange={(e) => setTime(d, 'start', e.target.value)}
                      className="w-[8.5rem]"
                    />
                    <span className="pt-2 text-small text-ink-muted">to</span>
                    <TextInput
                      type="time"
                      id={`${idPrefix}-${d}-end`}
                      aria-label={`${DAY_NAMES[d]} until`}
                      value={w.end >= 24 ? '00:00' : hoursToTime(w.end)}
                      onChange={(e) => setTime(d, 'end', e.target.value)}
                      className="w-[8.5rem]"
                      error={invalid ? 'Ends before it starts.' : undefined}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-1.5 text-small text-ink-muted">For “available after 4 PM”, set 4:00 PM to 12:00 AM. Away dates are kept in Staffing Planner &gt; Team.</p>
      </fieldset>
    </div>
  )
}

/** True when every "Set hours" day ends after it starts. */
export const availabilityIsValid = (availability) =>
  DAYS.every((d) => (availability[d] || []).every((w) => w.end > w.start))
