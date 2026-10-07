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

// Square, hairline-bordered, brass for the primary action - the reference
// button language, tightened so it still works at app density.
const BUTTON_VARIANTS = {
  primary: 'bg-brass text-white border-brass hover:bg-brass-dark',
  secondary: 'bg-transparent text-ink border-line hover:border-ink hover:bg-sand/60',
  danger: 'bg-transparent text-urgent border-urgent-line hover:bg-urgent-soft',
  ghost: 'bg-transparent text-moss border-transparent hover:bg-sand/70'
}

const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-[12px] tracking-[0.04em] gap-1.5',
  md: 'px-4 py-2 text-[13px] tracking-[0.04em] gap-2',
  lg: 'px-6 py-3 text-[14px] tracking-[0.04em] gap-2.5'
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
    'inline-flex items-center justify-center border font-semibold',
    'transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0',
    'disabled:opacity-40 disabled:hover:translate-y-0',
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
        'inline-flex items-center gap-1.5 border font-semibold whitespace-nowrap uppercase tracking-[0.06em]',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
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
        'border bg-paper',
        tone === 'urgent' ? 'border-urgent-line' : 'border-line',
        className
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line-soft bg-sand/40 px-4 py-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.02em] text-ink">
              {icon && <Icon name={icon} size={14} className="text-brass" />}
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-xs text-stone">{subtitle}</p>}
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
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="display text-[28px] text-ink sm:text-[34px]">{title}</h1>
          {lead && <p className="mt-2.5 max-w-[68ch] text-[14px] leading-relaxed text-stone">{lead}</p>}
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
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-[11px] tracking-[0.04em] text-stone">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <Icon name="chevronRight" size={12} className="text-faint" />}
          {item.href ? (
            <Link href={item.href} className="px-1 py-0.5 font-medium text-moss underline-offset-4 hover:underline">
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
              'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px]',
              isActive
                ? 'border-brass font-semibold text-ink'
                : 'border-transparent text-stone hover:text-ink'
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={cx(
                  'border px-1.5 text-[10px] font-semibold',
                  tab.tone === 'urgent'
                    ? 'border-urgent-line bg-urgent-soft text-urgent'
                    : 'border-line bg-sand text-stone'
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
    <div className="border border-dashed border-line bg-sand/50 px-4 py-10 text-center">
      <Icon name={icon} size={20} className="mx-auto mb-3 text-brass" />
      <p className="display text-[19px] text-ink">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-[46ch] text-xs text-muted">{body}</p>}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- Alert -- */

export function Alert({ tone = 'info', title, children, action }) {
  const t = TONES[tone] || TONES.info
  return (
    <div className={cx('flex items-start gap-3 border px-4 py-3', t.cls)}>
      <Icon name={t.icon} size={16} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-[14px] font-semibold tracking-[0.01em]">{title}</p>}
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
        <div className="truncate text-[14px] font-medium text-ink">{title}</div>
        {sub && <div className="mt-0.5 truncate text-xs text-stone">{sub}</div>}
        {meta && <div className="mt-1 text-[11px] text-faint">{meta}</div>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      {(href || onClick) && <Icon name="chevronRight" size={15} className="shrink-0 text-faint" />}
    </>
  )

  const cls = cx(
    'flex w-full items-center gap-3 border-b border-line-soft px-4 py-3 text-left last:border-b-0',
    (href || onClick) && 'transition-colors hover:bg-sand/60',
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
      <dt className="eyebrow text-stone">{label}</dt>
      <dd className="mt-1.5 text-[14px] text-ink">{children || value}</dd>
    </div>
  )
}

/* --------------------------------------------------------------- Avatar --- */

export function Avatar({ initials, size = 'md' }) {
  return (
    <span
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full border border-line bg-sand font-serif text-ink',
        size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-[12px]'
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
      <label htmlFor={id} className="eyebrow block text-moss">
        {label}
      </label>
      <input
        id={id}
        className="mt-2 block w-full border-0 border-b border-line bg-transparent px-0 pb-2 pt-1 text-[15px] text-ink placeholder:text-faint focus:border-brass focus:outline-none"
        {...rest}
      />
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  )
}

export function Select({ label, id, options = [], hint, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow block text-moss">
        {label}
      </label>
      <select
        id={id}
        className="mt-2 block w-full border-0 border-b border-line bg-transparent px-0 pb-2 pt-1 text-[15px] text-ink focus:border-brass focus:outline-none"
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
      <label htmlFor={id} className="eyebrow block text-moss">
        {label}
      </label>
      <textarea
        id={id}
        className="mt-2 block w-full border border-line bg-paper px-3 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-faint focus:border-brass focus:outline-none"
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
      <div className="eyebrow text-stone">{label}</div>
      <div
        className={cx(
          'mt-2 font-serif text-[34px] font-medium leading-none tabular-nums',
          tone === 'urgent' ? 'text-urgent' : tone === 'done' ? 'text-done' : 'text-ink'
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-2 text-xs text-stone">{sub}</div>}
    </>
  )
  const cls = cx(
    'block border bg-paper px-4 py-4 transition-all duration-200',
    tone === 'urgent' ? 'border-urgent-line' : 'border-line',
    href && 'hover:-translate-y-[2px] hover:border-brass'
  )
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
