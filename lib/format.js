// ---------------------------------------------------------------------------
// Shared wording and formatting. One place for each phrasing the product uses,
// so a count or a time reads the same on every screen.
// ---------------------------------------------------------------------------

/** The one way to say how many roles are unfilled: "1 open spot", "3 open spots". */
export function openSpots(n) {
  return `${n} open spot${n === 1 ? '' : 's'}`
}

/* ------------------------------------------------------------------ time -- */
// Every clock time in the product reads "9:00 AM" / "4:30 PM". The three
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
