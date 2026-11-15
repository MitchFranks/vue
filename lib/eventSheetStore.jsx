'use client'

// ---------------------------------------------------------------------------
// Event detail sheet · state: each event's sheet values and the change log.
// Rules and wording are in lib/eventSheet.js; notes in docs/EVENT-DETAIL-SHEET.md.
//
// Sits inside the Staffing Planner's provider, because a change is sent to
// the staff working the event (the planner's confirmed requests) and is
// stamped with the planner's clock, and outside the main store, which turns
// changes nobody has seen into tasks.
//
// Saved in this browser like the rest of the prototype. The manager's tab and
// a staff member's day-of page are often open side by side, so each takes the
// other's saved state when it changes ("Got it" shows up without a reload).
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { scopedKey } from '@/lib/account/session'
import { newId } from '@/lib/id'
import { events, venue } from '@/lib/mock/events'
import { requestsOf, simNowIso, staffById } from '@/lib/staffing/derive'
import { useStaffing } from '@/lib/staffing/store'
import { cleanSheet, diffRun, diffSheet, mergeChanges, SHEET_ENTRY_SEED, SHEET_SEED, unseenBy } from './eventSheet.js'

const STORAGE_KEY = scopedKey('vue-event-sheet-v1')

const Ctx = createContext(null)

/** Staff confirmed on the event, not counting the manager making the changes. */
export function teamIds(planner, eventId) {
  const ids = requestsOf(planner, eventId)
    .filter((r) => r.status === 'accepted')
    .map((r) => r.staffId)
  return [...new Set(ids)].filter((id) => staffById(id) && staffById(id).name !== venue.manager)
}

function seedState(planner) {
  const kept = new Set(events.map((e) => e.id))
  const values = Object.fromEntries(Object.entries(SHEET_SEED).filter(([id]) => kept.has(id)).map(([id, v]) => [id, cleanSheet(v)]))
  const entries = SHEET_ENTRY_SEED.filter((e) => kept.has(e.eventId)).map(({ seenAll, ...e }) => {
    const team = e.team || teamIds(planner, e.eventId)
    const seenBy = seenAll ? Object.fromEntries(team.map((id) => [id, e.at])) : { ...e.seenBy }
    return { ...e, team, seenBy }
  })
  return { values, entries }
}

export function EventSheetProvider({ children }) {
  const { state: planner } = useStaffing()
  const [state, setState] = useState(() => seedState(planner))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state after the first render so the static HTML and first render match
      if (saved) setState((s) => ({ ...s, ...JSON.parse(saved) }))
    } catch {
      /* blocked storage: the sheet still works in memory */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state, hydrated])

  // The manager's sheet and a staff member's day-of page in two tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return
      try {
        setState(e.newValue ? JSON.parse(e.newValue) : seedState(planner))
      } catch {
        /* a half-written value: the next change will bring it */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [planner])

  const now = useCallback(() => simNowIso(planner), [planner])

  // The latest state, for actions that must work out an id or an undo token
  // before saving: a state updater can run twice, so it must stay pure.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  const commit = useCallback((next) => {
    stateRef.current = next
    setState(next)
  }, [])

  /**
   * Log a batch of changes. When the newest entry for the event is the same
   * person editing the same area and nobody has opened it yet, the changes
   * fold into it, so dragging a block three times sends one change, not three.
   * Returns an undo token (see undo), or null when nothing changed.
   */
  const record = useCallback(
    (eventId, area, changes, { notify = true, reason = '', by = { name: venue.manager, kind: 'venue' } } = {}) => {
      if (!changes.length) return null
      const s = stateRef.current
      const at = now()
      const team = teamIds(planner, eventId)
      const latest = s.entries.filter((e) => e.eventId === eventId).sort((a, b) => (a.at < b.at ? 1 : -1))[0]
      const foldable =
        latest && latest.area === area && latest.by.name === by.name && !Object.keys(latest.seenBy || {}).length && !latest.remindedAt
      if (foldable) {
        const merged = mergeChanges(latest.changes, changes)
        const rest = s.entries.filter((e) => e.id !== latest.id)
        const next = { ...latest, at, changes: merged, notify: latest.notify || notify, reason: reason || latest.reason, team }
        commit({ ...s, entries: merged.length ? [...rest, next] : rest })
        return { prev: latest, id: latest.id }
      }
      const entry = { id: newId('sc'), eventId, at, by, area, changes, reason, notify, team, seenBy: {} }
      commit({ ...s, entries: [...s.entries, entry] })
      return { prev: null, id: entry.id }
    },
    [now, planner, commit]
  )

  /** Put the log back as it was before `token`'s change. */
  const undo = useCallback(
    (token) => {
      if (!token) return
      const s = stateRef.current
      const rest = s.entries.filter((e) => e.id !== token.id)
      commit({ ...s, entries: token.prev ? [...rest, token.prev] : rest })
    },
    [commit]
  )

  const valuesFor = useCallback((eventId) => ({ ...cleanSheet({}), ...state.values[eventId] }), [state.values])

  /** Save edited sheet fields and log what changed. Returns the changes and an undo handle. */
  const saveFields = useCallback(
    (eventId, area, patch, options) => {
      const before = { ...cleanSheet({}), ...stateRef.current.values[eventId] }
      const after = cleanSheet({ ...before, ...patch })
      const changes = diffSheet(before, after)
      if (!changes.length) return { changes, undo: () => {} }
      const s = stateRef.current
      commit({ ...s, values: { ...s.values, [eventId]: after } })
      const token = record(eventId, area, changes, options)
      return {
        changes,
        undo: () => {
          const now = stateRef.current
          commit({ ...now, values: { ...now.values, [eventId]: before } })
          undo(token)
        }
      }
    },
    [commit, record, undo]
  )

  /** Log a run-of-show edit (the rows are saved by lib/timelineEdits.jsx). */
  const logRun = useCallback(
    (eventId, before, after, options) => record(eventId, 'Run of show', diffRun(before, after), options),
    [record]
  )

  /** A staff member opened the sheet and tapped "Got it": everything sent to them is seen. */
  const acknowledge = useCallback(
    (eventId, staffId) => {
      const at = now()
      setState((s) => ({
        ...s,
        entries: s.entries.map((e) =>
          e.eventId === eventId && e.notify && e.team.includes(staffId) && !e.seenBy?.[staffId] ? { ...e, seenBy: { ...e.seenBy, [staffId]: at } } : e
        )
      }))
    },
    [now]
  )

  /** Text the change again to whoever hasn't opened it. */
  const remind = useCallback(
    (entryId) => {
      const at = now()
      setState((s) => ({ ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, remindedAt: at } : e)) }))
    },
    [now]
  )

  const entriesFor = useCallback(
    (eventId) => state.entries.filter((e) => e.eventId === eventId).sort((a, b) => (a.at < b.at ? 1 : -1)),
    [state.entries]
  )

  const unseenFor = useCallback((eventId, staffId) => unseenBy(entriesFor(eventId), staffId), [entriesFor])

  const reset = useCallback(() => setState(seedState(planner)), [planner])

  const value = useMemo(
    () => ({
      hydrated,
      entries: state.entries,
      valuesFor,
      entriesFor,
      unseenFor,
      teamOf: (eventId) => teamIds(planner, eventId),
      saveFields,
      logRun,
      undo,
      acknowledge,
      remind,
      reset
    }),
    [hydrated, state.entries, valuesFor, entriesFor, unseenFor, planner, saveFields, logRun, undo, acknowledge, remind, reset]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEventSheet() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useEventSheet must be used inside EventSheetProvider')
  return ctx
}
