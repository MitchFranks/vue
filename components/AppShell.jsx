'use client'

// ---------------------------------------------------------------------------
// The frame around every screen.
//
// NON-LINEAR NAVIGATION: a persistent sidebar is always on screen (a slide-over
// on mobile), grouped into the four product areas. Every area is reachable from
// everywhere — there is no wizard, no forced order, and no dead ends.
//
// CONVENTIONS: left sidebar + top bar + breadcrumbs is the layout people
// already know from every admin tool they have used.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cx } from '@/lib/cx'
import { useStore } from '@/lib/store'
import { venue } from '@/lib/mock/events'
import { Button, Icon } from './ui/primitives'
import { ToastHost } from './ui/domain'
import { IntroModal } from './IntroModal'

const NAV = [
  {
    heading: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: 'home', exact: true },
      { href: '/attention', label: 'Needs Attention', icon: 'alert', badge: 'attention' },
      { href: '/calendar', label: 'Calendar', icon: 'calendar' },
      { href: '/events', label: 'Upcoming Events', icon: 'list' }
    ]
  },
  {
    heading: 'Staffing',
    items: [
      { href: '/schedule', label: 'Weekly Schedule', icon: 'grid' },
      { href: '/schedule/gaps', label: 'Coverage Gaps', icon: 'alert', badge: 'gaps' },
      { href: '/schedule/planner', label: 'Staffing Planner', icon: 'users' },
      { href: '/schedule/publish', label: 'Publish Schedule', icon: 'send' },
      { href: '/staff', label: 'Staff Directory', icon: 'user' },
      { href: '/staff/availability', label: 'Availability', icon: 'clock' }
    ]
  },
  {
    heading: 'People & Comms',
    items: [
      { href: '/messages', label: 'Messages', icon: 'mail', badge: 'messages' },
      { href: '/clients', label: 'Clients', icon: 'users' },
      { href: '/vendors', label: 'Vendors', icon: 'truck' }
    ]
  }
]

export function AppShell({ children }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const { attention, gaps, messageList, toasts, dismissToast, reset } = useStore()

  const unreplied = messageList.filter((m) => m.needsReply && !m.replied).length
  const counts = { attention: attention.length, gaps: gaps.length, messages: unreplied }

  // Close the mobile nav whenever the route changes.
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* ---- Top bar ---- */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="main-nav"
            className="rounded-box border border-line px-2 py-1.5 text-ink-2 hover:bg-sunken lg:hidden"
          >
            <Icon name="list" size={16} />
            <span className="sr-only">Toggle navigation</span>
          </button>

          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-ink">Vue</span>
            <span className="hidden text-[11px] uppercase tracking-wider text-faint sm:inline">
              Venue Operations
            </span>
          </Link>

          {/* VISIBILITY OF SYSTEM STATUS: the prototype never pretends to be real. */}
          <span className="ml-1 hidden rounded-pill border border-warn-line bg-warn-soft px-2 py-0.5 text-[11px] font-medium text-warn sm:inline">
            Low-fidelity prototype
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Button href="/attention" variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Icon name="alert" size={13} />
              {attention.length} need{attention.length === 1 ? 's' : ''} attention
            </Button>
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-xs font-medium text-ink">{venue.manager}</div>
              <div className="text-[11px] text-faint">{venue.managerRole}</div>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-box border border-line bg-sunken text-[11px] font-semibold text-ink-2">
              {venue.managerInitials}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ---- Sidebar ---- */}
        <aside
          id="main-nav"
          className={cx(
            'fixed inset-y-0 left-0 z-40 w-60 shrink-0 overflow-y-auto border-r border-line bg-paper pt-14 transition-transform lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:pt-0',
            navOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="p-3" aria-label="Main">
            {NAV.map((group) => (
              <div key={group.heading} className="mb-4">
                <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                  {group.heading}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    const count = item.badge ? counts[item.badge] : 0
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={cx(
                            'flex items-center gap-2 rounded-box border px-2 py-1.5 text-sm',
                            active
                              ? 'border-accent-line bg-accent-soft font-semibold text-accent'
                              : 'border-transparent text-ink-2 hover:bg-sunken'
                          )}
                        >
                          <Icon name={item.icon} size={15} className={active ? 'text-accent' : 'text-faint'} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {count > 0 && (
                            <span
                              className={cx(
                                'rounded-pill border px-1.5 text-[11px] font-semibold',
                                item.badge === 'attention' || item.badge === 'gaps'
                                  ? 'border-urgent-line bg-urgent-soft text-urgent'
                                  : 'border-line bg-sunken text-muted'
                              )}
                            >
                              {count}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-6 border-t border-line-soft pt-3">
              <Button href="/events/new" variant="secondary" size="sm" className="w-full">
                <Icon name="plus" size={13} />
                New event
              </Button>
              <button
                type="button"
                onClick={reset}
                className="mt-2 w-full rounded-box border border-line px-2 py-1.5 text-xs text-muted hover:bg-sunken"
              >
                Reset prototype data
              </button>
              <p className="mt-2 px-1 text-[11px] leading-relaxed text-faint">
                Simulated data. Nothing here is saved to a real system.
              </p>
            </div>
          </nav>
        </aside>

        {navOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ---- Page ---- */}
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>

      <IntroModal />
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
