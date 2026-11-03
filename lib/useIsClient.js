'use client'

// false during the static-export render and the first browser render (so the
// two match), true after. For values that only exist in the browser, like the
// signed-in account in localStorage, read them when this is true instead of
// copying them into state from an effect.

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}
