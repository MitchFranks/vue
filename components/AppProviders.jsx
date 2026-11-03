'use client'

// ---------------------------------------------------------------------------
// Every provider the product needs, in the one order that works. The root
// layout wraps the app in this, and Storybook wraps connected stories in it,
// so the two can never drift.
//
//   ToastProvider          outermost: the store and screens send toasts
//   TimelineEditsProvider  run-of-show edits feed the planner's blocks
//   DirectoryProvider      the venue directory feeds the planner its staff
//   StaffingProvider       the planner sits outside the store so tasks can
//                          be derived from it
//   StoreProvider          tasks, messages, documents, payments
//   OnboardingProvider     intro and guided tour, reads all of the above
// ---------------------------------------------------------------------------

import { ToastProvider } from '@/lib/toasts'
import { TimelineEditsProvider } from '@/lib/timelineEdits'
import { DirectoryProvider } from '@/lib/directory/store'
import { StaffingProvider } from '@/lib/staffing/store'
import { StoreProvider } from '@/lib/store'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <TimelineEditsProvider>
        <DirectoryProvider>
          <StaffingProvider>
            <StoreProvider>
              <OnboardingProvider>{children}</OnboardingProvider>
            </StoreProvider>
          </StaffingProvider>
        </DirectoryProvider>
      </TimelineEditsProvider>
    </ToastProvider>
  )
}
