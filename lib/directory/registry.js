// ---------------------------------------------------------------------------
// The directory's current vendors and staff, for plain modules that can't use
// React context (lib/tasks.js sorts, tags and builds picker options with
// these; lib/assignees.js names who a task is assigned to). DirectoryProvider
// keeps both lists in step before anything below it draws, the same way it
// keeps the Staffing Planner's people in step.
// ---------------------------------------------------------------------------

let vendors = []
let staff = []

export function setDirectoryVendors(list) {
  vendors = list
}

/** Every vendor, active or not, so a task keeps naming a vendor made inactive later. */
export const directoryVendors = () => vendors

export const directoryVendorById = (id) => vendors.find((v) => v.id === id) || null

/** People as { id, name, first, initials, roles: [name], inactive }. */
export function setDirectoryStaff(list) {
  staff = list
}

/** Every staff member, active or not, so a task keeps naming someone made inactive later. */
export const directoryStaff = () => staff

export const directoryStaffById = (id) => staff.find((p) => p.id === id) || null
