'use client'

// ---------------------------------------------------------------------------
// Staffing Planner guide: two steps, shown the first time someone opens the
// planner once the welcome guide is out of the way. Each step points at the
// button to click next, using the same CoachPopover as the welcome guide's
// Up Next step: a glowing ring in the user's colour and a card beside it.
//
//   1/2  events list   points at the first event's button; opening the event
//                      moves the guide on
//   2/2  event screen  points at the first "Ask people"; clicking it ends the
//                      guide (it ends too if nothing is open to ask for)
//
// Settings can bring it back with clearPlannerGuide(). Skip, the close button
// and Esc all end it; it is remembered per browser.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PLANNER_GUIDE_KEY, PLANNER_REPLAY_EVENT } from '@/lib/onboarding'
import { CoachPopover } from './CoachPopover'
import { useOnboarding } from './OnboardingProvider'

const REPLAY_EVENT = PLANNER_REPLAY_EVENT

function read() {
  try {
    return window.localStorage.getItem(PLANNER_GUIDE_KEY)
  } catch {
    return null
  }
}

function write(value) {
  try {
    if (value === null) window.localStorage.removeItem(PLANNER_GUIDE_KEY)
    else window.localStorage.setItem(PLANNER_GUIDE_KEY, value)
  } catch {
    /* blocked storage: the guide still works in memory */
  }
}

/** Settings and "Reset prototype data": show the planner guide again. */
export function clearPlannerGuide() {
  write(null)
  window.dispatchEvent(new Event(REPLAY_EVENT))
}

export function PlannerGuide() {
  const pathname = usePathname()
  const router = useRouter()
  const { hydrated, step: welcomeStep } = useOnboarding()
  const [seen, setSeen] = useState(true)

  useEffect(() => {
    const sync = () => setSeen(read() === 'done')
    sync()
    window.addEventListener(REPLAY_EVENT, sync)
    return () => window.removeEventListener(REPLAY_EVENT, sync)
  }, [])

  // Step 1 is the events list, step 2 an event's screen. Team and Staff phone
  // have nothing to guide.
  const path = (pathname || '').replace(/[/]+$/, '')
  const onList = path === '/staffing'
  const onEvent = /^[/]staffing[/](?!(team|phone)$)[^/]+$/.test(path)

  const welcomeOut = welcomeStep === 'done' || welcomeStep === 'skipped'
  const show = hydrated && welcomeOut && !seen && (onList || onEvent)

  const close = () => {
    write('done')
    setSeen(true)
  }

  if (!show) return null

  if (onList) {
    return (
      <CoachPopover
        key="planner-1"
        target='[data-guide="planner-event"]'
        n={1}
        total={2}
        title="Let's get this party staffed"
        body="Ask your team, see who said yes, and fill gaps. Click on the event to see staffing needs."
        onSkip={close}
      />
    )
  }

  return (
    <CoachPopover
      key="planner-2"
      target='[data-guide="planner-ask"]'
      n={2}
      total={2}
      title="Ask your team"
      body="Each bar is a role at a time. Dashed means still open. Click Ask people to fill the first one."
      onBack={() => router.push('/staffing')}
      onSkip={close}
      onTargetClick={close}
    />
  )
}
