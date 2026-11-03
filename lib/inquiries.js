// ---------------------------------------------------------------------------
// Client inquiries: what a potential client can ask for from the public form
// (/inquire), and how each request reads as a task in Tasks.
//
// Pure functions of an inquiry record, so the client form, the store (which
// turns every new inquiry into a task) and the inquiry detail screen all
// agree on the wording. Spec: docs/INQUIRY-FLOW-SPEC.md.
//
// An inquiry is not a CRM lead (BACKLOG X-07): it is a task with the client's
// details attached, done once the manager has dealt with it.
// ---------------------------------------------------------------------------

import { timeLabel } from './format.js'
import { TODAY_KEY } from './mock/events.js'

export const INQUIRY_KINDS = [
  {
    value: 'walkthrough',
    label: 'Schedule a walkthrough',
    blurb: 'See the spaces in person.',
    icon: 'home',
    next: "We'll confirm a time for your walkthrough."
  },
  {
    value: 'quote',
    label: 'Ask for a quote',
    blurb: 'Get pricing for your date and guest count.',
    icon: 'dollar',
    next: "We'll send pricing for your date and guest count."
  },
  {
    value: 'services',
    label: 'Ask about services',
    blurb: 'Catering, bar, rentals and more.',
    icon: 'info',
    next: "We'll answer your question about our services."
  },
  {
    value: 'call',
    label: 'Schedule a call or virtual tour',
    blurb: 'Talk it through, or see the venue on video.',
    icon: 'phone',
    next: "We'll confirm a time for your call."
  }
]

export const kindOf = (value) => INQUIRY_KINDS.find((k) => k.value === value) || null

export const SERVICES = [
  { value: 'catering', label: 'In-house catering' },
  { value: 'bar', label: 'Bar service' },
  { value: 'coordination', label: 'Day-of coordination' },
  { value: 'rentals', label: 'Rentals (tables, chairs, linens)' },
  { value: 'av', label: 'AV and sound' },
  { value: 'rehearsal', label: 'Rehearsal dinner' },
  { value: 'overnight', label: 'Overnight stay' }
]
const serviceLabels = (values = []) => values.map((v) => SERVICES.find((s) => s.value === v)?.label || v)

// The time a booking modal suggests for each part of the day.
export const TIMES_OF_DAY = [
  { value: 'Morning', time: '10:00' },
  { value: 'Afternoon', time: '14:00' },
  { value: 'Evening', time: '17:00' }
]
export const suggestedTime = (timeOfDay) => TIMES_OF_DAY.find((t) => t.value === timeOfDay)?.time || '10:00'

export const CONTACT_PREFS = ['Email', 'Phone', 'Text']

export const CALL_FORMATS = [
  { value: 'phone', label: 'Phone call' },
  { value: 'video', label: 'Video tour' }
]
const formatLabel = (value) => CALL_FORMATS.find((f) => f.value === value)?.label || 'Call'

// The same check the directory forms use (lib/directory/model.js).
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const QUESTION_MIN = 10
export const QUESTION_MAX = 1000

/** Everything the form can collect. Fields a kind doesn't use stay blank and are dropped on submit. */
export function blankInquiry(kind = '') {
  return {
    kind,
    name: '',
    partnerName: '',
    email: '',
    phone: '',
    contactPref: 'Email',
    // walkthrough and call
    preferredDate: '',
    timeOfDay: '',
    // walkthrough
    backupDate: '',
    attendees: '2',
    // call
    format: '',
    // quote
    eventType: 'Wedding',
    eventDate: '',
    flexible: false,
    month: '',
    guests: '',
    // quote and services
    services: [],
    // services
    question: '',
    message: ''
  }
}

// The fields each kind keeps on submit, after the shared "About you" ones.
const KIND_FIELDS = {
  walkthrough: ['preferredDate', 'timeOfDay', 'backupDate', 'attendees', 'message'],
  quote: ['eventType', 'eventDate', 'flexible', 'month', 'guests', 'services', 'message'],
  services: ['services', 'question', 'eventDate'],
  call: ['format', 'preferredDate', 'timeOfDay', 'message']
}
const ABOUT_FIELDS = ['name', 'partnerName', 'email', 'phone', 'contactPref']

/** Only what the chosen kind asks for, trimmed. */
export function cleanInquiry(values) {
  const out = { kind: values.kind }
  for (const f of [...ABOUT_FIELDS, ...(KIND_FIELDS[values.kind] || [])]) {
    const v = values[f]
    out[f] = typeof v === 'string' ? v.trim() : v
  }
  if (values.kind === 'quote') {
    if (out.flexible) out.eventDate = ''
    else out.month = ''
  }
  return out
}

/**
 * Per-field error messages for the form, keyed by field name, in the order
 * the fields appear (so the first error is the first one focused).
 */
export function validateInquiry(v) {
  const needPhone = v.contactPref !== 'Email' || (v.kind === 'call' && v.format === 'phone')
  // Built in field order: about you, then the kind's own fields.
  const out = {}
  if (!v.name.trim()) out.name = 'Enter your name.'
  if (!v.email.trim()) out.email = 'Enter your email.'
  else if (!EMAIL.test(v.email.trim())) out.email = 'Enter an email like name@example.com.'
  if (needPhone && !v.phone.trim()) {
    out.phone =
      v.kind === 'call' && v.format === 'phone' ? 'Enter a phone number so we can call you.' : `Enter a phone number, or choose Email.`
  } else if (v.phone.trim() && v.phone.replace(/\D/g, '').length < 7) {
    out.phone = 'Enter a phone number like (612) 555-0123.'
  }

  const futureDate = (field, label, required) => {
    if (!v[field]) {
      if (required) out[field] = `Choose ${label}.`
    } else if (v[field] < TODAY_KEY) {
      out[field] = 'Choose today or a later date.'
    }
  }

  if (v.kind === 'call' && !v.format) out.format = 'Choose a phone call or a video tour.'
  if (v.kind === 'walkthrough' || v.kind === 'call') {
    futureDate('preferredDate', 'a date', true)
    if (!v.timeOfDay) out.timeOfDay = 'Choose a time of day.'
  }
  if (v.kind === 'walkthrough') {
    futureDate('backupDate', 'a backup date', false)
    if (!out.backupDate && v.backupDate && v.backupDate === v.preferredDate) out.backupDate = 'Choose a different day from your first choice.'
    const n = Number(v.attendees)
    if (!Number.isInteger(n) || n < 1 || n > 6) out.attendees = 'Choose between 1 and 6 people.'
  }
  if (v.kind === 'quote') {
    if (!v.flexible) futureDate('eventDate', 'your event date, or tick "We\'re flexible"', true)
    const g = Number(v.guests)
    if (!v.guests) out.guests = 'Enter about how many guests.'
    else if (!Number.isInteger(g) || g < 1 || g > 500) out.guests = 'Enter a number from 1 to 500.'
  }
  if (v.kind === 'services') {
    if (!v.services.length) out.services = 'Choose at least one service.'
    const q = v.question.trim()
    if (!q) out.question = 'Enter your question.'
    else if (q.length < QUESTION_MIN) out.question = `Tell us a little more (at least ${QUESTION_MIN} characters).`
    else if (q.length > QUESTION_MAX) out.question = `Keep it to ${QUESTION_MAX} characters or fewer.`
    futureDate('eventDate', 'a date', false)
  }
  return out
}

// ---- wording ---------------------------------------------------------------

/** "Sat, Oct 17", with the year only when it isn't this year. */
export function dateLabel(dateKey) {
  if (!dateKey) return ''
  const sameYear = dateKey.slice(0, 4) === TODAY_KEY.slice(0, 4)
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC'
  })
}

/** "June 2027" from a month input value ("2027-06"). */
export function monthLabel(month) {
  if (!month) return ''
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** "Jordan Ellis & Sam Okafor", or just the one name. */
export const clientNames = (inq) => [inq.name, inq.partnerName].filter(Boolean).join(' & ')

const listLabel = (values) =>
  serviceLabels(values)
    .map((s) => s.replace(/ \(.*\)$/, '').toLowerCase())
    .join(', ')

const clip = (text, n = 120) => (text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text)

function quoteWhen(inq) {
  if (inq.eventDate) return dateLabel(inq.eventDate)
  return inq.month ? `${monthLabel(inq.month)} (flexible)` : 'Date flexible'
}

/** The open task's title: what the manager has to do. */
export function inquiryTaskTitle(inq) {
  switch (inq.kind) {
    case 'walkthrough':
      return `Confirm a walkthrough with ${inq.name}`
    case 'quote':
      return `Send a quote to ${inq.name}`
    case 'services':
      return `Answer ${inq.name}'s question`
    case 'call':
      return `Set up a ${inq.format === 'video' ? 'video tour' : 'phone call'} with ${inq.name}`
    default:
      return `Reply to ${inq.name}`
  }
}

/** The open task's description: what they asked for, in one line. */
export function inquiryTaskWhat(inq) {
  switch (inq.kind) {
    case 'walkthrough': {
      const backup = inq.backupDate ? ` (backup ${dateLabel(inq.backupDate)})` : ''
      const people = Number(inq.attendees) === 1 ? '1 person' : `${inq.attendees} people`
      return `Asked for ${dateLabel(inq.preferredDate)} · ${inq.timeOfDay}${backup}. ${people}.`
    }
    case 'quote': {
      const services = inq.services.length ? ` Interested in ${listLabel(inq.services)}.` : ''
      return `${inq.eventType} · ${quoteWhen(inq)} · ${inq.guests} guests.${services}`
    }
    case 'services':
      return `"${clip(inq.question)}"`
    case 'call':
      return `Asked for ${dateLabel(inq.preferredDate)} · ${inq.timeOfDay}.`
    default:
      return ''
  }
}

export const INQUIRY_WHY = "New inquiry. Reply within one business day so the date doesn't go elsewhere."

/** The completed task's title: what was done. */
export function inquiryDoneTitle(inq) {
  if (inq.status === 'closed') return `Closed ${inq.name}'s inquiry`
  switch (inq.kind) {
    case 'walkthrough':
      return `Booked a walkthrough with ${inq.name}`
    case 'quote':
      return `Sent a quote to ${inq.name}`
    case 'services':
      return `Answered ${inq.name}'s question`
    case 'call':
      return `Booked a ${inq.format === 'video' ? 'video tour' : 'phone call'} with ${inq.name}`
    default:
      return `Replied to ${inq.name}`
  }
}

/** The status word for the detail screen and its badge tone. */
export function inquiryStatus(inq) {
  if (inq.status === 'done') return { label: 'Done', tone: 'done' }
  if (inq.status === 'closed') return { label: 'Closed', tone: 'info' }
  return { label: 'New', tone: 'urgent' }
}

/**
 * Everything the client told us, as [label, value] rows, for the review step
 * and the detail screen. Empty optional fields are left out.
 */
export function inquiryRows(inq) {
  const rows = [['Request', kindOf(inq.kind)?.label]]
  if (inq.kind === 'call') rows.push(['Format', formatLabel(inq.format)])
  if (inq.kind === 'walkthrough' || inq.kind === 'call') {
    rows.push(['Preferred date', `${dateLabel(inq.preferredDate)} · ${inq.timeOfDay}`])
  }
  if (inq.kind === 'walkthrough') {
    if (inq.backupDate) rows.push(['Backup date', dateLabel(inq.backupDate)])
    rows.push(['People coming', String(inq.attendees)])
  }
  if (inq.kind === 'quote') {
    rows.push(['Type of event', inq.eventType], ['Event date', quoteWhen(inq)], ['Estimated guests', String(inq.guests)])
  }
  if ((inq.kind === 'quote' || inq.kind === 'services') && inq.services?.length) rows.push(['Services', serviceLabels(inq.services).join(', ')])
  if (inq.kind === 'services' && inq.eventDate) rows.push(['Event date', dateLabel(inq.eventDate)])
  if (inq.kind === 'services') rows.push(['Question', inq.question])
  if (inq.message) rows.push(['Message', inq.message])
  return rows.filter(([, value]) => value)
}

/** About-you rows for the review step. */
export function aboutRows(inq) {
  return [
    ['Name', inq.name],
    ['Partner', inq.partnerName],
    ['Email', inq.email],
    ['Phone', inq.phone],
    ['Best way to reach you', inq.contactPref]
  ].filter(([, value]) => value)
}

// ---- after the manager acts --------------------------------------------------

export const inquiryHref = (id) => `/inquiries/view?id=${encodeURIComponent(id)}`

/** Kinds where the manager books a time, which also adds a dated task. */
export const BOOKS_A_TIME = ['walkthrough', 'call']

/** The task a booked walkthrough or call adds to Tasks, in the manual-task shape. */
export function bookedTask(inq, { date, time }) {
  const what = inq.kind === 'walkthrough' ? 'Walkthrough' : inq.format === 'video' ? 'Video tour' : 'Call'
  const how =
    inq.kind === 'call' && inq.format === 'phone'
      ? `Call ${inq.phone}.`
      : inq.kind === 'call'
        ? `Send a video link to ${inq.email}.`
        : `${inq.attendees} ${Number(inq.attendees) === 1 ? 'person' : 'people'} coming.`
  return {
    eventId: null,
    inquiryId: inq.id,
    title: `${what} with ${clientNames(inq)}`,
    type: inq.kind === 'walkthrough' ? 'Venue prep' : 'Couple follow-up',
    dueDate: date,
    dueTime: time || null,
    detail: `${how} Booked from their inquiry.`,
    contactIds: [],
    coupleIds: [],
    vendorIds: []
  }
}

/** The outcome line saved on the inquiry when the manager deals with it. */
export function outcomeLabel(inq, { date, time, amount } = {}) {
  switch (inq.kind) {
    case 'walkthrough':
    case 'call': {
      const what = inq.kind === 'walkthrough' ? 'Walkthrough' : inq.format === 'video' ? 'Video tour' : 'Call'
      return `${what} booked for ${dateLabel(date)}${time ? ` at ${timeLabel(time)}` : ''}.`
    }
    case 'quote':
      return amount ? `Quote of ${amount} sent.` : 'Quote sent.'
    case 'services':
      return 'Question answered.'
    default:
      return 'Done.'
  }
}

/** Dollars as typed ("12,500" or "$12500") to "$12,500", or '' if it isn't a number. */
export function moneyInput(text) {
  const n = Number(String(text).replace(/[$,\s]/g, ''))
  if (!text || !Number.isFinite(n) || n <= 0) return ''
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 })
}
