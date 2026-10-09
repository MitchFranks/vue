// ---------------------------------------------------------------------------
// First-run guide: constants and pure helpers.
//
// Deliberately NOT a client module, so server files (the couple route's
// generateStaticParams, the root layout's inline theme script) can import the
// constants as plain values.
//
//   theme   the user's accent colour. Stored as the hex they picked plus the
//           derived CSS variables, so the inline script in app/layout.jsx can
//           apply them before first paint without any colour maths.
//   guide   which step of the 3-step guide they are on, and the first couple
//           they typed in. Kept in its own key so it never collides with the
//           prototype store (lib/store.jsx).
// ---------------------------------------------------------------------------

export const THEME_KEY = 'vue-theme-v1'
export const GUIDE_KEY = 'vue-onboarding-v2'

/** The first couple has a fixed id so the static export can prebuild its page. */
export const FIRST_COUPLE_ID = 'cpl-2000'

export const DEFAULT_ACCENT = '#6b4bf0'
const INK = '#2a2145'
const WHITE = '#ffffff'
const BLACK = '#000000'

/**
 * Six curated accents. Every one carries white text at 4.5:1 or better, and
 * none sits near a status hue (mint, sunshine, coral), so a coloured thing
 * still means one thing.
 */
export const SWATCHES = [
  { name: 'Violet', hex: '#6b4bf0' },
  { name: 'Berry', hex: '#b4236c' },
  { name: 'Ocean', hex: '#1e6bc6' },
  { name: 'Plum', hex: '#8a3fa0' },
  { name: 'Lagoon', hex: '#0e6e8c' },
  { name: 'Midnight', hex: '#34408f' }
]

// ---- colour maths ----------------------------------------------------------

function toRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

function toHex(rgb) {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`
}

/** Mix `a` toward `b` by `t` (0 = a, 1 = b) in sRGB. */
export function mix(a, b, t) {
  const x = toRgb(a)
  const y = toRgb(b)
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two colours. */
export function contrast(a, b) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

export function isHex(value) {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}

/**
 * Turn one chosen colour into the full accent token set.
 *
 * Contrast rule (WCAG AA, 4.5:1):
 *   - text ON the accent fill is white when white reaches 4.5:1, otherwise ink
 *     when ink does; if neither does (a mid-tone), the fill is darkened until
 *     white does.
 *   - accent used AS text (links, active labels) gets its own shade,
 *     --color-accent-text, darkened until it reaches 4.5:1 on the soft tint.
 */
export function deriveAccent(input) {
  let accent = isHex(input) ? toHex(toRgb(input)) : DEFAULT_ACCENT
  let onAccent
  if (contrast(accent, WHITE) >= 4.5) onAccent = WHITE
  else if (contrast(accent, INK) >= 4.5) onAccent = INK
  else {
    for (let i = 0; i < 40 && contrast(accent, WHITE) < 4.5; i += 1) accent = mix(accent, BLACK, 0.05)
    onAccent = WHITE
  }

  // Hover/pressed state moves AWAY from the text colour so contrast only grows.
  const dark = onAccent === WHITE ? mix(accent, BLACK, 0.18) : mix(accent, WHITE, 0.22)
  const soft = mix(accent, WHITE, 0.9)
  const line = mix(accent, WHITE, 0.7)

  let text = accent
  for (let i = 0; i < 40 && contrast(text, soft) < 4.5; i += 1) text = mix(text, BLACK, 0.06)

  return {
    '--color-accent': accent,
    '--color-accent-dark': dark,
    '--color-accent-soft': soft,
    '--color-accent-line': line,
    '--color-accent-text': text,
    '--color-on-accent': onAccent
  }
}

export const ACCENT_VARS = Object.keys(deriveAccent(DEFAULT_ACCENT))

/**
 * Runs in <head> before first paint (see app/layout.jsx), so a returning user
 * never sees the default violet flash before their own colour.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_KEY
)})||"null");if(t&&t.vars){var s=document.documentElement.style;for(var k in t.vars)s.setProperty(k,t.vars[k])}}catch(e){}})()`

// ---- couples ---------------------------------------------------------------

/** "Ava Martin & Leo Chen" -> "AL"; "Ava Martin" -> "AM". */
export function initialsFor(names) {
  const partners = names
    .split(/\s*(?:&|\+|\band\b|,)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)
  if (partners.length >= 2) return (partners[0][0] + partners[1][0]).toUpperCase()
  const words = (partners[0] || names).trim().split(/\s+/)
  return ((words[0]?.[0] || '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase() || '?'
}

/** A minimal couple record, same shape as lib/mock/records.js `couples`. */
export function makeCouple(names) {
  const name = names.trim().replace(/\s+/g, ' ')
  const primaryContact = name.split(/\s*(?:&|\+|\band\b|,)\s*/i)[0] || name
  return {
    id: FIRST_COUPLE_ID,
    name,
    primaryContact,
    email: '',
    phone: '',
    initials: initialsFor(name),
    eventIds: [],
    since: 'Added today',
    note: 'Added during setup. Book their wedding when you are ready.',
    addedByGuide: true
  }
}

/** Staffing Planner guide: its saved flag and the event that brings it back. */
export const PLANNER_GUIDE_KEY = 'vue-planner-guide-v1'
export const PLANNER_REPLAY_EVENT = 'vue-planner-guide-replay'

/** Events guide: its saved flag and the event that brings it back. */
export const EVENTS_GUIDE_KEY = 'vue-events-guide-v1'
export const EVENTS_REPLAY_EVENT = 'vue-events-guide-replay'

/**
 * Step 3 of the welcome guide asks what the user wants to do first. The first
 * three are the likeliest; the rest sit behind "More options". The choice
 * picks the screen flow they are walked through next (FLOWS below).
 */
export const FIRST_CHOICES = [
  { id: 'couple', icon: 'users', title: 'Add my first couple', hint: 'Start with their names' },
  { id: 'staffing', icon: 'user', title: 'Staff an upcoming wedding', hint: 'Ask your team and fill gaps' },
  { id: 'calendar', icon: 'calendar', title: "See what's coming up", hint: 'Weddings by date' }
]

export const MORE_CHOICES = [
  { id: 'messages', icon: 'mail', title: 'Reply to a message', hint: 'Couples, vendors and staff' },
  { id: 'availability', icon: 'clock', title: "Check my team's availability", hint: 'Who is free, and when' },
  { id: 'vendors', icon: 'truck', title: 'Review my vendors', hint: 'Caterers, florists and more' },
  { id: 'new-event', icon: 'plus', title: 'Create a new event', hint: 'Set up a wedding from scratch' }
]

/**
 * A flow is a list of "click this next" steps. Each step points at one thing
 * (data-onboarding or data-guide attribute) and moves on when it is clicked;
 * the last click ends the guide.
 */
const nav = (id) => `[data-onboarding="${id}"]`
export const FLOWS = {
  couple: [
    {
      target: nav('up-next'),
      title: 'This is Up Next, in your colour',
      body: 'The things that need you wait here, most useful first. Click it to add your first couple.'
    }
  ],
  staffing: [
    {
      target: nav('staffing'),
      title: 'Open the Staffing Planner',
      body: 'See which weddings need people, then ask your team. Click it to begin.'
    }
  ],
  calendar: [
    {
      target: nav('calendar'),
      title: "Here's your calendar",
      body: 'Every wedding, by date. Click it to take a look.'
    }
  ],
  messages: [
    {
      target: nav('messages'),
      title: 'Your messages',
      body: 'Couples, vendors and staff in one place. Click it to see what needs a reply.'
    }
  ],
  availability: [
    {
      target: nav('staff'),
      title: 'Open the Staff Directory',
      body: 'Everyone on your team is here. Click it, then check who is free.'
    },
    {
      target: '[data-guide="view-availability"]',
      title: "See who's free",
      body: "This shows each person's availability across the week. Click View availability."
    }
  ],
  vendors: [
    {
      target: nav('vendors'),
      title: 'Your vendors',
      body: 'Caterers, florists and more. Click it to review them.'
    }
  ],
  'new-event': [
    {
      target: nav('events'),
      title: 'Open Events',
      body: 'Every wedding lives here. Click it, then start a new one.'
    },
    {
      target: '[data-guide="new-event"]',
      title: 'Create an event',
      body: 'Click New event to set up a wedding from scratch.'
    }
  ]
}
