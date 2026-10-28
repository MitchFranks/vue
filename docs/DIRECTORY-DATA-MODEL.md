# Venue directory: data model

The venue profile, staff, staff roles, vendors and vendor categories a manager sets up before assigning anyone to an event.

- Code: `lib/directory/model.js` (shapes, helpers, seed), `lib/directory/store.jsx` (state + localStorage key `vue-directory-v1`)
- Seed data: `lib/mock/directory.js`, plus the existing staff and vendors from `lib/mock/staff.js` and `lib/mock/records.js`
- Shared UI: `components/ui/records.jsx` and `components/directory/*`

## Relationships

```
Venue ─┬─ Staff ──── roleIds[] ───> StaffRole
       │    └─ availability ──────> Staffing Planner (WORLD, via syncDirectoryStaff)
       ├─ Vendor ─── categoryId ──> VendorCategory
       └─ VendorBooking (vendorId, eventId, status)
```

Records point at each other **by id**, never by display name. That means a renamed role or category carries through to every record that uses it.

Assignments are **separate records** that point at a person or vendor. They are not lists stored on the staff or vendor record. The Staffing Planner's requests (`{ staffId, eventId, role, blockIds, status }`) already follow this pattern, and `VendorBooking` does the same for vendors.

## Venue

| Field | Notes |
|---|---|
| `id`, `name`, `venueType`, `description` | |
| `address` | `{ street, city, region, postalCode }` |
| `phone`, `email`, `website` | |
| `primaryContactId` | A staff `id` |

## StaffRole / VendorCategory

`{ id, name, locked? }`. Both lists can be edited from the Staff and Vendors pages, using the same editor.

- An entry that a record still uses can be renamed but not removed.
- `locked` roles are the ones the Staffing Planner plans by: Venue Manager, Event Captain, Event Staff, Bartender, Server and Grounds. Their names cannot change, because the planner keys its needs by role name.

## Staff

| Field | Notes |
|---|---|
| `id`, `venueId` | |
| `firstName`, `lastName`, `phone`, `email` | |
| `roleIds[]` | The first entry is the main role |
| `status` | `'active'` or `'inactive'`. Inactive staff are not suggested for new asks. |
| `availability` | `{ Mon: [{ start, end }], … Sun }` in decimal hours. `9.5` is 9:30 AM and `24` is midnight. An empty day means unavailable. |
| `availabilityStatus` | `'confirmed'` or `'pending'`. While pending, the planner treats the person as open. |
| `preferredHours` | Free text, e.g. `20–30/week`. The planner parses the last number as the weekly maximum. |
| `skills[]`, `notes` | |

Examples:

- "Tuesday, available after 4 PM" is stored as `Tue: [{ start: 16, end: 24 }]`.
- "Monday, unavailable" is stored as `Mon: []`.

Each day can hold several windows. The editor currently edits the first window only.

## Vendor

| Field | Notes |
|---|---|
| `id`, `venueId` | |
| `name`, `contactName`, `categoryId` | |
| `phone`, `email`, `website` | |
| `description`, `notes` | |
| `status` | `'active'` or `'inactive'` |

## VendorBooking

`{ id, vendorId, eventId, status, tone }`. This record is where future fields belong, such as requirements, arrival time and linked tasks.

## Deleting records

A staff member or vendor can only be deleted when nothing points at it yet: no planner requests for staff, and no bookings for vendors. Otherwise the manager marks the record inactive, so its history stays intact.

## Routes

Detail and edit pages take the id from a query string, e.g. `/staff/profile?id=…` or `/vendors/edit?id=…`. The static export can only pre-build pages for ids it knows at build time, so this is what lets records created in the browser open too.

Build links with `staffHref`, `staffEditHref`, `vendorHref` and `vendorEditHref`, never by hand.

## Not built yet

- Assigning staff to tasks, or vendors to tasks and vendor requirements.
- Adding or editing vendor bookings from the UI.
- Editing more than one availability window per day.
- Making the Dashboard, staff phone and Account page read the venue name and manager from the directory. They still read `lib/mock/events.js`.
