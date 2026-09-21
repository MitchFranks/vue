'use client'

// ---------------------------------------------------------------------------
// The frame that wraps every product screen: top bar + breadcrumb trail.
//
// Keeping one shell around all the screens is what makes them read as the
// same product, and the breadcrumb is a persistent SIGNIFIER for "you are here
// / here is the way back". Both are derived from the URL, so they can never
// disagree with the page that is showing.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from './ui'
import { cx } from '@/lib/cx'
import { johnson, venue } from '@/lib/data'

function crumbsFor(pathname) {
  if (pathname.startsWith('/events/johnson/messages/')) {
    return [
      { label: johnson.name, href: '/events/johnson' },
      { label: 'Decorating time request' }
    ]
  }
  if (pathname.startsWith('/events/')) {
    return [{ label: johnson.name }]
  }
  return []
}

export function AppShell({ children }) {
  const pathname = usePathname()
  const crumbs = crumbsFor(pathname)
  const onDashboard = crumbs.length === 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-cream">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3.5 px-4 md:gap-7 md:px-6">
          {/* Wordmark goes home to the landing screen; "Dashboard" in the nav
              is the way back to the work. */}
          <Link
            href="/"
            className="flex flex-col items-start rounded-lg py-1.5 pr-2 text-left leading-none"
            title="Back to the welcome screen"
          >
            <span className="font-display text-[21px] font-semibold tracking-[0.02em]">{venue.name}</span>
            <span className="mt-[3px] text-[10px] uppercase tracking-[0.16em] text-faint">Venue Operations</span>
          </Link>

          {/* SIGNIFIER / NO FALSE AFFORDANCE: only sections that exist are
              listed. Nav items that look like navigation but aren't cost the
              user time. */}
          <nav className="mr-auto hidden items-center gap-0.5 md:flex" aria-label="Primary">
            <NavItem href="/dashboard" active={onDashboard}>
              Dashboard
            </NavItem>
            <NavItem href="/events/johnson" active={!onDashboard}>
              Events
            </NavItem>
          </nav>

          <div className="ml-auto flex items-center gap-2.5 md:ml-0">
            <span className="hidden flex-col items-end leading-tight md:flex">
              <span className="text-[13px] font-medium">{venue.manager}</span>
              <span className="text-[11px] text-faint">{venue.managerRole}</span>
            </span>
            <span className="inline-grid h-8 w-8 place-items-center rounded-full border border-parchment-line bg-parchment text-[11.5px] font-semibold text-night">
              {venue.managerInitials}
            </span>
          </div>
        </div>
      </header>

      {crumbs.length > 0 && (
        <div className="border-b border-line bg-cream">
          <nav className="mx-auto flex max-w-[1320px] items-center gap-1 px-4 py-2.5 text-[12.5px] md:px-6" aria-label="Breadcrumb">
            <Crumb href="/dashboard">
              <Icon name="arrowLeft" size={14} />
              Dashboard
            </Crumb>
            {crumbs.map((crumb, i) => (
              <span className="flex items-center gap-1" key={crumb.label}>
                <Icon name="chevronRight" size={13} className="text-line" />
                {crumb.href && i < crumbs.length - 1 ? (
                  <Crumb href={crumb.href}>{crumb.label}</Crumb>
                ) : (
                  <span className="px-1.5 py-[3px] text-muted" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-5 pb-10 md:px-6 md:pt-[26px] md:pb-14">{children}</main>

      <footer className="border-t border-line bg-cream px-6 py-4 text-center text-xs text-faint">
        Prototype · {venue.name} · IS 551. Mock data only — no live email, payments or integrations.
      </footer>
    </div>
  )
}

function NavItem({ href, active, children }) {
  return (
    <Link
      href={href}
      className={cx(
        'rounded-full px-3 py-[7px] text-[13px] font-medium transition-colors',
        active ? 'bg-parchment text-bark' : 'text-muted hover:bg-surface-2 hover:text-ink'
      )}
    >
      {children}
    </Link>
  )
}

function Crumb({ href, children }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-[3px] font-medium text-bark hover:bg-parchment">
      {children}
    </Link>
  )
}
