'use client'

// The couple updates (lib/updates.js) fed from the live stores, plus which
// ones the manager has already looked at in the bell.
//
// "Seen" is a list of update ids kept in this browser. An update counts as
// new when it happened today and isn't seen yet; anything that still needs
// the manager (a request waiting for an answer, details not read) counts
// until it is dealt with, wherever it is opened from.

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { scopedKey } from '@/lib/account/session'
import { useEventSheet } from '@/lib/eventSheetStore'
import { couples } from '@/lib/mock/records'
import { eventById, TODAY_KEY } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { coupleStatus, coupleUpdates } from '@/lib/updates'

const KEY = () => scopedKey('vue-updates-seen-v1')
const CHANGED = 'vue-updates-seen'
const EMPTY = '[]'

const read = () => {
  try {
    return localStorage.getItem(KEY()) || EMPTY
  } catch {
    return EMPTY
  }
}
const subscribe = (cb) => {
  window.addEventListener('storage', cb)
  window.addEventListener(CHANGED, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(CHANGED, cb)
  }
}

/** Forget which updates were seen (Reset prototype data). */
export function clearSeenUpdates() {
  try {
    localStorage.removeItem(KEY())
    window.dispatchEvent(new Event(CHANGED))
  } catch {
    /* nothing saved to clear */
  }
}

export function useCoupleUpdates() {
  const { hydrated, portalFor, documentList, paymentsForEvent } = useStore()
  const sheet = useEventSheet()
  const seenRaw = useSyncExternalStore(subscribe, read, () => EMPTY)

  const updates = useMemo(
    () => coupleUpdates({ couples, eventById, requests: sheet.requests, portalFor, documentList, paymentsForEvent }),
    [sheet.requests, portalFor, documentList, paymentsForEvent]
  )

  const seen = useMemo(() => new Set(JSON.parse(seenRaw)), [seenRaw])
  const isNew = useCallback((u) => !seen.has(u.id) && u.at.slice(0, 10) >= TODAY_KEY, [seen])
  const needsYou = updates.filter((u) => u.needsYou)
  const unread = updates.filter((u) => !u.needsYou && isNew(u))

  const markAllSeen = useCallback(() => {
    try {
      localStorage.setItem(KEY(), JSON.stringify([...new Set([...seen, ...updates.map((u) => u.id)])]))
      window.dispatchEvent(new Event(CHANGED))
    } catch {
      /* private window: the badge just stays */
    }
  }, [seen, updates])

  return {
    ready: hydrated && sheet.hydrated,
    updates,
    needsYou,
    unread,
    count: needsYou.length + unread.length,
    isNew,
    markAllSeen
  }
}

/** Where one event's couple stands (signed, paid, owed, overdue, requests waiting). */
export function useCoupleStatus(eventId) {
  const { documentList, paymentsForEvent } = useStore()
  const { requests } = useEventSheet()
  return useMemo(() => coupleStatus({ eventId, documentList, paymentsForEvent, requests }), [eventId, documentList, paymentsForEvent, requests])
}
