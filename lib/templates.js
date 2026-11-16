// ---------------------------------------------------------------------------
// Planning templates: the checklist every event gets, dated from the event.
//
// Why (venue manager interview): "a centralized system that automatically
// organizes tasks ... I'd love to be able to see what's coming up, what still
// needs to be done, and who's responsible for each thing without having to
// ... keep everything in my head."
//
// A template is a list of steps. Each step says what to do, when (days before
// or after the event), its task type and who usually does it (a role, or the
// manager). Every event gets the steps of its template as ordinary written
// tasks (ids `tpl-<eventId>-<stepId>`), so they are assigned, edited, marked
// done and filtered like any other task. Weddings use the wedding template;
// every other event type uses the second one.
//
// The steps live in the store (state.templates) and are edited on
// /tasks/templates. An edit applies to every event, except what has been
// changed on a task itself. A step added later only creates tasks due from
// the day it was added (`since`), so it never floods the list with overdue
// work for events already under way.
//
// Plain module: who does a step is resolved through the directory registry.
// ---------------------------------------------------------------------------

import { directoryStaff } from './directory/registry.js'
import { managerId } from './assignees.js'
import { TODAY_KEY } from './mock/events.js'

/** Who a step goes to: the manager, or the first active person in a role. */
export const MANAGER_ROLE = 'manager'

export const DEFAULT_TEMPLATES = [
  {
    id: 'wedding',
    name: 'Wedding plan',
    appliesTo: 'Wedding',
    steps: [
      { id: 'portal', offset: -120, title: 'Send the client portal link', type: 'Couple follow-up', role: MANAGER_ROLE, detail: 'So the couple can sign, pay and start filling in their details.' },
      { id: 'vendors', offset: -60, title: 'Confirm the vendor list and certificates of insurance', type: 'Vendor coordination', role: MANAGER_ROLE, detail: '' },
      { id: 'walkthrough', offset: -30, title: 'Hold the final walkthrough with the couple', type: 'Couple follow-up', role: MANAGER_ROLE, detail: '' },
      { id: 'run-of-show', offset: -21, title: 'Draft the run of show and share it with the couple', type: 'Paperwork', role: 'Event Captain', detail: '' },
      { id: 'final-count', offset: -14, title: 'Chase the final guest count', type: 'Couple follow-up', role: MANAGER_ROLE, detail: 'Catering needs the guarantee before the order locks.' },
      { id: 'rentals', offset: -10, title: 'Confirm rentals, linens and chair counts', type: 'Venue prep', role: 'Grounds', detail: '' },
      { id: 'staff-brief', offset: -7, title: 'Check the detail sheet is complete and brief the staff', type: 'Venue prep', role: 'Event Captain', detail: 'Every key detail filled in, and the run of show final.' },
      { id: 'load-in', offset: -2, title: "Confirm every vendor's load-in time", type: 'Vendor coordination', role: 'Event Captain', detail: '' },
      { id: 'setup-check', offset: -1, title: 'Walk the spaces after setup', type: 'Venue prep', role: MANAGER_ROLE, detail: '' },
      { id: 'damage', offset: 1, title: 'Return rentals and do the damage walkthrough', type: 'Venue prep', role: 'Grounds', detail: '' },
      { id: 'close-out', offset: 3, title: 'Close out the booking: final invoice and deposit', type: 'Paperwork', role: MANAGER_ROLE, detail: '' }
    ]
  },
  {
    id: 'other',
    name: 'Event plan',
    appliesTo: 'other',
    steps: [
      { id: 'confirm-details', offset: -14, title: 'Confirm the headcount and event details', type: 'Couple follow-up', role: MANAGER_ROLE, detail: 'Headcount, dietary needs and the day-of contact, so the detail sheet is complete.' },
      { id: 'staff-brief', offset: -7, title: 'Check the detail sheet is complete and send it to staff', type: 'Venue prep', role: 'Event Captain', detail: '' },
      { id: 'rentals', offset: -3, title: 'Confirm rentals, linens and table counts', type: 'Venue prep', role: 'Grounds', detail: '' },
      { id: 'setup-check', offset: -1, title: 'Walk the space after setup', type: 'Venue prep', role: MANAGER_ROLE, detail: '' },
      { id: 'close-out', offset: 2, title: 'Close out: final invoice and thank-you note', type: 'Paperwork', role: MANAGER_ROLE, detail: '' }
    ]
  }
]

/**
 * Sample data: template tasks due before the prototype's today count as done,
 * except these, left open to show what an overdue step looks like (the
 * Shah–Patel sheet really is missing its dietary needs and contact phone).
 */
export const SEED_OPEN = ['tpl-evt-1002-confirm-details']

export const templateFor = (templates, event) =>
  templates.find((t) => t.appliesTo === event.type) || templates.find((t) => t.appliesTo === 'other')

/* ---------------------------------------------------------------- dates --- */

const DAY_MS = 86400000
export const addDaysKey = (dateKey, n) => new Date(Date.parse(`${dateKey}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10)

/** "120 days before", "On the day", "3 days after". */
export function whenLabel(offset) {
  if (offset === 0) return 'On the day'
  const n = Math.abs(offset)
  return `${n} day${n === 1 ? '' : 's'} ${offset < 0 ? 'before' : 'after'}`
}

/** The person a role points to today (first active match A–Z), or the manager. */
export function roleAssignee(role) {
  if (role === MANAGER_ROLE) return managerId()
  const match = directoryStaff()
    .filter((p) => !p.inactive && p.roles.includes(role))
    .sort((a, b) => a.name.localeCompare(b.name))[0]
  return match?.id || managerId()
}

export const roleLabel = (role) => (role === MANAGER_ROLE ? 'The manager' : role)

/* ---------------------------------------------------------------- tasks --- */

export const templateTaskId = (eventId, stepId) => `tpl-${eventId}-${stepId}`

/**
 * Every event's template steps as task records, in the shape of
 * lib/mock/records.js manualTasks. `since` keeps a step added later from
 * creating tasks that were already due.
 */
export function templateTasks(templates, eventList) {
  const out = []
  for (const event of eventList) {
    const template = templateFor(templates, event)
    if (!template) continue
    for (const step of template.steps) {
      const dueDate = addDaysKey(event.dateKey, step.offset)
      if (step.since && dueDate < step.since) continue
      out.push({
        id: templateTaskId(event.id, step.id),
        eventId: event.id,
        title: step.title,
        type: step.type,
        dueDate,
        dueTime: null,
        assigneeId: roleAssignee(step.role),
        done: false,
        detail: step.detail || '',
        coupleIds: event.coupleId ? [event.coupleId] : [],
        contactIds: [],
        vendorIds: [],
        template: { id: template.id, name: template.name, stepId: step.id }
      })
    }
  }
  return out
}

/** Template tasks the sample data starts with as done (see SEED_OPEN). */
export function seedDoneTemplateIds(templates, eventList) {
  return templateTasks(templates, eventList)
    .filter((t) => t.dueDate < TODAY_KEY && !SEED_OPEN.includes(t.id))
    .map((t) => t.id)
}

/** A blank step for the editor. */
export const blankStep = () => ({ id: '', offset: -7, title: '', type: 'Other', role: MANAGER_ROLE, detail: '' })
