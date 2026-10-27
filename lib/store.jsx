'use client'

// ---------------------------------------------------------------------------
// Prototype state engine.
//
// STAFFING comes from the Staffing Planner's state (lib/staffing/store.jsx):
// open spots, event coverage and unsent texts are derived from its requests,
// so asking, sending and a reply in the planner clear the matching Tasks
// item. Tasks, messages, documents and payments live here.
//
// The whole point of this file: nothing in the task list is hard-coded.
// tasks are DERIVED from the current state:
//
//   planner requests  ->  open spots  ->  tasks
//   tasks             ->  tasks
//   messages          ->  tasks
//   documents         ->  tasks
//   payments          ->  tasks
//
// State persists to localStorage so a tester can move between screens (and
// reload) without losing their progress. "Reset prototype data" clears it.
// ---------------------------------------------------------------------------

import { useTimelineVersion } from '@/lib/timelineEdits'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { events, eventById, daysOutLabel, TODAY_KEY } from './mock/events.js'
import { contacts, contactName, documents, messages, money, payments, manualTasks } from './mock/records.js'
import { pluralRole } from './mock/staff.js'
import { allTaskTypes, DEFAULT_TASK_TYPES, dueInfo, eventTags, taskFromRecord, taskTypeError } from './tasks.js'
import { useStaffing2 } from './staffing/store'
import { changed, coverage, requestList, rolesOf, staffById as plannerStaffById } from './staffing/derive'

const StoreContext = createContext(null)

const STORAGE_KEY = 'vue-lowfi-prototype-v9'

function initialState() {
  return {
    doneManualTaskIds: manualTasks.filter((t) => t.done).map((t) => t.id),
    // recordId -> fields changed from Tasks (name, due date/time, type, description, tags)
    manualTaskEdits: {},
    // tasks added from the Tasks page ("New"), in the same shape as lib/mock/records.js manualTasks
    createdTasks: [],
    // The venue's own task types (the system ones are fixed, see lib/tasks.js)
    taskTypes: DEFAULT_TASK_TYPES,
    repliedMessageIds: [],
    readMessageIds: [],
    signedDocumentIds: [],
    // `${eventId}:${paymentId}` recorded as paid in the prototype
    paidPaymentIds: []
  }
}

/** "1 open spot", "3 open spots". The one phrasing for unfilled roles. */
function openSpotsText(n) {
  return `${n} open spot${n === 1 ? '' : 's'}`
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [toasts, setToasts] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const { state: planner, setGuarantee } = useStaffing2()

  // Rehydrate after mount so the server-rendered HTML and the first couple
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

  /**
   * toast(message, tone?, { actions?, small? }). Toasts with actions (Undo)
   * stay up longer so there is time to use them.
   */
  const toast = useCallback((message, tone = 'done', opts = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone, actions: opts.actions, small: opts.small }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.actions?.length ? 8000 : 4000)
  }, [])

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // ---- actions ------------------------------------------------------------

  const toggleManualTask = useCallback((recordId) => {
    setState((s) => ({
      ...s,
      doneManualTaskIds: s.doneManualTaskIds.includes(recordId)
        ? s.doneManualTaskIds.filter((t) => t !== recordId)
        : [...s.doneManualTaskIds, recordId]
    }))
  }, [])

  /** Add a task from the Tasks page. `fields` is what TaskEditor collects. Returns the new record's id. */
  const addManualTask = useCallback((fields) => {
    const id = `t-new-${Date.now()}`
    setState((s) => ({
      ...s,
      createdTasks: [
        ...(s.createdTasks || []),
        // Owned by the signed-in venue manager, as the sidebar shows.
        { owner: 'Dana Whitcomb', done: false, ...fields, id }
      ]
    }))
    return id
  }, [])

  /** Change a task's fields. `patch` holds only the fields that changed. */
  const updateManualTask = useCallback((recordId, patch) => {
    setState((s) => ({ ...s, manualTaskEdits: { ...s.manualTaskEdits, [recordId]: { ...s.manualTaskEdits?.[recordId], ...patch } } }))
  }, [])

  // ---- task types (the Task types screen) ----------------------------------
  //
  // Each returns an error message to show, or null on success.

  const addTaskType = useCallback(
    (name) => {
      const error = taskTypeError(name, state.taskTypes)
      if (!error) setState((s) => ({ ...s, taskTypes: [...s.taskTypes, name.trim()] }))
      return error
    },
    [state.taskTypes]
  )

  /** Rename a type. Tasks that use it move to the new name. */
  const renameTaskType = useCallback(
    (from, to) => {
      const error = taskTypeError(to, state.taskTypes, from)
      if (error) return error
      const next = to.trim()
      setState((s) => {
        const edits = { ...s.manualTaskEdits }
        for (const t of [...manualTasks, ...(s.createdTasks || [])]) {
          if ((edits[t.id]?.type ?? t.type) === from) edits[t.id] = { ...edits[t.id], type: next }
        }
        return { ...s, manualTaskEdits: edits, taskTypes: s.taskTypes.map((t) => (t === from ? next : t)) }
      })
      return null
    },
    [state.taskTypes]
  )

  /** Delete a type. Tasks that use it move to `moveTo`, which is required if any do. */
  const deleteTaskType = useCallback((name, moveTo) => {
    setState((s) => {
      const edits = { ...s.manualTaskEdits }
      for (const t of [...manualTasks, ...(s.createdTasks || [])]) {
        if ((edits[t.id]?.type ?? t.type) === name && moveTo) edits[t.id] = { ...edits[t.id], type: moveTo }
      }
      return { ...s, manualTaskEdits: edits, taskTypes: s.taskTypes.filter((t) => t !== name) }
    })
  }, [])

  /** Submit the guaranteed guest count: sets it on the event and completes the task. */
  const submitGuestCount = useCallback(
    (recordId, eventId, count) => {
      setGuarantee(eventId, count)
      setState((s) => (s.doneManualTaskIds.includes(recordId) ? s : { ...s, doneManualTaskIds: [...s.doneManualTaskIds, recordId] }))
    },
    [setGuarantee]
  )

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

  const unsignDocument = useCallback((docId) => {
    setState((s) => ({ ...s, signedDocumentIds: s.signedDocumentIds.filter((d) => d !== docId) }))
  }, [])

  const recordPayment = useCallback((eventId, paymentId) => {
    const key = `${eventId}:${paymentId}`
    setState((s) => (s.paidPaymentIds.includes(key) ? s : { ...s, paidPaymentIds: [...s.paidPaymentIds, key] }))
  }, [])

  const undoPayment = useCallback((eventId, paymentId) => {
    const key = `${eventId}:${paymentId}`
    setState((s) => ({ ...s, paidPaymentIds: s.paidPaymentIds.filter((k) => k !== key) }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState())
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const timelineVersion = useTimelineVersion()

  // ---- derived: open spots ------------------------------------------------
  //
  // An open spot is a (block, role) pair with fewer confirmed people than it
  // needs. Someone who has been asked but not yet said yes does NOT count as
  // covered: an unanswered text is not coverage.

  const openPositions = useMemo(() => {
    const out = []
    for (const event of events) {
      for (const block of event.blocks) {
        for (const role of rolesOf(block, planner)) {
          const c = coverage(event.id, block, role, planner)
          if (c.gap <= 0) continue
          const declined = requestList(planner).filter(
            (r) => r.eventId === event.id && r.role === role && r.status === 'declined' && r.blockIds.includes(block.id)
          )
          out.push({
            id: `${block.id}--${role.replace(/\s+/g, '-').toLowerCase()}`,
            eventId: event.id,
            event,
            block,
            role,
            required: c.need,
            accepted: c.confirmed,
            pending: c.waiting,
            draft: c.notSent,
            short: c.gap,
            // Nobody asked yet for this many of the open spots.
            toFind: c.toFind,
            declinedBy: declined.map((r) => plannerStaffById(r.staffId)).filter(Boolean),
            urgency: event.primary ? 'urgent' : 'warn'
          })
        }
      }
    }
    return out
  }, [planner, timelineVersion])

  /** Coverage summary for a whole event — drives the staffing badge everywhere. */
  const coverageForEvent = useCallback(
    (eventId) => {
      const event = eventById(eventId)
      if (!event) return { required: 0, filled: 0, short: 0, complete: true, pending: 0, draft: 0 }
      let required = 0
      let filled = 0
      let pending = 0
      let draft = 0
      for (const block of event.blocks) {
        for (const role of rolesOf(block, planner)) {
          const c = coverage(event.id, block, role, planner)
          required += c.need
          filled += c.filled
          pending += c.waiting
          draft += c.notSent
        }
      }
      return { required, filled, pending, draft, short: required - filled, complete: filled >= required }
    },
    [planner]
  )

  // ---- derived: tasks / messages / documents ------------------------------

  // `due` and `dueTone` are worked out from the due date (lib/tasks.js), so an
  // edited date moves the task in and out of Tasks.
  const manualTaskList = useMemo(
    () =>
      [...manualTasks, ...(state.createdTasks || [])].map((t) => {
        const task = { ...t, ...state.manualTaskEdits?.[t.id], done: state.doneManualTaskIds.includes(t.id) }
        return { ...task, ...dueInfo(task) }
      }),
    [state.doneManualTaskIds, state.manualTaskEdits, state.createdTasks]
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

  /** Payment schedule for an event, with prototype-recorded payments applied. */
  const paymentsForEvent = useCallback(
    (eventId) => {
      const plan = payments[eventId]
      if (!plan) return null
      let paid = plan.paid
      const schedule = plan.schedule.map((p) => {
        if (p.state !== 'paid' && state.paidPaymentIds.includes(`${eventId}:${p.id}`)) {
          paid += p.amount
          return { ...p, state: 'paid', when: 'Recorded today', recordedHere: true }
        }
        return p
      })
      return { ...plan, paid, schedule }
    },
    [state.paidPaymentIds]
  )

  // ---- derived: ATTENTION -------------------------------------------------
  //
  // Everything above funnels into here. Each item answers the four questions
  // the product is built around: what happened, which event, why it matters,
  // what you can do next.

  const allOpenTasks = useMemo(() => {
    const items = []

    // 1. Open spots. While nobody has been asked for a spot it is something to
    //    do; once everyone needed has been asked it is only something to wait on.
    for (const spot of openPositions) {
      const who = spot.declinedBy[0]
      const spotLink = `/staffing/${spot.event.id}?block=${spot.block.id}&role=${encodeURIComponent(spot.role)}`
      const base = {
        source: 'staffing',
        type: 'Staff',
        dueDate: spot.event.dateKey,
        ...eventTags(spot.event),
        eventId: spot.event.id,
        eventName: spot.event.name,
        meta: `${spot.block.name} · ${hourLabel(spot.block.start)}–${hourLabel(spot.block.end)}`,
      }
      if (spot.toFind > 0) {
        items.push({
          ...base,
          id: `openPosition:${spot.id}`,
          tone: spot.urgency,
          title: `${spot.block.name}: ${openSpotsText(spot.short)} for ${pluralRole(spot.role, spot.short)}`,
          what: who
            ? `${who.name} can't make the ${spot.block.name.toLowerCase()} shift.`
            : `${spot.accepted} of ${spot.required} ${pluralRole(spot.role, spot.required)} confirmed.`,
          why: spot.event.primary
            ? `${daysOutLabel(spot.event)}. Until it is filled, this block runs short-staffed.`
            : `${daysOutLabel(spot.event)}.`,
          href: `${spotLink}&ask=1`
        })
      } else if (spot.pending > 0) {
        items.push({
          ...base,
          id: `waiting:${spot.id}`,
          tone: 'warn',
          title: `${spot.block.name}: waiting on ${spot.pending} ${spot.pending === 1 ? 'reply' : 'replies'} for ${pluralRole(spot.role, spot.short)}`,
          what: `You asked ${spot.pending} ${spot.pending === 1 ? 'person' : 'people'}. The spot stays open until someone says yes.`,
          why: `${daysOutLabel(spot.event)}. If nobody says yes, ask someone else.`,
          href: spotLink
        })
      }
    }

    // 1b. Asks saved in the planner but never sent as texts
    for (const event of events) {
      const drafts = requestList(planner).filter(
        (r) => r.eventId === event.id && (r.status === 'draft' || changed(r))
      ).length
      if (!drafts) continue
      items.push({
        id: `publish:${event.id}`,
        source: 'staffing',
        type: 'Staff',
        dueDate: event.dateKey,
        ...eventTags(event),
        tone: 'warn',
        title: `Send ${drafts} ${drafts === 1 ? 'text' : 'texts'}`,
        what: 'People are chosen, but they have not been asked yet.',
        why: 'Sending the text lets each person say yes or no.',
        eventId: event.id,
        eventName: event.name,
        meta: `${drafts} not sent`,
        href: `/staffing/${event.id}?send=1`
      })
    }

    // 2. Messages awaiting a reply
    for (const m of messageList) {
      if (!m.needsReply || m.replied) continue
      const event = m.eventId ? eventById(m.eventId) : null
      items.push({
        id: `message:${m.id}`,
        source: 'message',
        type: 'Message',
        // A thread that needs a reply is due today.
        dueDate: TODAY_KEY,
        ...eventTags(event, {
          coupleIds: m.coupleId ? [m.coupleId] : event?.coupleId ? [event.coupleId] : [],
          contactIds: contacts.filter((c) => contactName(c) === m.from).map((c) => c.id)
        }),
        tone: m.priority === 'urgent' ? 'urgent' : 'warn',
        title: `Reply to ${m.from}`,
        what: `"${m.subject}" — received ${m.received.toLowerCase()}.`,
        why: event
          ? `A quick reply keeps everyone on the same page before the event.`
          : 'No reply has been sent yet.',
        eventId: m.eventId,
        eventName: event ? event.name : 'No event',
        meta: m.fromRole.split(' · ')[0],
        href: `/messages/${m.id}`
      })
    }

    // 3. Tasks that are due and not done
    for (const t of manualTaskList) {
      if (t.done || t.dueTone === 'done' || t.dueTone === 'info') continue
      items.push(taskFromRecord(t))
    }

    // 4. Documents awaiting signature
    for (const d of documentList) {
      if (d.tone !== 'urgent') continue
      const event = eventById(d.eventId)
      items.push({
        id: `document:${d.id}`,
        source: 'document',
        type: 'Sign Document',
        // Signed off before the event it belongs to.
        dueDate: event ? event.dateKey : TODAY_KEY,
        ...eventTags(event),
        tone: 'warn',
        title: `${d.name} is ready for your signature`,
        what: `Last updated ${d.updated}.`,
        why: 'Once it is signed, the couple has formally agreed to the schedule.',
        eventId: d.eventId,
        eventName: event ? event.name : 'No event',
        meta: 'Awaiting signature',
        href: `/events/${d.eventId}/documents`
      })
    }

    // 5. Payments due
    for (const event of events) {
      const plan = paymentsForEvent(event.id)
      if (!plan) continue
      for (const p of plan.schedule) {
        if (p.state !== 'due') continue
        items.push({
          id: `payment:${event.id}:${p.id}`,
          source: 'payment',
          type: 'Payment',
          dueDate: p.dueDate || event.dateKey,
          ...eventTags(event),
          tone: 'warn',
          title: `Collect the ${p.label.toLowerCase()} of ${money(p.amount)}`,
          what: `${money(plan.total - plan.paid)} of ${money(plan.total)} is still unpaid.`,
          why: `${daysOutLabel(event)}. The balance is due before the event.`,
          eventId: event.id,
          eventName: event.name,
          meta: p.when,
          href: `/events/${event.id}/payments`
        })
      }
    }

    // Every item answers "when is it due", so they can all be sorted and filtered together.
    const dated = items.map((i) => ({ ...dueInfo(i), ...i }))
    const order = { urgent: 0, warn: 1, pending: 2, info: 3 }
    return dated.sort((a, b) => (order[a.tone] ?? 9) - (order[b.tone] ?? 9))
  }, [openPositions, planner, messageList, manualTaskList, documentList, paymentsForEvent])

  const openTasks = allOpenTasks

  // ---- derived: COMPLETED tasks -------------------------------------------
  //
  // The other side of the list above: everything the manager has dealt with.
  // Each source has its own way of being done, and each leaves its task here
  // so nothing vanishes without a trace: a ticked-off manual task, a replied
  // message, a signed document, a recorded payment. (A filled open spot has no
  // one moment of completion, so staffing does not appear here.)
  const completedTasks = useMemo(() => {
    const done = []

    for (const t of manualTaskList) {
      if (t.done) done.push(taskFromRecord(t, { done: true }))
    }

    for (const m of messageList) {
      if (!m.needsReply || !m.replied) continue
      const event = m.eventId ? eventById(m.eventId) : null
      done.push({
        id: `message:${m.id}`,
        source: 'message',
        type: 'Message',
        title: `Replied to ${m.from}`,
        what: `"${m.subject}"`,
        eventId: m.eventId,
        eventName: event ? event.name : 'No event',
        dueDate: TODAY_KEY,
        ...eventTags(event, {
          coupleIds: m.coupleId ? [m.coupleId] : event?.coupleId ? [event.coupleId] : [],
          contactIds: contacts.filter((c) => contactName(c) === m.from).map((c) => c.id)
        }),
        due: 'Replied',
        href: `/messages/${m.id}`
      })
    }

    for (const d of documentList) {
      if (!state.signedDocumentIds.includes(d.id)) continue
      const event = eventById(d.eventId)
      done.push({
        id: `document:${d.id}`,
        source: 'document',
        type: 'Sign Document',
        title: `${d.name} signed`,
        eventId: d.eventId,
        eventName: event ? event.name : 'No event',
        dueDate: event ? event.dateKey : TODAY_KEY,
        ...eventTags(event),
        due: 'Signed',
        href: `/events/${d.eventId}/documents`
      })
    }

    for (const event of events) {
      const plan = paymentsForEvent(event.id)
      for (const p of plan?.schedule || []) {
        if (!p.recordedHere) continue
        done.push({
          id: `payment:${event.id}:${p.id}`,
          source: 'payment',
          type: 'Payment',
          title: `Collected the ${p.label.toLowerCase()} of ${money(p.amount)}`,
          eventId: event.id,
          eventName: event.name,
          dueDate: p.dueDate || event.dateKey,
          ...eventTags(event),
          due: 'Paid',
          href: `/events/${event.id}/payments`
        })
      }
    }

    return done.map((t) => ({ ...t, done: true, dueTone: 'done', tone: 'done' }))
  }, [manualTaskList, messageList, documentList, paymentsForEvent, state.signedDocumentIds])

  const tasksForEvent = useCallback((eventId) => openTasks.filter((a) => a.eventId === eventId), [openTasks])

  const value = {
    hydrated,
    // collections
    manualTaskList,
    messageList,
    documentList,
    paymentsForEvent,
    // staffing
    openPositions,
    coverageForEvent,
    // Tasks
    openTasks,
    tasksForEvent,
    completedTasks,
    taskTypes: allTaskTypes(state.taskTypes),
    editableTaskTypes: state.taskTypes,
    // actions
    toggleManualTask,
    addManualTask,
    updateManualTask,
    addTaskType,
    renameTaskType,
    deleteTaskType,
    submitGuestCount,
    markReplied,
    markRead,
    signDocument,
    unsignDocument,
    recordPayment,
    undoPayment,
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
  useTimelineVersion() // draw again after a timeline edit
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function hourLabel(h) {
  const wrapped = ((h % 24) + 24) % 24 // blocks that cross midnight run past 24
  const hour24 = Math.floor(wrapped)
  const mins = Math.round((wrapped - hour24) * 60)
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return mins ? `${hour12}:${String(mins).padStart(2, '0')} ${suffix}` : `${hour12}:00 ${suffix}`
}

/**
 * Calm, priority-first summary of a task list: "2 to do first", else
 * "5 coming up", else "All caught up". Never a raw alarm count.
 */
export function taskSummaryLabel(items) {
  const first = items.filter((i) => i.tone === 'urgent').length
  if (first) return `${first} to do first`
  if (items.length) return `${items.length} coming up`
  return 'All caught up'
}
