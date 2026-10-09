'use client'

// ---------------------------------------------------------------------------
// The Staff Planner's tab bar. It appears on every Staff Planner screen, and
// every tab is a real link, so the user can jump to any screen from any other.
// "Event board" opens the event last viewed (or the next one needing people).
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { events } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { Tabs } from './ui/primitives'

export const LAST_EVENT_KEY = 'vue-staffing-last-event'

export function StaffTabs() {
  const pathname = (usePathname() || '').replace(/\/$/, '')
  const { openPositions, assignmentList } = useStore()
  const [last, setLast] = useState(null)

  useEffect(() => {
    try {
      setLast(window.localStorage.getItem(LAST_EVENT_KEY))
    } catch {
      /* ignore */
    }
  }, [pathname])

  const onBoard = pathname.startsWith('/staffing/') && !['/staffing/team', '/staffing/replies'].includes(pathname)
  const boardEvent = onBoard
    ? pathname.split('/')[2]
    : events.some((e) => e.id === last)
      ? last
      : (openPositions[0]?.eventId ?? events[0].id)

  const active =
    pathname === '/staffing'
      ? 'week'
      : pathname === '/staffing/team'
        ? 'team'
        : pathname === '/staffing/replies'
          ? 'replies'
          : 'board'

  const waiting = assignmentList.filter((a) => a.status === 'declined' || a.status === 'pending').length

  const tabs = [
    { id: 'week', label: 'Week', href: '/staffing' },
    { id: 'board', label: 'Event board', href: `/staffing/${boardEvent}`, count: openPositions.length || null },
    { id: 'team', label: 'Team availability', href: '/staffing/team' },
    { id: 'replies', label: 'Staff replies', href: '/staffing/replies', count: waiting || null }
  ]

  return <Tabs tabs={tabs} active={active} />
}
