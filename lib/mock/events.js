// ---------------------------------------------------------------------------
// Events, their segments, and the seed shift assignments.
//
// An event is split into SEGMENTS (setup / ceremony / reception / cleanup).
// Each segment states how many of each role it requires. Assignments are held
// separately in the store so they can change at runtime (accept / decline /
// reassign) — coverage is always computed by comparing the segment's
// requirement against the assignments that are currently ACCEPTED.
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  'Wedding',
  'Ceremony',
  'Reception',
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
    client: 'Emily & Marcus Johnson',
    clientId: 'johnson-emily',
    date: 'Saturday, September 19, 2026',
    dateShort: 'Sat, Sep 19',
    day: 'Sat',
    guests: 150,
    spaces: 'Garden Terrace · Stone Hall',
    status: '2 days out',
    headline: '4:00 PM ceremony',
    primary: true,
    segments: [
      {
        id: 'johnson-setup',
        name: 'Setup',
        start: 9,
        end: 15,
        needs: [{ role: 'Grounds', count: 2 }],
        note: 'Chairs, tables, floral staging on the Garden Terrace.'
      },
      {
        id: 'johnson-ceremony',
        name: 'Ceremony',
        start: 15,
        end: 17,
        needs: [
          { role: 'Manager', count: 1 },
          { role: 'Event Staff', count: 2 }
        ],
        note: 'Guest arrival 3:30 PM, ceremony begins 4:00 PM.'
      },
      {
        id: 'johnson-reception',
        name: 'Reception',
        start: 17,
        end: 21,
        needs: [
          { role: 'Manager', count: 1 },
          { role: 'Event Staff', count: 2 },
          { role: 'Bartender', count: 1 },
          { role: 'Server', count: 1 }
        ],
        note: 'Stone Hall. Dinner service at 6:00 PM, two bar stations.'
      },
      {
        id: 'johnson-cleanup',
        name: 'Cleanup',
        start: 21,
        end: 23,
        needs: [{ role: 'Grounds', count: 2 }, { role: 'Event Staff', count: 1 }],
        note: 'Breakdown and venue close by 11:00 PM.'
      }
    ]
  },
  {
    id: 'taylor',
    dateKey: '2026-09-19',
    name: 'Taylor Birthday Party',
    type: 'Birthday',
    client: 'Rhonda Taylor',
    clientId: 'taylor-rhonda',
    date: 'Saturday, September 19, 2026',
    dateShort: 'Sat, Sep 19',
    day: 'Sat',
    guests: 45,
    spaces: 'Courtyard',
    status: '2 days out',
    headline: '6:00 PM — 40th birthday',
    segments: [
      {
        id: 'taylor-setup',
        name: 'Setup',
        start: 15,
        end: 17.5,
        needs: [{ role: 'Grounds', count: 1 }],
        note: 'Courtyard string lights and long table.'
      },
      {
        id: 'taylor-reception',
        name: 'Reception',
        start: 17.5,
        end: 22,
        needs: [
          { role: 'Event Staff', count: 1 },
          { role: 'Bartender', count: 1 }
        ],
        note: 'Buffet plus open bar.'
      }
    ]
  },
  {
    id: 'acme',
    dateKey: '2026-09-24',
    name: 'Acme Company Dinner',
    type: 'Corporate Event',
    client: 'Acme Industrial · Priya Shah',
    clientId: 'acme-priya',
    date: 'Thursday, September 24, 2026',
    dateShort: 'Thu, Sep 24',
    day: 'Thu',
    guests: 60,
    spaces: 'Stone Hall',
    status: '7 days out',
    headline: '6:30 PM seated dinner',
    segments: [
      {
        id: 'acme-setup',
        name: 'Setup',
        start: 13,
        end: 17,
        needs: [{ role: 'Grounds', count: 1 }],
        note: 'AV check with their presenter at 4:00 PM.'
      },
      {
        id: 'acme-dinner',
        name: 'Reception',
        start: 18,
        end: 22,
        needs: [
          { role: 'Manager', count: 1 },
          { role: 'Server', count: 2 }
        ],
        note: 'Three-course seated service.'
      }
    ]
  },
  {
    id: 'martinez',
    dateKey: '2026-10-03',
    name: 'Martinez Reception',
    type: 'Reception',
    client: 'Ana & Diego Martinez',
    clientId: 'martinez-ana',
    date: 'Saturday, October 3, 2026',
    dateShort: 'Sat, Oct 3',
    day: 'Sat',
    guests: 180,
    spaces: 'Orchard Lawn · Stone Hall',
    status: '16 days out',
    headline: '5:30 PM reception only',
    segments: [
      {
        id: 'martinez-setup',
        name: 'Setup',
        start: 10,
        end: 16,
        needs: [{ role: 'Grounds', count: 2 }],
        note: 'Largest floor plan of the season.'
      },
      {
        id: 'martinez-reception',
        name: 'Reception',
        start: 17,
        end: 22,
        needs: [
          { role: 'Manager', count: 1 },
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
    name: 'Chen Anniversary',
    type: 'Anniversary',
    client: 'Wei & Lian Chen',
    clientId: 'chen-wei',
    date: 'Friday, October 16, 2026',
    dateShort: 'Fri, Oct 16',
    day: 'Fri',
    guests: 70,
    spaces: 'Garden Terrace',
    status: '29 days out',
    headline: '5:00 PM — 40th anniversary',
    segments: [
      {
        id: 'chen-setup',
        name: 'Setup',
        start: 12,
        end: 16,
        needs: [{ role: 'Grounds', count: 1 }],
        note: 'Garden Terrace, weather backup in Stone Hall.'
      },
      {
        id: 'chen-reception',
        name: 'Reception',
        start: 17,
        end: 21,
        needs: [
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

export function segmentById(segId) {
  for (const event of events) {
    const seg = event.segments.find((s) => s.id === segId)
    if (seg) return { event, segment: seg }
  }
  return null
}

/** Every segment across every event, flattened — used by the weekly schedule. */
export function allSegments() {
  return events.flatMap((event) => event.segments.map((segment) => ({ event, segment })))
}

// ---------------------------------------------------------------------------
// Seed assignments. shiftId is `${segmentId}:${staffId}`.
//
// The Johnson ceremony is deliberately short-staffed: it needs 2 Event Staff
// and only Jake was assigned — and Jake has DECLINED. That is the scenario the
// whole prototype is built around.
// ---------------------------------------------------------------------------

export const seedAssignments = [
  // ---- Johnson Wedding ----------------------------------------------------
  // THE scenario: the ceremony needs 2 Event Staff. Marisol has accepted and
  // Jake has DECLINED, leaving exactly one gap. Everything else on this event
  // is covered, so the one real problem is easy to see.
  { segmentId: 'johnson-setup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { segmentId: 'johnson-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },

  { segmentId: 'johnson-ceremony', staffId: 'dana', role: 'Manager', status: 'accepted' },
  { segmentId: 'johnson-ceremony', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  {
    segmentId: 'johnson-ceremony',
    staffId: 'jake',
    role: 'Event Staff',
    status: 'declined',
    declineReason: 'Class until 4:00 PM — cannot make a 3:00 PM call time.'
  },

  { segmentId: 'johnson-reception', staffId: 'theo', role: 'Manager', status: 'accepted' },
  { segmentId: 'johnson-reception', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'johnson-reception', staffId: 'omar', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'johnson-reception', staffId: 'priya', role: 'Bartender', status: 'accepted' },
  { segmentId: 'johnson-reception', staffId: 'nina', role: 'Server', status: 'accepted' },
  // One extra person awaiting a reply — shows the "pending" state without
  // creating a gap, because the segment is already covered without them.
  { segmentId: 'johnson-reception', staffId: 'grace', role: 'Server', status: 'pending' },

  { segmentId: 'johnson-cleanup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { segmentId: 'johnson-cleanup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { segmentId: 'johnson-cleanup', staffId: 'omar', role: 'Event Staff', status: 'accepted' },

  // ---- Taylor Birthday (same day as Johnson — a real clash source) --------
  { segmentId: 'taylor-setup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { segmentId: 'taylor-reception', staffId: 'ben', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'taylor-reception', staffId: 'luis', role: 'Bartender', status: 'accepted' },

  // ---- Acme Dinner: deliberately one Server short (secondary gap) ---------
  { segmentId: 'acme-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { segmentId: 'acme-dinner', staffId: 'theo', role: 'Manager', status: 'accepted' },
  { segmentId: 'acme-dinner', staffId: 'nina', role: 'Server', status: 'accepted' },

  // ---- Martinez Reception (fully staffed, further out) --------------------
  { segmentId: 'martinez-setup', staffId: 'caleb', role: 'Grounds', status: 'accepted' },
  { segmentId: 'martinez-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { segmentId: 'martinez-reception', staffId: 'dana', role: 'Manager', status: 'accepted' },
  { segmentId: 'martinez-reception', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'martinez-reception', staffId: 'omar', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'martinez-reception', staffId: 'ben', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'martinez-reception', staffId: 'priya', role: 'Bartender', status: 'accepted' },
  { segmentId: 'martinez-reception', staffId: 'luis', role: 'Bartender', status: 'accepted' },

  // ---- Chen Anniversary (fully staffed) ----------------------------------
  { segmentId: 'chen-setup', staffId: 'sophie', role: 'Grounds', status: 'accepted' },
  { segmentId: 'chen-reception', staffId: 'marisol', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'chen-reception', staffId: 'omar', role: 'Event Staff', status: 'accepted' },
  { segmentId: 'chen-reception', staffId: 'grace', role: 'Server', status: 'accepted' }
]
