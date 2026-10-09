// Small date helpers for the Staff Planner's week navigation. Dates are the
// prototype's `YYYY-MM-DD` keys; weeks start on Monday.

import { TODAY_KEY } from './mock/events.js'

const DAY = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const parse = (key) => new Date(`${key}T00:00:00Z`)
const toKey = (d) => d.toISOString().slice(0, 10)

export function addDays(key, n) {
  return toKey(new Date(parse(key).getTime() + n * DAY))
}

/** The Monday of the week containing `key`. */
export function weekStart(key) {
  const dow = (parse(key).getUTCDay() + 6) % 7
  return addDays(key, -dow)
}

export const THIS_WEEK = weekStart(TODAY_KEY)

export function dayLabel(key) {
  const d = parse(key)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function weekLabel(startKey) {
  return `${dayLabel(startKey)} – ${dayLabel(addDays(startKey, 6))}`
}

/** 9 -> "9a", 17.5 -> "5:30p" */
export function shortHour(h) {
  const hour24 = Math.floor(h)
  const mins = Math.round((h - hour24) * 60)
  const suffix = hour24 >= 12 && hour24 < 24 ? 'p' : 'a'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return mins ? `${hour12}:${String(mins).padStart(2, '0')}${suffix}` : `${hour12}${suffix}`
}
