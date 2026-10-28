// ---------------------------------------------------------------------------
// Tasks: due dates, who a task is for, and the Tasks sorts and filters.
//
// Everything here is a pure function of a task record, so the store, the
// event Tasks tab and Tasks all agree on what "due today" or "Johnson
// couple" means.
//
// WHO A TASK IS FOR. A task tags whole couples (`coupleIds`) or single
// contacts (`contactIds`), never both for the same couple. For filtering and
// sorting the two are joined up: a task on the Johnson couple involves Emily
// and Marcus, and a task on Emily alone belongs to the Johnson couple.
// ---------------------------------------------------------------------------

import { eventById, TODAY_KEY } from './mock/events.js'
import { contactById, contactName, contacts, coupleById, couples } from './mock/records.js'
// Vendors come from the venue directory, so ones added in the app can be tagged too.
import { directoryVendorById as vendorById, directoryVendors } from './directory/registry.js'

// Everything on the Tasks page is a task, so a message to answer, a spot to
// fill and a document to sign each carry a type too.
//
// SYSTEM types are the ones the product assigns to the tasks it creates
// itself (a reply to send, a spot to fill, a document to sign, a payment to
// collect). They are locked: renaming or deleting one would orphan those
// tasks. Every other type is the venue's to add, rename and delete on the
// Task types screen, starting from DEFAULT_TASK_TYPES.
export const SYSTEM_TASK_TYPES = ['Message', 'Payment', 'Sign Document', 'Staff']
export const DEFAULT_TASK_TYPES = ['Couple follow-up', 'Other', 'Paperwork', 'Vendor coordination', 'Venue prep']

export const TASK_TYPE_MAX = 40

/** System types and the venue's own, A–Z. */
export function allTaskTypes(editable) {
  return [...SYSTEM_TASK_TYPES, ...editable].sort((a, b) => a.localeCompare(b))
}

/**
 * Why `name` cannot be a task type, or null if it can. `current` is the name
 * being renamed (it may be re-saved with different capitalisation).
 */
export function taskTypeError(name, editable, current = null) {
  const n = name.trim()
  if (!n) return 'Give the type a name.'
  if (n.length > TASK_TYPE_MAX) return `Keep it to ${TASK_TYPE_MAX} characters or fewer.`
  const clash = allTaskTypes(editable).find((t) => t.toLowerCase() === n.toLowerCase() && t !== current)
  if (clash) {
    return SYSTEM_TASK_TYPES.includes(clash)
      ? `"${clash}" is a built-in type and cannot be reused.`
      : `There is already a type called "${clash}".`
  }
  return null
}

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
 * coming week is `warn`, anything later is `info` (not yet in Tasks).
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

// ---- one shape for every item on the Tasks page ---------------------------

/** Couple (and, where the sender is a contact, contact) tags for an event-level item. */
export function eventTags(event, extra = {}) {
  return {
    coupleIds: event?.coupleId ? [event.coupleId] : [],
    contactIds: [],
    vendorIds: [],
    ...extra
  }
}

/** A task record as a list item, the same shape the store derives for messages, spots and the rest. */
export function taskFromRecord(t, extra = {}) {
  const event = eventById(t.eventId)
  return {
    id: `manual:${t.id}`,
    recordId: t.id,
    source: 'manual',
    type: t.type,
    tone: t.dueTone === 'urgent' ? 'urgent' : t.dueTone === 'warn' ? 'warn' : 'info',
    title: t.title,
    what: t.detail,
    why: `${t.due} · owned by ${t.owner}.`,
    eventId: t.eventId,
    eventName: event ? event.name : 'No event',
    meta: `${t.type} · ${t.due}`,
    dueDate: t.dueDate,
    dueTime: t.dueTime,
    due: t.due,
    dueTone: t.dueTone,
    coupleIds: t.coupleIds || [],
    contactIds: t.contactIds || [],
    vendorIds: t.vendorIds || [],
    input: t.input,
    href: `/events/${t.eventId}/tasks`,
    ...extra
  }
}

// ---- options for the pickers, A–Z -----------------------------------------

const az = (a, b) => a.label.localeCompare(b.label)

/** Active vendors, plus any inactive ones in `keep` (already tagged, so they stay visible). */
export const vendorOptions = (keep = []) =>
  directoryVendors()
    .filter((v) => v.status !== 'inactive' || keep.includes(v.id))
    .map((v) => ({ value: v.id, label: v.name }))
    .sort(az)

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

// `ascending` and `descending` are what the direction button says for each sort.
export const TASK_SORTS = [
  { value: 'due', label: 'Due date', ascending: 'Soonest first', descending: 'Latest first' },
  { value: 'contact', label: 'Contact', ascending: 'A–Z', descending: 'Z–A' },
  { value: 'couple', label: 'Couple', ascending: 'A–Z', descending: 'Z–A' },
  { value: 'vendor', label: 'Vendor', ascending: 'A–Z', descending: 'Z–A' },
  { value: 'title', label: 'Task name', ascending: 'A–Z', descending: 'Z–A' }
]

/**
 * Sort `list` by one of TASK_SORTS, ascending or descending, or not at all
 * when `sort` is null. Tasks with
 * nothing to sort on (no vendor, say) always go last, in due order, whichever
 * way the sort runs.
 */
export function sortTasks(list, sort, direction = 'asc') {
  // No sort chosen: leave the list in the order it came in.
  if (!sort) return [...list]
  const flip = direction === 'desc' ? -1 : 1
  const key = SORT_KEYS[sort]
  if (!key) return [...list].sort((a, b) => flip * byDue(a, b))
  return list
    .map((t) => ({ t, k: key(t) }))
    .sort((a, b) => {
      if (a.k === null || b.k === null) return a.k === b.k ? byDue(a.t, b.t) : a.k === null ? 1 : -1
      return flip * (a.k.localeCompare(b.k) || byDue(a.t, b.t))
    })
    .map(({ t }) => t)
}

// ---- who: couples and the people in them ----------------------------------

// A "who" value names either a couple or one contact: "couple:cpl-2001" or
// "contact:con-emily-johnson".
export const whoKey = (kind, id) => `${kind}:${id}`
export const whoSplit = (value) => {
  const i = value.indexOf(':')
  return { kind: value.slice(0, i), id: value.slice(i + 1) }
}

/** A readable name for a who value. */
export function whoLabel(value) {
  const { kind, id } = whoSplit(value)
  return kind === 'couple' ? coupleById(id)?.name : contactName(contactById(id))
}

/**
 * Picker options for choosing couples and contacts, with the rule that makes
 * the choice unambiguous: a couple and one of its own partners are mutually
 * exclusive. A couple already covers both partners, so tagging both would say
 * the same thing twice (and, when tagging a task, read as two different
 * people). Picking one disables the other, with the reason shown.
 *
 * Partners of different couples can be combined freely.
 */
export function whoOptions(selected) {
  const picked = new Set(selected)
  const options = []
  for (const couple of couples) {
    const partnerPicked = couple.contactIds.map(contactById).find((c) => c && picked.has(whoKey('contact', c.id)))
    options.push({
      value: whoKey('couple', couple.id),
      label: couple.name,
      group: 'Couples',
      disabled: !!partnerPicked,
      reason: partnerPicked ? `Remove ${partnerPicked.firstName} to choose the whole couple` : null
    })
  }
  for (const contact of contacts) {
    const couple = coupleById(contact.coupleId)
    const coupleOn = picked.has(whoKey('couple', contact.coupleId))
    options.push({
      value: whoKey('contact', contact.id),
      label: contactName(contact),
      sub: couple?.name,
      group: 'Contacts',
      disabled: coupleOn,
      reason: coupleOn ? `Already included in ${couple.name}` : null
    })
  }
  return options.sort((a, b) => (a.group === b.group ? a.label.localeCompare(b.label) : a.group === 'Couples' ? -1 : 1))
}

/** Split who values into the couple ids and contact ids they name. */
export function splitWho(values) {
  const out = { coupleIds: [], contactIds: [] }
  for (const v of values) {
    const { kind, id } = whoSplit(v)
    ;(kind === 'couple' ? out.coupleIds : out.contactIds).push(id)
  }
  return out
}

// ---- due -------------------------------------------------------------------

// One choice, so "this week" and "on Oct 20" can never contradict each other.
export const DUE_MODES = [
  { value: 'any', label: 'Any time' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'date', label: 'On a date…' }
]

function matchesDue(t, f) {
  switch (f.due) {
    case 'overdue':
      return t.dueDate < TODAY_KEY
    case 'today':
      return t.dueDate === TODAY_KEY
    case 'week':
      return dueThisWeek(t)
    case 'date':
      return !f.dueDate || t.dueDate === f.dueDate
    default:
      return true
  }
}

// ---- filters ---------------------------------------------------------------
//
// Within one filter, several choices are OR (a task of either type). Across
// filters they are AND. Choices that cannot be combined are kept apart by the
// controls themselves: see whoOptions and DUE_MODES, and TaskBoard, which
// disables any choice that would leave nothing to show.

export const EMPTY_TASK_FILTERS = {
  query: '',
  types: [],
  who: [],
  vendorIds: [],
  due: 'any',
  dueDate: '',
  status: 'open'
}

// Completed tasks are just another filter: Status is open (the default),
// completed, or both.
export const STATUS_MODES = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Completed' },
  { value: 'any', label: 'Open and completed' }
]

export function filterTasks(list, f) {
  const q = f.query.trim().toLowerCase()
  const { coupleIds, contactIds } = splitWho(f.who)
  return list.filter(
    (t) =>
      (!q || t.title.toLowerCase().includes(q)) &&
      (f.status === 'any' || (f.status === 'done' ? !!t.done : !t.done)) &&
      (!f.types.length || f.types.includes(t.type)) &&
      matchesDue(t, f) &&
      (!f.who.length ||
        taskCoupleIds(t).some((id) => coupleIds.includes(id)) ||
        taskContactIds(t).some((id) => contactIds.includes(id))) &&
      (!f.vendorIds.length || (t.vendorIds || []).some((id) => f.vendorIds.includes(id)))
  )
}

/** How many filters are narrowing the list. */
export function activeFilterCount(f) {
  return (
    (f.query.trim() ? 1 : 0) +
    (f.types.length ? 1 : 0) +
    (f.who.length ? 1 : 0) +
    (f.vendorIds.length ? 1 : 0) +
    (f.status !== 'open' ? 1 : 0) +
    (f.due !== 'any' && (f.due !== 'date' || f.dueDate) ? 1 : 0)
  )
}
