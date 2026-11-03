'use client'

// The one toast stack for the whole app, so toasts never overlap. It draws
// the app's toasts (lib/toasts.jsx) and the Staffing Planner's single
// undo-slot toast (components/staffing/plannerToasts.js) together, and
// routes each dismissal back to whichever one owns it.

import { ToastHost } from '@/components/ui'
import { useToast, useToastList } from '@/lib/toasts'
import { usePlannerToasts } from '@/components/staffing/plannerToasts'

export function AppToasts() {
  const toasts = useToastList()
  const { dismissToast } = useToast()
  const planner = usePlannerToasts()
  const plannerIds = new Set(planner.toasts.map((t) => t.id))

  return (
    <ToastHost
      toasts={[...planner.toasts, ...toasts]}
      onDismiss={(id) => (plannerIds.has(id) ? planner.dismiss(id) : dismissToast(id))}
    />
  )
}
