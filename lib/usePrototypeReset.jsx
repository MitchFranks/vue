'use client'

import { events } from '@/lib/mock/events'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'
import { useConfirm } from '@/components/ui/domain'
import { useStaffing2 } from '@/lib/staffing/store'
import { useStore } from '@/lib/store'
import { useTimelineEdits } from '@/lib/timelineEdits'
import { useDirectory } from '@/lib/directory/store'
import { IS_SAMPLE_WORKSPACE } from '@/lib/account/session'

export function usePrototypeReset() {
  const { reset: resetStore } = useStore()
  const planner = useStaffing2()
  const { resetAll: resetTimelines } = useTimelineEdits()
  const { reset: resetDirectory } = useDirectory()
  const { reset: resetIntro } = useOnboarding()
  const { confirm, dialog } = useConfirm()

  const resetPrototype = () =>
    confirm({
      title: 'Reset everything?',
      // In an account's own workspace "the start" is empty: say so plainly.
      body: IS_SAMPLE_WORKSPACE
        ? 'Replies, tasks, messages, staffing changes, timeline edits, staff, vendors, the venue profile, and display preferences will return to the sample state. This cannot be undone.'
        : 'Every staff member, vendor, role, category and change in this workspace will be erased, and the venue profile will go back to what you entered when you signed up. Your account stays. This cannot be undone.',
      confirmLabel: 'Reset everything',
      danger: true,
      onConfirm: () => {
        resetTimelines()
        resetDirectory()
        planner.reset({ undoable: false, notify: false })
        resetStore()
        // The demo starts over with its first-visit message; an own workspace just stays put.
        if (IS_SAMPLE_WORKSPACE) resetIntro('/')
      }
    })

  return { resetPrototype, dialog }
}
