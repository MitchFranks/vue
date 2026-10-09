// ---------------------------------------------------------------------------
// Events, their timeline blocks, and the seed assignments.
//
// An event is split into timeline BLOCKS (setup / ceremony / reception / teardown).
// Each block states its staffing requirement (how many of each role). Assignments are held
// separately in the store so they can change at runtime (accept / decline /
// reassign) — coverage is always computed by comparing the block's
// requirement against the assignments that are currently ACCEPTED.
// ---------------------------------------------------------------------------

// Booking lifecycle for an event. Names vary by venue; these are the common ones.
export const BOOKING_STATUSES = ['Inquiry', 'Tentative hold', 'Booked', 'Completed']

// What a timeline block is for. Setup and teardown are internal operations
// phases (load-in / strike); everything else is a guest-facing moment.
export const BLOCK_KINDS = ['setup', 'guest-facing', 'teardown']

// The prototype's frozen "today". Matches venue.today below.
export const TODAY_KEY = '2026-09-17'

export function daysOut(event) {
  const ms = new Date(`${event.dateKey}T00:00:00Z`) - new Date(`${TODAY_KEY}T00:00:00Z`)
  return Math.round(ms / 86400000)
}

export function daysOutLabel(event) {
  const n = daysOut(event)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n < 0) return `${-n} days ago`
  return `${n} days out`
}

export const EVENT_TYPES = [
  'Wedding',
  'Rehearsal Dinner',
  'Engagement Party',
  'Bridal Shower',
  'Birthday',
  'Corporate Event',
  'Anniversary',
  'Graduation',
  'Other'
]

export const venue = {
  name: 'Willow & Stone Events',
  manager: 'Dana Whitcomb',
  managerRole: 'Venue Manager',
  managerInitials: 'DW',
  today: 'Thursday, September 17, 2026',
  todayShort: 'Thu, Sep 17'
}

export const events = [
  {
    id: 'johnson',
    dateKey: '2026-09-19',
    name: 'Johnson Wedding',
    type: 'Wedding',
    couple: 'Emily & Marcus Johnson',
    coupleId: 'johnson-emily',
    date: 'Saturday, September 19, 2026',
    dateShort: 'Sat, Sep 19',
    day: 'Sat',
    guests: 150,
    spaces: 'Garden Terrace · Stone Hall',
    status: '2 days out',
    headline: '4:00 PM ceremony',
    primary: true,
    blocks: [
      {
        id: 'johnson-setup',
        name: 'Setup',
        kind: 'setup',
        start: 9,
        end: 15,
        requirements: [{ role: 'Grounds', count: 2 }],
        note: 'Chairs, tables, floral staging on the Garden Terrace.'
      },
      {
        id: 'johnson-ceremony',
        name: 'Ceremony',
        kind: 'guest-facing',
        start: 15,
        end: 17,
        requirements: [
          { role: 'Venue Manager', count: 1 },
          { role: 'Event Staff', count: 2 }
        ],
        note: 'Guest arrival 3:30 PM, ceremony begins 4:00 PM.'
      },
      {
        id: 'johnson-reception',
        name: 'Reception',
        kind: 'guest-facing',
        start: 17,
        end: 21,
        requirements: [
          { role: 'Event Captain', count: 1 },
          { role: 'Event Staff', count: 2 },
          { role: 'Bartender', count: 1 },
          { role: 'Server', count: 1 }
        ],
        note: 'Stone Hall. Dinner service at 6:00 PM, two bar stations.'
      },
      {
        id: 'johnson-cleanup',
        name: 'Teardown',
        kind: 'teardown',
        start: 21,
        end: 23,
        requirements: [{ role: 'Grounds', count: 2 }, { role: 'Event Staff', count: 1 }],
        note: 'Breakdown and venue close by 11:00 PM.'
      }
    ]
  },
  {
    id: 'taylor',
    dateKey: '2026-09-19',
    name: 'Taylor Engagement Party',
    type: 'Engagement Party',
    couple: 'Rhonda Taylor & Sam Brooks',
    coupleId: 'taylor-rhonda',
    date: 'Saturday, September 19, 2026',
    dateShort: 'Sat, Sep 19',
    day: 'Sat',
    guests: 45,
    spaces: 'Courtyard',
    status: '2 days out',
    headline: '6:00 PM — engagement party',
    blocks: [
      {
        id: 'taylor-setup',
        name: 'Setup',
        kind: 'setup',
        start: 15,
        end: 17.5,
        requirements: [{ role: 'Grounds', count: 1 }],
        note: 'Courtyard string lights and long table.'
      },
      {
        id: 'taylor-reception',
        name: 'Reception',
        kind: 'guest-facing',
        start: 17.5,
        end: 22,
        requirements: [
          { role: 'Event Staff', count: 1 },
          { role: 'Bartender', count: 1 }
        ],
        note: 'Buffet plus open bar.'
      }
    ]
  },
  {
    id: 'shah',
    dateKey: '2026-09-24',
    name: 'Shah–Patel Rehearsal Dinner',
    type: 'Rehearsal Dinner',
    couple: 'Priya Shah & Dev Patel',
    coupleId: 'shah-priya',
    date: 'Thursday, September 24, 2026',
    dateShort: 'Thu, Sep 24',
    day: 'Thu',
    guests: 60,
    spaces: 'Stone Hall',
    status: '7 days out',
    headline: '6:30 PM rehearsal dinner',
    blocks: [
      {
        id: 'shah-setup',
        name: 'Setup',
        kind: 'setup',
        start: 13,
        end: 17,
        requirements: [{ role: 'Grounds', count: 1 }],
        note: 'Slideshow and mic check with the couple at 4:00 PM.'
      },
      {
        id: 'shah-dinner',
        name: 'Dinner',
        kind: 'guest-facing',
        start: 18,
        end: 22,
        requirements: [
          { role: 'Event Captain', count: 1 },
          { role: 'Server', count: 2 }
        ],
        note: 'Three-course seated service.'
      }
    ]
  },
  {
    id: 'martinez',
    dateKey: '2026-10-03',
    name: 'Martinez Wedding Reception',
    type: 'Wedding',
    couple: 'Ana & Diego Martinez',
    coupleId: 'martinez-ana',
    date: 'Saturday, October 3, 2026',
    dateShort: 'Sat, Oct 3',
    day: 'Sat',
    guests: 180,
    spaces: 'Orchard Lawn · Stone Hall',
    status: '16 days out',
    headline: '5:30 PM reception only',
    blocks: [
      {
        id: 'martinez-setup',
        name: 'Setup',
        kind: 'setup',
        start: 10,
        end: 16,
        requirements: [{ role: 'Grounds', count: 2 }],
        note: 'Largest floor plan of the season.'
      },
      {
        id: 'martinez-reception',
        name: 'Reception',
        kind: 'guest-facing',
        start: 17,
        end: 22,
        requirements: [
          { role: 'Venue Manager', count: 1 },
          { role: 'Event Staff', count: 3 },
          { role: 'Bartender', count: 2 }
        ],
        note: 'Two bars, dance floor in Stone Hall.'
      }
    ]
  },
  {
    id: 'chen',
    dateKey: '2026-10-16',
    name: 'Chen–Wu Wedding',
    type: 'Wedding',
    couple: 'Wei Chen & Lian Wu',
    coupleId: 'chen-wei',
    date: 'Friday, October 16, 2026',
    dateShort: 'Fri, Oct 16',
    day: 'Fri',
    guests: 70,
    spaces: 'Garden Terrace',
    status: '29 days out',
    headline: '5:00 PM — intimate garden wedding',
    blocks: [
      {
        id: 'chen-setup',
        name: 'Setup',
        kind: 'setup',
        start: 12,
        end: 16,
        requirements: [{ role: 'Grounds', count: 1 }],
        note: 'Garden Terrace, weather backup in Stone Hall.'
      },
      {
        id: 'chen-reception',
        name: 'Reception',
        kind: 'guest-facing',
        start: 17,
        end: 21,
        requirements: [
          { role: 'Event Staff', count: 2 },
          { role: 'Server', count: 1 }
        ],
        note: 'Family-style dinner.'
      }
    ]
  }
]

export function eventById(id) {
  return events.find((e) => e.id === id) || null
}

export function blockById(segId) {
  for (const event of events) {
    const seg = event.blocks.find((s) => s.id === segId)
    if (seg) return { event, block: seg }
  }
  return null
}

/** Every block across every event, flattened — used by the weekly schedule. */
export function allBlocks() {
  return events.flatMap((event) => event.blocks.map((block) => ({ event, block })))
}

// ---------------------------------------------------------------------------
// Seed assignments. assignment id is `${blockId}:${staffId}`.
//
// The Johnson ceremony is deliberately short-staffed: it needs 2 Event Staff
// and only Jake was assigned — and Jake has DECLINED. That is the scenario the
// whole prototype is built around.
// ---------------------------------------------------------------------------

export const seedAssignments = [
  // ---- Johnson Wedding ----------------------------------------------------
  // THE scenario: the ceremony needs 2 Event Staff. Marisol has accepted and
  // Jake has DECLINED, leaving exactly one open position. Everything else on this event
  // is covered, so the one real problem is easy to see.
  { blockId: 'johnson-setup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { blockId: 'johnson-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },

  { blockId: 'johnson-ceremony', staffId: 'dana', role: 'Venue Manager', status: 'accepted' },
  { blockId: 'johnson-ceremony', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  {
    blockId: 'johnson-ceremony',
    staffId: 'jake',
    role: 'Event Staff',
    status: 'declined',
    declineReason: 'Class until 4:00 PM — cannot make a 3:00 PM call time.'
  },

  { blockId: 'johnson-reception', staffId: 'theo', role: 'Event Captain', status: 'accepted' },
  { blockId: 'johnson-reception', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  { blockId: 'johnson-reception', staffId: 'omar', role: 'Event Staff', status: 'accepted' },
  { blockId: 'johnson-reception', staffId: 'priya', role: 'Bartender', status: 'accepted' },
  { blockId: 'johnson-reception', staffId: 'nina', role: 'Server', status: 'accepted' },
  // One extra person awaiting a reply — shows the "pending" state without
  // creating an open position, because the block is already covered without them.
  { blockId: 'johnson-reception', staffId: 'grace', role: 'Server', status: 'pending' },

  { blockId: 'johnson-cleanup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { blockId: 'johnson-cleanup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { blockId: 'johnson-cleanup', staffId: 'omar', role: 'Event Staff', status: 'accepted' },

  // ---- Taylor Engagement Party (same day as Johnson — a real clash source) --------
  { blockId: 'taylor-setup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { blockId: 'taylor-reception', staffId: 'ben', role: 'Event Staff', status: 'accepted' },
  { blockId: 'taylor-reception', staffId: 'luis', role: 'Bartender', status: 'accepted' },

  // ---- Shah–Patel Rehearsal Dinner: deliberately one Server short (secondary open position) ---------
  { blockId: 'shah-setup', staffId: 'sophie', role: 'Grounds', status: 'draft' },
  { blockId: 'shah-dinner', staffId: 'theo', role: 'Event Captain', status: 'accepted' },
  { blockId: 'shah-dinner', staffId: 'nina', role: 'Server', status: 'draft' },

  // ---- Martinez Reception (fully staffed, further out) --------------------
  { blockId: 'martinez-setup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { blockId: 'martinez-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { blockId: 'martinez-reception', staffId: 'dana', role: 'Venue Manager', status: 'accepted' },
  { blockId: 'martinez-reception', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  { blockId: 'martinez-reception', staffId: 'omar', role: 'Event Staff', status: 'accepted' },
  { blockId: 'martinez-reception', staffId: 'ben', role: 'Event Staff', status: 'accepted' },
  { blockId: 'martinez-reception', staffId: 'priya', role: 'Bartender', status: 'accepted' },
  { blockId: 'martinez-reception', staffId: 'luis', role: 'Bartender', status: 'accepted' },

  // ---- Chen–Wu Wedding (fully staffed) ----------------------------------
  { blockId: 'chen-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { blockId: 'chen-reception', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  { blockId: 'chen-reception', staffId: 'omar', role: 'Event Staff', status: 'accepted' },
  { blockId: 'chen-reception', staffId: 'grace', role: 'Server', status: 'accepted' }
]
