'use client'

// ---------------------------------------------------------------------------
// Toasts. FEEDBACK: every meaningful action drops one.
//
//   toast(message, tone?, { actions?, small? })   from useToast()
//
// Toasts with actions (Undo) stay up longer so there is time to use them.
// The list and the actions are separate contexts, so calling toast() never
// re-renders the screens that only send toasts; only <AppToasts> (which
// draws the stack) re-renders when one appears or goes.
//
// The Staffing Planner keeps its own single toast because its Undo is tied
// to the planner's undo slot (lib/staffing/store.jsx). AppToasts draws both
// in one stack.
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { newId } from '@/lib/id'

const ToastActionsContext = createContext(null)
const ToastListContext = createContext([])

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (message, tone = 'done', opts = {}) => {
      const id = newId('toast')
      setToasts((t) => [...t, { id, message, tone, actions: opts.actions, small: opts.small }])
      setTimeout(() => dismissToast(id), opts.actions?.length ? 8000 : 4000)
    },
    [dismissToast]
  )

  const actions = useMemo(() => ({ toast, dismissToast }), [toast, dismissToast])

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastListContext.Provider value={toasts}>{children}</ToastListContext.Provider>
    </ToastActionsContext.Provider>
  )
}

/** { toast, dismissToast }. Stable across renders. */
export function useToast() {
  const ctx = useContext(ToastActionsContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/** The toasts on screen right now. Only the component that draws them needs this. */
export function useToastList() {
  return useContext(ToastListContext)
}
