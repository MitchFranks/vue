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
| Body size | **14px body**, as the Geist system specifies. Form fields are 16px on phones only (`control` role) so iOS doesn't zoom |
| Units | Type tokens **and the spacing unit** move from px to **rem** (`--spacing: 0.25rem`). At the default 16px root everything renders identically, and type and layout both follow the user's browser font-size setting. Radii stay px |
| Theme | **Light / Dark / System** setting in Settings, built on a `data-theme` attribute. System (follow the OS) stays the default |
| Storybook phase 1 | **Foundations docs** + the **20 primitives**, with the same light / dark / system toolbar |
| `/style-guide` route | **Retired.** Storybook replaces it; the route and its sidebar link are deleted when Storybook is published (phase 3) |
| Scope | **Tokens + primitives**, plus the theme setting. Pages and feature components are not otherwise edited; they get lint warnings |
| Enforcement | **Lint + docs.** Errors in `components/ui/` and stories, warnings everywhere else |

### Non-goals

- Changing the palette, the font, the radii or component visuals.
- Converting the 27 arbitrary `[Npx]` lengths in classes (`min-w-[520px]`, `min-h-[…]`, …). They get a lint warning and move to rem or spacing steps in phase 2.
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
6. **Settings gains an Appearance card** with Light / Dark / System. The choice is kept on the
   device, like the guide settings, and applied before first paint so there's no flash.
7. **Users who raise their browser's default font size** now get bigger type *and* proportionally
   bigger spacing. At the default size nothing moves.

---

## 4. Phases

### Phase 1: tokens, Storybook, primitives (this plan)

| # | Step | Output |
|---|---|---|
| 1 | Install Storybook 10 (`@storybook/nextjs-vite`), wire `globals.css`, Geist, the theme toolbar and viewport presets | `.storybook/`, `npm run storybook` ([STORYBOOK.md](STORYBOOK.md) §2) |
| 2 | Add `data-theme` support to `globals.css`: dark tokens apply under `[data-theme="dark"]` *or* OS dark when no theme is forced | Storybook and the setting can switch themes |
| 3 | **Theme setting:** `lib/theme.js` (`THEME_KEY`, `getTheme`, `setTheme`, `applyTheme`, `THEME_BOOT_SCRIPT`). The boot script runs inline in `app/layout.jsx` `<head>` and sets `data-theme` from `localStorage` before paint, with `suppressHydrationWarning` on `<html>`. Settings gets an "Appearance" `Card` with a three-way Light / Dark / System control | Users can override the OS theme; no flash on load |
| 4 | Units and type tokens: `--spacing: 4px` → `0.25rem`; type px → rem; fluid `display` / `title`; `--text-*--font-weight` on every role; new `body-long` and `control` roles | [TYPOGRAPHY.md](TYPOGRAPHY.md) §3–4 |
| 5 | Split `primitives.jsx` (18 components) into one file per component; move generic `Modal` and `ToastHost` out of `domain.jsx`. Keep both files as barrels so no import changes | `components/ui/Button.jsx`, … (20 primitives) |
| 6 | Update primitives to the new roles and drop redundant weight classes (mapping in [TYPOGRAPHY.md](TYPOGRAPHY.md) §6). Fixes the 3 type violations in `components/ui/`; the 2 px lengths in `domain.jsx` (`min-w-[520px]`, `outline-offset-[-2px]`) move to rem | No overrides left in `components/ui/` |
| 7 | Foundations MDX pages + one story file per primitive | [STORYBOOK.md](STORYBOOK.md) §3–4 |
| 8 | Type lint script; replace the broken `lint` script; run lint and `build-storybook` in CI | [ENFORCEMENT.md](ENFORCEMENT.md) |
| 9 | Check every route at 375 / 768 / 1280, in light and dark, at the default font size and at 20px | Notes in the PR |
| 10 | Update `STYLE-GUIDE.md`: §3 type table and the fluid rule, §2 the theme setting, §4 spacing in rem. Mark `/style-guide` as deprecated in favour of Storybook | One source of truth |

**Done when:** Storybook shows Foundations + 20 primitives in both themes; the Settings theme
control works with no flash on reload; `npm run lint` reports 0 errors; `npm run build` and
`npm run build-storybook` pass; every route has been checked at the three widths.

### Phase 2: page sweep (small)

Clear the ~40 warnings in 20 files (`leading-relaxed` → `text-body-long`, drop `tracking-wide` /
`uppercase`, `.eyebrow` → `text-small text-ink-muted`, `.display` → `text-title`). Delete the
`.eyebrow` / `.display` classes, remove Tailwind's default size scale (`--text-*: initial`), and
make every lint warning an error. Settle breakpoints on `md` / `lg` / `xl`. Convert the remaining
25 arbitrary `[Npx]` lengths outside `components/ui/` to rem or spacing steps.

### Phase 3: wider Storybook, retire `/style-guide`

Domain components with store/mock decorators, `@storybook/addon-a11y` (contrast checks in both
themes), interaction tests via `@storybook/addon-vitest`, and publishing Storybook alongside the
GitHub Pages build. In the same change, delete `app/(app)/style-guide/` and point the sidebar link
in `AppShell.jsx`, `STYLE-GUIDE.md`, the root `README.md` and the `globals.css` header at Storybook.

---

## 5. Decisions log

| # | Question | Decision |
|---|---|---|
| 1 | Body size: 14px (Geist) or 16px? | **14px**, with 16px form fields on phones only |
| 2 | Spacing units: px or rem? | **rem now**, in phase 1 (`--spacing: 0.25rem`) |
| 3 | Keep `/style-guide` once Storybook exists? | **No.** Deleted when Storybook is published (phase 3) |
| 4 | Light / Dark / System setting? | **Yes**, in phase 1, defaulting to System |

## 6. Open questions

None right now. New ones go here, then move to the decisions log once answered.
