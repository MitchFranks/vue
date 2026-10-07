// ---------------------------------------------------------------------------
// Supporting records: tasks, messages, clients, vendors, payments, documents
// and the per-event change history.
//
// These are the "context" around the two headline features. They exist so the
// attention items have somewhere real to point at — not as features in their
// own right.
// ---------------------------------------------------------------------------

export const tasks = [
  {
    id: 't-guest-count',
    eventId: 'johnson',
    title: 'Send final guest count to Harvest Table Catering',
    due: 'Due today',
    dueTone: 'urgent',
    owner: 'Dana Whitcomb',
    done: false,
    detail: 'Catering needs the confirmed headcount to lock the order. Contract says 48 hours before service.'
  },
  {
    id: 't-balance',
    eventId: 'johnson',
    title: 'Collect remaining balance of $4,250',
    due: 'Due Fri, Sep 18',
    dueTone: 'warn',
    owner: 'Dana Whitcomb',
    done: false,
    detail: 'Final payment is unpaid with 2 days until the event.'
  },
  {
    id: 't-timeline-signoff',
    eventId: 'johnson',
    title: 'Get client sign-off on the day-of timeline',
    due: 'Due Fri, Sep 18',
    dueTone: 'warn',
    owner: 'Dana Whitcomb',
    done: false,
    detail: 'Version 2 has been sent. Waiting on Emily to confirm the 9:00 AM decorating change.'
  },
  {
    id: 't-chairs',
    eventId: 'johnson',
    title: 'Confirm ceremony chair count (150)',
    due: 'Completed Sep 12',
    dueTone: 'done',
    owner: 'Caleb Ross',
    done: true,
    detail: 'Counted and staged in the Stone Hall storage room.'
  },
  {
    id: 't-floorplan',
    eventId: 'johnson',
    title: 'Floor plan approved by client',
    due: 'Completed Sep 8',
    dueTone: 'done',
    owner: 'Dana Whitcomb',
    done: true,
    detail: 'Version 3 approved by Emily by email.'
  },
  {
    id: 't-coi',
    eventId: 'johnson',
    title: 'Certificates of insurance on file for all vendors',
    due: 'Completed Sep 5',
    dueTone: 'done',
    owner: 'Dana Whitcomb',
    done: true,
    detail: 'All six vendors returned a current COI.'
  },
  {
    id: 't-taylor-cake',
    eventId: 'taylor',
    title: 'Confirm cake delivery window',
    due: 'Due Fri, Sep 18',
    dueTone: 'warn',
    owner: 'Theo Marsh',
    done: false,
    detail: 'Bakery has not confirmed whether they arrive before or after guest arrival.'
  },
  {
    id: 't-acme-av',
    eventId: 'acme',
    title: 'Book AV technician for the presentation',
    due: 'Due Mon, Sep 21',
    dueTone: 'warn',
    owner: 'Theo Marsh',
    done: false,
    detail: 'Acme is presenting slides; our in-house system needs an operator.'
  },
  {
    id: 't-martinez-walkthrough',
    eventId: 'martinez',
    title: 'Schedule final walkthrough with the Martinez family',
    due: 'Due Fri, Sep 25',
    dueTone: 'info',
    owner: 'Dana Whitcomb',
    done: false,
    detail: 'Needs to happen at least two weeks out.'
  }
]

export const messages = [
  {
    id: 'm-decor-time',
    eventId: 'johnson',
    clientId: 'johnson-emily',
    from: 'Emily Johnson',
    fromRole: 'Client · Johnson Wedding',
    initials: 'EJ',
    subject: 'Can we move decorating to 9:00 AM?',
    received: 'Today, 8:42 AM',
    needsReply: true,
    priority: 'urgent',
    body: [
      'Hi!',
      "We're finalizing our plans and were wondering if we could move our decorating time from 10:00 AM to 9:00 AM on the morning of the wedding. Would that be possible?",
      'Thanks!',
      'Emily'
    ],
    context: [
      { label: 'Current setup window', value: '9:00 AM – 3:00 PM' },
      { label: 'Earliest venue access', value: '8:00 AM (contract)' },
      { label: 'Night before', value: 'No event booked' },
      { label: 'Grounds crew on site', value: '7:30 AM' }
    ],
    suggestedReply:
      "Hi Emily,\n\nA 9:00 AM start works on our end — there's no event the night before and our grounds crew is on site from 7:30 AM.\n\nOne note: Bloom & Bough begin floral load-in at 12:00 PM, so we'd ask that personal decor be placed before then.\n\nI'll update the day-of timeline and let the vendor team know.\n\nWarmly,\nDana Whitcomb\nVenue Manager"
  },
  {
    id: 'm-catering-count',
    eventId: 'johnson',
    clientId: null,
    from: 'Marla Perez · Harvest Table',
    fromRole: 'Vendor · Catering',
    initials: 'MP',
    subject: 'Final guest count needed today',
    received: 'Today, 7:15 AM',
    needsReply: true,
    priority: 'urgent',
    body: [
      'Morning Dana,',
      'We need the confirmed headcount for Saturday by end of day today to place the order with our supplier. Last number I have is 150.',
      'Marla'
    ],
    context: [
      { label: 'Last confirmed count', value: '150 guests' },
      { label: 'Contract deadline', value: '48 hours before service' }
    ],
    suggestedReply:
      'Hi Marla,\n\nConfirming 150 guests for Saturday. No changes from the last count.\n\nThanks,\nDana'
  },
  {
    id: 'm-jake-decline',
    eventId: 'johnson',
    clientId: null,
    from: 'Jake Pearson',
    fromRole: 'Staff · Event Staff',
    initials: 'JP',
    subject: 'Cannot make the ceremony shift Saturday',
    received: 'Yesterday, 6:30 PM',
    needsReply: false,
    priority: 'info',
    body: [
      'Hey Dana,',
      "I have a class that doesn't finish until 4:00 PM on Saturday, so I can't make the 3:00 PM call time for the ceremony. Really sorry for the short notice. I can still do the later reception block if that helps.",
      'Jake'
    ],
    context: [
      { label: 'Shift', value: 'Johnson Wedding · Ceremony' },
      { label: 'Window', value: '3:00 PM – 5:00 PM' }
    ],
    suggestedReply: 'Thanks for letting me know, Jake. I\'ll find cover for the ceremony block.'
  },
  {
    id: 'm-taylor-menu',
    eventId: 'taylor',
    clientId: 'taylor-rhonda',
    from: 'Rhonda Taylor',
    fromRole: 'Client · Taylor Birthday Party',
    initials: 'RT',
    subject: 'Adding two more guests',
    received: 'Yesterday, 2:10 PM',
    needsReply: true,
    priority: 'warn',
    body: [
      'Hi Dana,',
      'Two more people can come after all — can we go from 43 to 45? Hopefully not too late to change.',
      'Rhonda'
    ],
    context: [
      { label: 'Current count', value: '45 guests' },
      { label: 'Space capacity', value: 'Courtyard — 60' }
    ],
    suggestedReply: 'Hi Rhonda,\n\n45 is no problem at all — the Courtyard seats 60. I\'ve updated your count.\n\nDana'
  },
  {
    id: 'm-acme-av',
    eventId: 'acme',
    clientId: 'acme-priya',
    from: 'Priya Shah · Acme Industrial',
    fromRole: 'Client · Acme Company Dinner',
    initials: 'PS',
    subject: 'Projector and microphone for the 24th',
    received: 'Mon, Sep 14',
    needsReply: false,
    priority: 'info',
    body: [
      'Hi Dana,',
      "We'll need a projector and a handheld mic for a short presentation after dinner. Can you confirm the room has both?",
      'Priya'
    ],
    context: [{ label: 'Space', value: 'Stone Hall' }],
    suggestedReply: 'Hi Priya,\n\nStone Hall has a ceiling projector and two handheld mics. I\'ll have an AV tech on site.\n\nDana'
  },
  {
    id: 'm-bloom-confirm',
    eventId: 'johnson',
    clientId: null,
    from: 'Iris Whelan · Bloom & Bough',
    fromRole: 'Vendor · Florals',
    initials: 'IW',
    subject: 'Load-in confirmed for 12:00 PM',
    received: 'Mon, Sep 14',
    needsReply: false,
    priority: 'done',
    body: ['Confirming our team arrives at 12:00 PM Saturday for floral load-in. — Iris'],
    context: [{ label: 'Load-in', value: '12:00 PM Saturday' }],
    suggestedReply: 'Thanks Iris, see you then.'
  }
]

export const clients = [
  {
    id: 'johnson-emily',
    name: 'Emily & Marcus Johnson',
    primary: 'Emily Johnson',
    email: 'emily.johnson@email.test',
    phone: '(612) 555-0147',
    initials: 'EJ',
    eventIds: ['johnson'],
    since: 'Booked February 2026',
    note: 'Planner is Rachel Adeyemi at Lark & Ivy Events.'
  },
  {
    id: 'taylor-rhonda',
    name: 'Rhonda Taylor',
    primary: 'Rhonda Taylor',
    email: 'rhonda.taylor@email.test',
    phone: '(612) 555-0310',
    initials: 'RT',
    eventIds: ['taylor'],
    since: 'Booked July 2026',
    note: '40th birthday. Returning client — hosted a shower here in 2024.'
  },
  {
    id: 'acme-priya',
    name: 'Acme Industrial',
    primary: 'Priya Shah',
    email: 'p.shah@acme.test',
    phone: '(612) 555-0422',
    initials: 'PS',
    eventIds: ['acme'],
    since: 'Booked June 2026',
    note: 'Annual company dinner. Third year booking with us.'
  },
  {
    id: 'martinez-ana',
    name: 'Ana & Diego Martinez',
    primary: 'Ana Martinez',
    email: 'ana.martinez@email.test',
    phone: '(612) 555-0533',
    initials: 'AM',
    eventIds: ['martinez'],
    since: 'Booked March 2026',
    note: 'Reception only — ceremony is off site.'
  },
  {
    id: 'chen-wei',
    name: 'Wei & Lian Chen',
    primary: 'Wei Chen',
    email: 'wei.chen@email.test',
    phone: '(612) 555-0644',
    initials: 'WC',
    eventIds: ['chen'],
    since: 'Booked May 2026',
    note: '40th anniversary dinner for family only.'
  }
]

export const vendors = [
  {
    id: 'harvest-table',
    name: 'Harvest Table Catering',
    category: 'Catering',
    contact: 'Marla Perez',
    phone: '(612) 555-0701',
    email: 'marla@harvesttable.test',
    eventIds: ['johnson', 'acme', 'martinez'],
    status: 'Count due',
    statusTone: 'urgent',
    note: 'Needs the final Johnson headcount today.'
  },
  {
    id: 'bloom-bough',
    name: 'Bloom & Bough',
    category: 'Florals',
    contact: 'Iris Whelan',
    phone: '(612) 555-0712',
    email: 'iris@bloomandbough.test',
    eventIds: ['johnson', 'chen'],
    status: 'Confirmed',
    statusTone: 'done',
    note: 'Load-in 12:00 PM Saturday.'
  },
  {
    id: 'northline',
    name: 'Northline Sound',
    category: 'DJ & AV',
    contact: 'Devon Hart',
    phone: '(612) 555-0723',
    email: 'devon@northlinesound.test',
    eventIds: ['johnson', 'taylor', 'martinez'],
    status: 'Confirmed',
    statusTone: 'done',
    note: 'Ceremony mic plus reception sound.'
  },
  {
    id: 'juniper-photo',
    name: 'Juniper Photo Co.',
    category: 'Photography',
    contact: 'Ana Cruz',
    phone: '(612) 555-0734',
    email: 'ana@juniperphoto.test',
    eventIds: ['johnson'],
    status: 'Confirmed',
    statusTone: 'done',
    note: 'Arrives 2:00 PM.'
  },
  {
    id: 'sweet-larkspur',
    name: 'Sweet Larkspur Bakery',
    category: 'Cake & desserts',
    contact: 'Jo Bennett',
    phone: '(612) 555-0745',
    email: 'jo@sweetlarkspur.test',
    eventIds: ['johnson', 'taylor'],
    status: 'Awaiting confirmation',
    statusTone: 'warn',
    note: 'Has not confirmed the Taylor delivery window.'
  },
  {
    id: 'grand-ave-coach',
    name: 'Grand Avenue Coach',
    category: 'Guest shuttle',
    contact: 'Terry Malone',
    phone: '(612) 555-0756',
    email: 'terry@grandavecoach.test',
    eventIds: ['johnson'],
    status: 'Confirmed',
    statusTone: 'done',
    note: 'Two runs from Hotel Brixton.'
  }
]

export const payments = {
  johnson: {
    total: 28400,
    paid: 24150,
    schedule: [
      { id: 'p1', label: 'Booking deposit', amount: 8400, when: 'Paid Feb 14, 2026', state: 'paid' },
      { id: 'p2', label: 'Second installment', amount: 9750, when: 'Paid Jun 1, 2026', state: 'paid' },
      { id: 'p3', label: 'Third installment', amount: 6000, when: 'Paid Aug 15, 2026', state: 'paid' },
      { id: 'p4', label: 'Final balance', amount: 4250, when: 'Due Sep 18, 2026', state: 'due' }
    ]
  },
  taylor: {
    total: 4800,
    paid: 4800,
    schedule: [
      { id: 'p1', label: 'Deposit', amount: 1600, when: 'Paid Jul 3, 2026', state: 'paid' },
      { id: 'p2', label: 'Balance', amount: 3200, when: 'Paid Sep 10, 2026', state: 'paid' }
    ]
  },
  acme: {
    total: 9200,
    paid: 4600,
    schedule: [
      { id: 'p1', label: 'Deposit', amount: 4600, when: 'Paid Jun 20, 2026', state: 'paid' },
      { id: 'p2', label: 'Balance', amount: 4600, when: 'Due Sep 22, 2026', state: 'due' }
    ]
  },
  martinez: {
    total: 31500,
    paid: 10500,
    schedule: [
      { id: 'p1', label: 'Deposit', amount: 10500, when: 'Paid Mar 8, 2026', state: 'paid' },
      { id: 'p2', label: 'Second installment', amount: 10500, when: 'Due Sep 20, 2026', state: 'due' },
      { id: 'p3', label: 'Final balance', amount: 10500, when: 'Due Sep 28, 2026', state: 'scheduled' }
    ]
  },
  chen: {
    total: 7400,
    paid: 2400,
    schedule: [
      { id: 'p1', label: 'Deposit', amount: 2400, when: 'Paid May 2, 2026', state: 'paid' },
      { id: 'p2', label: 'Balance', amount: 5000, when: 'Due Oct 9, 2026', state: 'scheduled' }
    ]
  }
}

export const documents = [
  { id: 'd1', eventId: 'johnson', name: 'Signed venue contract', kind: 'PDF', updated: 'Feb 14, 2026', status: 'Signed', tone: 'done' },
  { id: 'd2', eventId: 'johnson', name: 'Certificate of insurance', kind: 'PDF', updated: 'Sep 5, 2026', status: 'On file', tone: 'done' },
  { id: 'd3', eventId: 'johnson', name: 'Final floor plan v3', kind: 'PDF', updated: 'Sep 8, 2026', status: 'Approved', tone: 'done' },
  { id: 'd4', eventId: 'johnson', name: 'Catering menu selections', kind: 'PDF', updated: 'Sep 11, 2026', status: 'Final', tone: 'done' },
  { id: 'd5', eventId: 'johnson', name: 'Day-of timeline v2', kind: 'DOC', updated: 'Sep 16, 2026', status: 'Awaiting signature', tone: 'urgent' },
  { id: 'd6', eventId: 'taylor', name: 'Event agreement', kind: 'PDF', updated: 'Jul 3, 2026', status: 'Signed', tone: 'done' },
  { id: 'd7', eventId: 'acme', name: 'Corporate booking contract', kind: 'PDF', updated: 'Jun 20, 2026', status: 'Signed', tone: 'done' },
  { id: 'd8', eventId: 'acme', name: 'Dietary requirements list', kind: 'XLS', updated: 'Sep 15, 2026', status: 'Awaiting client', tone: 'warn' },
  { id: 'd9', eventId: 'martinez', name: 'Signed venue contract', kind: 'PDF', updated: 'Mar 8, 2026', status: 'Signed', tone: 'done' },
  { id: 'd10', eventId: 'chen', name: 'Signed venue contract', kind: 'PDF', updated: 'May 2, 2026', status: 'Signed', tone: 'done' }
]

export const history = [
  { id: 'h1', eventId: 'johnson', when: 'Today, 8:42 AM', who: 'Emily Johnson', what: 'Requested decorating time move from 10:00 AM to 9:00 AM', tone: 'urgent' },
  { id: 'h2', eventId: 'johnson', when: 'Yesterday, 6:30 PM', who: 'Jake Pearson', what: 'Declined the Ceremony shift (3:00–5:00 PM)', tone: 'urgent' },
  { id: 'h3', eventId: 'johnson', when: 'Yesterday, 11:05 AM', who: 'Marla Perez', what: 'Requested final guest count', tone: 'warn' },
  { id: 'h4', eventId: 'johnson', when: 'Mon, Sep 14', who: 'Iris Whelan', what: 'Confirmed floral load-in at 12:00 PM', tone: 'done' },
  { id: 'h5', eventId: 'johnson', when: 'Sep 12', who: 'Dana Whitcomb', what: 'Published the staffing schedule to 8 team members', tone: 'info' },
  { id: 'h6', eventId: 'johnson', when: 'Sep 8', who: 'Emily Johnson', what: 'Approved floor plan v3', tone: 'done' },
  { id: 'h7', eventId: 'taylor', when: 'Yesterday, 2:10 PM', who: 'Rhonda Taylor', what: 'Increased guest count from 43 to 45', tone: 'warn' },
  { id: 'h8', eventId: 'acme', when: 'Mon, Sep 14', who: 'Priya Shah', what: 'Asked about projector and microphone', tone: 'info' }
]

export const timelines = {
  johnson: [
    { id: 'tl1', time: '9:00 AM', title: 'Decorating access — client & planner', note: 'Change requested from 10:00 AM. Awaiting your response.', tone: 'urgent' },
    { id: 'tl2', time: '12:00 PM', title: 'Vendor load-in', note: 'Bloom & Bough florals, Northline Sound' },
    { id: 'tl3', time: '1:00 PM', title: 'Cake delivery', note: 'Sweet Larkspur Bakery' },
    { id: 'tl4', time: '3:00 PM', title: 'Staff call time — Ceremony', note: '1 manager + 2 event staff' },
    { id: 'tl5', time: '3:30 PM', title: 'Guest arrival & parking opens', note: 'Shuttle from Hotel Brixton' },
    { id: 'tl6', time: '4:00 PM', title: 'Ceremony', note: 'Garden Terrace · 150 chairs set' },
    { id: 'tl7', time: '4:45 PM', title: 'Cocktail hour', note: 'Courtyard · 2 bar stations' },
    { id: 'tl8', time: '6:00 PM', title: 'Reception & dinner service', note: 'Stone Hall · 15 rounds of 10' },
    { id: 'tl9', time: '10:30 PM', title: 'Send-off', note: 'Front drive · sparkler exit approved' },
    { id: 'tl10', time: '11:00 PM', title: 'Breakdown complete & venue close', note: 'All vendors off property' }
  ],
  taylor: [
    { id: 'tt1', time: '3:00 PM', title: 'Setup begins', note: 'Courtyard string lights, long table' },
    { id: 'tt2', time: '5:30 PM', title: 'Guests arrive', note: '45 guests' },
    { id: 'tt3', time: '6:00 PM', title: 'Dinner & toasts', note: 'Buffet service' },
    { id: 'tt4', time: '10:00 PM', title: 'Close', note: 'Courtyard cleared' }
  ],
  acme: [
    { id: 'ta1', time: '1:00 PM', title: 'Setup begins', note: 'Stone Hall, seated rounds' },
    { id: 'ta2', time: '4:00 PM', title: 'AV check with presenter', note: 'Projector and handheld mic' },
    { id: 'ta3', time: '6:30 PM', title: 'Seated dinner', note: 'Three courses' },
    { id: 'ta4', time: '8:30 PM', title: 'Presentation', note: '20 minutes of slides' },
    { id: 'ta5', time: '10:00 PM', title: 'Close', note: '' }
  ],
  martinez: [
    { id: 'tm1', time: '10:00 AM', title: 'Setup begins', note: 'Largest floor plan of the season' },
    { id: 'tm2', time: '5:30 PM', title: 'Reception begins', note: 'Orchard Lawn into Stone Hall' },
    { id: 'tm3', time: '10:00 PM', title: 'Close', note: '' }
  ],
  chen: [
    { id: 'tc1', time: '12:00 PM', title: 'Setup begins', note: 'Garden Terrace' },
    { id: 'tc2', time: '5:00 PM', title: 'Family dinner', note: 'Family-style service' },
    { id: 'tc3', time: '9:00 PM', title: 'Close', note: '' }
  ]
}

export function clientById(id) {
  return clients.find((c) => c.id === id) || null
}

export function vendorById(id) {
  return vendors.find((v) => v.id === id) || null
}

export function messageById(id) {
  return messages.find((m) => m.id === id) || null
}

export function money(n) {
  return `$${n.toLocaleString('en-US')}`
}
