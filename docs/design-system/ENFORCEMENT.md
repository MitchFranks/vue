# Enforcing the type rules

The Geist system already has zero arbitrary sizes and zero bold weights. The lint check's job
is to keep it that way and to clear the last ~40 overrides.

---

## 1. Why a script, not an ESLint plugin

- `npm run lint` runs `next lint`, which **Next 16 removed**, so the script is broken today.
- The rules are about class strings, so a small Node script that scans `.jsx` files does the job
  with no new dependencies. If the team adopts ESLint later, the same patterns move into
  `no-restricted-syntax` and the scope table stays the same.

---

## 2. `scripts/lint-type.mjs`

Scans `app/**/*.jsx`, `components/**/*.jsx` and `**/*.stories.jsx` for class tokens matching:

| Rule | Pattern | Today | Message |
|---|---|---|---|
| `no-arbitrary-size` | `text-[…px\|rem\|clamp(…)]` | 0 | Use a type role (TYPOGRAPHY.md §3) |
| `no-default-size` | `text-(xs\|sm\|base\|lg\|[2-9]?xl)` | 0 | Use a type role |
| `no-bold` | `font-(semibold\|bold\|extrabold\|black)` | 0 | Vue never uses bold |
| `no-manual-leading` | `leading-*` | 20 | Line height comes from the role; reading text uses `text-body-long` |
| `no-manual-tracking` | `tracking-*` | 4 | Tracking comes from the role |
| `no-uppercase` | `uppercase` | 1 | Sentence case only |
| `no-responsive-type` | `(sm\|md\|lg\|xl\|2xl):text-<role>` | 2 | Roles are already fluid |
| `no-legacy-class` | `eyebrow`, `display` (as class tokens) | 15 | `text-small text-ink-muted` / `text-title` |
| `no-px-length` | Arbitrary px lengths: `*-[Npx]` (`min-w-[520px]`, `outline-offset-[-2px]`, …) | 27 | Use a spacing step or a rem value so layout follows the font setting |
| `no-input-body` | `text-body` inside a `<input>` / `<select>` / `<textarea>` className | n/a | Use `text-control` |

Colour utilities (`text-ink`, `text-status-now`, …) and alignment (`text-center`, `text-balance`)
are allowed by name from the `@theme` tokens.

Escape hatch: `// type-lint-ignore-next-line <reason>`. The reason is required, and every ignore
is listed in the summary so it stays visible in review.

The existing `STYLE-GUIDE.md` rules that also suit a string check (`dark:` variants, hex colours,
`text-white`, `focus:outline-none`) go in the same script as `no-dark-variant`, `no-hex`,
`no-text-white` and `no-outline-none`. All four are at 0 today.

---

## 3. Severity by location

| Path | Phase 1 | Phase 2 |
|---|---|---|
| `components/ui/**` and its stories | **error** (exit 1). 3 type and 2 px-length fixes in step 6 | error |
| `docs/design-system/**` (Foundations blocks) | **error** | error |
| `app/**`, other `components/**` | **warning**: per-file counts, exit 0 (≈39 type warnings across 19 files, plus 25 px lengths) | **error** |

The summary prints the warning total so progress through phase 2 is measurable.

---

## 4. Wiring

```json
"lint": "node scripts/lint-type.mjs"
```

This replaces the broken `next lint`. In `.github/workflows/deploy.yml`, run `npm run lint` before
`npm run build`, and `npm run build-storybook` after it.

Add a PR template (`.github/pull_request_template.md`) with:

```
- [ ] Text uses type roles only (no size, leading or tracking overrides)
- [ ] Checked at 375 / 768 / 1280, in light and dark
```
