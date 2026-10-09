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
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-2xl border border-done-line bg-done-soft px-4 py-3 text-sm text-done shadow-[0_12px_35px_rgba(12,21,18,.18)]">
        <Icon name="check" size={15} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p>{toast.message}</p>
          {toast.small && <p className="mt-1 text-[11px] opacity-80">{toast.small}</p>}
          {toast.phone && (
            <button
              type="button"
              onClick={() => {
                openPhone(toast.phone)
                dismissToast()
              }}
              className="mt-1 text-[12px] font-semibold underline underline-offset-2"
            >
              Open {firstName(toast.phone)}&apos;s phone
            </button>
          )}
        </div>
        {toast.undo && canUndo && (
          <button
            type="button"
            onClick={undo}
            className="rounded-full border border-done-line bg-surface px-3 py-1 text-[12px] font-semibold text-done hover:bg-done-soft"
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
