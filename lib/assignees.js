// ---------------------------------------------------------------------------
// Who a task is assigned to.
//
// Why (venue manager interview): "a centralized system that ... helps me
// delegate and track responsibilities with my team. I'd love to be able to
// see ... who's responsible for each thing without having to constantly
// follow up." So every task names one person from the staff directory.
//
//   Any task is assigned in the task editor or straight from its card, to
//   anyone on the team, or to nobody yet. A task the venue writes starts with
//   the manager; so does everything the product raises (a reply to send, a
//   spot to fill...), until the manager hands it on (store: taskEdits).
//
// The manager is a staff record too (the sample venue's Dana Whitcomb; a new
// account's owner is added to its directory), found by name.
// Plain module: reads the directory through lib/directory/registry.js.
// ---------------------------------------------------------------------------

import { directoryStaff, directoryStaffById } from './directory/registry.js'
import { venue } from './mock/events.js'

/** The filter value for tasks nobody owns yet. */
export const UNASSIGNED = 'unassigned'

/** The signed-in manager's staff id, or null if they aren't in the directory. */
export const managerId = () => directoryStaff().find((p) => p.name === venue.manager)?.id ?? null

export const personById = (id) => (id ? directoryStaffById(id) : null)

/** "Caleb Ross", or "Unassigned". */
export const personName = (id) => personById(id)?.name || 'Unassigned'

/** "Caleb", or "Unassigned". */
export const personFirst = (id) => personById(id)?.first || 'Unassigned'

const az = (a, b) => a.label.localeCompare(b.label)

/**
 * Who a task can be given to: the manager first ("Dana Whitcomb (you)"),
 * then active staff A–Z with their roles. Anyone in `keep` stays listed even
 * if inactive, so a task keeps showing who has it.
 */
export function assigneeOptions(keep = []) {
  const me = managerId()
  const people = directoryStaff()
    .filter((p) => !p.inactive || keep.includes(p.id))
    .map((p) => ({ value: p.id, label: p.id === me ? `${p.name} (you)` : p.name, sub: p.roles.join(' · ') || undefined }))
  return [...people.filter((o) => o.value === me), ...people.filter((o) => o.value !== me).sort(az)]
}
