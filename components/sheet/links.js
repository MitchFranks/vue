// Where the sheet lives, for the manager and for one staff member.
// A real build would give each staff member a private, unguessable link
// instead of their staff id.

export const sheetHref = (eventId) => `/events/${eventId}/sheet`

export const dayOfHref = (eventId, staffId) =>
  `/day-of?e=${encodeURIComponent(eventId)}${staffId ? `&s=${encodeURIComponent(staffId)}` : ''}`

/** A staff member's own task list (components/tasks/MyTasks.jsx). */
export const myTasksHref = (staffId) => `/my-tasks${staffId ? `?s=${encodeURIComponent(staffId)}` : ''}`
