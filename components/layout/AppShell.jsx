'use client'

// ---------------------------------------------------------------------------
// The frame around every screen.
//
// NON-LINEAR NAVIGATION: a persistent sidebar is always on screen (a slide-over
// on mobile), grouped into the product areas. Every area is reachable from
// everywhere — there is no wizard, no forced order, and no dead ends.
//
// CONVENTIONS: left sidebar + top bar + breadcrumbs is the layout people
// already know from every admin tool they have used.
//
// This is the connected half: it reads the route and the stores, works out
// the sidebar counts, and hands plain props to TopBar and Sidebar (which
// draw without any provider, so they have their own stories).
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useDirectory } from '@/lib/directory/store'
import { openSpots } from '@/lib/format'
import { PrototypeNotice } from '@/components/onboarding/PrototypeNotice'
import { PhoneDrawer } from '@/components/staffing/StaffPhone'
import { AccountMenu } from './AccountMenu'
import { AppToasts } from './AppToasts'
import { activeHrefFor } from './nav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/** The sidebar badge counts, each a number plus the words it stands for. */
export function navCounts({ openTasks, openPositions, messageList }) {
  const unreplied = messageList.filter((m) => m.needsReply && !m.replied).length
  const toDoFirst = openTasks.filter((a) => a.tone === 'urgent').length
  const spots = openPositions.reduce((n, p) => n + p.short, 0)
  return {
    openTasks: { n: toDoFirst, label: `${toDoFirst} to do first` },
    openPositions: { n: spots, label: openSpots(spots) },
    messages: { n: unreplied, label: `${unreplied} awaiting a reply` }
  }
}

export function AppShell({ children }) {
  const pathname = usePathname()
  // The mobile nav closes whenever the route changes (a link, Back, Forward).
  // Comparing with the last route seen during render does this without an effect.
  const [navOpen, setNavOpen] = useState(false)
  const [navPath, setNavPath] = useState(pathname)
  if (navPath !== pathname) {
    setNavPath(pathname)
    setNavOpen(false)
  }
  const store = useStore()
  const { venue } = useDirectory()

  return (
    <div className="min-h-screen">
      <TopBar
        venueName={venue.name}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((v) => !v)}
        // The tester's goal is always one click away, and the prototype never
        // pretends to be real (VISIBILITY OF SYSTEM STATUS).
        actions={<PrototypeNotice />}
      />

      <div className="flex">
        <Sidebar activeHref={activeHrefFor(pathname)} counts={navCounts(store)} open={navOpen} account={<AccountMenu />} />

        {navOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setNavOpen(false)} aria-hidden="true" />}

        <main className="min-w-0 flex-1 px-4 pt-8 pb-12 sm:px-8 sm:pt-12">
          <div className="mx-auto w-full max-w-[1120px]">{children}</div>
        </main>
      </div>

      {/* The prototype staff phone: any screen can open it (Tasks, staffing, staff profiles). */}
      <PhoneDrawer />
      <AppToasts />
    </div>
  )
}
