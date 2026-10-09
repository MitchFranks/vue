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
import { upNextLabel, useStore } from '@/lib/store'
import { venue } from '@/lib/mock/events'
import { Button, Icon } from './ui/primitives'
import { ToastHost } from './ui/domain'
import { useOnboarding } from './onboarding/OnboardingProvider'
import { AccountMenu } from './AccountMenu'

const NAV = [
  {
    heading: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'home', exact: true },
      { href: '/up-next', label: 'Up Next', icon: 'check', badge: 'attention', onboarding: 'up-next' },
      { href: '/calendar', label: 'Calendar', icon: 'calendar' },
      { href: '/events', label: 'Upcoming Events', icon: 'list' }
    ]
  },
  {
    heading: 'Staffing',
    items: [
      // One workflow, one menu item. The tab bar inside it links its screens.
      {
        href: '/staffing',
        match: '/staffing',
        label: 'Staffing Planner',
        icon: 'users',
        badge: 'openPositions'
      },
      // Parallel changeover: a second, independently researched and built
      // Staff Planner so the two can be compared side by side. Lives under
      // /staffing2 and does not touch the first one.
      {
        href: '/staffing2',
        match: '/staffing2',
        label: 'Staffing Planner 2',
        icon: 'users'
      }
    ]
  },
  {
    heading: 'People & Comms',
    items: [
      { href: '/staff', label: 'Staff Directory', icon: 'user' },
      { href: '/messages', label: 'Messages', icon: 'mail', badge: 'messages' },
      { href: '/couples', label: 'Couples', icon: 'users' },
      { href: '/vendors', label: 'Vendors', icon: 'truck' }
    ]
  }
]

export function AppShell({ children }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const { attention, openPositions, messageList, toasts, dismissToast, reset } = useStore()
  const { reset: resetGuide, step: guideStep, finish: finishGuide } = useOnboarding()

  const unreplied = messageList.filter((m) => m.needsReply && !m.replied).length
  const counts = { attention: attention.filter((a) => a.tone === 'urgent').length, openPositions: openPositions.length, messages: unreplied }

  // Highlight only the most specific nav item for the current route, so a
  // parent is not also lit up on a child route. `match` lets one item own a
  // whole section (the staffing workflow owns every /staffing/* page).
  const activeHref = NAV.flatMap((g) => g.items)
    .filter((item) => {
      const base = item.match ?? item.href
      return pathname === base || (!item.exact && pathname.startsWith(`${base}/`))
    })
    .sort((a, b) => (b.match ?? b.href).length - (a.match ?? a.href).length)[0]?.href

  // Close the mobile nav whenever the route changes.
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* ---- Top bar ---- */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 text-ink backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="main-nav"
            className="rounded-full border border-line bg-surface px-2.5 py-2 text-ink transition-colors hover:bg-accent-soft lg:hidden"
          >
            <Icon name="list" size={16} />
            <span className="sr-only">Toggle navigation</span>
          </button>

          <Link href="/" className="flex items-center gap-2.5" title="Back to the welcome screen">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-[17px] font-extrabold text-on-accent shadow-pop">
              v
            </span>
            <span className="leading-none">
              <span className="block font-display text-[19px] font-extrabold tracking-tight text-ink">vue</span>
              <span className="mt-0.5 hidden text-[11px] font-medium text-muted sm:block">wedding venue ops</span>
            </span>
          </Link>

          {/* VISIBILITY OF SYSTEM STATUS: the prototype never pretends to be real. */}
          <span className="ml-2 hidden rounded-full bg-blush px-3 py-1 text-[11px] font-bold text-ink-2 sm:inline">
            Prototype
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/up-next"
              className="hidden items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[12px] font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent sm:inline-flex"
            >
              <Icon name="check" size={13} />
              {upNextLabel(attention)}
            </Link>
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-xs font-semibold text-ink">{venue.manager}</div>
              <div className="text-[11px] text-muted">{venue.managerRole}</div>
            </div>
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ---- Sidebar ---- */}
        <aside
          id="main-nav"
          className={cx(
            'fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-line bg-surface/90 pt-16 backdrop-blur transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-0',
            navOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="p-3" aria-label="Main">
            {NAV.map((group) => (
              <div key={group.heading} className="mb-4">
                <div className="eyebrow mb-2 px-3 text-faint">{group.heading}</div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = item.href === activeHref
                    // Step 3 of the first-run guide: the Up Next item wears the user's colour.
                    const guided = guideStep === 'coach' && item.onboarding === 'up-next' && !active
                    const count = item.badge ? counts[item.badge] : 0
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          data-onboarding={item.onboarding}
                          onClick={guideStep === 'coach' && item.onboarding === 'up-next' ? finishGuide : undefined}
                          className={cx(
                            'flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-3 text-[13px] transition-colors',
                            active
                              ? 'bg-accent font-semibold text-on-accent shadow-pop'
                              : guided
                                ? 'bg-accent-soft font-semibold text-accent'
                                : 'text-muted hover:bg-accent-soft hover:text-accent'
                          )}
                        >
                          <Icon name={item.icon} size={15} className={active ? 'text-on-accent' : guided ? 'text-accent' : 'text-faint'} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {count > 0 && (
                            <span
                              className={cx(
                                'rounded-full px-2 text-[11px] font-bold',
                                active ? 'bg-on-accent/20 text-on-accent' : 'bg-accent-soft text-accent'
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
              <Button href="/events/new" variant="primary" size="md" className="w-full">
                <Icon name="plus" size={13} />
                New event
              </Button>
              <button
                type="button"
                onClick={() => {
                  reset()
                  resetGuide()
                }}
                className="mt-2 w-full rounded-full border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-accent-line hover:bg-accent-soft hover:text-accent"
              >
                Reset prototype data
              </button>
              <Link href="/style-guide" className="mt-2 block rounded-full px-3 py-2 text-center text-[12px] font-medium text-faint transition-colors hover:bg-accent-soft hover:text-accent">
                Style guide
              </Link>
              <p className="mt-3 px-1 text-[11px] leading-relaxed text-faint">
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
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1120px]">{children}</div>
        </main>
      </div>

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
