// ---------------------------------------------------------------------------
// Client portal: the couple's one place to sign, pay, fill in their details
// and book a meeting, and the record the venue reads back.
//
// Why (user-test survey): every manager looks event details up again and
// again, and most say information gets lost between the couple, the manager
// and the staff. Chasing couples for signatures, payments and answers is the
// work they would hand off first. The portal moves that to the couple, and
// every answer lands in one record.
//
// Pure functions of plain data, so the couple's pages, the couple record and
// Tasks all agree. State lives in lib/store.jsx (state.portal). Model notes:
// docs/CLIENT-PORTAL.md.
// ---------------------------------------------------------------------------

import { dateLabel } from './inquiries.js'
import { fromInputValue, timeLabel } from './format.js'
import { TODAY_KEY } from './mock/events.js'

/** The couple's private link. A real build would use an unguessable token, not the couple id. */
export const portalHref = (coupleId) => `/portal?c=${encodeURIComponent(coupleId)}`

/* ------------------------------------------------------------- details --- */
// What the couple tells the venue. Grouped as the form shows them; `kind`
// decides the input and how a value reads in the record and the change log.

export const DETAIL_GROUPS = [
  {
    id: 'day',
    title: 'Your day',
    subtitle: 'Your best estimate is fine. You can change these until the week of the event.',
    icon: 'calendar',
    fields: [
      { id: 'guestCount', label: 'Guest count', kind: 'number', hint: 'Adults and children.' },
      { id: 'childCount', label: 'Children under 12', kind: 'number', hint: 'Optional.' }
    ]
  },
  {
    id: 'moments',
    title: 'Key moments',
    subtitle: 'The times the staff, kitchen and vendors work to. Leave any you are not having blank.',
    icon: 'clock',
    fields: [
      { id: 'grandEntrance', label: 'Grand entrance', kind: 'time' },
      { id: 'firstDance', label: 'First dance', kind: 'time' },
      { id: 'cakeCutting', label: 'Cake cutting', kind: 'time' },
      { id: 'sendOff', label: 'Send-off', kind: 'time' }
    ]
  },
  {
    id: 'contact',
    title: 'Day-of contact',
    subtitle: 'Who the staff should go to on the day, so they are not looking for you.',
    icon: 'user',
    fields: [
      { id: 'dayOfName', label: 'Name', kind: 'text' },
      { id: 'dayOfRole', label: 'Who they are', kind: 'text', hint: 'Planner, maid of honor, parent…' },
      { id: 'dayOfPhone', label: 'Phone', kind: 'tel' }
    ]
  },
  {
    id: 'guests',
    title: 'Your guests',
    icon: 'users',
    fields: [
      { id: 'dietary', label: 'Dietary needs and allergies', kind: 'long', hint: 'For example: 3 vegetarian, 1 severe nut allergy (table 4).' },
      { id: 'accessibility', label: 'Accessibility needs', kind: 'long', hint: 'Optional. Wheelchair access, seating near an exit…' }
    ]
  },
  {
    id: 'vendors',
    title: 'Your vendors and anything else',
    icon: 'truck',
    fields: [
      { id: 'outsideVendors', label: 'Vendors you are bringing', kind: 'long', hint: 'Name, what they do and a phone number. For example: Lens & Light, photographer, (555) 555-0100.' },
      { id: 'notes', label: 'Anything else we should know', kind: 'long', hint: 'Optional.' }
    ]
  }
]

export const DETAIL_FIELDS = DETAIL_GROUPS.flatMap((g) => g.fields)
const fieldById = Object.fromEntries(DETAIL_FIELDS.map((f) => [f.id, f]))

/** A stored value as people read it: "7:30 PM", "64", or "Not given". */
export function detailText(fieldId, value) {
  if (value == null || String(value).trim() === '') return 'Not given'
  return fieldById[fieldId]?.kind === 'time' ? timeLabel(value) : String(value).trim()
}

export const blankDetails = () => Object.fromEntries(DETAIL_FIELDS.map((f) => [f.id, '']))

/** Only what the form can hold, as trimmed strings. */
export const cleanDetails = (values) => Object.fromEntries(DETAIL_FIELDS.map((f) => [f.id, String(values[f.id] ?? '').trim()]))

/** What changed between two saves: [{ field, label, from, to }] in form order. */
export function diffDetails(before, after) {
  return DETAIL_FIELDS.filter((f) => (before?.[f.id] ?? '') !== (after?.[f.id] ?? '')).map((f) => ({
    field: f.id,
    label: f.label,
    from: detailText(f.id, before?.[f.id]),
    to: detailText(f.id, after?.[f.id])
  }))
}

/** "Cake cutting: 8:30 PM → 7:30 PM" */
export const changeLine = (c) => `${c.label}: ${c.from} → ${c.to}`

export function validateDetails(v) {
  const errors = {}
  for (const id of ['guestCount', 'childCount']) {
    const n = v[id]
    if (n !== '' && (!/^\d+$/.test(n) || Number(n) > 2000)) errors[id] = 'Enter a whole number.'
  }
  if (!String(v.guestCount).trim()) errors.guestCount = 'Enter your guest count, even a rough one.'
  if (v.dayOfName && !v.dayOfPhone) errors.dayOfPhone = 'Add a phone number so staff can reach them.'
  return errors
}

/* ------------------------------------------------------------ meetings --- */

export const MEETING_KINDS = [
  { value: 'walkthrough', label: 'Final walkthrough', blurb: 'Walk the spaces with us and settle the layout.', minutes: 60 },
  { value: 'planning', label: 'Planning meeting', blurb: 'Go through the timeline, vendors and details at the venue.', minutes: 60 },
  { value: 'call', label: 'Phone or video call', blurb: 'A quick check-in from wherever you are.', minutes: 30 }
]
export const meetingKind = (value) => MEETING_KINDS.find((k) => k.value === value) || null

// The venue's open meeting times (a real build would read the manager's calendar).
export const MEETING_TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((t) => ({ value: t, label: timeLabel(t) }))

export const meetingWhen = (m) => `${dateLabel(m.dateKey)} at ${timeLabel(m.time)}`

export function validateMeeting(v) {
  const errors = {}
  if (!v.kind) errors.kind = 'Choose what kind of meeting.'
  if (!v.dateKey) errors.dateKey = 'Choose a date.'
  else if (v.dateKey <= TODAY_KEY) errors.dateKey = 'Choose a date after today.'
  if (!v.time) errors.time = 'Choose a time.'
  return errors
}

/* ----------------------------------------------------------- signatures --- */

export function validateSignature(v, expectedNames) {
  const errors = {}
  const name = String(v.name || '').trim().toLowerCase()
  if (!name) errors.name = 'Type your full name to sign.'
  else if (!expectedNames.some((n) => n.toLowerCase() === name)) errors.name = `Type your name as it appears on the agreement: ${expectedNames.join(' or ')}.`
  if (!v.agree) errors.agree = 'Tick the box to confirm you agree.'
  return errors
}

/* -------------------------------------------------------------- summary --- */

/**
 * The four things the portal asks of a couple, with where each stands. Shared
 * by the portal's checklist and the couple record, so both say the same.
 *   docs     the event's documents that need the couple (signer: 'couple')
 *   plan     paymentsForEvent(eventId)
 *   record   state.portal[coupleId]
 */
export function portalSteps({ docs = [], plan, record = {} }) {
  const toSign = docs.filter((d) => d.signer === 'couple' && d.tone !== 'done')
  const signed = docs.filter((d) => d.signer === 'couple' && d.tone === 'done')
  const due = plan ? plan.schedule.filter((p) => p.state === 'due') : []
  const balance = plan ? plan.total - plan.paid : 0
  const meeting = record.meeting
  return [
    {
      id: 'sign',
      label: 'Sign your agreements',
      done: toSign.length === 0,
      status: toSign.length ? `${toSign.length} waiting for your signature` : signed.length ? 'All signed' : 'Nothing to sign',
      tone: toSign.length ? 'warn' : 'done'
    },
    {
      id: 'pay',
      label: 'Make a payment',
      done: due.length === 0,
      status: !plan ? 'No payments set up' : due.length ? `${money(due.reduce((n, p) => n + p.amount, 0))} due now` : balance > 0 ? `${money(balance)} scheduled later` : 'Paid in full',
      tone: due.length ? 'warn' : 'done'
    },
    {
      id: 'details',
      label: 'Fill in your details',
      done: !!record.details,
      status: record.details ? `Sent ${stamp(record.detailsAt)}` : 'Not sent yet',
      tone: record.details ? 'done' : 'warn'
    },
    {
      id: 'meeting',
      label: 'Book a meeting',
      done: !!meeting,
      status: meeting ? `${meetingKind(meeting.kind)?.label}, ${meetingWhen(meeting)}` : 'Not booked',
      tone: meeting ? 'done' : 'pending'
    }
  ]
}

const money = (n) => `$${n.toLocaleString('en-US')}`

/** An ISO time or "2026-10-10" -> "Oct 10". Seeds use date keys; the portal writes ISO times. */
export function stamp(at) {
  if (!at) return ''
  const key = at.slice(0, 10)
  return dateLabel(key).replace(/^\w+, /, '')
}

/** "2026-10-10" + 7 -> "2026-10-17" */
export function addDaysKey(dateKey, days) {
  const d = new Date(`${dateKey}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** A couple's portal signature on a document, from any couple's record, or null. */
export function portalSignature(portal = {}, docId) {
  for (const r of Object.values(portal || {})) if (r?.signatures?.[docId]) return r.signatures[docId]
  return null
}

/** The prototype's "now": the frozen demo date at the current clock time, as an ISO string. */
export function portalNow() {
  const t = new Date().toTimeString().slice(0, 5)
  return `${TODAY_KEY}T${t}`
}

export const atLabel = (at) => `${stamp(at)}${at?.length > 10 ? `, ${fromInputValue(at.slice(11, 16))}` : ''}`
