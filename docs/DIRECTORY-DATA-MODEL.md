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

The staff and vendor forms can also add a new entry on the spot:

- The role and category dropdowns end with "Other: add a new …", which opens a text box (`OptionSelect`).
- On save, `ensureOption` creates the entry, or reuses an existing one with the same name (ignoring case).

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

## Assigning work (tasks, shifts, requirements)

Work points at whoever does it with an **assignee reference**, `{ type: 'staff' | 'vendor', id }`. A task stores these as `staffIds` / `vendorIds`, matching the `vendorIds` in the Tasks work on `danny-tasks`. Helpers in `model.js`:

- `assigneeOptions(directory)`: everyone a task can be given to (active staff and vendors), for a picker.
- `resolveAssignee(directory, ref)`: what a task row shows (label, profile link, inactive flag), or `null` if the record was deleted.
- `tasksNaming(tasks, type, id)`: tasks that name a person or vendor. The profiles use it to block deleting them.

When Tasks merges, its vendor picker should read vendors from the directory (`useDirectory().vendors`), not `lib/mock/records.js`. Otherwise vendors created in the app won't appear in it.

## Deleting records

A staff member or vendor can only be deleted when nothing points at it yet: no planner requests or tasks for staff, and no bookings or tasks for vendors. Otherwise the manager marks the record inactive, so its history stays intact.

## Routes

Detail and edit pages take the id from a query string, e.g. `/staff/profile?id=…` or `/vendors/edit?id=…`. The static export can only pre-build pages for ids it knows at build time, so this is what lets records created in the browser open too.

Build links with `staffHref`, `staffEditHref`, `vendorHref` and `vendorEditHref`, never by hand.

## Accounts and workspaces

All account logic is in `lib/account/session.js`.

- **Demo account:** username `demo`, password `demo`. It opens the sample venue (Willow Stone).
- **Create account** (`/signup`): creates an administrator account with the venue name, the person's name and role, an email and a password. Their workspace starts empty except for that person, who becomes the first staff member (Venue Manager) and the venue's primary contact.
- **Sign-in gate:** every screen in `app/(app)` requires sign-in (`components/account/RequireAccount.jsx`). Signed-out visitors are sent to `/login?next=…` and return to that page afterwards. The guided tour signs a signed-out visitor in to the demo.
- **Separate data:** each workspace's data is saved under its own keys (`scopedKey(base)` gives `base::<accountId>`). The demo keeps the original keys, so earlier demo progress still loads.
- **Empty start:** `lib/mock/scope.js` empties every sample list when a real account is signed in.
- **Reset:** "Reset prototype data" in the demo restores the samples. "Reset workspace data" in a real account empties the workspace and keeps the account.
- **Delete account** (Account page): removes the account and all of its data.

**Limitation:** the site is static and has no server. Accounts are stored in the browser's localStorage, and passwords are kept only as salted PBKDF2-SHA-256 hashes. An account exists only in the browser where it was created. Moving to a hosted service (e.g. Supabase or Firebase Auth plus a database) means replacing the functions in `session.js` and the stores' load/save calls, not the screens.

## Not built yet

- Assigning staff to tasks, or vendors to tasks and vendor requirements.
- Adding or editing vendor bookings from the UI.
- Editing more than one availability window per day.
- A hosted backend, so accounts and data work across devices, and inviting other users (staff logins, roles and permissions).
- Real-time dates in real accounts. "Today" is still the prototype's fixed date, Oct 10, 2026.
- Creating events in a real account (the New event screen is still a mockup).
