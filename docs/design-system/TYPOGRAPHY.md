# Typography system

Geist for UI text, Geist Mono for numbers that align. Weights 300, 400 and 500 only. Hierarchy
comes from size and space, never bold (see [`STYLE-GUIDE.md`](../STYLE-GUIDE.md) §3).

This document specifies the type **roles** and **tokens**, the changes that make them work from
a 360px phone to a 1512px laptop, and the rules for using them. Components ask for a role
(`text-heading`), never a size.

---

## 1. Principles

1. **Roles, not sizes.** A role sets size, line height, tracking **and weight**. If a design needs
   something no role provides, change the roles here; don't override at the call site.
2. **Fluid anchors, fixed reading text.** `display` and `title` scale with the viewport.
   `heading`, `body`, `small` and `label` never change, because density and line length depend on them.
3. **Responsiveness lives in the tokens.** A role may change with the viewport inside
   `globals.css`. Call sites never use `sm:text-…` / `md:text-…`.
4. **rem, not px.** Type tokens and the spacing unit (`--spacing: 0.25rem`) are rem. They render
   the same at the default root, but text *and* the space around it grow together when a user
   raises their browser's default font size (WCAG 1.4.4). Radii and hairlines stay px.
5. **12px floor.** `label` is the smallest size that exists.

---

## 2. The scale

Fixed steps are unchanged from the Geist system. The two fluid steps interpolate linearly from
**360px** to **1280px** and hold above that, so every laptop from 1280 to 1512 gets the full size.

| Role | Today | 360 | 390 | 430 | 768 | 1024 | 1280–1512 |
|---|---|---|---|---|---|---|---|
| `display` | 24 → 40 at 640px (`PageHeader`); 40 everywhere (`MetricTile`) | 28 | 28.4 | 28.9 | 33.3 | 36.7 | 40 |
| `title` | 24 | 20 | 20.1 | 20.3 | 21.8 | 22.9 | 24 |
| `heading` | 16 | 16 | 16 | 16 | 16 | 16 | 16 |
| `control` *(new)* | 14 (via `body`) | 16 | 16 | 16 | 14 | 14 | 14 |
| `body` / `body-long` | 14 | 14 | 14 | 14 | 14 | 14 | 14 |
| `small` | 13 | 13 | 13 | 13 | 13 | 13 | 13 |
| `label` | 12 | 12 | 12 | 12 | 12 | 12 | 12 |

On phones, display is 2× body (28 / 14); on laptops it's 2.86× (40 / 14). The hierarchy
opens up where there's room for it.

```
size      = clamp(min, intercept + slope·100vw, max)
slope     = (max − min) / (1280 − 360)
intercept = min − slope · 360     (in rem, so zoom and font settings still apply)
```

---

## 3. Roles

| Role (utility) | Size | Line height | Tracking | Weight | Use for |
|---|---|---|---|---|---|
| `text-display` | 28 → 40 | 1.1 | −0.02em | 300 | The one anchor per screen: `PageHeader` title, `MetricTile` figure, landing headline |
| `text-title` | 20 → 24 | 1.25 | −0.01em | 300 | `Modal` / `Drawer` / dialog titles, the "Vue" wordmark |
| `text-heading` | 16 | 22px | 0 | 500 | `Card` titles, list item titles, page leads |
| `text-body` | 14 | 20px | 0 | 400 | Default UI text |
| `text-body-long` *(new)* | 14 | 22px | 0 | 400 | Two or more lines of reading text: messages, drafts, guide copy, settings explanations. Replaces `text-body leading-relaxed` |
| `text-control` *(new)* | 16 → 14 at 768px | 22px → 20px | 0 | 400 | Text inside `TextInput`, `Select`, `Textarea`. 16px on phones stops iOS from zooming on focus |
| `text-small` | 13 | 18px | 0 | 400 | Labels above values, metadata, buttons, tabs, hints |
| `text-label` | 12 | 16px | 0 | 500 | Status chips, counts, captions, table headers |

**Weight modifiers allowed on top of a role:** `font-normal` on `title`; `font-medium` on
`body`, `small` and `body-long` for emphasis inside running text; `font-normal` on `label`.
Nothing else, and never above 500.

**Numbers:**
- Times, money and counts that line up in tables, chips and `Count` use `font-mono tabular-nums`.
- Large figures (`display` in `MetricTile`, landing stats) stay Geist Sans with `tabular-nums`,
  because a light mono at 40px reads as code.

**Heading levels are independent of roles.** Choose `h1`–`h3` for the document outline and the
role for appearance. One `h1` per page (the `PageHeader` title).

**Line length:** reading text uses `max-w-prose` (65ch). The style guide caps it at 72 characters.

---

## 4. Tokens

All in `app/globals.css`. Tailwind v4's `--text-<role>` namespace generates `text-<role>`, and the
`--line-height`, `--letter-spacing` and `--font-weight` sub-properties ride along.

```css
@theme {
  --text-display: clamp(1.75rem, 1.4565rem + 1.3043vw, 2.5rem);
  --text-display--line-height: 1.1;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 300;

  --text-title: clamp(1.25rem, 1.1522rem + 0.4348vw, 1.5rem);
  --text-title--line-height: 1.25;
  --text-title--letter-spacing: -0.01em;
  --text-title--font-weight: 300;

  --text-heading: 1rem;
  --text-heading--line-height: 1.375rem;
  --text-heading--font-weight: 500;

  --text-body: 0.875rem;
  --text-body--line-height: 1.25rem;
  --text-body--font-weight: 400;

  --text-body-long: 0.875rem;
  --text-body-long--line-height: 1.375rem;
  --text-body-long--font-weight: 400;

  --text-control: var(--control-size);
  --text-control--line-height: var(--control-leading);
  --text-control--font-weight: 400;

  --text-small: 0.8125rem;
  --text-small--line-height: 1.125rem;
  --text-small--font-weight: 400;

  --text-label: 0.75rem;
  --text-label--line-height: 1rem;
  --text-label--font-weight: 500;
}

/* The one role that steps instead of flowing: inputs must be 16px on phones. */
:root {
  --control-size: 1rem;
  --control-leading: 1.375rem;
}
@media (width >= 48rem) {
  :root {
    --control-size: 0.875rem;
    --control-leading: 1.25rem;
  }
}
```

Fluid roles use **unitless** line heights so the leading scales with the size. Fixed roles keep
the exact line heights from the Geist system, converted to rem.

**Legacy classes,** deprecated in phase 1 and deleted in phase 2:

| Class | Uses | Replace with |
|---|---|---|
| `.eyebrow` | 13 | `text-small text-ink-muted` |
| `.display` | 2 (`GuideDialog`) | `text-title` (weight now comes from the role) |

**Phase 2** adds `--text-*: initial;` above the roles so Tailwind's default `text-xs … text-9xl`
no longer exist. Nothing uses them today, and this keeps it that way.

---

## 5. Responsive rules

| Tier | Width | Prefix | What changes |
|---|---|---|---|
| Mobile | 360–767 | (none) | Fluid roles near their minimum; inputs at 16px; one-column layouts |
| Tablet | 768–1279 | `md:` | Fluid roles mid-range; inputs drop to 14px; two-column layouts |
| Laptop | ≥1280 | `xl:` | Fluid roles at maximum, held through 1512 and beyond; sidebar and full layouts |

- **No breakpoint prefixes on type utilities.** `PageHeader` becomes plain `text-display`.
- **Layout breakpoints** standardise on `md` (768), `lg` (1024) for tablet landscape where
  needed, and `xl` (1280). The 73 existing `sm:` uses are left alone in phase 1 and reviewed in phase 2.
- Long names (couples, venues) get `break-words` in cards. Truncated text keeps a `title` attribute
  or the full value nearby.
- Test every type change at **375, 768 and 1280**, in **light and dark** (Storybook viewport and
  theme toolbars).

---

## 6. Primitive changes (phase 1)

| Component | Today | Becomes |
|---|---|---|
| `PageHeader` title | `text-title font-light text-balance sm:text-display` | `text-display text-balance` |
| `PageHeader` lead | `text-heading text-ink-muted` | unchanged; weight now from the role |
| `MetricTile` value | `text-display font-light tabular-nums` | `text-display tabular-nums` |
| `Modal` title | `text-title font-light` | `text-title` |
| `TextInput` / `Select` / `Textarea` (`CONTROL`) | `text-body`; Textarea adds `leading-6` | `text-control`; drop `leading-6` |
| `Avatar` | `font-medium tracking-wide` | `text-label` (no tracking) |
| `Count` | `font-mono text-label tabular-nums` | unchanged |
| Any `font-light` / `font-medium` that equals the role's default | n/a | removed (now redundant) |

Feature components outside `components/ui/` (e.g. `Drawer` titles at `font-medium`) are phase 2.
They'll come out at weight 300 unless the design asks for an exception.

---

## 7. Implementation rules (PR checklist)

1. Every piece of text uses a role utility. No `text-[…]`, no Tailwind default sizes.
2. No `leading-*` or `tracking-*`. If the line height is wrong, the role is wrong. Use `body-long`
   for reading text.
3. No breakpoint prefixes on type. Roles already respond.
4. Weights 300 / 400 / 500 only, and only the modifiers listed in §3.
5. Sentence case: no `uppercase`, no letter-spaced labels.
6. Inputs use `text-control`.
7. One `text-display` per screen, and the page's `h1` carries it.
8. Aligned numbers: `font-mono tabular-nums`. Large figures: `tabular-nums` only.
9. Adding or changing a role means updating this file, `STYLE-GUIDE.md` §3, the Typography story
   and `globals.css` in the same PR.
