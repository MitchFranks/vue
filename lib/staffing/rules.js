// ---------------------------------------------------------------------------
// Staffing Planner · settings, rule catalogue and ratio rules.
//
// Every number that rests on weak evidence is a configurable default here,
// with its confidence noted (spec §C.2–C.4).
// ---------------------------------------------------------------------------

export const SETTINGS = {
  simStepMin: 2, // each manager action moves the simulated clock 2 minutes
  callOffsetByRole: { 'Event Captain': -30 }, // Medium: captain's lineup before guests (04 §3)
  shortNoticeHours: 72, // Low (03 P6)
  replyByHours: 48, // Low (02 §2.1 step 5)
  replyBeforeCallHours: 24,
  shortReplyByHours: 2,
  maxHoursPerDay: 12, // Low: venue policy
  weeklyHours: 40, // High: FLSA
  changeoverMin: 15, // Low (04 §3)
  credSoonDays: 30,
  windowDays: 30,
  credentialsByRole: { Bartender: 'alcohol-service' } // Medium (02 §2.6)
}

// Severity: block | hard | soft | info. Group is the Ask panel group it puts a person in.
export const RULES = {
  'I-ON-EVENT': { severity: 'block' },
  'I-SAME': { severity: 'block' },
  'R-OVERLAP': { severity: 'hard' },
  'R-AWAY': { severity: 'hard' },
  'R-CRED': { severity: 'hard' },
  'R-AVAIL': { severity: 'soft' },
  'R-ROLE': { severity: 'soft' },
  'R-ASKED-BEFORE': { severity: 'soft' },
  'R-CHANGEOVER': { severity: 'soft' },
  'R-LONG-DAY': { severity: 'soft' },
  'R-WEEK': { severity: 'soft' },
  'R-CRED-SOON': { severity: 'info' },
  'R-LOAD': { severity: 'info' }
}

export const SEVERITY_RANK = { info: 0, soft: 1, hard: 2, block: 3 }

export const SERVICE_STYLES = [
  { id: 'plated', label: 'Plated' },
  { id: 'buffet', label: 'Buffet' },
  { id: 'family', label: 'Family style' },
  { id: 'stations', label: 'Stations' },
  { id: 'cocktail', label: 'Cocktail only' }
]

export const BAR_TYPES = [
  { id: 'none', label: 'None' },
  { id: 'beer-wine', label: 'Beer & wine' },
  { id: 'full', label: 'Full bar' }
]

// Ratio rules (§C.4). `when(e, block, need)` decides if the rule applies to a
// guest-facing block; `count(g, e)` is the suggestion. Service and bar rules
// only apply to blocks that already list that role, so a ceremony is never
// handed bartenders. They never change needs on their own.
export const RATIO_RULES = [
  {
    id: 'server-plated', role: 'Server', perGuests: 10, basis: '1 per 10, plated',
    when: (e, b, need) => e.serviceStyle === 'plated' && need('Server') > 0,
    count: (g) => Math.ceil(g / 10),
    confidence: 'High',
    source: 'CMU policy, Caterease example, Mayfair, Breakroom (research 02 §2.2). Range 1:8 to 1:12.'
  },
  {
    id: 'server-family', role: 'Server', perGuests: 15, basis: '1 per 15, family style',
    when: (e, b, need) => e.serviceStyle === 'family' && need('Server') > 0,
    count: (g) => Math.ceil(g / 15),
    confidence: 'Low',
    source: 'No direct source; set between plated and buffet. Confirm with the venue.'
  },
  {
    id: 'server-buffet', role: 'Server', perGuests: 25, basis: '1 per 25, buffet or stations',
    when: (e, b, need) => (e.serviceStyle === 'buffet' || e.serviceStyle === 'stations') && need('Server') > 0,
    count: (g) => Math.ceil(g / 25),
    confidence: 'Medium',
    source: 'CMU 1:30, Turnozo 1:30, Mayfair 1:15–20 (research 02 §2.2).'
  },
  {
    id: 'bar-full', role: 'Bartender', perGuests: 50, basis: '1 per 50, full bar',
    when: (e, b, need) => e.bar === 'full' && need('Bartender') > 0,
    count: (g, e) => Math.max(Math.ceil(g / 50), e.barStations || 0),
    confidence: 'High',
    source: 'Research 02 §2.2; 04 §4.6. Never fewer than one per bar station.'
  },
  {
    id: 'bar-bw', role: 'Bartender', perGuests: 75, basis: '1 per 75, beer & wine',
    when: (e, b, need) => e.bar === 'beer-wine' && need('Bartender') > 0,
    count: (g, e) => Math.max(Math.ceil(g / 75), e.barStations || 0),
    confidence: 'Medium',
    source: 'Dummies 50–75, Breakroom 60–80. Never fewer than one per bar station.'
  },
  {
    id: 'captain', role: 'Event Captain', perGuests: null, basis: '1 when 5 or more people work the block',
    when: (e, b, need, totalOthers) => totalOthers >= 5,
    count: () => 1,
    confidence: 'Medium',
    source: 'Breakroom "five or more staff"; Qwick "100+ guests" (research 02 §2.2).'
  }
]

export const NO_RULE_ROLES = ['Event Staff', 'Grounds', 'Venue Manager']
export const NO_RULE_TEXT = 'No reliable rule of thumb; set your own.'
