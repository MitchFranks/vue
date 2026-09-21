'use client'

// ---------------------------------------------------------------------------
// Prototype state.
//
// GALL'S LAW: this is deliberately the simplest thing that works — one piece
// of state (which "needs attention" items have been cleared) held in a context
// at the root layout so it survives client-side navigation between routes.
// Refreshing the page resets it, which is the documented way to start over.
// A server and a real inbox can replace this later.
// ---------------------------------------------------------------------------

import { createContext, useContext, useState } from 'react'
import { attentionQueue, events } from './data.js'

const PrototypeContext = createContext(null)

export function PrototypeProvider({ children }) {
  const [resolvedIds, setResolvedIds] = useState([])

  const attention = attentionQueue.map((item) => ({
    ...item,
    resolved: resolvedIds.includes(item.id)
  }))

  // Live per-event counts so the dashboard badge, the workspace header and the
  // stat tile can never disagree with each other.
  const eventAttention = Object.fromEntries(
    events.map((event) => [event.id, attention.filter((i) => i.eventId === event.id && !i.resolved).length])
  )

  function resolve(id) {
    setResolvedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
  }

  const value = {
    attention,
    eventAttention,
    johnsonAttention: attention.filter((item) => item.eventId === 'johnson'),
    replySent: resolvedIds.includes('decor-time'),
    resolve
  }

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext)
  if (!ctx) throw new Error('usePrototype must be used inside <PrototypeProvider>')
  return ctx
}
