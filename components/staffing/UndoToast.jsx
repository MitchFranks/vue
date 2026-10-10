'use client'

// the planner's own toast host with an Undo button. It does not touch the shared
// ToastHost. Toasts last 10 seconds (B-11).

import { useEffect } from 'react'
import { Icon } from '@/components/ui/primitives'
import { firstName } from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'

export function UndoToast() {
  const { toast, dismissToast, canUndo, undo, openPhone } = useStaffing2()

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(dismissToast, 10000)
    return () => clearTimeout(t)
  }, [toast, dismissToast])

  if (!toast) return null
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3">
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-md border border-status-clear-soft bg-status-clear-soft px-4 py-3 text-body text-status-clear shadow-overlay">
        <Icon name="check" size={15} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p>{toast.message}</p>
          {toast.small && <p className="mt-1 text-label opacity-80">{toast.small}</p>}
          {toast.phone && (
            <button
              type="button"
              onClick={() => {
                openPhone(toast.phone)
                dismissToast()
              }}
              className="mt-1 text-label font-medium underline underline-offset-2"
            >
              Open {firstName(toast.phone)}&apos;s phone
            </button>
          )}
        </div>
        {toast.undo && canUndo && (
          <button
            type="button"
            onClick={undo}
            className="h-8 rounded-sm border border-line-strong bg-surface px-3 text-small font-medium text-ink transition-colors hover:bg-surface-sunken"
          >
            Undo
          </button>
        )}
        <button type="button" onClick={dismissToast} className="text-current opacity-60 hover:opacity-100">
          <Icon name="x" size={13} />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  )
}
