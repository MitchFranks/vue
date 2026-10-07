'use client'

// ---------------------------------------------------------------------------
// DESIGN LIBRARY — primitives
//
// Every screen in the prototype is assembled from these. Nothing re-implements
// a border, a status colour or a button style locally.
//
// SIMILARITY  One component per job, so anything with the same function looks
//             identical everywhere in the product.
// SIGNIFIERS  Buttons look raised and bordered at rest, not only on hover.
// NEVER COLOUR ALONE  StatusBadge always pairs a colour with a glyph and a word.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { cx } from '@/lib/cx'

/* ------------------------------------------------------------------ Icon -- */
// Deliberately simple monochrome glyphs — a low-fidelity prototype should not
// look like it has a bespoke icon set.

const PATHS = {
  alert: <path d="M12 3.6 2.8 19.6h18.4L12 3.6Zm0 5.8v4.4m0 3h.01" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  dash: <path d="M6 12h12" />,
  users: (
    <>
      <path d="M16 20v-1.6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M17 4.2a3.5 3.5 0 0 1 0 6.6M22 20v-1.6a4 4 0 0 0-3-3.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.5" />
      <path d="m3.4 6.5 8.6 6.2 8.6-6.2" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 2.8v18.4" />
      <path d="M16.5 6.7H9.9a2.9 2.9 0 0 0 0 5.8h4.2a2.9 2.9 0 0 1 0 5.8H7" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  arrowRight: <path d="M5 12h13.5M13 5.5l5.5 6.5-5.5 6.5" />,
  arrowLeft: <path d="M19 12H5.5M11 5.5 5.5 12 11 18.5" />,
  chevronRight: <path d="m9.5 5.5 7 6.5-7 6.5" />,
  chevronDown: <path d="M5.5 9.5 12 16.5l6.5-7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </>
  ),
  truck: (
    <>
      <path d="M2 7h12v9H2zM14 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8.2h.01" />
    </>
  ),
  send: <path d="M21.5 2.5 2.5 9.2l8 3.8 3.8 8 7.2-18.5Z" />,
  home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
}

export function Icon({ name, size = 16, className = '' }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      className={cx('shrink-0', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  )
}

/* ---------------------------------------------------------------- Button -- */

const BUTTON_VARIANTS = {
  primary: 'bg-accent text-white border-accent hover:bg-accent-dark',
  secondary: 'bg-paper text-ink border-line hover:bg-sunken',
  danger: 'bg-paper text-urgent border-urgent-line hover:bg-urgent-soft',
  ghost: 'bg-transparent text-ink-2 border-transparent hover:bg-sunken'
}

const BUTTON_SIZES = {
  sm: 'px-2.5 py-1 text-[13px] gap-1.5',
  md: 'px-3 py-1.5 text-sm gap-2',
  lg: 'px-4 py-2.5 text-[15px] gap-2'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  href,
  type = 'button',
  className = '',
  disabled,
  children,
  ...rest
}) {
  const cls = cx(
    'inline-flex items-center justify-center rounded-box border font-medium',
    'transition-colors disabled:opacity-45',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  )
  if (href && !disabled) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}

/* ----------------------------------------------------------- StatusBadge -- */
// NEVER COLOUR ALONE: tone -> {colour, glyph, default label}. Callers may pass
// their own text but they can never drop the glyph.

const TONES = {
  urgent: { cls: 'bg-urgent-soft text-urgent border-urgent-line', icon: 'alert', label: 'Urgent' },
  warn: { cls: 'bg-warn-soft text-warn border-warn-line', icon: 'clock', label: 'Due soon' },
  pending: { cls: 'bg-pending-soft text-pending border-pending-line', icon: 'clock', label: 'Pending' },
  done: { cls: 'bg-done-soft text-done border-done-line', icon: 'check', label: 'Confirmed' },
  info: { cls: 'bg-info-soft text-info border-info-line', icon: 'info', label: 'Info' },
  declined: { cls: 'bg-urgent-soft text-urgent border-urgent-line', icon: 'x', label: 'Declined' },
  empty: { cls: 'bg-sunken text-muted border-line', icon: 'dash', label: 'Unassigned' }
}

export function StatusBadge({ tone = 'info', children, size = 'md', className = '' }) {
  const t = TONES[tone] || TONES.info
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-pill border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs',
        t.cls,
        className
      )}
    >
      <Icon name={t.icon} size={size === 'sm' ? 11 : 12} />
      {children || t.label}
    </span>
  )
}

/* ------------------------------------------------------------------ Card -- */
// COMMON REGION: one card = one subject, always inside a visible boundary.

export function Card({ title, subtitle, icon, action, children, tone, className = '', bodyClassName = '' }) {
  return (
    <section
      className={cx(
        'rounded-box border bg-paper',
        tone === 'urgent' ? 'border-urgent-line' : 'border-line',
        className
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line-soft px-4 py-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              {icon && <Icon name={icon} size={15} className="text-muted" />}
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cx('px-4 py-3', bodyClassName)}>{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------ PageHeader -- */

export function PageHeader({ title, lead, actions, children }) {
  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
          {lead && <p className="mt-1 max-w-[70ch] text-sm text-muted">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  )
}

/* ----------------------------------------------------------- Breadcrumbs -- */

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <Icon name="chevronRight" size={12} className="text-faint" />}
          {item.href ? (
            <Link href={item.href} className="rounded px-1 py-0.5 text-accent underline-offset-2 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="px-1 py-0.5 text-ink-2">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

/* ------------------------------------------------------------------ Tabs -- */
// Rendered as real links so every tab is its own URL — that is what makes the
// navigation non-linear and deep-linkable.

export function Tabs({ tabs, active }) {
  return (
    <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-line pb-px" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            className={cx(
              'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm',
              isActive
                ? 'border-accent font-semibold text-accent'
                : 'border-transparent text-muted hover:text-ink'
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={cx(
                  'rounded-pill border px-1.5 text-[11px] font-semibold',
                  tab.tone === 'urgent'
                    ? 'border-urgent-line bg-urgent-soft text-urgent'
                    : 'border-line bg-sunken text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------ EmptyState -- */

export function EmptyState({ title, body, action, icon = 'check' }) {
  return (
    <div className="rounded-box border border-dashed border-line bg-sunken/40 px-4 py-8 text-center">
      <Icon name={icon} size={20} className="mx-auto mb-2 text-faint" />
      <p className="text-sm font-medium text-ink">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-[46ch] text-xs text-muted">{body}</p>}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- Alert -- */

export function Alert({ tone = 'info', title, children, action }) {
  const t = TONES[tone] || TONES.info
  return (
    <div className={cx('flex items-start gap-2.5 rounded-box border px-3 py-2.5', t.cls)}>
      <Icon name={t.icon} size={16} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && <div className="text-xs leading-relaxed opacity-90">{children}</div>}
      </div>
      {action}
    </div>
  )
}

/* --------------------------------------------------------------- ListRow -- */
// The generic row used by every list in the product.

export function ListRow({ href, leading, title, sub, meta, trailing, onClick, className = '' }) {
  const inner = (
    <>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{title}</div>
        {sub && <div className="mt-0.5 truncate text-xs text-muted">{sub}</div>}
        {meta && <div className="mt-1 text-[11px] text-faint">{meta}</div>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      {(href || onClick) && <Icon name="chevronRight" size={15} className="shrink-0 text-faint" />}
    </>
  )

  const cls = cx(
    'flex w-full items-center gap-3 border-b border-line-soft px-3 py-2.5 text-left last:border-b-0',
    (href || onClick) && 'hover:bg-sunken',
    className
  )

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    )
  }
  return <div className={cls}>{inner}</div>
}

/* ----------------------------------------------------------------- Field -- */

export function Field({ label, value, children, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children || value}</dd>
    </div>
  )
}

/* --------------------------------------------------------------- Avatar --- */

export function Avatar({ initials, size = 'md' }) {
  return (
    <span
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-box border border-line bg-sunken font-semibold text-ink-2',
        size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-[11px]'
      )}
    >
      {initials}
    </span>
  )
}

/* ------------------------------------------------------------ Form bits --- */

export function TextInput({ label, id, hint, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-ink-2">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-box border border-line bg-paper px-2.5 py-1.5 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        {...rest}
      />
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  )
}

export function Select({ label, id, options = [], hint, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-ink-2">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-box border border-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
        {...rest}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, id, hint, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-ink-2">
        {label}
      </label>
      <textarea
        id={id}
        className="w-full rounded-box border border-line bg-paper px-2.5 py-1.5 text-sm leading-relaxed text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        {...rest}
      />
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------ SectionNote -- */

export function SectionNote({ children }) {
  return <p className="mb-3 text-xs leading-relaxed text-muted">{children}</p>
}

/* ----------------------------------------------------------- MetricTile --- */

export function MetricTile({ label, value, tone, sub, href }) {
  const body = (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</div>
      <div
        className={cx(
          'mt-1 text-2xl font-semibold tabular-nums',
          tone === 'urgent' ? 'text-urgent' : tone === 'done' ? 'text-done' : 'text-ink'
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </>
  )
  const cls = cx(
    'block rounded-box border bg-paper px-3 py-2.5',
    tone === 'urgent' ? 'border-urgent-line' : 'border-line',
    href && 'hover:bg-sunken'
  )
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
