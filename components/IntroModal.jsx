'use client'

// ---------------------------------------------------------------------------
// Early-stage prototype notice.
//
// Shown once per tester (remembered in localStorage). States plainly that this
// is a low-fidelity prototype with simulated data, and gives the tester a goal.
//
// It does NOT tell them which buttons to press — the goal names the outcome,
// and the routes to get there are theirs to find. "Skip for now" is given equal
// weight so onboarding is never forced.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Button, Icon } from './ui/primitives'
import { Modal } from './ui/domain'

export function IntroModal() {
  const { hydrated, seenIntro, setSeenIntro } = useStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (hydrated && !seenIntro) setOpen(true)
  }, [hydrated, seenIntro])

  function close() {
    setOpen(false)
    setSeenIntro(true)
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Before you start"
      labelledBy="intro-title"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Skip for now
          </Button>
          <Button variant="primary" onClick={close}>
            Start exploring
            <Icon name="arrowRight" size={14} />
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm leading-relaxed text-ink-2">
        <div className="rounded-box border border-warn-line bg-warn-soft px-3 py-2 text-warn">
          <p className="font-semibold">This is an early-stage, low-fidelity prototype.</p>
          <p className="mt-1 text-xs">
            The information and actions shown here are simulated and are being tested for usability. Nothing you
            do is saved to a real system, and no real messages are ever sent.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wide text-faint">Your goal</h3>
          <p className="mt-1 text-[15px] text-ink">
            The Johnson Wedding is this Saturday. Start with what is up next and make sure the event is fully
            staffed.
          </p>
        </div>

        <p className="text-xs text-muted">
          There is more than one way to get there. Explore however you like — you can reach the same place from the
          dashboard, the Up Next list, the event itself, or the schedule.
        </p>
      </div>
    </Modal>
  )
}
