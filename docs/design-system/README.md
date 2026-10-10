# Vue design system — plan

Status: **planned** · Builds on the Geist design system from PRs #4–#7
(`design-system/1-foundations` … `4-screens`).

The visual language (colour, type, shape, voice) is defined in [`docs/STYLE-GUIDE.md`](../STYLE-GUIDE.md)
and implemented in `app/globals.css` and `components/ui/`. That is the source of truth for **what
Vue looks like**. This folder plans the next step: making that system **responsive, documented
in Storybook, and enforced**.

| File | What it covers |
|---|---|
| [README.md](README.md) | Where the system stands, goals, scope, phases, open questions |
| [TYPOGRAPHY.md](TYPOGRAPHY.md) | Type roles and tokens, the fluid changes for mobile/tablet/laptop, implementation rules |
| [STORYBOOK.md](STORYBOOK.md) | Storybook setup, light/dark theming in stories, story inventory |
| [ENFORCEMENT.md](ENFORCEMENT.md) | The type lint check, where it errors vs warns, CI wiring |

---

## 1. Where the system stands

The Geist system already fixed most of what the earlier prototypes got wrong. An audit of
`app/` and `components/` (`*.jsx`) after PR #7:

| Check | Result |
|---|---|
| Arbitrary sizes (`text-[13px]`) or Tailwind defaults (`text-sm`) | **0**. Every size is one of the six roles |
| Bold weights (`font-semibold` / `bold`) | **0**. Only 300 / 400 / 500 |
| `dark:` variants, hex values, `text-white` in components | **0**. Dark mode is purely token-driven |
| Role usage | `label` 142 · `small` 94 · `body` 50 · `heading` 17 · `title` 11 · `display` 5 |

**What is still missing:**

1. **Type is fixed-size, with one hard jump.** Roles are px values that never change. Page titles
   jump from 24px to 40px at the 640px breakpoint (`text-title sm:text-display` in `PageHeader`
   and `Landing`), and `MetricTile` figures are 40px even in a two-up grid on a 360px phone.
2. **Inputs are 14px.** iOS Safari zooms the whole page when a field under 16px gets focus,
   which happens on every form in the app on an iPhone.
3. **Roles don't carry their weight.** The style guide gives each role a weight (display 300,
   heading 500, …), but the tokens only set size, line height and tracking, so every call site
   adds `font-light` / `font-medium` by hand, and they drift (modal titles are 300 in `Modal`,
   500 in `Drawer`).
4. **About 40 local overrides.** 20× `leading-*` (mostly `leading-relaxed` on multi-paragraph
   text, which suggests a missing role), 4× `tracking-wide` and 1× `uppercase` (against the
   sentence-case rule), 13× the legacy `.eyebrow` class, and 2× `.display`.
5. **Breakpoints don't match the target devices.** `sm:` (640) ×73, `lg:` ×21, `md:` ×3. Nothing
   is aimed at tablet portrait (768).
6. **Dark mode can only follow the OS.** The dark tokens sit inside
   `@media (prefers-color-scheme: dark)`, so neither Storybook nor a user setting can switch themes.
7. **No Storybook, and `npm run lint` is broken.** It calls `next lint`, which Next 16 removed.

---

## 2. Goals

| Decision | Choice |
|---|---|
| Visual language | The Geist system as defined in `STYLE-GUIDE.md`. This plan does not change colours, fonts or shape |
| Responsive strategy | **Fluid** `display` and `title` with `clamp()`. Reading sizes (heading, body, small, label) stay fixed. Call sites never use breakpoint prefixes on type |
| Target viewports | Mobile **360–430**, tablet **768–1024**, laptop **1280–1512**. Type stops growing at 1280 |
| Units | Type tokens move from px to **rem**. At the default 16px root the rendered sizes are identical, and the user's browser font-size setting is respected |
| Storybook phase 1 | **Foundations docs** + the **20 primitives**, with a light / dark / system toolbar |
| Scope | **Tokens + primitives.** Pages and feature components are not edited; they get lint warnings |
| Enforcement | **Lint + docs.** Errors in `components/ui/` and stories, warnings everywhere else |

### Non-goals

- Changing the palette, the font, the spacing scale or component visuals.
- A user-facing theme switch in Settings. Phase 1 only adds the hook (`data-theme`) that makes one possible.
- Domain components (`EventCard`, `AssignmentCard`, …) in Storybook. They need store decorators (phase 3).

---

## 3. Visible changes (all small)

1. **Page titles on phones** go from 24px to 28px, then grow smoothly to 40px at 1280px instead
   of jumping at 640px.
2. **Metric figures on phones** go from 40px to 28px, matching `display`.
3. **Modal and drawer titles** scale 20→24px, so they're 4px smaller on phones.
4. **Inputs on phones** go from 14px to 16px text. From 768px up they stay 14px.
5. **Long-form text** (messages, guide, settings) gets one consistent line height through a new
   `body-long` role instead of ad hoc `leading-relaxed`.

---

## 4. Phases

### Phase 1: tokens, Storybook, primitives (this plan)

| # | Step | Output |
|---|---|---|
| 1 | Install Storybook 10 (`@storybook/nextjs-vite`), wire `globals.css`, Geist, the theme toolbar and viewport presets | `.storybook/`, `npm run storybook` ([STORYBOOK.md](STORYBOOK.md) §2) |
| 2 | Add `data-theme` support to `globals.css`: dark tokens apply under `[data-theme="dark"]` *or* OS dark when no theme is forced | Storybook and a future setting can switch themes |
| 3 | Type tokens: px → rem, fluid `display` / `title`, `--text-*--font-weight` on every role, new `body-long` and `control` roles | [TYPOGRAPHY.md](TYPOGRAPHY.md) §3–4 |
| 4 | Split `primitives.jsx` (18 components) into one file per component; move generic `Modal` and `ToastHost` out of `domain.jsx`. Keep both files as barrels so no import changes | `components/ui/Button.jsx`, … (20 primitives) |
| 5 | Update primitives to the new roles and drop redundant weight classes (mapping in [TYPOGRAPHY.md](TYPOGRAPHY.md) §6). Fixes the 3 violations in `components/ui/` | No overrides left in `components/ui/` |
| 6 | Foundations MDX pages + one story file per primitive | [STORYBOOK.md](STORYBOOK.md) §3–4 |
| 7 | Type lint script; replace the broken `lint` script; run lint and `build-storybook` in CI | [ENFORCEMENT.md](ENFORCEMENT.md) |
| 8 | Check every route at 375 / 768 / 1280, light and dark | Notes in the PR |
| 9 | Update `STYLE-GUIDE.md` §3 (type table and the fluid rule) and link it here | One source of truth |

**Done when:** Storybook shows Foundations + 20 primitives in both themes; `npm run lint`
reports 0 errors; `npm run build` and `npm run build-storybook` pass; every route has been
checked at the three widths.

### Phase 2: page sweep (small)

Clear the ~40 warnings in 20 files (`leading-relaxed` → `text-body-long`, drop `tracking-wide` /
`uppercase`, `.eyebrow` → `text-small text-ink-muted`, `.display` → `text-title`). Delete the
`.eyebrow` / `.display` classes, remove Tailwind's default size scale (`--text-*: initial`), and
make every lint warning an error. Settle breakpoints on `md` / `lg` / `xl`.

### Phase 3: wider Storybook

Domain components with store/mock decorators, `@storybook/addon-a11y` (contrast checks in both
themes), interaction tests via `@storybook/addon-vitest`, publishing Storybook alongside the
GitHub Pages build.

---

## 5. Open questions

1. **Body size.** The Geist system uses a 14px body. Earlier planning asked for 16px. This plan
   keeps 14px (it's what the design calls for and every screen is built on it) and handles the one
   real mobile problem, input zoom, with the `control` role. Revisit after testing on a phone.
2. **Spacing units.** `--spacing: 4px` is fixed px. Moving it to `0.25rem` changes nothing at the
   default root but makes layout scale with the browser font setting too. Worth doing, but it
   touches every layout, so it's left out of phase 1.
3. **`/style-guide` route.** Keep it as a quick in-app reference, or replace it with a link to
   Storybook once Storybook is published (phase 3)?
4. **User theme setting.** Once `data-theme` exists, should Settings offer Light / Dark / System?
