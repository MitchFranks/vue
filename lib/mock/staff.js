// ---------------------------------------------------------------------------
// Staff directory + availability.
//
// Availability is stored as a day -> array of {start, end} windows, in 24h
// decimal hours (9.5 === 9:30 AM). The AvailabilityGrid renders it and the
// scheduler reads it to work out who can actually cover an open position.
// ---------------------------------------------------------------------------

export const ROLES = ['Venue Manager', 'Event Captain', 'Event Staff', 'Bartender', 'Server', 'Grounds']

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const staff = [
  {
    id: 'dana',
    name: 'Dana Whitcomb',
    initials: 'DW',
    role: 'Venue Manager',
    phone: '(612) 555-0110',
    email: 'dana@vuevenue.test',
    preferredHours: 'Up to 40/week',
    note: 'Venue manager. Signed in as this user.',
    availability: {
      Mon: [{ start: 9, end: 17 }],
      Tue: [{ start: 9, end: 17 }],
      Wed: [{ start: 9, end: 17 }],
      Thu: [{ start: 9, end: 17 }],
      Fri: [{ start: 9, end: 20 }],
      Sat: [{ start: 8, end: 23 }],
      Sun: []
    }
  },
  {
    id: 'theo',
    name: 'Theo Marsh',
    initials: 'TM',
    role: 'Event Captain',
    phone: '(612) 555-0121',
    email: 'theo@vuevenue.test',
    preferredHours: 'Up to 32/week',
    note: 'Event captain. Usually runs receptions.',
    availability: {
      Mon: [],
      Tue: [{ start: 12, end: 20 }],
      Wed: [{ start: 12, end: 20 }],
      Thu: [{ start: 12, end: 20 }],
      Fri: [{ start: 10, end: 22 }],
      Sat: [{ start: 8, end: 23 }],
      Sun: [{ start: 10, end: 18 }]
    }
  },
  {
    id: 'nina',
    name: 'Nina Kovac',
    initials: 'NK',
    role: 'Server',
    phone: '(612) 555-0134',
    email: 'nina@vuevenue.test',
    preferredHours: '20–30/week',
    note: 'Server lead. Trained on ceremony setup.',
    availability: {
      Mon: [{ start: 14, end: 22 }],
      Tue: [],
      Wed: [{ start: 14, end: 22 }],
      Thu: [{ start: 14, end: 22 }],
      Fri: [{ start: 14, end: 23 }],
      Sat: [{ start: 8, end: 23 }],
      Sun: [{ start: 12, end: 20 }]
    }
  },
  {
    id: 'priya',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Bartender',
    phone: '(612) 555-0147',
    email: 'priya@vuevenue.test',
    preferredHours: '15–25/week',
    note: 'Bar lead. Certified; handles bar setup.',
    availability: {
      Mon: [],
      Tue: [],
      Wed: [{ start: 16, end: 23 }],
      Thu: [{ start: 16, end: 23 }],
      Fri: [{ start: 15, end: 23.5 }],
      Sat: [{ start: 14, end: 23.5 }],
      Sun: []
    }
  },
  {
    id: 'luis',
    name: 'Luis Ortega',
    initials: 'LO',
    role: 'Bartender',
    phone: '(612) 555-0158',
    email: 'luis@vuevenue.test',
    preferredHours: '10–20/week',
    note: 'Second bartender for large receptions.',
    availability: {
      Mon: [],
      Tue: [{ start: 17, end: 23 }],
      Wed: [],
      Thu: [{ start: 17, end: 23 }],
      Fri: [{ start: 16, end: 23.5 }],
      Sat: [{ start: 15, end: 23.5 }],
      Sun: []
    }
  },
  {
    id: 'jake',
    name: 'Jake Pearson',
    initials: 'JP',
    role: 'Event Staff',
    phone: '(612) 555-0166',
    email: 'jake@vuevenue.test',
    preferredHours: '20–30/week',
    note: 'Declined the Johnson ceremony shift — has a class until 4:00 PM.',
    availability: {
      Mon: [{ start: 9, end: 15 }],
      Tue: [{ start: 9, end: 15 }],
      Wed: [{ start: 9, end: 15 }],
      Thu: [{ start: 9, end: 15 }],
      Fri: [{ start: 9, end: 17 }],
      Sat: [{ start: 16, end: 23 }],
      Sun: [{ start: 10, end: 18 }]
    }
  },
  {
    id: 'marisol',
    name: 'Marisol Vega',
    initials: 'MV',
    role: 'Event Staff',
    phone: '(612) 555-0171',
    email: 'marisol@vuevenue.test',
    preferredHours: '25–35/week',
    note: 'Available all day Saturday. Trained on ceremony and reception.',
    availability: {
      Mon: [{ start: 10, end: 18 }],
      Tue: [{ start: 10, end: 18 }],
      Wed: [],
      Thu: [{ start: 10, end: 18 }],
      Fri: [{ start: 10, end: 20 }],
      Sat: [{ start: 8, end: 23 }],
      Sun: [{ start: 12, end: 20 }]
    }
  },
  {
    id: 'omar',
    name: 'Omar Haddad',
    initials: 'OH',
    role: 'Event Staff',
    phone: '(612) 555-0182',
    email: 'omar@vuevenue.test',
    preferredHours: '15–25/week',
    note: 'Available Saturday afternoon onward.',
    availability: {
      Mon: [],
      Tue: [{ start: 13, end: 21 }],
      Wed: [{ start: 13, end: 21 }],
      Thu: [],
      Fri: [{ start: 13, end: 22 }],
      Sat: [{ start: 13, end: 23 }],
      Sun: [{ start: 10, end: 16 }]
    }
  },
  {
    id: 'grace',
    name: 'Grace Lindqvist',
    initials: 'GL',
    role: 'Server',
    phone: '(612) 555-0193',
    email: 'grace@vuevenue.test',
    preferredHours: '10–20/week',
    note: 'Weekend only.',
    availability: {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [{ start: 16, end: 23 }],
      Sat: [{ start: 10, end: 23 }],
      Sun: [{ start: 10, end: 20 }]
    }
  },
  {
    id: 'caleb',
    name: 'Caleb Ross',
    initials: 'CR',
    role: 'Grounds',
    phone: '(612) 555-0204',
    email: 'caleb@vuevenue.test',
    preferredHours: '20–30/week',
    note: 'Setup and breakdown crew lead.',
    availability: {
      Mon: [{ start: 7, end: 15 }],
      Tue: [{ start: 7, end: 15 }],
      Wed: [{ start: 7, end: 15 }],
      Thu: [{ start: 7, end: 15 }],
      Fri: [{ start: 7, end: 17 }],
      Sat: [{ start: 7, end: 17 }],
      Sun: []
    }
  },
  {
    id: 'sophie',
    name: 'Sophie Tran',
    initials: 'ST',
    role: 'Grounds',
    phone: '(612) 555-0215',
    email: 'sophie@vuevenue.test',
    preferredHours: '15–25/week',
    note: 'Setup crew. Also covers late teardown.',
    availability: {
      Mon: [{ start: 8, end: 16 }],
      Tue: [],
      Wed: [{ start: 8, end: 16 }],
      Thu: [{ start: 8, end: 16 }],
      Fri: [{ start: 8, end: 18 }],
      Sat: [{ start: 8, end: 23.5 }],
      Sun: []
    }
  },
  {
    id: 'ben',
    name: 'Ben Alvarez',
    initials: 'BA',
    role: 'Event Staff',
    phone: '(612) 555-0226',
    email: 'ben@vuevenue.test',
    preferredHours: '20–30/week',
    note: 'Not available Saturday — already booked at the Taylor party.',
    availability: {
      Mon: [{ start: 10, end: 18 }],
      Tue: [{ start: 10, end: 18 }],
      Wed: [{ start: 10, end: 18 }],
      Thu: [{ start: 10, end: 18 }],
      Fri: [{ start: 10, end: 18 }],
      Sat: [{ start: 17, end: 23 }],
      Sun: []
    }
  }
]

export function staffById(id) {
  return staff.find((s) => s.id === id) || null
}

/** Does this person's stated availability fully cover a window on a day? */
export function isAvailable(person, day, start, end) {
  const windows = person.availability[day] || []
  return windows.some((w) => w.start <= start && w.end >= end)
}

/** 9.5 -> "9:30 AM" */
export function formatHour(h) {
  const hour24 = Math.floor(h)
  const mins = Math.round((h - hour24) * 60)
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`
}

/**
 * "Event Staff" and "Grounds" are already plural; "Venue Manager" and "Server" are
 * not. Naive +"s" produced "2 Event Staffs", so roles get an explicit rule.
 */
const ALREADY_PLURAL = ['Event Staff', 'Grounds']

export function pluralRole(role, n) {
  if (n === 1 || ALREADY_PLURAL.includes(role)) return role
  return `${role}s`
}
