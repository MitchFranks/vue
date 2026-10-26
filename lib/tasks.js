// ---------------------------------------------------------------------------
// Tasks: due dates, who a task is for, and the Up Next sorts and filters.
//
// Everything here is a pure function of a task record, so the store, the
// event Tasks tab and Up Next all agree on what "due today" or "Johnson
// couple" means.
//
// WHO A TASK IS FOR. A task tags whole couples (`coupleIds`) or single
// contacts (`contactIds`), never both for the same couple. For filtering and
// sorting the two are joined up: a task on the Johnson couple involves Emily
// and Marcus, and a task on Emily alone belongs to the Johnson couple.
// ---------------------------------------------------------------------------

import { TODAY_KEY } from './mock/events.js'
import { contactById, contactName, contacts, coupleById, couples, vendorById, vendors } from './mock/records.js'

export const TASK_TYPES = [
  'Couple follow-up',
  'Vendor coordination',
  'Payment',
  'Paperwork',
  'Venue prep',
  'Staffing',
  'Other'
]

// ---- dates -----------------------------------------------------------------

const DAY_MS = 86400000

function dayIndex(dateKey) {
  return Math.round(new Date(`${dateKey}T00:00:00Z`) / DAY_MS)
}

export function addDays(dateKey, n) {
  return new Date((dayIndex(dateKey) + n) * DAY_MS).toISOString().slice(0, 10)
}

/** "Sun, Oct 11" */
export function shortDate(dateKey) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

/** "17:00" -> "5:00 PM" */
export function timeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Days from the prototype's today to the due date. Negative is overdue. */
export function daysUntilDue(task) {
  return dayIndex(task.dueDate) - dayIndex(TODAY_KEY)
}

/** "This week" is today plus the next six days. */
export const WEEK = { start: TODAY_KEY, end: addDays(TODAY_KEY, 6) }

export function dueThisWeek(task) {
  return task.dueDate >= WEEK.start && task.dueDate <= WEEK.end
}

/**
 * The due text and tone for a task. Overdue and due today are `urgent`, the
 * coming week is `warn`, anything later is `info` (not yet in Up Next).
 */
export function dueInfo(task) {
  if (task.done) {
    return { due: task.completedOn ? `Completed ${task.completedOn}` : 'Completed', dueTone: 'done' }
  }
  const n = daysUntilDue(task)
  const at = task.dueTime ? ` · ${timeLabel(task.dueTime)}` : ''
  if (n < 0) return { due: `Overdue · was due ${shortDate(task.dueDate)}${at}`, dueTone: 'urgent' }
  if (n === 0) return { due: `Due today${at}`, dueTone: 'urgent' }
  if (n === 1) return { due: `Due tomorrow${at}`, dueTone: 'warn' }
  return { due: `Due ${shortDate(task.dueDate)}${at}`, dueTone: n <= 7 ? 'warn' : 'info' }
}

// ---- who a task is for ----------------------------------------------------

const unique = (ids) => [...new Set(ids)]

/** Couples the task involves: those tagged, plus the couple of each tagged contact. */
export function taskCoupleIds(task) {
  return unique([
    ...(task.coupleIds || []),
    ...(task.contactIds || []).map((id) => contactById(id)?.coupleId)
  ]).filter((id) => coupleById(id))
}

/** Contacts the task involves: those tagged, plus both partners of each tagged couple. */
export function taskContactIds(task) {
  return unique([
    ...(task.contactIds || []),
    ...(task.coupleIds || []).flatMap((id) => coupleById(id)?.contactIds || [])
  ]).filter((id) => contactById(id))
}

/** What the card shows: the couples tagged as couples, the contacts tagged on their own. */
export function taskTags(task) {
  return {
    couples: (task.coupleIds || []).map(coupleById).filter(Boolean),
    contacts: (task.contactIds || []).map(contactById).filter(Boolean),
    vendors: (task.vendorIds || []).map(vendorById).filter(Boolean)
  }
}

// ---- options for the pickers, A–Z -----------------------------------------

const az = (a, b) => a.label.localeCompare(b.label)

export const contactOptions = contacts.map((c) => ({ value: c.id, label: contactName(c) })).sort(az)
export const coupleOptions = couples.map((c) => ({ value: c.id, label: c.name })).sort(az)
export const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.name })).sort(az)

// ---- sorts -----------------------------------------------------------------

// Tasks with nothing to sort on (no couple, no vendor) go last, in due order.
const firstName = (names) => [...names].sort((a, b) => a.localeCompare(b))[0] ?? null

const SORT_KEYS = {
  contact: (t) => firstName(taskContactIds(t).map((id) => contactName(contactById(id)))),
  // Couple names are stored alphabetically, so this is the first partner's first name.
  couple: (t) => firstName(taskCoupleIds(t).map((id) => coupleById(id).name)),
  vendor: (t) => firstName(taskVendorNames(t)),
  title: (t) => t.title
}

function taskVendorNames(task) {
  return (task.vendorIds || []).map(vendorById).filter(Boolean).map((v) => v.name)
}

/** By date; within a day, tasks with no time come first, then by time. */
function byDue(a, b) {
  if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
  if (!a.dueTime !== !b.dueTime) return a.dueTime ? 1 : -1
  if (a.dueTime && a.dueTime !== b.dueTime) return a.dueTime < b.dueTime ? -1 : 1
  return a.title.localeCompare(b.title)
}

export const TASK_SORTS = [
  { value: 'due', label: 'Due date' },
  { value: 'contact', label: 'Contact name (A–Z)' },
  { value: 'couple', label: 'Couple name (A–Z)' },
  { value: 'vendor', label: 'Vendor name (A–Z)' },
  { value: 'title', label: 'Task name (A–Z)' }
]

export function sortTasks(list, sort) {
  const key = SORT_KEYS[sort]
  if (!key) return [...list].sort(byDue)
  return list
    .map((t) => ({ t, k: key(t) }))
    .sort((a, b) => {
      if (a.k === null || b.k === null) return a.k === b.k ? byDue(a.t, b.t) : a.k === null ? 1 : -1
      return a.k.localeCompare(b.k) || byDue(a.t, b.t)
    })
    .map(({ t }) => t)
}

// ---- filters ---------------------------------------------------------------

export const EMPTY_TASK_FILTERS = {
  dueDate: '',
  thisWeek: false,
  contactId: '',
  coupleId: '',
  vendorId: '',
  query: '',
  type: '',
  showDone: false
}

export function filterTasks(list, f) {
  const q = f.query.trim().toLowerCase()
  return list.filter(
    (t) =>
      (f.showDone || !t.done) &&
      (!f.dueDate || t.dueDate === f.dueDate) &&
      (!f.thisWeek || dueThisWeek(t)) &&
      (!f.contactId || taskContactIds(t).includes(f.contactId)) &&
      (!f.coupleId || taskCoupleIds(t).includes(f.coupleId)) &&
      (!f.vendorId || (t.vendorIds || []).includes(f.vendorId)) &&
      (!q || t.title.toLowerCase().includes(q)) &&
      (!f.type || t.type === f.type)
  )
}

/** How many filters are narrowing the list (showDone widens it, so it does not count). */
export function activeFilterCount(f) {
  return ['dueDate', 'thisWeek', 'contactId', 'coupleId', 'vendorId', 'query', 'type'].filter((k) =>
    typeof f[k] === 'string' ? f[k].trim() : f[k]
  ).length
}
