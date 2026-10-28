'use client'

// ---------------------------------------------------------------------------
// Venue directory · state, actions and persistence.
//
// Holds the venue profile, staff, roles, vendors, categories and vendor
// bookings under its own localStorage key, like the Staffing Planner does,
// so neither store has to know the other's shape. The planner reads staff
// through syncDirectoryStaff: an edit to someone's roles or weekly hours here
// is what the planner ranks with on the next draw.
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { syncDirectoryStaff } from '@/lib/staffing/adapter'
import { optionId, seedDirectory, toPlannerPerson } from './model'

const STORAGE_KEY = 'vue-directory-v1'

const Ctx = createContext(null)

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function DirectoryProvider({ children }) {
  const [state, setState] = useState(seedDirectory)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved?.version === 1 && saved.staff && saved.vendors) setState(saved)
    } catch {
      /* unreadable: start from the sample data */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked: keep working in memory */
    }
  }, [state, hydrated])

  // Keep the planner's people in step before anything below draws. This
  // writes to the shared WORLD object (as timeline edits do) and is idempotent.
  useMemo(() => syncDirectoryStaff(state.staff.map((p) => toPlannerPerson(p, state.roles))), [state.staff, state.roles])

  const update = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), [])

  const actions = useMemo(() => {
    const now = () => new Date().toISOString()
    /** Create (no id) or update a record in one of the lists. Returns its id. */
    const save = (list, prefix) => (id, fields) => {
      const recordId = id || newId(prefix)
      update((s) => ({
        [list]: id
          ? s[list].map((r) => (r.id === id ? { ...r, ...fields, updatedAt: now() } : r))
          : [...s[list], { id: recordId, venueId: s.venue.id, ...fields, createdAt: now() }]
      }))
      return recordId
    }
    const remove = (list) => (id) => update((s) => ({ [list]: s[list].filter((r) => r.id !== id) }))

    return {
      saveVenue: (fields) => update((s) => ({ venue: { ...s.venue, ...fields } })),
      saveStaff: save('staff', 'stf'),
      deleteStaff: remove('staff'),
      saveVendor: save('vendors', 'vnd'),
      deleteVendor: (id) =>
        update((s) => ({ vendors: s.vendors.filter((v) => v.id !== id), vendorBookings: s.vendorBookings.filter((b) => b.vendorId !== id) })),
      /** Replace the role or category list ('roles' | 'categories'). New entries get ids here. */
      saveOptions: (kind, list) =>
        update((s) => {
          const prefix = kind === 'roles' ? 'role' : 'cat'
          const ids = []
          const next = list.map((o) => {
            const id = o.id || optionId(prefix, o.name, [...s[kind].map((x) => x.id), ...ids])
            ids.push(id)
            return { ...o, id, name: o.name.trim() }
          })
          return { [kind]: next }
        }),
      reset: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        setState(seedDirectory())
      }
    }
  }, [update])

  const value = useMemo(() => {
    const staffById = (id) => state.staff.find((p) => p.id === id) || null
    const vendorById = (id) => state.vendors.find((v) => v.id === id) || null
    return {
      ...state,
      hydrated,
      staffById,
      vendorById,
      bookingsFor: (vendorId) => state.vendorBookings.filter((b) => b.vendorId === vendorId),
      bookingsOnEvent: (eventId) => state.vendorBookings.filter((b) => b.eventId === eventId),
      /** How many records use a role or category, so the manager can't remove one in use. */
      usage: (kind, id) =>
        kind === 'roles' ? state.staff.filter((p) => p.roleIds.includes(id)).length : state.vendors.filter((v) => v.categoryId === id).length,
      ...actions
    }
  }, [state, hydrated, actions])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDirectory() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDirectory must be used inside DirectoryProvider')
  return ctx
}

/** For readers of the shared WORLD (the planner): draw again after a directory edit. */
export const useDirectoryVersion = () => useContext(Ctx)?.staff
