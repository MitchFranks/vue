# Vue — Venue Operations

**A low-fidelity, fully clickable prototype of an operations platform for small-to-medium event venues.**

> ⚠️ **This is an early-stage, low-fidelity prototype.** The information and actions shown are
> simulated and are being tested for usability. No backend, no accounts, no real messages.

---

## Product Summary

Vue is an operations platform for venues that host weddings, receptions, ceremonies, birthdays,
corporate dinners, anniversaries and graduations. It is aimed at the person who actually runs the
day: a venue manager or coordinator juggling several upcoming events, their staff, vendors,
deadlines, payments and the last-minute changes that affect all of them at once.

It is not a CRM, an accounting package or a marketing tool. It does one thing: it tells the manager
what needs their attention right now, and gives them the means to deal with it.

---

## Root User Outcome

**Control and confidence.**

The manager needs to know what requires action, and to trust that nothing important is quietly
going wrong somewhere they are not looking. Every design decision in this prototype is subordinate
to that: the system goes looking for problems so the manager does not have to.

---

## Discovery Research Findings

- Event information is scattered across email, calendars, documents, spreadsheets, checklists and
  conversations.
- Last-minute changes are common, and one change cascades — a time change affects staffing,
  vendors, the timeline and the client.
- Staff scheduling and availability are the hardest thing to coordinate.
- Small venues value simplicity and flexibility; they will abandon a system that becomes another
  thing to maintain.
- Managers do not need *more* information. They need to know **what matters right now**.
- Staff themselves only need their own schedule and the details relevant to them.
- Different parts of an event need different people — setup, ceremony, reception and cleanup are
  effectively four different staffing problems inside one booking.

---

## Core Design Features

### 1. Needs Attention dashboard

The system proactively surfaces anything that requires action rather than making the manager hunt
for it. It covers staffing gaps, declined shifts, unanswered client and vendor messages, approaching
vendor deadlines, overdue guest counts, unpaid balances, unsigned documents and overdue tasks.

Critically, an attention item does not just say something is wrong. Every item states:

| | |
|---|---|
| **What happened** | "Jake Pearson declined the ceremony shift." |
| **Which event** | Johnson Wedding (a link straight to it) |
| **Why it matters** | "Johnson Wedding is 2 days out. Without cover this segment runs understaffed." |
| **What you can do** | A primary action button — "Find replacement" |

**Nothing in this list is hard-coded.** Attention items are *derived* from the live state of
shifts, tasks, messages and documents (`lib/store.jsx`). Resolve the underlying thing and the item
disappears on its own.

### 2. Staff availability + smart scheduling

Staff submit the hours they can work. The manager sees that availability, builds a schedule by
event segment, publishes it, and staff accept or decline. Anything left uncovered flows straight
back into Needs Attention.

The scheduling is "smart" in a deliberately modest, explainable way. When a shift needs filling,
the system proposes people by checking three things:

1. Do they hold the required role?
2. Does their stated availability actually cover this window?
3. Are they already booked on an overlapping segment *on that date*?

People who fail those checks are still listed, with the reason shown, and can be assigned anyway —
the manager is never blocked, just informed.

### The loop that connects them

```
staff availability
   → manager builds / reviews the schedule
   → schedule published
   → staff accept or decline
   → a decline opens a COVERAGE GAP
   → the gap appears in NEEDS ATTENTION
   → manager finds a replacement
   → gap closes, attention item resolves, dashboard updates
```

This chain is implemented, not mocked per-screen. It was verified in a headless browser:
declining raises the attention count, assigning a replacement lowers it, and the event's badge
flips from "Short 1 staff" to "Fully staffed".

---

## Why These Features Are Prioritized

Discovery ranked these two highest, and they are causally linked rather than merely adjacent.
Scheduling is where last-minute change does the most damage — a single decline two days before a
wedding affects the segment, the event and the manager's confidence in the whole booking. A
"needs attention" dashboard with nothing feeding it is just a to-do list; staffing without a
feedback loop is just a rota. Together they produce the actual outcome: the manager finds out
about the problem without looking for it, and can fix it in two clicks from wherever they happen
to be.

Everything else in the prototype — vendors, payments, documents, change history — is supporting
context that exists so attention items have somewhere real to point.

---

## Low-Fidelity Prototype Notice

This prototype is deliberately **not** visually polished. It uses a greyscale neutral ramp, a
single accent colour, system sans-serif type, 1px borders, minimal corner radius, no gradients, no
shadows, no photography and almost no animation.

Users are told this in two places:

- A modal on first entry (`components/IntroModal.jsx`).
- A persistent **"Low-fidelity prototype"** badge in the top bar, plus a note in the sidebar
  reading *"Simulated data. Nothing here is saved to a real system."*

---

## Prototype Goal

Testers are given this goal in the opening modal:

> **The Johnson Wedding is this Saturday. Review what needs attention and make sure the event is
> fully staffed.**

The modal does **not** say which buttons to press. The seeded scenario supporting it:

- **Johnson Wedding** — Saturday 19 September 2026, 150 guests, 4:00 PM ceremony
- Segments: Setup 9:00–3:00 (2 grounds) · Ceremony 3:00–5:00 (1 manager + 2 event staff) ·
  Reception 5:00–9:00 (1 manager + 2 event staff + 1 bartender + 1 server) · Cleanup 9:00–11:00
- **Jake Pearson has declined the ceremony shift** — leaving the event short 1 Event Staff
- An unanswered client request to move decorating to 9:00 AM
- A catering guest-count deadline due today
- A final balance of $4,250 due tomorrow
- An unsigned day-of timeline

---

## Screen Map

**30 distinct routes.** Every one has a job; none are filler.

### Overview
| # | Route | Screen |
|---|---|---|
| 1 | `/` | Dashboard (entry) |
| 2 | `/attention` | Needs Attention Center |
| 3 | `/calendar` | Calendar |
| 4 | `/events` | Upcoming Events |

### Event management
| # | Route | Screen |
|---|---|---|
| 5 | `/events/[id]` | Event Overview |
| 6 | `/events/[id]/timeline` | Event Timeline |
| 7 | `/events/[id]/tasks` | Event Tasks |
| 8 | `/events/[id]/staffing` | Event Staffing |
| 9 | `/events/[id]/vendors` | Event Vendors |
| 10 | `/events/[id]/payments` | Event Payments |
| 11 | `/events/[id]/messages` | Event Messages |
| 12 | `/events/[id]/documents` | Event Documents |
| 13 | `/events/[id]/history` | Event Change History |
| 14 | `/events/new` | Create Event |

### Staffing
| # | Route | Screen |
|---|---|---|
| 15 | `/staff` | Staff Directory |
| 16 | `/staff/[id]` | Staff Member Detail |
| 17 | `/staff/availability` | Staff Availability |
| 18 | `/schedule` | Weekly Schedule |
| 19 | `/schedule/planner` | Event Staffing Planner |
| 20 | `/schedule/shifts/[shiftId]` | Shift Detail |
| 21 | `/schedule/publish` | Publish Schedule |
| 22 | `/schedule/gaps` | Coverage Gaps |
| 23 | `/schedule/gaps/[gapId]` | Replacement Suggestions |
| 24 | `/schedule/requests/[reqId]` | Coverage Request Detail |

### Communication & people
| # | Route | Screen |
|---|---|---|
| 25 | `/messages` | Message Inbox |
| 26 | `/messages/[id]` | Message Detail / Reply |
| 27 | `/clients` | Clients |
| 28 | `/clients/[id]` | Client Detail |
| 29 | `/vendors` | Vendors |
| 30 | `/vendors/[id]` | Vendor Detail |

Dynamic routes are statically generated for every seeded record — 278 HTML pages in total, so any
of them can be deep-linked.

---

## Usability Principles Implemented

**Guide attention.** The dashboard's first substantive block is the attention queue. Urgent items
get a 4px red left rule, a heavier title and the only filled button in the list; "due soon" items
are quieter and render in compact form. Of the four metric tiles, only the ones that imply work are
tinted.

**Gestalt — proximity.** The four facts a manager is constantly asked for (date, schedule, guests,
spaces) sit in one bordered strip directly under the event name and stay there across all nine
event tabs (`components/EventHeader.jsx`).

**Gestalt — similarity.** One component per job, used everywhere: every status is a `StatusBadge`,
every list row is a `ListRow`, every grouping is a `Card`. Five vendors looking identical is what
makes the sixth, flagged amber, obvious.

**Common region.** Every group of related content sits inside a visible bordered `Card`. The tab
strip and its panel form a single region so "Payments" and its contents read as one object.

**Hierarchy.** Four type sizes and three weights do all the work. The dashboard `h1` is the product
promise; metric tiles are secondary; the "how this list is built" explainer is smallest.

**Signifiers / affordances.** Buttons are bordered and filled at rest, not on hover. Clickable rows
carry a trailing chevron. Tabs show an underline plus bold weight when active. Focus states are a
2px accent outline, always visible. Nothing relies on hover alone.

**Conventions.** Left sidebar, top bar, breadcrumbs, tabs, checkboxes, a modal with Cancel on the
left and the primary action on the right — all standard admin-tool patterns.

**Feedback.** Every meaningful action fires a toast (`ToastHost`, `role="status"`): "Marisol Vega
assigned to Johnson Wedding — Ceremony. Gap closed.", "Schedule published to 8 people.",
"Completed 'Send final guest count'.", "Reply sent to Marla Perez."

**Visibility of system status.** Coverage is shown as "12 of 13 roles confirmed" with a bar;
schedules are labelled Draft or Published; shifts read Accepted / Pending / Declined; the sidebar
carries live counts for attention, gaps and unread messages.

**Error prevention.** Declining a shift, assigning someone with a scheduling clash, removing an
assignment and publishing a schedule all route through a confirmation dialog that states the
consequence ("This will open a coverage gap for Ceremony and raise an item in Needs Attention").

**Recognition over recall.** The message reply screen shows the event context beside the message —
current setup window, earliest venue access, whether anything is booked the night before — so the
manager can answer without going to look it up.

**Consistency.** Status tone → colour → icon → label is one mapping defined once in
`primitives.jsx` and used by every screen.

**Progressive disclosure.** The event workspace is nine tabs rather than one long page. The
attention list has kind and event filters. Availability grids expand per person on request.

**User control.** Every dialog has Cancel and closes on Escape or backdrop click. Every detail
screen has a back route. Breadcrumbs appear on every non-dashboard screen. "Reset prototype data"
restores the seeded scenario at any time.

**Accessibility.** Semantic `<table>`/`<ol>`/`<dl>` markup, `<button>` for actions and `<a>` for
navigation, labels bound to every form control, `aria-current` on active nav, `aria-expanded` on
disclosures, `aria-pressed` on filter toggles, `role="status"` on toasts, `sr-only` text on
icon-only controls, and a `prefers-reduced-motion` guard.

---

## Attention Design

An intentional status hierarchy, defined once and never varied:

| Tone | Meaning | Colour | Glyph | Where it outranks |
|---|---|---|---|---|
| `urgent` | Needs action now | red | ⚠ triangle | top of every list |
| `warn` | Due soon | amber | clock | below urgent |
| `pending` | Awaiting a reply | blue | clock | informational |
| `done` | Confirmed / complete | green | tick | settled |
| `info` | Informational | grey | i | lowest |

**Colour is never used alone.** `StatusBadge` always renders colour **plus** an icon glyph **plus**
a text label, so the meaning survives greyscale printing and colour-blindness. Urgency is
additionally signalled by position (sorted first), border weight (4px left rule) and button
prominence.

---

## Event Types

The platform is not wedding-only. Seeded events cover Wedding, Birthday, Corporate Event, Reception
and Anniversary; `/events/new` offers all eight types (adding Ceremony, Graduation and Other) and
changes its optional fields with the selection — a corporate event asks for AV requirements and a
purchase-order number, a wedding asks for ceremony and rehearsal times. The underlying structure
(segments, staffing, tasks, payments) is shared.

---

## Design Library / Component Reuse

Two files hold the entire visual system. No screen re-implements a border, a status colour or a
button.

**`components/ui/primitives.jsx`**
`Icon` · `Button` (4 variants × 3 sizes) · `StatusBadge` (7 tones) · `Card` · `PageHeader` ·
`Breadcrumbs` · `Tabs` · `EmptyState` · `Alert` · `ListRow` · `Field` · `Avatar` · `TextInput` ·
`Select` · `Textarea` · `SectionNote` · `MetricTile`

**`components/ui/domain.jsx`**
`AttentionItem` · `EventCard` · `EventRow` · `StaffCard` · `ShiftCard` · `EventSegment` ·
`AvailabilityGrid` · `TaskRow` · `Modal` · `ToastHost` · `useConfirm`

**Shell:** `components/AppShell.jsx` (sidebar + top bar + mobile nav) ·
`components/EventHeader.jsx` (event identity + tab bar) · `components/IntroModal.jsx`

**Design tokens:** `app/globals.css` defines spacing, type, radius, neutrals, the single accent and
the five status ramps as CSS custom properties consumed through Tailwind v4's `@theme`.

**State:** `lib/store.jsx` — one context holding assignments, task/message/document state and
derived gaps and attention items, persisted to `localStorage`.

---

## Team Responsibilities

Fill these in with real names. The codebase is split so these four areas can be worked on without
editing the same files.

- **[Team Member]** — Dashboard / Needs Attention — `app/page.jsx`, `app/attention/`, `app/calendar/`
- **[Team Member]** — Events — `app/events/`, `components/EventHeader.jsx`
- **[Team Member]** — Staffing — `app/schedule/`, `app/staff/`, `lib/mock/staff.js`
- **[Team Member]** — Communication & people — `app/messages/`, `app/clients/`, `app/vendors/`

Shared files to coordinate on before editing: `lib/store.jsx`, `components/ui/*`, `app/globals.css`.

---

## Running Locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Production build:

```bash
npm run build     # static export into out/
npx serve out
```

**Resetting:** the prototype remembers your changes in `localStorage`. Use **Reset prototype data**
in the sidebar to restore the seeded scenario.

---

## Public Deployment

Deployed from `main` to GitHub Pages by `.github/workflows/deploy.yml`:

**<https://mitchfranks.github.io/vue/>**

---

## Known Prototype Limitations

- **No backend.** All state is React context plus `localStorage`, scoped to one browser.
- **Creating an event does not persist.** `/events/new` validates and confirms, but the five seeded
  events are fixed so every tester sees the same scenario. The screen says so.
- **Staff cannot log in.** Accept/decline is performed by the manager on the staff member's behalf,
  which is how the loop is demonstrated in a single-user prototype.
- **No real notifications.** "Publish schedule" and "Send reply" change state and show confirmation,
  but nothing leaves the browser.
- **The calendar is one month.** Only September 2026 is populated.
- **Availability is read-only.** Staff availability is seeded and viewable but not editable here;
  in the real product staff would submit it themselves.
- **Coverage counts confirmed staff only.** A pending shift deliberately does not count as covered,
  which is why an event can show a gap while someone is still deciding.
