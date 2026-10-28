// ---------------------------------------------------------------------------
// Venue directory · data model.
//
// One venue owns staff, staff roles, vendors and vendor categories. Records
// point at each other by id, never by display name, so a renamed role or
// category follows every record that uses it. See docs/DIRECTORY-DATA-MODEL.md.
//
//   Venue ─┬─ Staff ── roleIds ──> StaffRole
//          │     └─ availability (weekly windows) ──> Staffing Planner
//          ├─ Vendor ── categoryId ──> VendorCategory
//          └─ VendorBooking (vendorId + eventId + status)
//
// Assignments (staff to shifts, vendors to tasks) are not stored on the
// person or vendor. They are their own records that point at a staffId or
// vendorId, the way Staffing Planner requests already do.
// ---------------------------------------------------------------------------

import { DAYS, formatHour, staff as seedStaff, ROLES as PLANNER_ROLES } from '@/lib/mock/staff'
import { vendors as seedVendors } from '@/lib/mock/records'
import { STAFF_EXTRAS } from '@/lib/staffing/seed'
import {
  EXTRA_STAFF,
  EXTRA_VENDORS,
  LEGACY_CATEGORY,
  SEED_CATEGORY_NAMES,
  SEED_ROLE_NAMES,
  SEED_VENUE,
  STAFF_DETAILS,
  VENDOR_DESCRIPTIONS,
  VENUE_ID
} from '@/lib/mock/directory'

export { DAYS }

export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }

/* -------------------------------------------------------------- status --- */

// One record status for staff and vendors. `tone` is a StatusBadge tone.
export const RECORD_STATUS = {
  active: { label: 'Active', tone: 'done' },
  inactive: { label: 'Inactive', tone: 'empty' }
}

/** Status choices for a create/edit form. */
export const STATUS_OPTIONS = Object.entries(RECORD_STATUS).map(([value, s]) => ({ value, label: s.label }))

export const STATUS_FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' }
]

/* -------------------------------------------------------------- routes --- */
// Detail and edit screens take the id as a query string, so records created
// in the browser open the same as seeded ones on the static export.

export const staffHref = (id) => `/staff/profile?id=${encodeURIComponent(id)}`
export const staffEditHref = (id) => `/staff/edit?id=${encodeURIComponent(id)}`
export const vendorHref = (id) => `/vendors/profile?id=${encodeURIComponent(id)}`
export const vendorEditHref = (id) => `/vendors/edit?id=${encodeURIComponent(id)}`

/* ------------------------------------------------------------- options --- */
// Staff roles and vendor categories share one shape: { id, name, locked? }.

export function optionId(prefix, name, taken = []) {
  const base = `${prefix}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'}`
  let id = base
  for (let n = 2; taken.includes(id); n += 1) id = `${base}-${n}`
  return id
}

function seedOptions(prefix, names, isLocked = () => false) {
  const out = []
  for (const name of names) {
    out.push({ id: optionId(prefix, name, out.map((o) => o.id)), name, ...(isLocked(name) && { locked: true }) })
  }
  return out
}

export const optionName = (list, id) => list.find((o) => o.id === id)?.name || ''
const optionIdByName = (list, name) => list.find((o) => o.name === name)?.id

/* ---------------------------------------------------------------- people --- */

export const fullName = (p) => [p.firstName, p.lastName].filter(Boolean).join(' ')
export const initialsOf = (p) => [p.firstName, p.lastName].map((s) => (s || '').trim()[0] || '').join('').toUpperCase()

export const emptyWeek = () => Object.fromEntries(DAYS.map((d) => [d, []]))

/* -------------------------------------------------------- availability --- */
// availability = { Mon: [{ start, end }], ... } in decimal hours (9.5 = 9:30
// AM, 24 = midnight). An empty day is unavailable. This is the shape the
// Staffing Planner already ranks people with. availabilityStatus says whether
// the hours are known ('confirmed') or still to be collected ('pending').

const clock = (h) => (h >= 24 ? 'midnight' : formatHour(h))

/** [] -> "Unavailable"; [{16,24}] -> "Available after 4:00 PM" */
export function describeWindows(windows = []) {
  if (!windows.length) return 'Unavailable'
  return windows
    .map(({ start, end }) => {
      if (start <= 0 && end >= 24) return 'Available all day'
      if (end >= 24) return `Available after ${clock(start)}`
      if (start <= 0) return `Available until ${clock(end)}`
      return `Available ${clock(start)}–${clock(end)}`
    })
    .join(', ')
}

/** A one-line summary for list rows. */
export function availabilitySummary(p) {
  if (p.availabilityStatus === 'pending') return 'Availability pending'
  const days = DAYS.filter((d) => p.availability?.[d]?.length)
  if (!days.length) return 'No availability set'
  if (days.length === 7) return 'Available every day'
  return `Available ${days.join(', ')}`
}

/** 9.5 -> "09:30" for <input type="time">. */
export const hoursToTime = (h) => {
  const t = Math.min(h, 23.99)
  return `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`
}

/** "16:30" -> 16.5. An end of "00:00" means midnight (24). */
export function timeToHours(value, { isEnd = false } = {}) {
  const m = /^(\d{1,2}):(\d{2})/.exec(value || '')
  if (!m) return null
  const h = Number(m[1]) + Number(m[2]) / 60
  return isEnd && h === 0 ? 24 : h
}

const OPEN_WEEK = () => Object.fromEntries(DAYS.map((d) => [d, [{ start: 0, end: 24 }]]))

/**
 * The person as the Staffing Planner reads them (lib/staffing/adapter.js).
 * Roles become names because the planner plans by role name. Hours still
 * pending are treated as open, like a helper added by hand in the planner.
 */
export function toPlannerPerson(p, roles) {
  const names = p.roleIds.map((id) => optionName(roles, id)).filter(Boolean)
  return {
    id: p.id,
    name: fullName(p),
    initials: initialsOf(p),
    role: names[0] || '',
    roles: names,
    phone: p.phone,
    email: p.email,
    preferredHours: p.preferredHours,
    note: p.notes,
    availability: p.availabilityStatus === 'pending' ? OPEN_WEEK() : p.availability,
    inactive: p.status === 'inactive',
    pool: false,
    directory: true
  }
}

/* ------------------------------------------------------------ searching --- */

export function matchesQuery(query, values) {
  const q = query.trim().toLowerCase()
  return !q || values.some((v) => String(v || '').toLowerCase().includes(q))
}

/** Trim every string field of a form's values. */
export const trimStrings = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' ? x.trim() : x]))

/* ------------------------------------------------------------ validation --- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** `required` is { field: message }. Returns { field: message } for each problem. */
export function validate(values, { required = {}, email = [] } = {}) {
  const errors = {}
  for (const [field, message] of Object.entries(required)) {
    const v = values[field]
    if (Array.isArray(v) ? !v.length : !String(v ?? '').trim()) errors[field] = message
  }
  for (const field of email) {
    if (values[field] && !errors[field] && !EMAIL.test(values[field].trim())) errors[field] = 'Enter an email like name@example.com.'
  }
  return errors
}

export const validateStaff = (v) =>
  validate(v, {
    required: { firstName: 'Enter a first name.', lastName: 'Enter a last name.', primaryRoleId: 'Choose a role.' },
    email: ['email']
  })

export const validateVendor = (v) =>
  validate(v, { required: { name: 'Enter the company name.', categoryId: 'Choose a category.' }, email: ['email'] })

export const validateVenue = (v) => validate(v, { required: { name: 'Enter the venue name.' }, email: ['email'] })

/* -------------------------------------------------------------- blanks --- */

export function blankStaff(roles) {
  return {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    primaryRoleId: roles.find((r) => r.name === 'Event Staff')?.id || roles[0]?.id || '',
    otherRoleIds: [],
    status: 'active',
    availabilityStatus: 'pending',
    availability: emptyWeek(),
    preferredHours: '',
    skills: '',
    notes: ''
  }
}

export const blankVendor = (categories) => ({
  name: '',
  contactName: '',
  categoryId: categories[0]?.id || '',
  phone: '',
  email: '',
  website: '',
  description: '',
  notes: '',
  status: 'active'
})

/** Record -> form values (roles split into primary + others, skills as text). */
export const staffToForm = (p) => ({
  ...p,
  primaryRoleId: p.roleIds[0] || '',
  otherRoleIds: p.roleIds.slice(1),
  skills: (p.skills || []).join(', ')
})

/** Form values -> the stored fields. */
export function formToStaff(v) {
  return {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    phone: v.phone.trim(),
    email: v.email.trim(),
    roleIds: [v.primaryRoleId, ...v.otherRoleIds.filter((id) => id !== v.primaryRoleId)],
    status: v.status,
    availabilityStatus: v.availabilityStatus,
    availability: v.availability,
    preferredHours: v.preferredHours.trim(),
    skills: v.skills.split(',').map((s) => s.trim()).filter(Boolean),
    notes: v.notes.trim()
  }
}

/* ---------------------------------------------------------------- seed --- */

function splitName(name) {
  const parts = name.trim().split(/\s+/)
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function seedDirectory() {
  // Roles the Staffing Planner plans by are locked: renaming one would orphan its needs.
  const roles = seedOptions('role', SEED_ROLE_NAMES, (name) => PLANNER_ROLES.includes(name))
  const categories = seedOptions('cat', SEED_CATEGORY_NAMES)
  const roleIds = (names) => names.map((n) => optionIdByName(roles, n)).filter(Boolean)

  const staff = [
    ...seedStaff.map((p) => ({
      id: p.id,
      venueId: VENUE_ID,
      ...splitName(p.name),
      phone: p.phone,
      email: p.email,
      roleIds: roleIds(STAFF_EXTRAS[p.id]?.roles || [p.role]),
      status: 'active',
      availabilityStatus: 'confirmed',
      availability: structuredClone(p.availability),
      preferredHours: p.preferredHours,
      skills: STAFF_DETAILS[p.id]?.skills || [],
      notes: p.note
    })),
    ...EXTRA_STAFF.map(({ roleNames, ...p }) => ({ ...structuredClone(p), venueId: VENUE_ID, roleIds: roleIds(roleNames) }))
  ]

  const vendors = [
    ...seedVendors.map((v) => ({
      id: v.id,
      venueId: VENUE_ID,
      name: v.name,
      contactName: v.contact,
      categoryId: optionIdByName(categories, LEGACY_CATEGORY[v.category] || 'Other'),
      phone: v.phone,
      email: v.email,
      website: '',
      description: VENDOR_DESCRIPTIONS[v.id] || '',
      notes: v.note,
      status: 'active'
    })),
    ...EXTRA_VENDORS.map(({ categoryName, ...v }) => ({ ...v, venueId: VENUE_ID, categoryId: optionIdByName(categories, categoryName) }))
  ]

  // A vendor's place on an event is its own record, so it can later carry
  // requirements, arrival times and tasks without changing the vendor.
  const vendorBookings = seedVendors.flatMap((v) =>
    v.eventIds.map((eventId) => ({ id: `bk-${v.id}-${eventId}`, vendorId: v.id, eventId, status: v.status, tone: v.statusTone }))
  )

  return { version: 1, venue: { ...SEED_VENUE, address: { ...SEED_VENUE.address } }, roles, categories, staff, vendors, vendorBookings }
}
