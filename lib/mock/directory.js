// ---------------------------------------------------------------------------
// Venue directory seed: the venue profile, staff roles, vendor categories,
// and the staff and vendor records a manager keeps before assigning anyone
// to an event.
//
// The existing staff and vendors (lib/mock/staff.js, lib/mock/records.js)
// are mapped into the directory shape in lib/directory/model.js; this file
// only holds what is new. All names, numbers and addresses are fictional.
// ---------------------------------------------------------------------------

export const VENUE_ID = 'ven-willow-stone'

export const SEED_VENUE = {
  id: VENUE_ID,
  name: 'Willow Stone',
  venueType: 'Wedding and event venue',
  description:
    'A restored stone barn with a garden terrace, courtyard and orchard lawn. Hosts weddings and private events for up to 220 guests.',
  address: { street: '4100 Willow Creek Road', city: 'Stillwater', region: 'MN', postalCode: '55082' },
  phone: '(612) 555-0100',
  email: 'events@willowstone.example',
  website: 'willowstone.example',
  // A staff id, so the primary contact is a real person in the directory.
  primaryContactId: 'stf-4001'
}

export const VENUE_TYPES = [
  'Wedding and event venue',
  'Barn or farm',
  'Estate or mansion',
  'Garden or park',
  'Hotel or resort',
  'Restaurant',
  'Winery or brewery',
  'Other'
]

// Roles the venue can give staff. Managers can add and rename roles; the
// ones the Staffing Planner plans by are locked by name (see model.js).
export const SEED_ROLE_NAMES = [
  'Venue Manager',
  'Event Coordinator',
  'Event Captain',
  'Event Staff',
  'Setup Staff',
  'Cleanup Staff',
  'Bartender',
  'Server',
  'Grounds',
  'Security',
  'Other'
]

export const SEED_CATEGORY_NAMES = [
  'Catering',
  'Photography',
  'Florist',
  'DJ / Entertainment',
  'Rentals',
  'Cake / Bakery',
  'Transportation',
  'Decor',
  'AV / Production',
  'Other'
]

// The existing vendors used older category words; map them onto the list above.
export const LEGACY_CATEGORY = {
  Caterer: 'Catering',
  Florist: 'Florist',
  'DJ/Band': 'DJ / Entertainment',
  Photographer: 'Photography',
  Bakery: 'Cake / Bakery',
  Transportation: 'Transportation'
}

// Directory-only details layered onto the existing staff.
export const STAFF_DETAILS = {
  'stf-4001': { skills: ['Contracts', 'Day-of coordination'] },
  'stf-4002': { skills: ['Reception lead', 'Radio channel lead'] },
  'stf-4003': { skills: ['Ceremony setup', 'Plated service'] },
  'stf-4004': { skills: ['Alcohol service certified', 'Bar setup'] },
  'stf-4007': { skills: ['Ceremony setup', 'Reception service'] },
  'stf-4010': { skills: ['Forklift', 'Tent setup'] }
}

const none = () => ({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] })

// New people, in the directory shape.
export const EXTRA_STAFF = [
  {
    id: 'stf-4101',
    firstName: 'Sarah',
    lastName: 'Chen',
    phone: '(801) 555-0101',
    email: 'sarah@example.com',
    roleNames: ['Event Coordinator'],
    status: 'active',
    availabilityStatus: 'confirmed',
    availability: { ...none(), Fri: [{ start: 16, end: 24 }], Sat: [{ start: 9, end: 23 }] },
    preferredHours: '20–30/week',
    skills: ['Timeline planning', 'Vendor check-in'],
    notes: 'Coordinates Saturday weddings. Prefers to start with the vendor walk-through.'
  },
  {
    id: 'stf-4102',
    firstName: 'Jake',
    lastName: 'Miller',
    phone: '(801) 555-0102',
    email: 'jake@example.com',
    roleNames: ['Event Staff', 'Setup Staff'],
    status: 'active',
    // Hired, but has not sent his weekly hours yet.
    availabilityStatus: 'pending',
    availability: none(),
    preferredHours: '',
    skills: [],
    notes: 'New hire. Waiting on his availability.'
  }
]

// New vendors, in the directory shape.
export const EXTRA_VENDORS = [
  {
    id: 'vnd-3101',
    name: 'Mountain View Catering',
    contactName: 'Rafael Ortiz',
    categoryName: 'Catering',
    phone: '(801) 555-0140',
    email: 'events@mountainviewcatering.example',
    website: 'mountainviewcatering.example',
    description: 'Full-service catering with plated, buffet and family-style menus. Brings their own servers on request.',
    notes: 'Needs final guest count 10 days out.',
    status: 'active'
  },
  {
    id: 'vnd-3102',
    name: 'Evergreen Floral',
    contactName: 'Hannah Brooks',
    categoryName: 'Florist',
    phone: '(801) 555-0151',
    email: 'hello@evergreenfloral.example',
    website: '',
    description: 'Seasonal arrangements, ceremony arches and table centerpieces.',
    notes: 'Prefers a 10:00 AM load-in.',
    status: 'active'
  },
  {
    id: 'vnd-3103',
    name: 'Silver Lens Photography',
    contactName: 'Marcus Lee',
    categoryName: 'Photography',
    phone: '(801) 555-0162',
    email: 'marcus@silverlens.example',
    website: 'silverlens.example',
    description: 'Wedding and event photography. Two-shooter packages available.',
    notes: '',
    status: 'active'
  }
]

export const VENDOR_DESCRIPTIONS = {
  'vnd-3001': 'Local farm-to-table caterer. Plated and buffet service, with their own service staff.',
  'vnd-3002': 'Florals for ceremony and reception, including arches and installations.'
}
