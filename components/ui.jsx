'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/cx'

// ---------------------------------------------------------------------------
// Small shared UI pieces used by every screen.
//
// SIMILARITY (Gestalt): these are the only building blocks the screens use, so
// anything with the same job looks the same everywhere in the product.
// GALL'S LAW: deliberately a tiny set of primitives — a simple system that
// works, which can grow later, rather than a design system built up front.
// ---------------------------------------------------------------------------

const PATHS = {
  alert: (
    <>
      <path d="M12 3.8 2.9 19.4h18.2L12 3.8Z" />
      <path d="M12 9.6v4" />
      <path d="M12 16.6h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-1.6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M17 4.2a3.5 3.5 0 0 1 0 6.6M22 20v-1.6a4 4 0 0 0-3-3.8" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 2.8v18.4" />
      <path d="M16.5 6.7H9.9a2.9 2.9 0 0 0 0 5.8h4.2a2.9 2.9 0 0 1 0 5.8H7" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.7 2.7L16.2 9.4" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="8.2" />,
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2" />
      <path d="m3.4 6.5 8.6 6.2 8.6-6.2" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  chevronRight: <path d="m9.5 5.5 7 6.5-7 6.5" />,
  arrowLeft: (
    <>
      <path d="M19 12H5.5" />
      <path d="m11 5.5-5.5 6.5 5.5 6.5" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h13.5" />
      <path d="m13 5.5 5.5 6.5-5.5 6.5" />
    </>
  ),
  send: (
    <>
      <path d="M21.5 2.5 10.8 13.2" />
      <path d="M21.5 2.5 14.8 21.5l-4-8.3-8.3-4 19-6.7Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6l-1.9-5.8L4.3 10.9 10.1 9 12 3.2Z" />
      <path d="M19 3v3.4M20.7 4.7h-3.4" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.3 1.3" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3" />
    </>
  )
}

export function Icon({ name, size = 16, className = '' }) {
  return (
    <svg
      className={cx('shrink-0', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Buttons — the primary signifier in the product. Every one is a pill, as on
// the landing screen. Renders a Next <Link> when given `href`.
// ---------------------------------------------------------------------------

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-[7px] rounded-full border border-transparent whitespace-nowrap font-medium ' +
  'transition-[background-color,border-color,transform,box-shadow] duration-100 ' +
  'enabled:active:translate-y-px disabled:opacity-45 disabled:cursor-default'

const BUTTON_VARIANT = {
  primary: 'bg-bark text-cream shadow-card enabled:hover:bg-night',
  secondary: 'bg-surface border-line text-ink-2 enabled:hover:bg-surface-2 enabled:hover:border-parchment-line',
  quiet: 'text-bark enabled:hover:bg-parchment',
  // The two hero buttons: cream is the primary act, parchment the secondary.
  cream: 'bg-cream text-bark font-semibold enabled:hover:bg-parchment',
  parchment: 'bg-parchment text-bark font-semibold enabled:hover:bg-cream'
}

const BUTTON_SIZE = {
  sm: 'px-[13px] py-1.5 text-[12.5px]',
  md: 'px-[18px] py-[9px] text-[13px]',
  lg: 'px-7 py-[13px] text-sm'
}

export function Button({ variant = 'primary', size = 'md', href, className = '', busy, children, ...rest }) {
  const classes = cx(
    BUTTON_BASE,
    BUTTON_VARIANT[variant],
    variant === 'quiet' ? (size === 'sm' ? 'px-2.5 py-1.5 text-[12.5px]' : 'px-3 py-1.5 text-[13px]') : BUTTON_SIZE[size],
    busy && 'opacity-85',
    className
  )
  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}

// A quiet inline link with an arrow — "the way back" on inner screens.
export function BackLink({ href, onClick, onDark = false, children }) {
  const classes = cx(
    'inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 -ml-1 text-[12.5px] font-medium transition-colors',
    onDark ? 'text-cream/88 hover:bg-cream/16 hover:text-cream' : 'text-bark hover:bg-parchment'
  )
  if (href) {
    return (
      <Link href={href} className={classes}>
        <Icon name="arrowLeft" size={15} />
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} onClick={onClick}>
      <Icon name="arrowLeft" size={15} />
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// A bordered region. COMMON REGION + PROXIMITY: one card = one subject, so
// related facts sit together inside a shared boundary.
// ---------------------------------------------------------------------------

export function Card({ title, icon, subtitle, action, children, className = '' }) {
  return (
    <section className={cx('overflow-hidden rounded-xl border border-line bg-surface shadow-card', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3.5 border-b border-line-soft bg-surface-2 px-4 py-3.5">
          <div>
            <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
              {icon && <Icon name={icon} size={15} className="text-muted" />}
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="px-4 pt-1.5 pb-3.5">{children}</div>
    </section>
  )
}

export function CardFootnote({ children }) {
  return <p className="mt-2 border-t border-line-soft pt-2.5 pb-0.5 text-[11.5px] text-faint">{children}</p>
}

// ---------------------------------------------------------------------------
// Status labels. One tone per meaning, used identically on every screen, so a
// colour never means two different things (NO INTERFERENCE).
// ---------------------------------------------------------------------------

const PILL_TONE = {
  neutral: 'bg-surface-2 border-line text-muted',
  urgent: 'bg-urgent-soft border-urgent-line text-urgent',
  warning: 'bg-warn-soft border-warn-line text-warn',
  ok: 'bg-ok-soft border-ok-line text-ok',
  brand: 'bg-parchment border-parchment-line text-night',
  live: 'bg-bark border-bark text-cream [&_svg]:fill-current',
  onDark: 'bg-parchment/15 border-parchment/35 text-cream [&_svg]:fill-current'
}

export function Pill({ tone = 'neutral', icon, className = '', children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-[5px] rounded-full border px-[9px] py-[3px] text-[11.5px] font-semibold whitespace-nowrap',
        PILL_TONE[tone],
        className
      )}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  )
}

const AVATAR_TONE = {
  neutral: 'bg-surface-2 border-line text-muted',
  brand: 'bg-parchment border-parchment-line text-night',
  attention: 'bg-urgent-soft border-urgent-line text-urgent'
}

const AVATAR_SIZE = {
  md: 'h-8 w-8 text-[11.5px]',
  sm: 'h-[26px] w-[26px] text-[10.5px]'
}

export function Avatar({ initials, tone = 'neutral', size = 'md' }) {
  return (
    <span
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full border font-semibold tracking-[0.01em]',
        AVATAR_TONE[tone],
        AVATAR_SIZE[size]
      )}
    >
      {initials}
    </span>
  )
}

// A labelled value. Used for every "field" in the product.
export function Field({ label, value, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.045em] text-faint">{label}</dt>
      <dd className="mt-px text-[15px] font-semibold tracking-[-0.01em]">{children || value}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progressive disclosure
//
// Both of these exist to show less at once without taking anything away. The
// rule they follow: hiding content must never hide the *existence* of content.
// Every tab and every collapsed header still reports its count, so the user can
// see there are 6 vendors without having to look at all 6.
// ---------------------------------------------------------------------------

const TAB_COUNT_TONE = {
  urgent: 'bg-urgent-soft text-urgent',
  ok: 'bg-ok-soft text-ok'
}

// Tabbed sections. The active tab is signified three ways at once — weight,
// colour, and an underline — so it reads at a glance.
export function Tabs({ tabs, active, onChange, label = 'Sections' }) {
  return (
    <div className="flex flex-wrap gap-0.5 border-b border-line bg-surface-2 px-2 pt-1.5" role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cx(
              'inline-flex items-center gap-[7px] rounded-t-lg border-b-2 px-[13px] py-2.5 text-[13px] whitespace-nowrap transition-colors',
              isActive
                ? 'border-bark bg-surface font-semibold text-night'
                : 'border-transparent font-medium text-muted hover:bg-cream/70 hover:text-ink'
            )}
          >
            {tab.icon && <Icon name={tab.icon} size={14} className="opacity-70" />}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={cx(
                  'min-w-[19px] rounded-full px-1.5 py-px text-center text-[11px] font-semibold',
                  TAB_COUNT_TONE[tab.tone] ?? (isActive ? 'bg-parchment text-night' : 'bg-line-soft text-muted')
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, active, children }) {
  if (id !== active) return null
  return (
    <div id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} className="animate-panel-in">
      {children}
    </div>
  )
}

// One line that opens. Used for the attention queue so a list of ten things is
// ten lines, not ten paragraphs.
//
// The closed state still carries everything needed to triage — status, title,
// which event it belongs to — so opening a row is for acting on it, not for
// finding out what it is.
export function DisclosureRow({ summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <li className="border-t border-line-soft first:border-t-0">
      <button
        type="button"
        className="flex w-full flex-wrap items-center gap-3 rounded-lg px-2 py-3.5 text-left transition-colors hover:bg-cream/70"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {summary}
        <Icon
          name="chevronRight"
          size={16}
          className={cx('ml-auto transition-transform duration-200', open ? 'rotate-90 text-ink-2' : 'text-faint')}
        />
      </button>
      {open && <div className="animate-panel-in px-2 pt-0.5 pb-[18px] md:pl-12">{children}</div>}
    </li>
  )
}

// A card that starts closed. The whole header is the control, and the chevron
// rotates so the open/closed state is visible without reading the label.
export function Collapsible({ title, icon, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <button
        type="button"
        className={cx(
          'flex w-full items-center gap-2.5 border-b bg-surface-2 px-4 py-[13px] text-left transition-colors hover:bg-parchment',
          open ? 'border-line-soft' : 'border-transparent'
        )}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="flex flex-1 items-center gap-2 text-[13.5px] font-semibold">
          {icon && <Icon name={icon} size={15} className="text-muted" />}
          {title}
        </span>
        {badge && (
          <span className="rounded-full border border-line bg-surface px-[9px] py-0.5 text-[11.5px] whitespace-nowrap text-faint">
            {badge}
          </span>
        )}
        <Icon
          name="chevronRight"
          size={16}
          className={cx('text-muted transition-transform duration-200', open && 'rotate-90')}
        />
      </button>
      {open && <div className="px-4 pt-1.5 pb-3.5">{children}</div>}
    </section>
  )
}

// Section header inside a tab panel.
export function PanelHead({ title, meta }) {
  return (
    <header className="mb-0.5 flex items-baseline justify-between gap-3.5 border-b border-line-soft pt-4 pb-2">
      <h3 className="text-[14.5px] font-semibold tracking-[-0.01em]">{title}</h3>
      {meta && <span className="text-right text-[11.5px] text-faint">{meta}</span>}
    </header>
  )
}

// A plain list row: title, sub-line, optional note, trailing content.
export function Row({ leading, title, sub, note, tight = false, children }) {
  return (
    <li className={cx('flex items-center gap-[11px] border-t border-line-soft first:border-t-0', tight ? 'py-[9px]' : 'py-[11px]')}>
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-[13px] font-medium">{title}</span>
        {sub && <span className="text-[11.5px] text-muted">{sub}</span>}
        {note && <span className="mt-0.5 text-[11.5px] text-faint">{note}</span>}
      </span>
      {children}
    </li>
  )
}
