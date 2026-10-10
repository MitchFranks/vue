# Vue — Style Guide

How Vue looks and sounds. The tokens live in `app/globals.css`; the shared components live in
`components/ui/`. A live version of this page (real components, real tokens) is at **`/style-guide`**
in the running app. When the two disagree, the code wins — fix this document.

**The feel:** bright, soft and friendly. A wedding venue's day is stressful, so the product should
feel like a calm, capable friend, not a control room. Round shapes, one clear accent, plenty of
air, and plain words.

---

## 1. Colour — five hues

Five colours do all the work. Anything outside this list needs a reason.

| Role | Name | Hex | Used for |
|---|---|---|---|
| **Action** | Violet `accent` | `#6B4BF0` (dark `#5636D6`, soft `#EFEAFF`, line `#D5CAFF`) | The primary button, links, active navigation, focus rings, "pending" |
| **Warmth** | Blush `blush` | `#FFD9E6` (deep `#FF8FB3`) | Decoration only: avatars, tags, background washes. Never a status, never clickable |
| **Settled** | Mint `done` | `#0C7358` on `#DFF8EE` | Confirmed, staffed, paid, signed |
| **Soon** | Sunshine `warn` | `#86560A` on `#FFF4D4` | Due soon, needs a look |
| **Now** | Coral `urgent` | `#C8372F` on `#FFECE9` | Act now: open positions, overdue, declined |

Supporting neutrals (not counted as hues): `ink` `#2A2145` for text (`ink-2` `#4A4268`, `muted`
`#6B6485`, `faint` `#9A94B3`), `canvas` `#FFF8F5` as the page, `surface` `#FFFFFF` for cards, `wash`
`#F7F2FF` / `wash-deep` `#EEE7FD` for quiet fills, `line` `#E7DFF5` for borders.

**Rules**
1. **One meaning per colour.** Violet means "you can act on this". Mint/sunshine/coral mean status.
   Blush means nothing, it is just friendly. A status is never violet; a button is never mint.
2. **Never colour alone.** Every status badge carries an icon and a word (`StatusBadge`).
3. **Soft fill, strong text.** Tinted backgrounds (`*-soft`) carry the saturated text colour of the
   same family. Do not put saturated fills behind body text.
4. **One filled violet button per screen region.** Everything else is a soft outline.
5. Text on the accent uses `text-on-accent` (white by default), never a hard-coded `text-white`;
   text on blush is `ink-2`.

### The accent is the user's colour

New users pick their accent in step 2 of the first-run guide (`components/onboarding/`), so
"violet" above really means "the accent". Violet `#6B4BF0` is only the default. The six curated
choices (`SWATCHES` in `lib/onboarding.js`: Violet, Berry, Ocean, Plum, Lagoon, Midnight) all carry
white text at 4.5:1 and sit away from the status hues. A custom colour is also allowed.

`deriveAccent()` turns the one chosen colour into every accent token and sets them on `<html>`
(an inline script in `app/layout.jsx` applies the saved set before first paint):

| Token | Derived as |
|---|---|
| `accent` | The chosen colour (deepened only if neither white nor ink text could reach 4.5:1 on it) |
| `on-accent` | **Contrast rule:** white if white reaches 4.5:1 on the accent, otherwise ink |
| `accent-dark` | Hover/pressed fill: moved away from the text colour, so contrast only goes up |
| `accent-soft` / `accent-line` | 90% / 70% toward white |
| `accent-text` | Accent used *as* text (`text-accent`): darkened until it reaches 4.5:1 on `accent-soft` |

Status colours (`done`, `warn`, `urgent`, and `pending` violet) are never themed, so a status can
not be mistaken for something clickable, whatever colour the user picks. Use the semantic names
(`bg-accent`, `text-on-accent`, `text-accent`) and the theme follows automatically.

Use the Tailwind names: `bg-accent`, `text-urgent`, `border-done-line`, `bg-canvas`, `text-muted`.
The older square-theme names (`brass`, `cream`, `sand`, `moss`, `paper`, `sunken`, `stone`) are gone.

---

## 2. Typography

One typeface: **Plus Jakarta Sans** (`font-sans`, also `font-display`). Hierarchy comes from weight
and size, never from a second font, italics, or uppercase tracking.

| Style | Class / size | Weight | Used for |
|---|---|---|---|
| Page title | `display` · 28 / 36px | 800 | `PageHeader` |
| Section title | 20–22px | 700 | Modal and large card titles |
| Card title | 14px | 700 | `Card` header |
| Body | 14–15px | 400–500 | Everything else |
| Label | `eyebrow` · 12px | 600 | Field labels, stat labels (sentence case) |
| Caption | 11–12px | 500 | Metadata, helper text |
| Big number | 36px | 800 | `MetricTile` figures |

Sentence case everywhere. No all-caps labels. Numbers use `tabular-nums` when they line up in a column.

---

## 3. Shape and depth

Nothing has a sharp corner.

| Element | Radius | Notes |
|---|---|---|
| Buttons, badges, tabs, nav items, chips | **Pill** (`rounded-full`) | |
| Inputs, selects, textareas, alerts | `rounded-2xl` (16px) | |
| Cards, tiles, empty states | `rounded-3xl` / `surface-card` (24px) | `overflow-hidden` so rows clip to the corner |
| Avatars | Circle | Blush fill, ink initials |

Depth is soft and tinted violet: `shadow-card` for resting surfaces, `shadow-pop` for the primary
button and the active nav pill. Borders are 1px `line`; cards mostly rely on the shadow instead.

**Motion:** interactive surfaces lift 2px on hover (`lift`, or built into `Button`/`MetricTile`) and
settle on press. Respect `prefers-reduced-motion` (handled globally).

---

## 4. Components

Always use the shared component rather than restyling by hand.

| Need | Use |
|---|---|
| Any action | `Button` — `primary` (filled violet), `secondary` (white pill), `ghost` (violet text), `danger` (coral outline). Sizes `sm` / `md` / `lg` |
| A status | `StatusBadge tone="urgent \| warn \| pending \| done \| info \| declined"` |
| A grouped subject | `Card` (one card = one subject) |
| A list of things | `ListRow` inside a `Card bodyClassName="px-0 py-0"` |
| A number with a label | `MetricTile` |
| A person | `Avatar` |
| Messages to the user | `Alert` (inline), toast (transient), `EmptyState` (nothing here yet) |
| Page navigation | `Breadcrumbs` + `Tabs` (pill tabs, each its own URL). Multi-screen features (the Staff Planner) use a `Tabs` bar shown on every screen, so any screen is one click from any other |
| Choosing the accent colour | `ThemePicker` (`components/onboarding/`), shared by the guide's step 2 and Settings. Account menu: `AccountMenu` |
| Forms | `TextInput`, `Select`, `Textarea`, label above, hint below |

**Layout:** page background is `canvas` with two faint washes; content max width 1120px; 16–32px
page padding; 16px gaps between cards. The sidebar is a list of pill links, the active one filled
violet.

---

## 5. Voice

- Plain words, sentence case, no jargon the venue manager would not say out loud.
- Say what happened and what to do next: "Jake declined the ceremony assignment. Find a replacement."
- Wedding vocabulary first: couple, guarantee, run of show, timeline block, open position. The
  canonical terms are in [`DATA-DICTIONARY.md`](./DATA-DICTIONARY.md).
- Friendly, not cute. No exclamation marks in errors.

---

## 6. Do / don't

| Do | Don't |
|---|---|
| One filled accent button per region | Two competing primary buttons |
| `text-on-accent` on an accent fill | `text-white` on `bg-accent` (breaks light user colours) |
| Round everything | Mix square and round corners |
| Pair every status colour with an icon and a word | Rely on colour to say "urgent" |
| Use blush for friendly decoration | Use blush as a status or a link |
| Put new colours in `globals.css` first, then document them here | Hard-code hex values in components |
| Keep copy in sentence case | ALL CAPS LABELS |

---

## 7. Changing the look

Edit tokens in `app/globals.css` (`@theme`). Because components only use the semantic names
(`accent`, `urgent`, `canvas`, `surface`...), a re-skin is a token change, not a component hunt. If
you add a token, add it to the table in section 1 and to the `/style-guide` page.

---

## 8. Priority without stress ("Up Next")

Operations software tends to shout. Vue should not. Priority is conveyed by **order, wording and
position**, not by alarm colours or ever-growing red counts.

- The list is called **Up Next**. Items are **Do first** or **Coming up**.
- Counters show only what to do first (`2 to do first`), never the total backlog. Empty = **All caught up**.
- "Do first" uses violet; "Coming up" uses sunshine. Coral is kept for genuine failures and used sparingly.
- Shortages say **Needs 1 more**, not "Short 1". Titles say what to do ("Reply to Marla"), not what is wrong.
- Never show a red badge for a plain count. Counts in the sidebar and top bar are soft violet.
