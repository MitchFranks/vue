'use client'

// ---------------------------------------------------------------------------
// Events guide: three steps, shown the first time someone opens the Events tab
// once the welcome guide is out of the way. Each step points at the button to
// click next with the same CoachPopover the other guides use.
//
//   1/3  events list     points at the first event; opening it moves on
//   2/3  event overview  points at the Run of show tab; opening it moves on
//   3/3  run of show     points at a "Needs staff" tick; ticking it ends the
//                        guide (that row now shows up in the Staffing Planner)
//
// Settings can bring it back with clearEventsGuide(). Skip, the close button
// and Esc all end it; it is remembered per browser.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { EVENTS_GUIDE_KEY, EVENTS_REPLAY_EVENT } from '@/lib/onboarding'
import { CoachPopover } from './CoachPopover'
import { useOnboarding } from './OnboardingProvider'

function read() {
  try {
    return window.localStorage.getItem(EVENTS_GUIDE_KEY)
  } catch {
    return null
  }
}

function write(value) {
  try {
    if (value === null) window.localStorage.removeItem(EVENTS_GUIDE_KEY)
    else window.localStorage.setItem(EVENTS_GUIDE_KEY, value)
  } catch {
    /* blocked storage: the guide still works in memory */
  }
}

/** Settings and "Reset prototype data": show the Events guide again. */
export function clearEventsGuide() {
  write(null)
  window.dispatchEvent(new Event(EVENTS_REPLAY_EVENT))
}

export function EventsGuide() {
  const pathname = usePathname()
  const router = useRouter()
  const { hydrated, step: welcomeStep } = useOnboarding()
  const [seen, setSeen] = useState(true)

  useEffect(() => {
    const sync = () => setSeen(read() === 'done')
    sync()
    window.addEventListener(EVENTS_REPLAY_EVENT, sync)
    return () => window.removeEventListener(EVENTS_REPLAY_EVENT, sync)
  }, [])

  const path = (pathname || '').replace(/[/]+$/, '')
  const eventId = /^[/]events[/]([^/]+)/.exec(path)?.[1]
  const real = eventId && eventId !== 'new'
  const onList = path === '/events'
  const onOverview = real && path === `/events/${eventId}`
  const onRun = real && path === `/events/${eventId}/timeline`

  const welcomeOut = welcomeStep === 'done' || welcomeStep === 'skipped'
  const show = hydrated && welcomeOut && !seen && (onList || onOverview || onRun)

  const close = () => {
    write('done')
    setSeen(true)
  }

  if (!show) return null

  if (onList) {
    return (
      <CoachPopover
        key="events-1"
        target='[data-guide="events-first"]'
        n={1}
        total={3}
        title="Every wedding, in date order"
        body="This is where your events live, soonest first. Click the first one to open it."
        onSkip={close}
      />
    )
  }

  if (onOverview) {
    return (
      <CoachPopover
        key="events-2"
        target='[data-guide="tab-timeline"]'
        n={2}
        total={3}
        title="Plan the day here"
        body="Each event has its own tabs. Open Run of show to lay out the day hour by hour."
        onBack={() => router.push('/events')}
        onSkip={close}
      />
    )
  }

  return (
    <CoachPopover
      key="events-3"
      target='[data-guide="needs-staff"]'
      n={3}
      total={3}
      title="Tick Needs staff"
      body="Any row you tick appears in the Staffing Planner, ready for you to fill. Drag a row by its handle to reorder the day."
      onBack={() => router.push(`/events/${eventId}`)}
      onSkip={close}
      onTargetClick={close}
    />
  )
}
