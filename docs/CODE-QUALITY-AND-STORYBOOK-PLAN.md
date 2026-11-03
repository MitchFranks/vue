# Code quality review and Storybook plan

Written 2026-11-03 against `main` at `b5cdf6c`. This doc has two parts:

1. **Review**: what the codebase does well, and improvements ranked by payoff.
2. **Storybook plan**: the story list for the components the design-system plan leaves for later.

> **Read with [`docs/design-system/`](design-system/README.md).** That plan is the team's
> decision record for Storybook setup, theming, foundations, the 20 primitive stories, the type
> lint and retiring `/style-guide`. Where this doc and that one differ, that one wins. This doc
> adds the code-structure review and the stories for records, product and connected components
> (its "phase 3").

### Status (branch `refactor/component-structure`)

| # | Item | Status |
|---|---|---|
| 1 | Lint | **Done.** ESLint flat config (`eslint.config.mjs`, `eslint-config-next/core-web-vitals`), `npm run lint` = `eslint .`, 0 errors / 0 warnings. The type-lint script in `design-system/ENFORCEMENT.md` can run alongside it (`eslint . && node scripts/lint-type.mjs`). Not yet in CI. |
| 2 | Tests | Deferred. |
| 3 | Split library files | **Done.** One file per component in `components/ui/` (barrel `index.js`), `components/records/` (barrel), product components to `components/tasks/`, `components/events/`, `components/layout/`. Imports updated to `@/components/ui` / `@/components/records`; the old `primitives.jsx` / `domain.jsx` / `records.jsx` are gone. |
| 4 | UI layer importing mock data | Left as is until there is real data. |
| 5 | Container / view splits | **Done** for `AppShell` (→ `TopBar`, `Sidebar`, `nav.js`), `TaskBoard` (→ `useTaskBoard` + `TaskBoardView`), `TaskCard` (→ `resolveTaskTags` + `TaskCardView`), `EventHeader` (→ `EventHeaderView`), `StaffPhone` (→ `PhoneFrame`, `TextThread`). `RoleCard` already took planner state as props. |
| 6 | Run of show page | **Done.** 638 → ~215 lines. `lib/timeline/layout.js` (pure maths), `components/timeline/` (`DayGrid`, `TimelineBlock`, `BlockEditor`, `RangeButton`, `useDayView`). |
| 7 | Cleanups | **Done:** store context value memoized; toasts moved to `lib/toasts.jsx` (`ToastProvider`, `useToast`) and drawn by `components/layout/AppToasts.jsx`; `components/AppProviders.jsx`; `lib/format.js` (`openSpots`, `clockLabel`, `hourLabel`, `timeLabel`) replacing 7 copies; `lib/id.js` (`newId`); `EventRow` / `SectionNote` deleted; `Staffing2*` → `Staffing*` (storage keys unchanged so saved data survives); `Tabs` is a labelled `<nav>`. |

The rest of this doc is the original review, kept for the reasoning.

---

## Part 1 — Review

### What is already good (keep doing it)

- **A real design library.** `components/ui/primitives.jsx`, `domain.jsx` and `records.jsx` are used everywhere, and the header comments explain the *rules* (never colour alone, one primary per region). Few student or prototype codebases have this.
- **Tokens in one place.** `app/globals.css` holds raw CSS variables (light and dark), and `@theme inline` maps them into Tailwind. Components never hard-code colours.
- **Accessibility is designed in.** Form fields wire `aria-invalid` / `aria-describedby`, the Modal traps focus and gives it back, toasts use `role="status"`, and badges carry a glyph plus words.
- **Derived state.** Tasks are computed from planner, message, document and payment state (`lib/store.jsx`), not stored twice.
- **Comments explain why, not what.** Keep this up.

### Improvements, by priority

#### P0 — Tooling that is broken or missing

1. **`npm run lint` does nothing useful.** `package.json` runs `next lint`, but Next 16 removed that command (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`: *"The `next lint` command has been removed. Use Biome or ESLint directly."*). ESLint isn't installed either, so the two `// eslint-disable-next-line react-hooks/exhaustive-deps` comments (`components/account/RequireAccount.jsx:52`, `components/staffing/StaffPhone.jsx:63`) point at a linter that never runs.
   - Fix: `npx @next/codemod@canary next-lint-to-eslint-cli .`, or add `eslint`, `eslint-config-next` and a flat `eslint.config.mjs` by hand. Set `"lint": "eslint ."`.
   - Add **Prettier** and write down the style the code already follows (no semicolons, single quotes, 2 spaces, no trailing commas). That way merges from four contributors stop drifting.
   - Add `npm run lint` and `npm run build` as a PR check in `.github/workflows/`. Today the only workflow deploys, and it runs only after merge.

2. **There are no tests.** The riskiest logic is pure and easy to test: `lib/tasks.js` (sort, filter, due info), `lib/staffing/derive.js` and `rules.js` (coverage, issues, suggestions), and `lib/directory/model.js` (validation). Add **Vitest** and start with those modules. Storybook interaction tests (Part 2) cover the components.

#### P1 — Component structure

3. **Split the three library files into one component per file.** `primitives.jsx` has 631 lines and about 20 exports. `domain.jsx` mixes general overlays (`Modal`, `ToastHost`, `useConfirm`) with product concepts (`TaskRow`, `EventCard`). Its header even reads *"a task, an event, a task, an overlay"*. Suggested layout:

   ```
   components/
     ui/                      # no product knowledge, no store, no mock data
       Button/Button.jsx
       Button/Button.stories.jsx
       StatusBadge/…  Card/…  Modal/…  Toast/…  forms/(TextInput, Select, Textarea, FormField)
       index.js               # re-exports, so `@/components/ui` imports keep working
     records/                 # RecordForm, ContactInfo, EntityList … (from ui/records.jsx)
     events/                  # EventCard, EventRow, EventHeader
     tasks/                   # TaskRow, ManualTaskRow, TaskCard, TaskBoard …
     staffing/  directory/  onboarding/  account/  layout/(AppShell, AccountMenu)
   ```

   Keep an `index.js` barrel so existing imports change in one place. Putting each story next to its component (`Button.stories.jsx`) makes it obvious when a component has no story.

4. **Keep the UI layer from depending on mock data or stores.** `components/ui/domain.jsx` imports `daysOutLabel` from `@/lib/mock/events`, and `ui/records.jsx` imports `RECORD_STATUS` from `@/lib/directory/model`. That makes the dependency run upward: the bottom layer knows about the data. Move formatting helpers into `lib/format.js` and pass labels in as props. Rule of thumb: **`components/ui/*` may import only `react`, `next/link`, `lib/cx` and other `ui/*` files.**

5. **Split container and presentational components where it matters.** About 20 components call `useStore()` / `useStaffing2()` / `useDirectory()` directly. Some also read module-level lookups such as `staffById` (`lib/staffing/derive.js:64`, from a mutable `WORLD`) or `directoryVendorById` (`lib/directory/registry.js`, a `let vendors` set by a provider). This works, but these components can't render without the full provider tree, and they depend on render order. For the components that matter most, split a thin connected wrapper from a props-only view:
   - `AppShell` → `AppShell` (reads store) + `Sidebar({ nav, counts, activeHref })` + `TopBar({ venueName })`
   - `TaskBoard` → `TaskBoard` (store) + `TaskBoardView({ items, completed, taskTypes, onToggle, onSave … })`
   - `TaskCard` → take resolved `couples`, `contacts` and `vendors` as props instead of looking them up
   - `EventHeader`, `StaffPhone`, `RoleCard/BlockCard` → same pattern

   `TaskToolbar` already works this way (all props, no store) and is a good model.

6. **Break up the large page files.** Page files should mostly compose components. The worst cases:
   - `app/(app)/events/[id]/timeline/page.jsx` (638 lines): move the layout math (`span`, column packing, snapping) to `lib/timeline/layout.js`, which is pure and testable. Move `RangeButton` and `Editor` to `components/timeline/`. Its local `INPUT` class re-creates the `CONTROL` style from `primitives.jsx:516`, which breaks the library's own rule. Use `TextInput` / `Textarea`.
   - `app/(app)/staffing/[eventId]/page.jsx` (388, local `Crew`), `staff/profile/page.jsx` (295, local `HoursModal`), `tasks/types/page.jsx` (`TypeRow`), `events/[id]/tasks/page.jsx` (`GuestCountTask`): move each local component into `components/<area>/`.

7. **One `AppProviders` component.** `app/layout.jsx` nests five providers, and the order matters (the comments explain why). Move them into `components/AppProviders.jsx` so the app and Storybook share the exact same tree. Then the order is defined in one place.

#### P2 — State and data hygiene

8. **The store context re-renders everything.** In `lib/store.jsx:578`, `value` is a new object every render, and toasts live in the same context. Every toast, every 4-second timeout and every edit re-renders every `useStore()` consumer. Two fixes:
   - Wrap `value` in `useMemo`.
   - Move toasts into their own `ToastProvider`. This also merges the two toast systems. Right now planner toasts and store toasts are combined in `AppShell` with a `plannerIds` set to route dismissals.

   `useStore()` also calls `useTimelineVersion()` (`lib/store.jsx:620`) only to force a redraw. That hidden link would go away if timeline edits flowed into the store as normal state.

9. **Remove duplicate helpers.**
   - `openSpotsText` (`lib/store.jsx:56`) duplicates `openSpots` (`components/ui/domain.jsx:19`).
   - Time and label formatting lives in four places: `hourLabel` (store), `timeLabel` (`lib/tasks.js`), `clockLabel` (`lib/timelineEdits.jsx`) and `fmtH` (`lib/staffing/derive.js`).
   - Gather them into `lib/format.js` with unit tests.

10. **One id helper.** Five places build ids from `Math.random()` / `Date.now()` (store, directory store, session, staffing store, timeline page). Use a `lib/id.js` built on `crypto.randomUUID()`.

11. **Dead code.** `EventRow` (`domain.jsx:123`) and `SectionNote` (`primitives.jsx:597`) are never imported. Delete them, or give them a use.

12. **Leftover names.** `Staffing2Provider`, `useStaffing2`, `Staffing2Nav` and the storage key `vue-lowfi-prototype-v9` are left over from the rewrite. Rename them to `StaffingProvider` / `useStaffing` once nothing else uses v1.

#### P3 — Accessibility and typing

13. **`Tabs` claims the ARIA tabs pattern without implementing it.** `primitives.jsx:331` sets `role="tablist"` / `role="tab"` / `aria-selected` on links that navigate to new URLs. It has no `tabpanel` and no arrow-key handling, so screen readers announce a widget that doesn't behave like one. Since these tabs are page navigation, drop the tab roles and use `<nav aria-label>` with `aria-current="page"`, which the component already sets.

14. **Document props.** The project is plain JS, so nothing checks props. Two options, cheapest first:
    - (a) JSDoc `@param` / `@typedef` on every exported component. Storybook autodocs reads these.
    - (b) Rename `jsconfig.json` → `tsconfig.json` with `allowJs` and `checkJs`, then convert `components/ui` to `.tsx` first.

    Start with (a). Do (b) only if the team wants it.

---

## Part 2 — Storybook plan

### Goals

- Every major component has stories that show its real states: tones, sizes, empty, error, loading and long text.
- Stories render with the real tokens, fonts and dark mode, so Storybook looks exactly like the app.
- Connected components render inside the real providers with fresh sample data on every story.
- Storybook builds in CI and publishes next to the prototype on GitHub Pages at `/storybook/`.

### Setup, foundations and primitives

Follow [`docs/design-system/STORYBOOK.md`](design-system/STORYBOOK.md): Storybook 10 with
`@storybook/nextjs-vite`, the light / dark / system toolbar, Foundations MDX, and one story file per
primitive next to it in `components/ui/`. `/style-guide` is retired once Storybook is published
(design-system decision).

Two additions for the stories below:

- **Providers decorator.** Connected stories set `parameters: { providers: true }` and the preview
  wraps them in `components/AppProviders.jsx`, the same tree the app uses. Clear `localStorage`
  in `beforeEach` so every story starts from the sample data.
- **Story globs.** Widen `stories` in `.storybook/main.js` to `../components/**/*.stories.jsx`.

### Records and product components that take props (1–1½ days)

Mostly pure. Story the `*View` halves (`TaskCardView`, `TaskBoardView`, `EventHeaderView`, `TopBar`, `Sidebar`, `PhoneFrame`, `TextThread`) with plain args. `RequestStatus` reads planner lookups, so it needs `parameters.providers: true`.

| Component | File | Stories |
|---|---|---|
| RecordStatusBadge | `ui/records` | Active, Inactive |
| ListToolbar + EntityList | `ui/records` | WithResults, NoResults with ClearFilters, SearchOnly, SearchAndFilters |
| DetailGrid / ContactInfo | `ui/records` | ContactInfo: AllFilled, Missing ("Not added"), TwoColumns. DetailGrid: AsideAndMain |
| RecordStatusCard | `ui/records` | Active, Inactive, DeleteBlocked, DeleteAllowed (play: confirm flow) |
| RecordForm / FormSection / Wide / CheckboxGroup | `ui/records` | ExampleForm with `useRecordForm` (play: submit empty → errors, first field focused) |
| TaskRow | `ui/domain` | Urgent, Warn, First (primary button), Compact, WithBadge |
| EventCard | `ui/domain` | WithTasks, AllSet, FullyStaffed, OpenSpots, Guided |
| ManualTaskRow | `ui/domain` | Open (urgent, warn, info due), Done (play: toggle) |
| TaskCardView | `tasks/TaskCard` | Manual, Message, OpenSpot, Document, WithTags, Completed, First |
| TopBar / Sidebar | `layout/` | Sidebar: each active item, WithBadges, MobileOpen. TopBar: WithVenue, NavOpen |
| EventHeaderView | `events/EventHeader` | FullyStaffed, OpenSpots, Urgent, each tab active |
| TimelineBlock / BlockEditor / RangeButton | `timeline/` | Block: plain, needs staff, urgent, short / tall. Editor: New, Edit, Errors. RangeButton: Open, Disabled |
| PhoneFrame / TextThread | `staffing/StaffPhone` | NoTexts, PendingAsk, Answered |
| TaskToolbar | `tasks/TaskToolbar` | Default, WithActiveFilters, SearchOpen (play: open Filter panel, Escape closes) |
| WhoPicker | `tasks/WhoPicker` | Empty, Selected |
| Staffing status chips | `staffing/StatusChip` | RequestStatus per status, CheckMark, OkdMark, OpenSpotChip (1 and many) |
| Staffing controls | `staffing/controls` | BlockToggles (with gaps), CallTimeSelect, PickChips |
| SkeletonCards | `staffing/Nav` | Three, One |
| AvailabilitySummary / AvailabilityEditor | `directory/Availability` | Summary: full week, part week, inactive. Editor: interactive |
| RecordNotFound | `directory/RecordNotFound` | Staff, Vendor |
| GuidedTour | `onboarding/GuidedTour` | FirstStep, MiddleStep, LastStep |
| IntroModal | `onboarding/IntroModal` | Default |
| AuthLayout | `account/AuthLayout` | WithForm, WithFooter, LocalAccountsNote |

### Connected components (1½–2 days)

Every story here sets `parameters: { providers: true }`, and `nextjs.navigation.pathname` too when the component reads the route. Planner flows (ask → send → reply) are the best candidates for `play` tests, because they show state moving across components.

| Component | File | Stories |
|---|---|---|
| AppShell | `layout/AppShell` | Default (pathname `/tasks`), MobileNavOpen (play: open menu). Most states are covered by the Sidebar / TopBar stories. |
| AccountMenu | `AccountMenu` | SignedIn (sample account set up in a loader), MenuOpen |
| PrototypeNotice | `onboarding/PrototypeNotice` | Default |
| DayGrid | `timeline/DayGrid` | Event 1, overlapping blocks (play: drag a block, expect onMoved) |
| TaskBoard | `tasks/TaskBoard` | Default, NewTask (play: open editor). Filtered states are `TaskBoardView` args. |
| TaskEditor | `tasks/TaskEditor` | New, EditExisting, ValidationError |
| StaffForm / VendorForm | `directory/*` | New, Edit (with a mock person or vendor), ValidationErrors |
| OptionSelect / ManageOptionsButton | `directory/*` | Role select with custom value, ManageOptions dialog open |
| Staffing2Nav | `staffing/Nav` | Each section active |
| BlockCard (RoleCard) | `staffing/RoleCard` | FullyStaffed, OpenSpots, WithWarnings, Highlighted |
| TimeChart | `staffing/TimeChart` | Event 1, Event 2 |
| AskPanel | `staffing/AskPanel` | Default, Hidden |
| EditNeeds | `staffing/EditNeeds` | Default |
| SendReview | `staffing/SendReview` | WithPreparedTexts (play: send → toast) |
| ChangeTimes / MarkOkDialog | `staffing/ChangeTimes` | Default |
| AwayDateForm | `staffing/AwayDateForm` | Manager, Staff |
| StaffPhone / PhoneDrawer | `staffing/StaffPhone` | NoTexts, PendingAsk (play: Tap to answer → confirm), MyDates tab, Drawer open |
| Landing | `Landing` | Default (layout `fullscreen`) |

`RequireAccount` and `OnboardingProvider` are infrastructure, not visual components, so they get no stories.

### Tests in CI (½ day)

- Add `@storybook/addon-vitest`. Every story becomes a smoke test (it renders without throwing), every `play` function becomes an interaction test, and with `a11y.test: 'error'` every story is checked with axe.
- Add a `ci.yml` PR workflow that runs `npm ci`, `npm run lint`, `npx vitest run` (unit and story tests) and `npm run build-storybook`.
- Later, if the team wants visual regression: Chromatic's free tier, or Playwright screenshots of the built Storybook.

### Order

1. Design-system phase 1 (setup, foundations, primitives), per `docs/design-system/README.md` §4.
   Its step 5 (split `primitives.jsx`) and the `next lint` part of step 8 are already done.
2. Records and product view stories (above), then connected stories.
3. Vitest addon, a11y gate, and `lint` + `build-storybook` in CI.

### Definition of done

- `npm run storybook` and `npm run build-storybook` succeed with no console errors.
- Every exported component in `components/` either has a stories file or is listed above as infrastructure.
- Every story passes the a11y check, or has a documented `a11y: { disable }` with a reason.
- CI runs lint, unit tests and story tests on every PR. `main` publishes Storybook at `<pages-url>/storybook/`.
