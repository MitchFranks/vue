'use client'

// ---------------------------------------------------------------------------
// Prototype state engine.
//
// The whole point of this file: nothing in the Needs Attention list is
// hard-coded. Attention items are DERIVED from the current state of shifts,
// tasks, messages and documents. So when Jake declines a shift, a coverage gap
// appears, and an attention item appears with it. Assign a replacement and all
// three disappear together. The chain is real, not simulated per-screen.
//
//   assignments  ->  coverage gaps  ->  attention items
//   tasks        ->  attention items
//   messages     ->  attention items
//   documents    ->  attention items
//
// State persists to localStorage so a tester can move between screens (and
// reload) without losing their progress. "Reset prototype" clears it.
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { events, eventById, seedAssignments, segmentById } from './mock/events.js'
import { documents, messages, tasks } from './mock/records.js'
import { isAvailable, pluralRole, staff, staffById } from './mock/staff.js'

const StoreContext = createContext(null)
const STORAGE_KEY = 'vue-lowfi-prototype-v1'

function initialState() {
  return {
    // shiftId -> { segmentId, staffId, role, status, declineReason }
    assignments: Object.fromEntries(
      seedAssignments.map((a) => [`${a.segmentId}--${a.staffId}`, { ...a, id: `${a.segmentId}--${a.staffId}` }])
    ),
    doneTaskIds: tasks.filter((t) => t.done).map((t) => t.id),
    repliedMessageIds: [],
    readMessageIds: [],
    signedDocumentIds: [],
    publishedEventIds: ['johnson', 'taylor'],
    dismissedAttentionIds: [],
    seenIntro: false
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [toasts, setToasts] = useState([])
  const [hydrated, setHydrated] = useState(false)

  // Rehydrate after mount so the server-rendered HTML and the first client
  // render match (static export would otherwise warn about a mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setState((s) => ({ ...s, ...JSON.parse(saved) }))
    } catch {
      /* private mode or blocked storage — the prototype still works in memory */
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

  // ---- feedback -----------------------------------------------------------

  const toast = useCallback((message, tone = 'done') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // ---- actions ------------------------------------------------------------

  const setShiftStatus = useCallback(
    (shiftId, status, declineReason) => {
      setState((s) => {
        const existing = s.assignments[shiftId]
        if (!existing) return s
        return {
          ...s,
          assignments: {
            ...s.assignments,
            [shiftId]: { ...existing, status, declineReason: declineReason ?? existing.declineReason }
          }
        }
      })
    },
    []
  )

  const assignStaff = useCallback((segmentId, staffId, role) => {
    const id = `${segmentId}--${staffId}`
    setState((s) => ({
      ...s,
      assignments: {
        ...s.assignments,
        [id]: { id, segmentId, staffId, role, status: 'accepted' }
      }
    }))
  }, [])

  const removeAssignment = useCallback((shiftId) => {
    setState((s) => {
      const next = { ...s.assignments }
      delete next[shiftId]
      return { ...s, assignments: next }
    })
  }, [])

  const toggleTask = useCallback((taskId) => {
    setState((s) => ({
      ...s,
      doneTaskIds: s.doneTaskIds.includes(taskId)
        ? s.doneTaskIds.filter((t) => t !== taskId)
        : [...s.doneTaskIds, taskId]
    }))
  }, [])

  const markReplied = useCallback((messageId) => {
    setState((s) => ({
      ...s,
      repliedMessageIds: s.repliedMessageIds.includes(messageId)
        ? s.repliedMessageIds
        : [...s.repliedMessageIds, messageId],
      readMessageIds: s.readMessageIds.includes(messageId) ? s.readMessageIds : [...s.readMessageIds, messageId]
    }))
  }, [])

  const markRead = useCallback((messageId) => {
    setState((s) =>
      s.readMessageIds.includes(messageId) ? s : { ...s, readMessageIds: [...s.readMessageIds, messageId] }
    )
  }, [])

  const signDocument = useCallback((docId) => {
    setState((s) => ({
      ...s,
      signedDocumentIds: s.signedDocumentIds.includes(docId)
        ? s.signedDocumentIds
        : [...s.signedDocumentIds, docId]
    }))
  }, [])

  const publishSchedule = useCallback((eventId) => {
    setState((s) => ({
      ...s,
      publishedEventIds: s.publishedEventIds.includes(eventId)
        ? s.publishedEventIds
        : [...s.publishedEventIds, eventId]
    }))
  }, [])

  const dismissAttention = useCallback((id) => {
    setState((s) => ({ ...s, dismissedAttentionIds: [...s.dismissedAttentionIds, id] }))
  }, [])

  const setSeenIntro = useCallback((seen) => setState((s) => ({ ...s, seenIntro: seen })), [])

  const reset = useCallback(() => {
    setState(initialState())
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  // ---- derived: shifts ----------------------------------------------------

  const assignmentList = useMemo(() => Object.values(state.assignments), [state.assignments])

  const shiftsForSegment = useCallback(
    (segmentId) => assignmentList.filter((a) => a.segmentId === segmentId),
    [assignmentList]
  )

  const shiftsForStaff = useCallback(
    (staffId) =>
      assignmentList
        .filter((a) => a.staffId === staffId)
        .map((a) => {
          const found = segmentById(a.segmentId)
          return found ? { ...a, event: found.event, segment: found.segment } : null
        })
        .filter(Boolean),
    [assignmentList]
  )

  // ---- derived: coverage gaps --------------------------------------------
  //
  // A gap is a (segment, role) pair where accepted assignments < required.
  // Pending assignments deliberately do NOT count as covered — an unanswered
  // shift request is not coverage, and that distinction is the point of the
  // accept/decline loop.

  const gaps = useMemo(() => {
    const out = []
    for (const event of events) {
      for (const segment of event.segments) {
        const assigned = assignmentList.filter((a) => a.segmentId === segment.id)
        for (const need of segment.needs) {
          const accepted = assigned.filter((a) => a.role === need.role && a.status === 'accepted').length
          const pending = assigned.filter((a) => a.role === need.role && a.status === 'pending').length
          const declined = assigned.filter((a) => a.role === need.role && a.status === 'declined')
          const short = need.count - accepted
          if (short > 0) {
            out.push({
              id: `${segment.id}--${need.role.replace(/\s+/g, '-').toLowerCase()}`,
              eventId: event.id,
              event,
              segment,
              role: need.role,
              required: need.count,
              accepted,
              pending,
              short,
              declinedBy: declined.map((d) => staffById(d.staffId)).filter(Boolean),
              urgency: event.primary ? 'urgent' : 'warn'
            })
          }
        }
      }
    }
    return out
  }, [assignmentList])

  const gapById = useCallback((id) => gaps.find((g) => g.id === id) || null, [gaps])

  /** Who could actually fill this gap? Right role, genuinely free, no clash. */
  const replacementsForGap = useCallback(
    (gap) => {
      if (!gap) return []
      const { event, segment, role } = gap
      const alreadyOnSegment = assignmentList
        .filter((a) => a.segmentId === segment.id && a.status !== 'declined')
        .map((a) => a.staffId)

      return staff
        .filter((person) => person.role === role)
        .filter((person) => !alreadyOnSegment.includes(person.id))
        .map((person) => {
          const available = isAvailable(person, event.day, segment.start, segment.end)
          // A clash is another segment on the same day whose hours overlap.
          const clash = assignmentList
            .filter((a) => a.staffId === person.id && a.status !== 'declined')
            .map((a) => segmentById(a.segmentId))
            .filter(Boolean)
            .find(
              ({ event: e, segment: s }) =>
                e.dateKey === event.dateKey && s.id !== segment.id && s.start < segment.end && s.end > segment.start
            )
          return {
            person,
            available,
            clash: clash ? { event: clash.event, segment: clash.segment } : null,
            eligible: available && !clash
          }
        })
        .sort((a, b) => Number(b.eligible) - Number(a.eligible))
    },
    [assignmentList]
  )

  /** Coverage summary for a whole event — drives the staffing badge everywhere. */
  const coverageForEvent = useCallback(
    (eventId) => {
      const event = eventById(eventId)
      if (!event) return { required: 0, filled: 0, short: 0, complete: true, pending: 0 }
      let required = 0
      let filled = 0
      let pending = 0
      for (const segment of event.segments) {
        const assigned = assignmentList.filter((a) => a.segmentId === segment.id)
        for (const need of segment.needs) {
          required += need.count
          filled += Math.min(
            need.count,
            assigned.filter((a) => a.role === need.role && a.status === 'accepted').length
          )
          pending += assigned.filter((a) => a.role === need.role && a.status === 'pending').length
        }
      }
      return { required, filled, pending, short: required - filled, complete: filled >= required }
    },
    [assignmentList]
  )

  // ---- derived: tasks / messages / documents ------------------------------

  const taskList = useMemo(
    () => tasks.map((t) => ({ ...t, done: state.doneTaskIds.includes(t.id) })),
    [state.doneTaskIds]
  )

  const messageList = useMemo(
    () =>
      messages.map((m) => ({
        ...m,
        replied: state.repliedMessageIds.includes(m.id),
        read: state.readMessageIds.includes(m.id)
      })),
    [state.repliedMessageIds, state.readMessageIds]
  )

  const documentList = useMemo(
    () =>
      documents.map((d) =>
        state.signedDocumentIds.includes(d.id) ? { ...d, status: 'Signed', tone: 'done' } : d
      ),
    [state.signedDocumentIds]
  )

  // ---- derived: ATTENTION -------------------------------------------------
  //
  // Everything above funnels into here. Each item answers the four questions
  // the product is built around: what happened, which event, why it matters,
  // what you can do next.

  const attention = useMemo(() => {
    const items = []

    // 1. Coverage gaps
    for (const gap of gaps) {
      const who = gap.declinedBy[0]
      items.push({
        id: `gap:${gap.id}`,
        kind: 'staffing',
        tone: gap.urgency,
        title: `${gap.event.name} is short ${gap.short} ${pluralRole(gap.role, gap.short)} for ${gap.segment.name}`,
        what: who
          ? `${who.name} declined the ${gap.segment.name.toLowerCase()} shift.`
          : `${gap.segment.name} has ${gap.accepted} of ${gap.required} ${gap.role} confirmed.`,
        why: gap.event.primary
          ? `${gap.event.name} is ${gap.event.status}. Without cover this segment runs understaffed.`
          : `${gap.event.name} is ${gap.event.status}.`,
        eventId: gap.event.id,
        eventName: gap.event.name,
        meta: `${gap.segment.name} · ${hourLabel(gap.segment.start)}–${hourLabel(gap.segment.end)}`,
        actionLabel: 'Find replacement',
        href: `/schedule/gaps/${gap.id}`
      })
    }

    // 2. Messages awaiting a reply
    for (const m of messageList) {
      if (!m.needsReply || m.replied) continue
      const event = m.eventId ? eventById(m.eventId) : null
      items.push({
        id: `msg:${m.id}`,
        kind: 'message',
        tone: m.priority === 'urgent' ? 'urgent' : 'warn',
        title: `${m.from} is waiting on a reply`,
        what: `"${m.subject}" — received ${m.received.toLowerCase()}.`,
        why: event
          ? `Unanswered client and vendor requests are the most common way a detail gets missed before an event.`
          : 'No reply has been sent yet.',
        eventId: m.eventId,
        eventName: event ? event.name : 'No event',
        meta: m.fromRole,
        actionLabel: 'Open and reply',
        href: `/messages/${m.id}`
      })
    }

    // 3. Tasks that are due and not done
    for (const t of taskList) {
      if (t.done || t.dueTone === 'done' || t.dueTone === 'info') continue
      const event = eventById(t.eventId)
      items.push({
        id: `task:${t.id}`,
        kind: 'task',
        tone: t.dueTone === 'urgent' ? 'urgent' : 'warn',
        title: t.title,
        what: t.detail,
        why: `${t.due} · owned by ${t.owner}.`,
        eventId: t.eventId,
        eventName: event ? event.name : 'No event',
        meta: t.due,
        actionLabel: 'Open event tasks',
        href: `/events/${t.eventId}/tasks`
      })
    }

    // 4. Documents awaiting signature
    for (const d of documentList) {
      if (d.tone !== 'urgent') continue
      const event = eventById(d.eventId)
      items.push({
        id: `doc:${d.id}`,
        kind: 'document',
        tone: 'warn',
        title: `${d.name} is awaiting a signature`,
        what: `Last updated ${d.updated}.`,
        why: 'An unsigned timeline means the client has not formally agreed to the schedule.',
        eventId: d.eventId,
        eventName: event ? event.name : 'No event',
        meta: `${d.kind} · ${d.status}`,
        actionLabel: 'Open documents',
        href: `/events/${d.eventId}/documents`
      })
    }

    const order = { urgent: 0, warn: 1, pending: 2, info: 3 }
    return items
      .filter((i) => !state.dismissedAttentionIds.includes(i.id))
      .sort((a, b) => (order[a.tone] ?? 9) - (order[b.tone] ?? 9))
  }, [gaps, messageList, taskList, documentList, state.dismissedAttentionIds])

  const attentionForEvent = useCallback((eventId) => attention.filter((a) => a.eventId === eventId), [attention])

  const value = {
    hydrated,
    // raw state
    assignments: state.assignments,
    publishedEventIds: state.publishedEventIds,
    seenIntro: state.seenIntro,
    // collections
    taskList,
    messageList,
    documentList,
    // staffing
    assignmentList,
    shiftsForSegment,
    shiftsForStaff,
    gaps,
    gapById,
    replacementsForGap,
    coverageForEvent,
    // attention
    attention,
    attentionForEvent,
    // actions
    setShiftStatus,
    assignStaff,
    removeAssignment,
    toggleTask,
    markReplied,
    markRead,
    signDocument,
    publishSchedule,
    dismissAttention,
    setSeenIntro,
    reset,
    // feedback
    toasts,
    toast,
    dismissToast
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function hourLabel(h) {
  const hour24 = Math.floor(h)
  const mins = Math.round((h - hour24) * 60)
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return mins ? `${hour12}:${String(mins).padStart(2, '0')} ${suffix}` : `${hour12}:00 ${suffix}`
}
