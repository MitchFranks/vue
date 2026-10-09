// ---------------------------------------------------------------------------
// Staffing Planner 2 · seed extras.
//
// Planner 2 reads the v1 seed (lib/mock/events.js, lib/mock/staff.js) read-only
// and layers these extras on top through lib/staffing2/adapter.js. Nothing here
// is visible to the first Staff Planner. See docs/STAFFING-PLANNER-2-SPEC.md §D.2.
// ---------------------------------------------------------------------------

export const BASE_NOW = '2026-09-17T10:00' // matches TODAY_KEY
export const SEED_SENT_AT = '2026-09-14T12:00' // seed asks went out Mon
export const SEED_RESPONDED_AT = '2026-09-15T18:20'

export const SPACES = {
  'garden-terrace': 'Garden Terrace',
  'stone-hall': 'Stone Hall',
  courtyard: 'Courtyard',
  'orchard-lawn': 'Orchard Lawn'
}

export const BLOCK_EXTRAS = {
  'johnson-setup': { spaceId: 'garden-terrace' },
  'johnson-ceremony': { spaceId: 'garden-terrace', guestStart: 15.5 },
  'johnson-reception': { spaceId: 'stone-hall' },
  'johnson-cleanup': { spaceId: 'stone-hall' },
  'taylor-setup': { spaceId: 'courtyard' },
  'taylor-reception': { spaceId: 'courtyard' },
  'shah-setup': { spaceId: 'stone-hall' },
  'shah-dinner': { spaceId: 'stone-hall' },
  'martinez-setup': { spaceId: 'orchard-lawn' },
  'martinez-reception': { spaceId: 'stone-hall' },
  'chen-setup': { spaceId: 'garden-terrace' },
  'chen-reception': { spaceId: 'garden-terrace' }
}

// Open question G.2 #1: confirm suppliedBy with the pilot venue.
export const EVENT_EXTRAS = {
  johnson: { serviceStyle: 'plated', bar: 'full', barStations: 2, suppliedBy: { Server: 'caterer' } },
  taylor: { serviceStyle: 'buffet', bar: 'full', barStations: 1, suppliedBy: { Server: 'caterer' } },
  shah: { serviceStyle: 'plated', bar: 'none', barStations: 0 },
  martinez: { serviceStyle: 'plated', bar: 'full', barStations: 2, suppliedBy: { Server: 'caterer' } },
  chen: { serviceStyle: 'family', bar: 'none', barStations: 0 }
}

// Merged onto v1 staff by the adapter.
export const STAFF_EXTRAS = {
  nina: { roles: ['Server', 'Event Staff'] },
  priya: { credentials: [{ type: 'alcohol-service', expiresOn: '2027-05-01' }] },
  luis: { credentials: [{ type: 'alcohol-service', expiresOn: '2026-10-01' }] }
}

// On-call pool. These exist only in Planner 2. The 12-person v1 seed is too
// small to show backfill; real venues keep a much larger roster than any one
// event uses (02 §2.4, 03 §1.1).
export const POOL_STAFF = [
  {
    id: 'tessa', name: 'Tessa Nguyen', initials: 'TN', role: 'Event Staff', roles: ['Event Staff'], pool: true,
    phone: '(612) 555-0237', preferredHours: 'Up to 20/week',
    availability: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [{ start: 16, end: 23 }], Sat: [{ start: 12, end: 23 }], Sun: [{ start: 10, end: 18 }] }
  },
  {
    id: 'andre', name: 'Andre Wilson', initials: 'AW', role: 'Server', roles: ['Server', 'Event Staff'], pool: true,
    phone: '(612) 555-0248', preferredHours: '10–20/week',
    availability: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [{ start: 17, end: 23 }], Sat: [{ start: 14, end: 23 }], Sun: [] }
  },
  {
    id: 'mei', name: 'Mei Lin', initials: 'ML', role: 'Bartender', roles: ['Bartender'], pool: true,
    phone: '(612) 555-0259', preferredHours: 'Up to 15/week',
    credentials: [{ type: 'alcohol-service', expiresOn: '2027-08-01' }],
    availability: { Mon: [], Tue: [], Wed: [], Thu: [{ start: 16, end: 23 }], Fri: [{ start: 16, end: 24 }], Sat: [{ start: 15, end: 24 }], Sun: [] }
  },
  {
    id: 'rosa', name: 'Rosa Delgado', initials: 'RD', role: 'Grounds', roles: ['Grounds'], pool: true,
    phone: '(612) 555-0260', preferredHours: '15–25/week',
    availability: { Mon: [], Tue: [], Wed: [], Thu: [{ start: 8, end: 18 }], Fri: [{ start: 8, end: 18 }], Sat: [{ start: 8, end: 20 }], Sun: [] }
  }
]

export const SEED_AWAY = [
  { id: 'aw-jake', staffId: 'jake', dateKey: '2026-09-19', start: 0, end: 16, reason: 'Class', addedBy: 'staff' },
  { id: 'aw-ben', staffId: 'ben', dateKey: '2026-10-16', endDateKey: '2026-10-17', reason: 'Family trip', addedBy: 'staff' }
]
