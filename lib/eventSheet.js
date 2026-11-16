// ---------------------------------------------------------------------------
// The event detail sheet: one live record of everything about an event that
// the staff work from on the day, and a log of every change to it.
//
// Why (post-survey, step 1): every respondent looks event details up again
// and again, and most say information gets lost on the way to the staff. The
// story that sums it up: the cake cutting moved up an hour and nobody told
// the people serving it. So the sheet does two things paper can't:
//
//   CHANGE CAPTURE  every edit is logged as "what changed": field, from, to,
//                   who, when, and an optional reason for the staff.
//   REACH           a change is sent to the staff working the event, and the
//                   sheet tracks who has seen it. Until everyone has, the
//                   manager has a task (lib/store.jsx) and the change stays
//                   highlighted wherever it shows.
//
// The run of show is part of the sheet but is stored where it always was
// (lib/timelineEdits.jsx), so a time moved on the Run of show tab and a time
// moved on the sheet are the same edit, logged the same way (diffRun).
//
// Field ids match the client portal's details (lib/portal.js on the
// client-portal branch: dayOfName, dietary, outsideVendors...), so a couple's
// portal save can be logged here as a change "by the couple" once both land.
//
// Pure functions of plain data. State lives in lib/eventSheetStore.jsx.
// Model notes: docs/EVENT-DETAIL-SHEET.md.
// ---------------------------------------------------------------------------

import { parseClock } from './format.js'

/* -------------------------------------------------------------- fields --- */
// `important` fields count toward "still missing": the staff can't do their
// job well without them. `long` fields are multi-line.

export const SHEET_SECTIONS = [
  {
    id: 'contact',
    title: 'Day-of contact',
    subtitle: 'Who staff go to on the day, instead of looking for the couple.',
    icon: 'phone',
    fields: [
      { id: 'dayOfName', label: 'Name', important: true },
      { id: 'dayOfRole', label: 'Who they are', hint: 'Planner, best friend, parent…' },
      { id: 'dayOfPhone', label: 'Phone', kind: 'tel', important: true }
    ]
  },
  {
    id: 'guests',
    title: 'Guests',
    subtitle: 'Needs the kitchen and floor staff must plan for.',
    icon: 'users',
    fields: [
      { id: 'dietary', label: 'Dietary needs and allergies', kind: 'long', important: true, hint: 'Say which table when it matters.' },
      { id: 'accessibility', label: 'Accessibility needs', kind: 'long' }
    ]
  },
  {
    id: 'food',
    title: 'Food and bar',
    icon: 'list',
    fields: [
      { id: 'menu', label: 'Menu and service', kind: 'long', important: true },
      { id: 'bar', label: 'Bar', kind: 'long' }
    ]
  },
  {
    id: 'layout',
    title: 'Setup and layout',
    icon: 'grid',
    fields: [
      { id: 'ceremonyLayout', label: 'Ceremony', kind: 'long', hint: 'Leave blank if there is no ceremony.' },
      { id: 'receptionLayout', label: 'Reception', kind: 'long', important: true },
      { id: 'rainPlan', label: 'Rain plan', kind: 'long' }
    ]
  },
  {
    id: 'vendors',
    title: 'Outside vendors',
    subtitle: 'Vendors the couple is bringing. Vendors the venue booked are listed above them.',
    icon: 'truck',
    fields: [{ id: 'outsideVendors', label: 'Who, what they do, phone and arrival time', kind: 'long' }]
  },
  {
    id: 'notes',
    title: 'Notes for staff',
    icon: 'info',
    fields: [{ id: 'notes', label: 'Anything else staff should know', kind: 'long' }]
  }
]

export const SHEET_FIELDS = SHEET_SECTIONS.flatMap((s) => s.fields)
const fieldById = Object.fromEntries(SHEET_FIELDS.map((f) => [f.id, f]))
export const sectionById = (id) => SHEET_SECTIONS.find((s) => s.id === id)

export const blankSheet = () => Object.fromEntries(SHEET_FIELDS.map((f) => [f.id, '']))

/** Only what the sheet holds, as trimmed strings. */
export const cleanSheet = (values) => Object.fromEntries(SHEET_FIELDS.map((f) => [f.id, String(values?.[f.id] ?? '').trim()]))

/** A value as people read it. */
export const sheetText = (value) => (String(value ?? '').trim() ? String(value).trim() : 'Not given')

/** Important fields with nothing in them, in sheet order. */
export const missingFields = (values) => SHEET_FIELDS.filter((f) => f.important && !String(values?.[f.id] ?? '').trim())
export const importantCount = SHEET_FIELDS.filter((f) => f.important).length

/* ------------------------------------------------------------- changes --- */
// A change is { key, label, from, to }. `key` says what changed, so two edits
// to the same thing can be merged (fieldKey, runKey).

export const fieldKey = (fieldId) => `field:${fieldId}`
export const runKey = (rowId, part) => `run:${rowId}:${part}`

/** Field changes between two versions of the sheet, in sheet order. */
export function diffSheet(before, after) {
  return SHEET_FIELDS.filter((f) => (before?.[f.id] ?? '') !== (after?.[f.id] ?? '')).map((f) => ({
    key: fieldKey(f.id),
    label: f.label,
    from: sheetText(before?.[f.id]),
    to: sheetText(after?.[f.id])
  }))
}

/**
 * Run-of-show changes between two row lists: a moved time, a changed end,
 * a renamed or re-noted item, an added or removed item. Labelled by the
 * item's name, so "Cake cutting: 8:30 PM → 7:30 PM".
 */
export function diffRun(before = [], after = []) {
  const was = new Map(before.map((r) => [r.id, r]))
  const now = new Map(after.map((r) => [r.id, r]))
  const out = []
  for (const r of after) {
    const old = was.get(r.id)
    const name = r.title || 'Untitled'
    if (!old) {
      out.push({ key: runKey(r.id, 'row'), label: name, from: 'Not on the run of show', to: `Added at ${r.time}` })
      continue
    }
    if (old.title !== r.title) out.push({ key: runKey(r.id, 'title'), label: 'Run of show item renamed', from: old.title || 'Untitled', to: name })
    if (old.time !== r.time) out.push({ key: runKey(r.id, 'time'), label: name, from: old.time, to: r.time })
    if ((old.end || '') !== (r.end || '') && r.needsStaff) out.push({ key: runKey(r.id, 'end'), label: `${name} ends`, from: old.end || 'Not set', to: r.end || 'Not set' })
    if ((old.note || '') !== (r.note || '')) out.push({ key: runKey(r.id, 'note'), label: `${name} note`, from: sheetText(old.note), to: sheetText(r.note) })
  }
  for (const r of before) {
    if (!now.has(r.id)) out.push({ key: runKey(r.id, 'row'), label: r.title || 'Untitled', from: `At ${r.time}`, to: 'Removed' })
  }
  return out
}

/**
 * Two batches of changes as one: the same thing changed twice keeps its first
 * "from" and its last "to", and a change that ends where it started drops out.
 */
export function mergeChanges(first, second) {
  const out = first.map((c) => ({ ...c }))
  for (const c of second) {
    const prev = out.find((x) => x.key === c.key)
    if (prev) Object.assign(prev, { label: c.label, to: c.to })
    else out.push({ ...c })
  }
  return out.filter((c) => c.from !== c.to)
}

/** "Cake cutting: 8:30 PM → 7:30 PM" */
export const changeLine = (c) => `${c.label}: ${c.from} → ${c.to}`

/** One line for a title or a toast: the whole change when it is short, "Bar changed" when it is a paragraph. */
export const changeSummary = (c) => (c.from.length + c.to.length > 40 ? `${c.label} changed` : changeLine(c))

/** "Cake cutting: 8:30 PM → 7:30 PM", or "… and 2 more" when there are several. */
export function entryTitle(entry) {
  const [first, ...rest] = entry.changes
  if (!first) return 'No changes'
  return rest.length ? `${changeSummary(first)} and ${rest.length} more` : changeSummary(first)
}

/* -------------------------------------------------------------- reach ---- */
// An entry is sent to `team` (staff ids at the time) when `notify` is on.
// `seenBy` maps staff id -> when they opened it.

export const notSeenBy = (entry) => (entry.notify ? entry.team.filter((id) => !entry.seenBy?.[id]) : [])
export const seenCount = (entry) => entry.team.filter((id) => entry.seenBy?.[id]).length
export const everyoneSaw = (entry) => notSeenBy(entry).length === 0

/** Entries this person was sent and hasn't opened, oldest first. */
export const unseenBy = (entries, staffId) =>
  entries.filter((e) => e.notify && e.team.includes(staffId) && !e.seenBy?.[staffId]).sort((a, b) => (a.at < b.at ? -1 : 1))

/**
 * The newest change to each thing that someone hasn't seen yet, keyed by
 * change key: what the sheet highlights. For one staff member, pass their id
 * to highlight only what is new to them.
 */
export function freshChanges(entries, staffId = null) {
  const out = {}
  const open = staffId ? unseenBy(entries, staffId) : entries.filter((e) => notSeenBy(e).length > 0)
  for (const e of [...open].sort((a, b) => (a.at < b.at ? -1 : 1))) {
    for (const c of e.changes) out[c.key] = { ...c, at: e.at, by: e.by }
  }
  return out
}

/* ---------------------------------------------------------------- time --- */

/** Keep an item's length when its start time moves (an edited start on the sheet). */
export function shiftEnd(row, newTime) {
  const a = parseClock(row.time)
  const b = parseClock(newTime)
  const end = parseClock(row.end)
  if (a == null || b == null || end == null) return row.end
  const mins = (((end + (b - a)) % 1440) + 1440) % 1440
  const h = Math.floor(mins / 60)
  const m = String(mins % 60).padStart(2, '0')
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
}

/* ---------------------------------------------------------------- seed --- */
// What the sample weddings' sheets hold, and the changes already logged
// against them. `team: null` means "the staff working it", filled in from the
// Staffing Planner when the sheet first loads (lib/eventSheetStore.jsx).

export const SHEET_SEED = {
  'evt-1001': {
    dayOfName: 'Rachel Adeyemi',
    dayOfRole: 'Planner, Lark & Ivy Events',
    dayOfPhone: '(612) 555-0190',
    dietary: "6 vegetarian, 2 gluten-free, 1 severe shellfish allergy (Marcus's uncle, table 9).",
    accessibility: "Emily's grandmother uses a wheelchair: seat her near the Garden Terrace ramp.",
    menu: 'Plated dinner at 6:00 PM: herb chicken or short rib, mushroom risotto for vegetarians. Late-night pretzel bar at 9:30 PM.',
    bar: 'Full bar, two stations. Signature drink: Garden Spritz. Last call 10:15 PM.',
    ceremonyLayout: '150 white chairs in 10 rows, center aisle. Arch under the oak.',
    receptionLayout: '15 rounds of 10, sweetheart table by the windows, dance floor in the center.',
    rainPlan: 'Ceremony moves into Stone Hall. Rachel and Dana decide by 12:00 PM.',
    outsideVendors: 'Juniper Photo Co., photographer, Ana Cruz (612) 555-0734. Arrives 2:00 PM, leaves 8:00 PM.',
    notes: 'Sparkler send-off: we will bring the sparklers.'
  },
  'evt-1002': {
    dayOfName: 'Anika Shah',
    dayOfRole: 'Priya’s sister',
    dayOfPhone: '',
    dietary: '',
    accessibility: '',
    menu: 'Three-course seated dinner, family recipes shared with the caterer.',
    bar: 'No bar. Sparkling water and chai service.',
    ceremonyLayout: '',
    receptionLayout: 'Six long tables in Stone Hall, projector screen on the north wall.',
    rainPlan: '',
    outsideVendors: '',
    notes: 'Slideshow and toasts at 8:30 PM: projector and a handheld mic must be tested by 4:00 PM.'
  }
}

export const SHEET_ENTRY_SEED = [
  {
    id: 'sc-cake',
    eventId: 'evt-1001',
    at: '2026-10-09T17:40',
    by: { name: 'Dana Whitcomb', kind: 'venue' },
    area: 'Run of show',
    changes: [{ key: runKey('tl-cake', 'time'), label: 'Cake cutting', from: '8:30 PM', to: '7:30 PM' }],
    reason: 'Emily changed it in the client portal: their photographer leaves at 8:00 PM.',
    notify: true,
    team: null,
    seenBy: { 'stf-4002': '2026-10-09T18:05', 'stf-4007': '2026-10-09T19:12' }
  },
  {
    id: 'sc-menu',
    eventId: 'evt-1001',
    at: '2026-10-08T11:20',
    by: { name: 'Dana Whitcomb', kind: 'venue' },
    area: 'Food and bar',
    changes: [
      {
        key: fieldKey('menu'),
        label: 'Menu and service',
        from: 'Plated dinner at 6:00 PM: herb chicken or short rib, mushroom risotto for vegetarians.',
        to: 'Plated dinner at 6:00 PM: herb chicken or short rib, mushroom risotto for vegetarians. Late-night pretzel bar at 9:30 PM.'
      }
    ],
    reason: 'The couple added a late-night snack.',
    notify: true,
    team: null,
    seenAll: true
  }
]

export const BY_KIND = { venue: 'Venue', couple: 'Couple', staff: 'Staff' }

/* ------------------------------------------------- the couple's requests --- */
// From the client portal, the couple asks for a run-of-show change and says
// what they expect: move an item, take it out, add one, or something else.
// The venue accepts (the change is applied, logged "by the couple" and sent
// to the staff) or declines with a reply. Waiting requests are tasks.
//
//   { id, eventId, kind: 'move'|'remove'|'add'|'other', rowId, rowTitle,
//     fromTime, toTime, title, note, by, at,
//     status: 'waiting'|'accepted'|'declined', reply, decidedAt }

export const REQUEST_STATUS = {
  waiting: { label: 'Waiting for the venue', tone: 'pending' },
  accepted: { label: 'Accepted', tone: 'done' },
  declined: { label: 'Not possible', tone: 'declined' }
}

/** "Move Cake cutting from 7:30 PM to 7:00 PM", "Add Grandparents' dance at 6:45 PM"... */
export function requestLine(r) {
  if (r.kind === 'move') return `Move ${r.rowTitle} from ${r.fromTime} to ${r.toTime}`
  if (r.kind === 'remove') return `Take ${r.rowTitle} out of the day`
  if (r.kind === 'add') return `Add ${r.title} at ${r.toTime}`
  return r.rowTitle ? `Change ${r.rowTitle}` : 'A change to the day'
}

/**
 * The run of show with a request applied, or null when it can't be applied
 * as asked ('other' is for the venue to work out; a moved or removed item may
 * have gone since). `newRowId` names an added item.
 */
export function applyRequest(rows, r, newRowId) {
  if (r.kind === 'add') return [...rows, { id: newRowId, time: r.toTime, end: null, title: r.title, note: r.note ? `Requested by the couple: ${r.note}` : '', needsStaff: false }]
  const row = rows.find((x) => x.id === r.rowId)
  if (!row) return null
  if (r.kind === 'remove') return rows.filter((x) => x.id !== r.rowId)
  if (r.kind === 'move') return rows.map((x) => (x.id === r.rowId ? { ...x, time: r.toTime, end: x.end ? shiftEnd(x, r.toTime) : x.end } : x))
  return null
}

export const REQUEST_SEED = [
  {
    id: 'rq-grandparents',
    eventId: 'evt-1001',
    kind: 'add',
    rowId: null,
    rowTitle: '',
    fromTime: '',
    toTime: '6:45 PM',
    title: 'Grandparents’ anniversary dance',
    note: 'Marcus’s grandparents celebrate 60 years this month. A short dance before dinner ends; please cue the band.',
    by: 'Emily Johnson',
    at: '2026-10-09T20:15',
    status: 'waiting',
    reply: '',
    decidedAt: null
  }
]
