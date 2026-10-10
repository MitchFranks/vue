# Storybook plan

Storybook is where the design system is **documented and exercised**. Foundations pages render
the live tokens, and every primitive has stories for its variants at phone, tablet and laptop
widths, in light and dark. Phase 1 covers Foundations and the 20 primitives.

---

## 1. Versions

| Package | Version | Why |
|---|---|---|
| `storybook` | 10.6.x | Current major |
| `@storybook/nextjs-vite` | 10.6.x | Peer-supports `next ^16` and `react ^19`; mocks `next/link`, `next/navigation` and `next/font` (Geist is loaded through `next/font/local`) |
| `@storybook/addon-docs` | 10.6.x | MDX Foundations pages and autodocs |
| `vite` | ^7 | Required peer of `nextjs-vite` |

Viewport presets are built into Storybook core. `addon-a11y` and `addon-vitest` are phase 3.

Install with `npx storybook@latest init`, pick the Next.js (Vite) framework, then delete the
generated example stories.

---

## 2. Configuration

### `.storybook/main.js`

```js
/** @type {import('@storybook/nextjs-vite').StorybookConfig} */
export default {
  framework: '@storybook/nextjs-vite',
  stories: ['../docs/design-system/foundations/*.mdx', '../components/ui/**/*.stories.jsx'],
  addons: ['@storybook/addon-docs'],
  staticDirs: ['../public']
}
```

Tailwind v4 reaches Storybook through the existing `postcss.config.mjs`.

### `.storybook/preview.jsx`

1. **Real tokens:** `import '../app/globals.css'`.
2. **Real fonts on `<html>`.** `--font-sans` resolves `var(--font-geist-sans)` at `:root`, so
   `GeistSans.variable` and `GeistMono.variable` must be added to `document.documentElement`,
   not a wrapper div. A decorator does this once.
3. **Theme toolbar:** a global `theme` with `light`, `dark` and `system`, the same three options
   as the Settings control. The decorator calls `applyTheme()` from `lib/theme.js` (the function the
   app's boot script and Settings use), so stories and the app can't switch themes differently.
   This depends on phase 1 step 2: the dark tokens must also apply under `[data-theme="dark"]`, not only inside
   `@media (prefers-color-scheme: dark)`:

   ```css
   @media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { /* dark tokens */ } }
   :root[data-theme='dark'] { /* same dark tokens */ }
   ```

   Storybook backgrounds are turned off. The canvas colour comes from the `canvas` token, so it
   follows the theme.
4. **Viewports** (`parameters.viewport.options`), matching the target devices:

| Name | Width × height |
|---|---|
| Mobile S | 360 × 740 |
| iPhone | 390 × 844 |
| Mobile L | 430 × 932 |
| Tablet portrait | 768 × 1024 |
| Tablet landscape | 1024 × 768 |
| Laptop 13" | 1280 × 800 |
| Laptop 14" | 1512 × 982 |

`parameters.layout = 'padded'`.

### Scripts

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build -o storybook-static"
```

Add `storybook-static` to `.gitignore`.

---

## 3. Foundations pages (MDX)

These live in `docs/design-system/foundations/`, next to this plan.

| Page | Contents |
|---|---|
| `Introduction.mdx` | The five principles from `STYLE-GUIDE.md` §1, links to the style guide and TYPOGRAPHY.md |
| `Typography.mdx` | Every role rendered live, with size, line height and weight **read from the DOM via `getComputedStyle`** so it can't drift; a fluid demo to resize; Sans vs Mono numbers; do / don't for the §7 rules |
| `Colour.mdx` | Every token from `STYLE-GUIDE.md` §2 as swatches that switch with the theme toolbar, with live contrast ratios against `canvas` and `surface` |
| `Space-shape-depth.mdx` | The 0.25rem (4px) spacing steps (1, 2, 3, 4, 6, 8, 12), shown at the default and a 20px root, `radius-sm` / `md` / `pill` and what each means, `shadow-raised` vs `shadow-overlay`, `ease-calm` timings, the focus ring |
| `Voice.mdx` | The voice rules and "Up Next" priority wording from `STYLE-GUIDE.md` §6–7 |

Small helpers (`TypeSpecimen`, `Swatch`, `TokenTable`) live in `docs/design-system/foundations/blocks/`.

---

## 4. Primitive stories

One `*.stories.jsx` per component, co-located after the split (`components/ui/Button.jsx` +
`Button.stories.jsx`). CSF3 with `tags: ['autodocs']`.

| Group | Components | Required stories |
|---|---|---|
| Actions | `Button` | primary / secondary / ghost / danger × sm / md / lg; with icon; disabled; as link; "one primary per region" example |
| Status | `StatusBadge`, `Alert`, `Count` | Every tone; `Count` hidden at zero |
| Layout | `Card`, `PageHeader`, `SectionNote`, `EmptyState` | Optional slots on/off; long titles at Mobile S |
| Navigation | `Breadcrumbs`, `Tabs` | Overflow at Mobile S; active tab; tab with `Count` |
| Data display | `ListRow`, `Field`, `MetricTile`, `Avatar`, `Icon` | Truncation; link vs static; every metric tone; icon gallery |
| Forms | `TextInput`, `Select`, `Textarea` | Default, hint, focus, disabled; checked at iPhone width for the 16px control size |
| Overlays | `Modal`, `ToastHost` | Open with footer; stacked toasts |

Conventions:

- **Titles mirror the groups:** `title: 'Primitives/Actions/Button'`.
- **A `Mobile` story** for each layout-sensitive component (`PageHeader`, `Tabs`, `Card`,
  `ListRow`, `MetricTile`), with `globals: { viewport: { value: 'mobileS' } }`.
- **A `Dark` story** where colour carries meaning (`StatusBadge`, `Alert`, `Button`), with
  `globals: { theme: 'dark' }`, so both themes are always visible in review.
- **Realistic copy** from `lib/mock/*`: couples, venues, run-of-show blocks. Include a long-name case.
- Stories follow the same lint **errors** as `components/ui/`.

---

## 5. Keeping Storybook honest

- **Tokens are read, never copied.** Foundations pages compute values from the live CSS.
- **CI builds it:** `npm run build-storybook` runs in the deploy workflow after `npm run build`.
  Publishing it is phase 3.
- **A new primitive is done when it has:** a component file, a story for every variant (light
  and dark), and a row in `STYLE-GUIDE.md` §5.
