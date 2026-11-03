// ---------------------------------------------------------------------------
// Shared wording and formatting. One place for each phrasing the product uses,
// so a count or a time reads the same on every screen.
// ---------------------------------------------------------------------------

/** The one way to say how many roles are unfilled: "1 open spot", "3 open spots". */
export function openSpots(n) {
  return `${n} open spot${n === 1 ? '' : 's'}`
}

/* ------------------------------------------------------------------ time -- */
// Every clock time in the product reads "9:00 AM" / "4:30 PM". The label
// helpers below take the three shapes times are stored in and share one core.

/** Minutes after midnight -> "4:30 PM". Wraps past midnight (1500 -> "1:00 AM"). */
export function clockLabel(mins) {
  const total = ((Math.round(mins) % 1440) + 1440) % 1440
  const h24 = Math.floor(total / 60)
  const mm = String(total % 60).padStart(2, '0')
  const suffix = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${mm} ${suffix}`
}

/** Decimal hours -> "4:30 PM" (16.5). Blocks that cross midnight run past 24 and wrap. */
export const hourLabel = (h) => clockLabel(h * 60)

/** "16:30" -> "4:30 PM". */
export function timeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return clockLabel(h * 60 + m)
}

/** Minutes after midnight -> "4:00 PM – 5:30 PM" (the run of show). Hours use rangeLabel in lib/staffing/derive. */
export const clockRange = (s, e) => `${clockLabel(s)} – ${clockLabel(e)}`

/* ------------------------------------------- "9:00 AM" <-> minutes <-> "09:00" -- */
// "09:00" is what <input type="time"> reads and writes.

/** "4:30 PM" -> 990 minutes after midnight, or null if it isn't a clock time. */
export function parseClock(text) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(text || '').trim())
  if (!m) return null
  const hour = Number(m[1])
  if (hour < 1 || hour > 12 || Number(m[2]) > 59) return null
  let h = hour % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + Number(m[2])
}

/** "4:30 PM" -> "16:30" for a time field ('' if unreadable). */
export const toInputValue = (text) => {
  const m = parseClock(text)
  return m == null ? '' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** "16:30" from a time field -> "4:30 PM" (null if unreadable). */
export const fromInputValue = (value) => {
  const m = /^(\d{2}):(\d{2})$/.exec(value)
  return m ? clockLabel(Number(m[1]) * 60 + Number(m[2])) : null
}
