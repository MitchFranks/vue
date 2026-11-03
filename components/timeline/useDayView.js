'use client'

// The run of show's visible window (which hours the grid shows), remembered
// in localStorage across every event. Read with useSyncExternalStore so the
// server render and the first browser render agree without an effect.

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { DEFAULT_VIEW, VIEW_KEY, parseView } from '@/lib/timeline/layout'

const listeners = new Set()

function subscribe(onChange) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function readRaw() {
  try {
    return window.localStorage.getItem(VIEW_KEY)
  } catch {
    return null
  }
}

/** [view, setView]: view is { start, end } in minutes after midnight. */
export function useDayView() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null)
  const view = useMemo(() => parseView(raw), [raw])
  const setView = useCallback((next) => {
    try {
      window.localStorage.setItem(VIEW_KEY, JSON.stringify(next ?? DEFAULT_VIEW))
    } catch {
      /* blocked storage: nothing to remember the choice in */
    }
    listeners.forEach((l) => l())
  }, [])
  return [view, setView]
}
