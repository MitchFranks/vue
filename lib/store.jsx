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
//   client inquiries  ->  tasks   (the public form at /inquire)
//
// State persists to localStorage so a tester can move between screens (and
// reload) without losing their progress. "Reset prototype data" clears it.
// ---------------------------------------------------------------------------

import { scopedKey } from '@/lib/account/session'
import { newId } from '@/lib/id'
import { useToast } from '@/lib/toasts'
import { hourLabel, openSpots } from '@/lib/format'
import { useTimelineVersion } from '@/lib/timelineEdits'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { events, eventById, daysOut, daysOutLabel, TODAY_KEY, venue } from './mock/events.js'
import { contacts, contactName, coupleById, documents, inquiries as seedInquiries, messages, money, payments, portalSeed, manualTasks } from './mock/records.js'
import { addDaysKey, changeLine, cleanDetails, diffDetails, meetingKind, meetingWhen, portalNow, portalSignature, stamp } from './portal.js'
import { pluralRole } from './mock/staff.js'
import { allTaskTypes, DEFAULT_TASK_TYPES, dueInfo, eventTags, taskFromRecord, taskTypeError } from './tasks.js'
import { cleanInquiry, currentOutcomeLabel, INQUIRY_WHY, inquiryDoneTitle, inquiryHref, inquiryTaskTitle, inquiryTaskWhat, kindOf } from './inquiries.js'
import { useStaffing } from './staffing/store'
import { useEventSheet } from './eventSheetStore'
import { managerId } from './assignees.js'
import { DEFAULT_TEMPLATES, seedDoneTemplateIds, templateTasks } from './templates.js'
import { useDirectory } from './directory/store'
import { simNowIso } from './staffing/derive'
import { entryTitle, notSeenBy, requestLine } from './eventSheet.js'
import { changed, coverage, requestList, rolesOf, staffById as plannerStaffById } from './staffing/derive'

const StoreContext = createContext(null)

const STORAGE_KEY = scopedKey('vue-lowfi-prototype-v11')

// A new task goes to the signed-in manager unless it says otherwise (lib/assignees.js).
const newTaskRecord = (fields, id) => ({ assigneeId: managerId(), done: false, ...fields, id })

function initialState() {
  return {
    // Written tasks done, including template steps (lib/templates.js) already behind the sample events.
    doneManualTaskIds: [...manualTasks.filter((t) => t.done).map((t) => t.id), ...seedDoneTemplateIds(DEFAULT_TEMPLATES, events)],
    // recordId -> fields changed from Tasks (name, due date/time, type, description, tags)
    manualTaskEdits: {},
    // recordId -> { by: staffId, at } for manual tasks marked done: who finished it, and when.
    completedBy: {},
    // task id -> fields changed on a task the product raised (a message to
    // answer, a spot to fill...): name, due date, type, description, tags,
    // who it's assigned to. Laid over the derived task (withEdits), so the
    // message or spot itself is untouched.
    taskEdits: {},
    // tasks added from the Tasks page ("New"), in the same shape as lib/mock/records.js manualTasks
    createdTasks: [],
    // The venue's own task types (the system ones are fixed, see lib/tasks.js)
    taskTypes: DEFAULT_TASK_TYPES,
    // The planning templates every event's checklist comes from (/tasks/templates).
    templates: structuredClone(DEFAULT_TEMPLATES),
    repliedMessageIds: [],
    readMessageIds: [],
    // Messages the manager wrote from the Messages tab (newest first):
    // { id, to: { type: 'staff' | 'vendor' | 'couple', id, name }, subject, body, sentAt }
    sentMessages: [],
    signedDocumentIds: [],
    // `${eventId}:${paymentId}` recorded as paid in the prototype
    paidPaymentIds: [],
    // Client inquiries from the public form (/inquire), newest last. Each new
    // one is a task until the manager deals with it (lib/inquiries.js).
    inquiries: seedInquiries,
    // The client portal, per couple (lib/portal.js):
    // { details, detailsAt, history: [{ at, by, kind, changes }], seen, signatures: { docId: { name, at } }, meeting }
    // `seen` is how many history entries the manager has read; the rest are a task.
    portal: structuredClone(portalSeed),
    // `${eventId}:${paymentId}` -> { at, by, method } for payments the couple made in the portal
    portalPayments: {}
  }
}

/**
 * A detail-sheet change as a task: make sure it reached the staff. Urgent
 * when the event is today or tomorrow; due today either way, because a
 * change nobody has read is worth chasing now.
 */
function sheetTask(e, event, missing) {
  const n = missing.length
  const names = missing.map((id) => (plannerStaffById(id)?.name || 'Someone').split(' ')[0])
  return {
    id: `sheet:${e.id}`,
    source: 'sheet',
    type: 'Event change',
    dueDate: TODAY_KEY,
    ...eventTags(event),
    tone: daysOut(event) <= 1 ? 'urgent' : 'warn',
    title: `${n} of ${e.team.length} staff haven't seen: ${entryTitle(e)}`,
    what: `Not yet: ${names.join(', ')}.${e.reason ? ` Why it changed: ${e.reason}` : ''}`,
    why: 'Staff work from the detail sheet; a change they have not read is a change that did not happen.',
    eventId: event.id,
    eventName: event.name,
    meta: e.area,
    href: `/events/${event.id}/sheet`
  }
}

/**
 * A raised task with the manager's edits laid over it, in the task's own
 * shape: the editor's `detail` is the card's `what`, and a new event brings
 * its name. A changed due date drops the derived due text so it is worked out
 * again.
 */
function withEdits(task, edit) {
  if (!edit) return task
  const { detail, ...rest } = edit
  const next = { ...task, ...rest }
  if (detail !== undefined) next.what = detail
  if (edit.eventId !== undefined && edit.eventId !== task.eventId) next.eventName = eventById(edit.eventId)?.name || task.eventName
  if (edit.dueDate !== undefined || edit.dueTime !== undefined) {
    delete next.due
    delete next.dueTone
  }
  return next
}

/** A couple's run-of-show request as a task: answer it on the Detail sheet. */
function requestTask(r, event) {
  return {
    id: `request:${r.id}`,
    source: 'request',
    type: 'Client portal',
    dueDate: TODAY_KEY,
    ...eventTags(event),
    tone: daysOut(event) <= 7 ? 'urgent' : 'warn',
    title: `${r.by.split(' ')[0]} asks: ${requestLine(r)}`,
    what: r.note ? `“${r.note}”` : '',
    why: 'The couple is waiting to hear whether the venue can do it.',
    eventId: event.id,
    eventName: event.name,
    meta: 'Run of show request',
    href: `/events/${event.id}/sheet`
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [hydrated, setHydrated] = useState(false)
  const { state: planner, setGuarantee } = useStaffing()
  // Template steps go to whoever holds a role, so they follow the directory.
  const { staff: directoryStaff } = useDirectory()
  const { entries: sheetEntries, requests: sheetRequests } = useEventSheet()

  // Rehydrate after mount so the server-rendered HTML and the first couple
  // render match (static export would otherwise warn about a mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state after the first render so the static HTML and first render match
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

  // The client form and the manager's Tasks are often open in two tabs of the
  // same browser. Take the other tab's saved state when it changes, so a new
  // inquiry shows up without a reload, and so this tab's next save doesn't
  // write over it. (Reset clears the key: go back to the seeded state.)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return
      try {
        setState(e.newValue ? { ...initialState(), ...JSON.parse(e.newValue) } : initialState())
      } catch {
        /* a half-written value: the next change will bring it */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ---- feedback -----------------------------------------------------------

  // Toasts live in their own provider (lib/toasts.jsx) so a toast never
  // re-renders every screen that reads the store. `toast` is passed through
  // here so screens can keep calling useStore().toast.
  const { toast } = useToast()

  // ---- actions ------------------------------------------------------------

  /**
   * Mark a manual task done, or reopen it. `byId` is the staff member doing it
   * (a staff member on their own task list); the manager when left out.
   */
  const toggleManualTask = useCallback(
    (recordId, byId = managerId()) => {
      const at = simNowIso(planner)
      setState((s) => {
        const reopening = s.doneManualTaskIds.includes(recordId)
        const completedBy = { ...(s.completedBy || {}) }
        if (reopening) delete completedBy[recordId]
        else completedBy[recordId] = { by: byId, at }
        return {
          ...s,
          completedBy,
          doneManualTaskIds: reopening ? s.doneManualTaskIds.filter((t) => t !== recordId) : [...s.doneManualTaskIds, recordId]
        }
      })
    },
    [planner]
  )

  /** Add a task from the Tasks page. `fields` is what TaskEditor collects. Returns the new record's id. */
  const addManualTask = useCallback((fields) => {
    const id = newId('t-new')
    setState((s) => ({ ...s, createdTasks: [...(s.createdTasks || []), newTaskRecord(fields, id)] }))
    return id
  }, [])

  /** Change a task's fields. `patch` holds only the fields that changed. */
  const updateManualTask = useCallback((recordId, patch) => {
    setState((s) => ({ ...s, manualTaskEdits: { ...s.manualTaskEdits, [recordId]: { ...s.manualTaskEdits?.[recordId], ...patch } } }))
  }, [])

  /**
   * Change any task, written or raised by the product, with the fields
   * TaskEditor collects. A written task's record is edited; a raised task's
   * changes are kept by its id and laid over it.
   */
  const updateTask = useCallback(
    (task, patch) => {
      if (task.source === 'manual') return updateManualTask(task.recordId, patch)
      setState((s) => ({ ...s, taskEdits: { ...(s.taskEdits || {}), [task.id]: { ...s.taskEdits?.[task.id], ...patch } } }))
    },
    [updateManualTask]
  )

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

  // ---- planning templates (the Planning templates screen) -----------------

  /**
   * Add a step to a template, or change one. A new step only creates tasks
   * due from today on (`since`), so events already under way don't get a
   * pile of overdue work.
   */
  const saveTemplateStep = useCallback((templateId, step) => {
    setState((s) => {
      const templates = (s.templates || DEFAULT_TEMPLATES).map((tpl) => {
        if (tpl.id !== templateId) return tpl
        const exists = step.id && tpl.steps.some((st) => st.id === step.id)
        const steps = exists
          ? tpl.steps.map((st) => (st.id === step.id ? { ...st, ...step } : st))
          : [...tpl.steps, { ...step, id: newId('step'), since: TODAY_KEY }]
        return { ...tpl, steps: steps.sort((a, b) => a.offset - b.offset) }
      })
      return { ...s, templates }
    })
  }, [])

  /** Remove a step; the tasks it created for every event go with it. */
  const deleteTemplateStep = useCallback((templateId, stepId) => {
    setState((s) => ({
      ...s,
      templates: (s.templates || DEFAULT_TEMPLATES).map((tpl) =>
        tpl.id === templateId ? { ...tpl, steps: tpl.steps.filter((st) => st.id !== stepId) } : tpl
      )
    }))
  }, [])

  /** Rename a type. Tasks that use it move to the new name. */
  const renameTaskType = useCallback(
    (from, to) => {
      const error = taskTypeError(to, state.taskTypes, from)
      if (error) return error
      const next = to.trim()
      setState((s) => {
        const edits = { ...s.manualTaskEdits }
        for (const t of [...manualTasks, ...(s.createdTasks || []), ...templateTasks(s.templates || DEFAULT_TEMPLATES, events)]) {
          if ((edits[t.id]?.type ?? t.type) === from) edits[t.id] = { ...edits[t.id], type: next }
        }
        // Raised tasks given this type in the editor move with it too.
        const raised = Object.fromEntries(
          Object.entries(s.taskEdits || {}).map(([id, e]) => [id, e.type === from ? { ...e, type: next } : e])
        )
        // ...and so do template steps of this type, so new events get the new name.
        const templates = (s.templates || DEFAULT_TEMPLATES).map((tpl) => ({
          ...tpl,
          steps: tpl.steps.map((st) => (st.type === from ? { ...st, type: next } : st))
        }))
        return { ...s, manualTaskEdits: edits, taskEdits: raised, templates, taskTypes: s.taskTypes.map((t) => (t === from ? next : t)) }
      })
      return null
    },
    [state.taskTypes]
  )

  /** Delete a type. Tasks that use it move to `moveTo`, which is required if any do. */
  const deleteTaskType = useCallback((name, moveTo) => {
    setState((s) => {
      const edits = { ...s.manualTaskEdits }
      for (const t of [...manualTasks, ...(s.createdTasks || []), ...templateTasks(s.templates || DEFAULT_TEMPLATES, events)]) {
        if ((edits[t.id]?.type ?? t.type) === name && moveTo) edits[t.id] = { ...edits[t.id], type: moveTo }
      }
      // A raised task given this type goes to `moveTo`, or back to its own type.
      const raised = Object.fromEntries(
        Object.entries(s.taskEdits || {}).map(([id, e]) => {
          if (e.type !== name) return [id, e]
          if (moveTo) return [id, { ...e, type: moveTo }]
          const { type: _gone, ...rest } = e
          return [id, rest]
        })
      )
      // Template steps of this type move to `moveTo`, or to Other.
      const templates = (s.templates || DEFAULT_TEMPLATES).map((tpl) => ({
        ...tpl,
        steps: tpl.steps.map((st) => (st.type === name ? { ...st, type: moveTo || 'Other' } : st))
      }))
      return { ...s, manualTaskEdits: edits, taskEdits: raised, templates, taskTypes: s.taskTypes.filter((t) => t !== name) }
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

  /** A new message to a staff member, vendor or couple. Returns its id. */
  const sendMessage = useCallback((message) => {
    const id = `sent-${Date.now().toString(36)}`
    setState((s) => ({
      ...s,
      sentMessages: [{ id, ...message, sentAt: new Date().toISOString() }, ...(s.sentMessages || [])]
    }))
    return id
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

  // ---- client portal --------------------------------------------------------
  // What the couple does in their portal (/portal). Each action stamps who did
  // it and when, so the couple record can say so (lib/portal.js).

  const updatePortal = useCallback((coupleId, fn) => {
    setState((s) => {
      const record = { history: [], seen: 0, signatures: {}, meeting: null, details: null, ...(s.portal || {})[coupleId] }
      return { ...s, portal: { ...(s.portal || {}), [coupleId]: { ...record, ...fn(record) } } }
    })
  }, [])

  const portalSign = useCallback(
    (coupleId, docId, name) => updatePortal(coupleId, (r) => ({ signatures: { ...r.signatures, [docId]: { name, at: portalNow() } } })),
    [updatePortal]
  )

  const portalPay = useCallback((eventId, paymentId, { by, method }) => {
    setState((s) => ({ ...s, portalPayments: { ...(s.portalPayments || {}), [`${eventId}:${paymentId}`]: { at: portalNow(), by, method } } }))
  }, [])

  /** Save the couple's details. The first save is "sent"; later ones log what changed. */
  const portalSaveDetails = useCallback(
    (coupleId, values, by) =>
      updatePortal(coupleId, (r) => {
        const next = cleanDetails(values)
        const changes = r.details ? diffDetails(r.details, next) : []
        if (r.details && !changes.length) return {}
        const entry = { at: portalNow(), by, kind: r.details ? 'changed' : 'sent', changes }
        return { details: next, detailsAt: entry.at, history: [...r.history, entry] }
      }),
    [updatePortal]
  )

  const portalBookMeeting = useCallback(
    (coupleId, meeting, by) => updatePortal(coupleId, () => ({ meeting: { ...meeting, by, at: portalNow() } })),
    [updatePortal]
  )
  const portalCancelMeeting = useCallback((coupleId) => updatePortal(coupleId, () => ({ meeting: null })), [updatePortal])

  /** The manager has read the couple's latest details and changes. */
  const markPortalSeen = useCallback((coupleId) => updatePortal(coupleId, (r) => ({ seen: r.history.length })), [updatePortal])

  const portalFor = useCallback(
    (coupleId) => ({ history: [], seen: 0, signatures: {}, meeting: null, details: null, ...(state.portal || {})[coupleId] }),
    [state.portal]
  )

  // ---- client inquiries -----------------------------------------------------

  /** Save what the client sent from /inquire. Returns the new inquiry's id (their reference). */
  const submitInquiry = useCallback((values) => {
    const id = newId('inq')
    const inquiry = {
      ...cleanInquiry(values),
      id,
      // The prototype's frozen today, so it sorts against the seeded tasks.
      submittedOn: TODAY_KEY,
      submittedAt: new Date().toISOString(),
      status: 'new',
      outcome: null
    }
    setState((s) => ({ ...s, inquiries: [...(s.inquiries || []), inquiry] }))
    return id
  }, [])

  /**
   * The manager dealt with an inquiry. `outcome` is { label, amount?, note? }.
   * `task` (a booked walkthrough or call) is added to Tasks at the same time,
   * so Undo can take both back in one step. Only a new inquiry can be resolved:
   * if another tab got there first, its outcome and task stand.
   */
  const resolveInquiry = useCallback((id, outcome, task = null) => {
    const taskId = task ? newId('t-new') : null
    setState((s) => {
      if (!(s.inquiries || []).some((q) => q.id === id && q.status === 'new')) return s
      return {
        ...s,
        inquiries: s.inquiries.map((q) => (q.id === id ? { ...q, status: 'done', outcome: { ...outcome, on: TODAY_KEY, taskId } } : q)),
        createdTasks: task ? [...(s.createdTasks || []), newTaskRecord(task, taskId)] : s.createdTasks
      }
    })
  }, [])

  /** Close without follow-up (spam, not a fit, date taken). Only a new inquiry, as with resolveInquiry. */
  const closeInquiry = useCallback((id, note = '') => {
    setState((s) => ({
      ...s,
      inquiries: (s.inquiries || []).map((q) =>
        q.id === id && q.status === 'new' ? { ...q, status: 'closed', outcome: { label: 'Closed without follow-up.', note, on: TODAY_KEY } } : q
      )
    }))
  }, [])

  /** Back to new (Undo, or Reopen). Removes the task a booking added, so nothing is left behind. */
  const reopenInquiry = useCallback((id) => {
    setState((s) => {
      const taskId = (s.inquiries || []).find((q) => q.id === id)?.outcome?.taskId
      return {
        ...s,
        inquiries: (s.inquiries || []).map((q) => (q.id === id ? { ...q, status: 'new', outcome: null } : q)),
        createdTasks: taskId ? (s.createdTasks || []).filter((t) => t.id !== taskId) : s.createdTasks,
        doneManualTaskIds: taskId ? s.doneManualTaskIds.filter((t) => t !== taskId) : s.doneManualTaskIds
      }
    })
  }, [])

  const inquiryList = useMemo(() => state.inquiries || [], [state.inquiries])
  const inquiryById = useCallback((id) => inquiryList.find((q) => q.id === id) || null, [inquiryList])

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
    // Blocks come from the live run of show, so open spots are worked out again after an edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timelineVersion is the signal that the run of show changed
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
      // Written tasks: the sample ones, ones added here, and every event's
      // planning-template steps (lib/templates.js), all handled the same way.
      [...manualTasks, ...(state.createdTasks || []), ...templateTasks(state.templates || DEFAULT_TEMPLATES, events)].map((t) => {
        const done = state.doneManualTaskIds.includes(t.id)
        const task = { ...t, ...state.manualTaskEdits?.[t.id], done, completedBy: done ? state.completedBy?.[t.id] || null : null }
        return { ...task, ...dueInfo(task) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- directoryStaff is read through the registry (template steps' assignees)
    [state.doneManualTaskIds, state.manualTaskEdits, state.createdTasks, state.completedBy, state.templates, directoryStaff]
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
      {
        if (state.signedDocumentIds.includes(d.id)) return { ...d, status: 'Signed', tone: 'done' }
        const sig = portalSignature(state.portal, d.id)
        return sig ? { ...d, status: 'Signed', tone: 'done', signedBy: sig.name, signedOn: stamp(sig.at), signedOnline: true } : d
      }),
    [state.signedDocumentIds, state.portal]
  )

  /** Payment schedule for an event, with prototype-recorded payments applied. */
  const paymentsForEvent = useCallback(
    (eventId) => {
      const plan = payments[eventId]
      if (!plan) return null
      let paid = plan.paid
      const schedule = plan.schedule.map((p) => {
        const online = state.portalPayments?.[`${eventId}:${p.id}`]
        if (p.state !== 'paid' && online) {
          paid += p.amount
          return { ...p, state: 'paid', when: `Paid online ${stamp(online.at)} by ${online.by}`, paidOnline: online }
        }
        if (p.state !== 'paid' && state.paidPaymentIds.includes(`${eventId}:${p.id}`)) {
          paid += p.amount
          return { ...p, state: 'paid', when: 'Recorded today', recordedHere: true }
        }
        return p
      })
      return { ...plan, paid, schedule }
    },
    [state.paidPaymentIds, state.portalPayments]
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
          title: `${spot.block.name}: ${openSpots(spot.short)} for ${pluralRole(spot.role, spot.short)}`,
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

    // 5. Client inquiries from the public form. Due the day they arrive: the
    //    confirmation screen promised a reply within one business day.
    for (const q of inquiryList) {
      if (q.status !== 'new') continue
      items.push({
        id: `inquiry:${q.id}`,
        source: 'inquiry',
        type: 'Inquiry',
        inquiryId: q.id,
        dueDate: q.submittedOn,
        coupleIds: [],
        contactIds: [],
        vendorIds: [],
        tone: 'urgent',
        title: inquiryTaskTitle(q),
        what: inquiryTaskWhat(q),
        why: INQUIRY_WHY,
        eventId: null,
        eventName: kindOf(q.kind)?.label,
        meta: 'New inquiry',
        href: inquiryHref(q.id)
      })
    }

    // 5b. The client portal: details the couple sent or changed that the
    //     manager hasn't read (so a moved cake cutting reaches the staff), and
    //     meetings the couple booked.
    for (const [coupleId, r] of Object.entries(state.portal || {})) {
      const couple = coupleById(coupleId)
      if (!couple) continue
      const event = eventById(couple.eventIds[0])
      const base = {
        source: 'portal',
        type: 'Client portal',
        ...eventTags(event),
        eventId: event?.id || null,
        eventName: event ? event.name : couple.name,
        href: `/couples/${coupleId}`
      }
      const unseen = (r.history || []).slice(r.seen || 0)
      if (unseen.length) {
        // Not read even the first version yet: it is all new, so there is nothing to compare against.
        const sentNow = unseen.some((h) => h.kind === 'sent')
        const changes = sentNow ? [] : unseen.flatMap((h) => h.changes)
        const by = unseen[unseen.length - 1].by
        const n = changes.length
        items.push({
          ...base,
          id: `portal-details:${coupleId}:${r.history.length}`,
          dueDate: TODAY_KEY,
          tone: event && event.dateKey <= addDaysKey(TODAY_KEY, 7) ? 'urgent' : 'warn',
          title: sentNow ? `${by} sent their event details` : `${by} changed ${n} ${n === 1 ? 'detail' : 'details'}`,
          what: n
            ? `${changes.slice(0, 3).map(changeLine).join('. ')}.${n > 3 ? ` And ${n - 3} more.` : ''}`
            : 'Guest count, key moments, day-of contact and guest needs.',
          why: 'Pass it on to the staff and vendors, so nobody works from old information on the day.',
          meta: 'From the client portal'
        })
      }
      if (r.meeting && r.meeting.dateKey >= TODAY_KEY) {
        items.push({
          ...base,
          id: `portal-meeting:${coupleId}`,
          dueDate: r.meeting.dateKey,
          tone: 'info',
          title: `${meetingKind(r.meeting.kind)?.label} with ${r.meeting.by}`,
          what: `${meetingWhen(r.meeting)}. Booked by the couple in their portal.`,
          why: 'It is on your schedule. Nothing to do until then.',
          meta: 'Meeting'
        })
      }
    }

    // 6. Payments due
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

    // 7. Detail sheet changes that some of the staff working the event haven't
    //    opened. The manager's job is to be sure the change reached them; it
    //    is done when everyone has tapped "Got it" (lib/eventSheet.js).
    for (const e of sheetEntries) {
      const missing = notSeenBy(e)
      const event = eventById(e.eventId)
      if (!missing.length || !event || daysOut(event) < 0) continue
      items.push(sheetTask(e, event, missing))
    }

    // 8. Run-of-show changes the couple asked for in the client portal,
    //    waiting for the venue to accept or decline (on the Detail sheet).
    for (const r of sheetRequests) {
      const event = eventById(r.eventId)
      if (r.status !== 'waiting' || !event) continue
      items.push(requestTask(r, event))
    }

    // Every item answers "when is it due", so they can all be sorted and filtered together.
    // What the product raises goes to the manager unless it's been reassigned
    // (lib/assignees.js), and any edits to it are laid over it.
    const me = managerId()
    const dated = items.map((i) => {
      const t = withEdits({ assigneeId: me, ...i }, i.source === 'manual' ? null : state.taskEdits?.[i.id])
      return { ...dueInfo(t), ...t }
    })
    const order = { urgent: 0, warn: 1, pending: 2, info: 3 }
    return dated.sort((a, b) => (order[a.tone] ?? 9) - (order[b.tone] ?? 9))
  }, [openPositions, planner, messageList, manualTaskList, documentList, paymentsForEvent, inquiryList, state.portal, sheetEntries, sheetRequests, state.taskEdits])

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
      if (!state.signedDocumentIds.includes(d.id) && !d.signedOnline) continue
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
        if (!p.recordedHere && !p.paidOnline) continue
        done.push({
          id: `payment:${event.id}:${p.id}`,
          source: 'payment',
          type: 'Payment',
          title: p.paidOnline
            ? `${p.paidOnline.by} paid the ${p.label.toLowerCase()} of ${money(p.amount)} online`
            : `Collected the ${p.label.toLowerCase()} of ${money(p.amount)}`,
          eventId: event.id,
          eventName: event.name,
          dueDate: p.dueDate || event.dateKey,
          ...eventTags(event),
          due: 'Paid',
          href: `/events/${event.id}/payments`
        })
      }
    }

    for (const q of inquiryList) {
      if (q.status === 'new') continue
      done.push({
        id: `inquiry:${q.id}`,
        source: 'inquiry',
        type: 'Inquiry',
        inquiryId: q.id,
        title: inquiryDoneTitle(q),
        what: currentOutcomeLabel(q, manualTaskList.find((t) => t.id === q.outcome?.taskId)),
        eventId: null,
        eventName: kindOf(q.kind)?.label,
        dueDate: q.submittedOn,
        coupleIds: [],
        contactIds: [],
        vendorIds: [],
        due: q.status === 'closed' ? 'Closed' : 'Done',
        href: inquiryHref(q.id)
      })
    }

    // A run-of-show request the venue has answered.
    for (const r of sheetRequests) {
      const event = eventById(r.eventId)
      if (r.status === 'waiting' || !event) continue
      done.push({ ...requestTask(r, event), title: `${r.status === 'accepted' ? 'Accepted' : 'Declined'}: ${requestLine(r)}`, due: r.status === 'accepted' ? 'Accepted' : 'Declined' })
    }

    // A sheet change everyone has seen.
    for (const e of sheetEntries) {
      const event = eventById(e.eventId)
      if (!event || !e.notify || !e.team.length || notSeenBy(e).length) continue
      done.push({ ...sheetTask(e, event, []), title: `Everyone saw: ${entryTitle(e)}`, due: 'Seen by all' })
    }

    const me = managerId()
    return done.map((t) => {
      const edited = withEdits({ assigneeId: me, ...t }, t.source === 'manual' ? null : state.taskEdits?.[t.id])
      return { ...edited, due: t.due, done: true, dueTone: 'done', tone: 'done' }
    })
  }, [manualTaskList, messageList, documentList, paymentsForEvent, state.signedDocumentIds, inquiryList, sheetEntries, sheetRequests, state.taskEdits])

  /** Everything assigned to one person, open and done (their own task list, their profile). */
  const tasksAssignedTo = useCallback(
    (staffId) => {
      const upcoming = manualTaskList.filter((t) => !t.done && t.dueTone === 'info').map((t) => taskFromRecord(t))
      return {
        open: [...openTasks, ...upcoming].filter((t) => t.assigneeId === staffId),
        done: completedTasks.filter((t) => t.assigneeId === staffId)
      }
    },
    [manualTaskList, openTasks, completedTasks]
  )

  const tasksForEvent = useCallback((eventId) => openTasks.filter((a) => a.eventId === eventId), [openTasks])

  const taskTypes = useMemo(() => allTaskTypes(state.taskTypes), [state.taskTypes])

  const value = useMemo(
    () => ({
      hydrated,
      // collections
      manualTaskList,
      messageList,
      sentMessageList: state.sentMessages || [],
      documentList,
      paymentsForEvent,
      inquiryList,
      inquiryById,
      // staffing
      openPositions,
      coverageForEvent,
      // Tasks
      openTasks,
      tasksForEvent,
      completedTasks,
      taskTypes,
      editableTaskTypes: state.taskTypes,
      // actions
      toggleManualTask,
      addManualTask,
      updateManualTask,
      updateTask,
      tasksAssignedTo,
      addTaskType,
      renameTaskType,
      deleteTaskType,
      templates: state.templates || DEFAULT_TEMPLATES,
      saveTemplateStep,
      deleteTemplateStep,
      submitGuestCount,
      markReplied,
      markRead,
      sendMessage,
      portalFor,
      portalSign,
      portalPay,
      portalSaveDetails,
      portalBookMeeting,
      portalCancelMeeting,
      markPortalSeen,
      signDocument,
      unsignDocument,
      recordPayment,
      undoPayment,
      submitInquiry,
      resolveInquiry,
      closeInquiry,
      reopenInquiry,
      reset,
      // feedback (see lib/toasts.jsx)
      toast
    }),
    [
      hydrated,
      manualTaskList,
      messageList,
      state.sentMessages,
      documentList,
      paymentsForEvent,
      inquiryList,
      inquiryById,
      openPositions,
      coverageForEvent,
      openTasks,
      tasksForEvent,
      completedTasks,
      taskTypes,
      state.taskTypes,
      toggleManualTask,
      addManualTask,
      updateManualTask,
      updateTask,
      tasksAssignedTo,
      addTaskType,
      renameTaskType,
      deleteTaskType,
      state.templates,
      saveTemplateStep,
      deleteTemplateStep,
      submitGuestCount,
      markReplied,
      markRead,
      sendMessage,
      portalFor,
      portalSign,
      portalPay,
      portalSaveDetails,
      portalBookMeeting,
      portalCancelMeeting,
      markPortalSeen,
      signDocument,
      unsignDocument,
      recordPayment,
      undoPayment,
      submitInquiry,
      resolveInquiry,
      closeInquiry,
      reopenInquiry,
      reset,
      toast
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  useTimelineVersion() // draw again after a timeline edit
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
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
