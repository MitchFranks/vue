// ---------------------------------------------------------------------------
// The directory's current vendors, for plain modules that can't use React
// context (lib/tasks.js sorts, tags and builds picker options with these).
// DirectoryProvider keeps the list in step before anything below it draws,
// the same way it keeps the Staffing Planner's people in step.
// ---------------------------------------------------------------------------

let vendors = []

export function setDirectoryVendors(list) {
  vendors = list
}

/** Every vendor, active or not, so a task keeps naming a vendor made inactive later. */
export const directoryVendors = () => vendors

export const directoryVendorById = (id) => vendors.find((v) => v.id === id) || null
