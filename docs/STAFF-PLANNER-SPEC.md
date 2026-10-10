# Staff Planner: spec

Replaces the five-stage staffing workflow (Availability, Weekly schedule, Open positions, Staffing planner, Publish) with one feature, **Staff Planner**, opened from the existing sidebar item (label stays "Staffing Planner"). Patterns come from [`research/STAFF-SCHEDULING-SOFTWARE.md`](./research/STAFF-SCHEDULING-SOFTWARE.md). Its caveats apply: Planning Center conflict-badge colours and the Matrix layout are unverified, Deputy detail is search-only, and Shiftboard's flow comes from a third party. Where a pattern rests on weak evidence, it is marked (weak).

Vue words: couple, timeline block, open position, assignment ("shift" only in copy aimed at staff), Up Next. Shortages read "Needs 1 more".

---

## A. Workflow

The manager works per event, which is how Planning Center (plan) and Event Staff App (event Staffing page) do it. The generic tools (When I Work, Sling, Deputy) work per week; Vue keeps a week view only as an entry point.

| # | Manager step | Vue term | Research step | Borrowed from |
|---|---|---|---|---|
| 1 | Pick the event that needs people | Event, Week overview | 3 Define the work | Planning Center "open a Plan" |
| 2 | See what each timeline block requires | Staffing requirement (role + count per block) | 3 | Planning Center "Needed Positions" (count per role), extended by Vue's block dimension |
| 3 | Pick a slot and see who can work | Assign panel, availability | 2, 4 | Event Staff App per-event availability; When I Work availability colours |
| 4 | Assign, or override a warning | Assignment (status Not sent) | 4, 5 | Planning Center conflict badges with "schedule anyway" (conflicts do not block); Deputy "Schedule anyway" (weak) |
| 5 | Leave a slot empty, or offer it | Open position, Offer | 8 | When I Work OpenShifts; Shiftboard broadcast and interest (weak) |
| 6 | Review and send | Publish and notify | 6 | When I Work "Publish & Notify"; Event Staff App "Send Shifts" |
| 7 | Staff accept or decline | Accepted / Pending / Declined | 7 | Planning Center My Schedule (accept, decline); Sling (reason required on decline) |
| 8 | Fix gaps, swap, cover | Replace, Offer, open position | 8, 9 | Sling (a denied assignment stays visible until reassigned); When I Work "find replacement" |

Out of Vue's scope: clock-in, payroll, forecasting (research step 10).

---

## B. Screenflow

Four screens. Every screen carries the same pill tab bar (`Tabs`, each tab its own URL), so the user can jump from any screen to any other at any time. The **Event board** tab opens the last event viewed, or the next event that needs people.

```
 Tab bar on every screen:  [ Week ] [ Event board ] [ Team availability ] [ Staff replies ]
                                |          ^   ^            |                   |
   Up Next "Fill position" -----+----------|---|------------|-------------------|--> deep link
   (/staffing/<eventId>?block=&role=)      |   |            |                   |
                                           |   +-- Assign panel (drawer)         |
  1 Week --click event row---------------->|   +-- Publish dialog (modal)        |
  3 Team --click an assignment-----------> | (opens board on that block)         |
  4 Replies --click a decline/offer------> | (opens board with panel on that slot)
```

### 1. Week (`/staffing`)
- Replaces Weekly schedule and the Open positions list. It answers "which events need people?"
- Week selector (prev, next, "This week"). One card per event in view: name, couple, date, `Fully staffed` or `Needs N more` badge, `Draft: N changes not sent` or `Published`, and a thin per-block coverage strip.
- Under each event, a compact list of its open positions ("Ceremony: Event Staff, needs 1 more"). Each is a link to the Event board with the panel open.
- Actions: **Open board** per event, a per-week **Publish all drafts** that opens the Publish dialog for several events (When I Work: publish everything in view), and a quick filter chip "Needs people".

### 2. Event board (`/staffing/<eventId>`), the primary screen
Header: event picker (select), date and couple, staffing badge, **Publish and notify** (the single filled violet button), and `Copy staffing from another event` (Planning Center templates; used when blocks have no assignments yet).

Body: **one row per timeline block** (Setup 9:00 AM to 3:00 PM, Ceremony, Reception, Teardown), with the block's time and `kind`. Inside a row, one group per required role with `count` **slots**:

| Slot state | Look (icon plus word, never colour alone) | Counts as covered? |
|---|---|---|
| Open | Dashed pill "Open: Event Staff" with `+` | No (this is the open position) |
| Not sent | Soft-outline chip, avatar, "Not sent" | No |
| Pending | Violet chip, "Pending" | No (existing rule) |
| Accepted | Mint chip, check, "Accepted" | Yes |
| Declined | Coral chip, struck name, "Declined", reason in tooltip; the slot beside it shows as Open | No |
| Overridden | Any chip plus a warning mark and "Assigned despite: <warning>" tooltip | Per its status |

Row footer: "Needs N more" or "Fully staffed" per role. The existing `urgent`/`warn` event tone still sets emphasis.

**Clicking an Open slot (or a Declined chip's "Replace") opens the Assign panel**, a right-hand drawer (bottom sheet on phones). Clicking an existing chip opens a small menu: *Mark accepted* and *Mark declined* (reason field; this simulates the staff reply in the prototype), *Replace*, *Remove*.

**Assign panel** (Planning Center picker, with When I Work/Deputy warnings):
- Title "Ceremony: Event Staff, 3:00 to 5:00 PM", plus "1 of 2 accepted".
- People with the matching role, eligible first. Toggle **Show other roles** lists everyone; a different-role person gets the warning "Usually works as Server". Each row shows `Avatar`, name, preferred hours and badges:
  - Available (mint). Weekly window covers the block.
  - Outside availability (sunshine). "Free 4:00 to 9:00 PM only".
  - Double-booked (sunshine). "Reception at Taylor Wedding, 5:30 to 9:30 PM" (overlap on the same `dateKey`).
  - Declined this before (coral). The person declined this block.
  - Already on this block (disabled).
- Button is **Assign** when clean, secondary **Assign anyway** when there is any warning. Assign-anyway shows an inline note naming the warning and saves `overridden: true`. Warnings never block (Planning Center, Deputy, research step 5).
- **Offer to everyone eligible** (When I Work OpenShift; Shiftboard broadcast, weak). It creates an Offer for the position, listing the eligible people, and leaves the slot open until someone claims it.

**Publish dialog** (modal, not a screen): lists who will be notified, by name and shift ("Jake, Ceremony 3:00 to 5:00 PM"), split into new, changed and unchanged. If open positions remain it shows `Alert`: "Ceremony still needs 1 more. You can publish anyway." Confirm button: "Publish and notify N people". On confirm, every Not sent assignment becomes Pending. Editing an assignment after publishing returns it to Not sent and re-notifies on the next publish (Sling).

### 3. Team availability (`/staffing/team`)
- Replaces the Availability stage. Week grid: rows are staff (grouped by role), columns Mon to Sun, cells show the weekly window (green when free, grey when unavailable, per When I Work). Assigned blocks that week are drawn on top as small chips, with a conflict flag when an assignment sits outside the window.
- Read and edit: **Edit window** reuses the existing availability editor. Clicking a chip goes to the Event board on that block.
- Per-event "ask availability" (Event Staff App) is out of scope; see D.

### 4. Staff replies (`/staffing/replies`)
- Replaces the assignment detail and staffing request pages. Three sections:
  1. **Declined** (needs action): "Jake declined the Ceremony assignment: class until 4:00 PM". Buttons: **Replace** (to the board, panel open), **Offer to eligible staff**.
  2. **Waiting for a reply**: Pending assignments, with **Mark accepted** and **Mark declined** (simulates the staff phone; decline requires a reason).
  3. **Open offers**: each Offer with who it went to. **Simulate claim** by one person turns it into an accepted assignment and closes the open position. When I Work has an optional manager-approval step; Vue skips it (weak, see D).
- Preview toggle "Show as staff" is a stretch goal, not required.

### What happens to each old thing
| Old | New |
|---|---|
| Open position (derived list and detail page) | Still derived. It is the dashed Open slot on the board, the line on the Week screen, and the Up Next item. "Find replacement" now opens the board with the panel on that slot. |
| Decline | Chip stays on the slot as Declined until replaced or removed (Sling). The slot reads as open. Appears under Declined on Staff replies and in Up Next. |
| Replacement | The Assign panel on the declined slot (When I Work "find replacement"). |
| Staffing request (`reqId`) | Becomes a stored **Offer** (see C). The Staff Request page is removed. |
| Availability view | Team availability tab (screen 3). |
| Weekly schedule view | Week tab (screen 1). |
| Planner "smart suggestions" | Replaced by the sorted candidate list in the panel. |
| Publish stage | Publish dialog plus per-event "Draft" badges. |

---

## C. State and data changes

Keep the model: Event, Timeline block, Staffing requirement, Staff, Assignment. Counting rule stays (only `accepted` counts).

**Justified additions**
1. Assignment `status` gains **`draft`** (shown "Not sent"). Needed so assigning does not auto-confirm and so Publish means something. Seed assignments stay `accepted`/`pending`/`declined`. `assignStaff` now creates `draft`.
2. Assignment gains **`overridden`** (boolean, optional) and **`warning`** (string, optional) so overridden conflicts stay visible.
3. State gains **`offers`**: `{ [positionId]: { staffIds: string[] } }` so "nothing remembers who was asked" (Data dictionary ambiguity 1) is fixed. The position is still derived; the offer is the only new record.

**Store mapping**

| Need | Function | Change |
|---|---|---|
| Assign | `assignStaff(blockId, staffId, role, { overridden, warning })` | Creates `draft`, stores override |
| Accept, decline | `setAssignmentStatus(id, status, reason)` | Reuse; also drop any matching offer when accepted |
| Remove, replace | `removeAssignment(id)` | Reuse; replace = remove plus assign |
| Publish | `publishSchedule(eventId)` | Also converts that event's `draft` to `pending`; keep `publishedEventIds` as "has been published at least once". "N changes not sent" is derived from drafts |
| Open positions | `openPositions` | Reuse unchanged; treats `draft` and `pending` as not covered |
| Candidates | `replacementsForPosition` | Rename to `candidatesForSlot(block, role, { allRoles })`. Return `warnings[]` of kinds `availability`, `overlap`, `declinedBefore`, `otherRole`, not just `eligible`. Reuse the existing `isAvailable` and overlap logic. |
| Offer | **new** `offerPosition(positionId, staffIds)`, **new** `claimOffer(positionId, staffId)` | `claimOffer` calls `assignStaff` with status `accepted` |
| Event badge | `coverageForEvent` | Reuse; add `draft` count |
| Up Next | `attention` | Keep the open-position item; change `href` to `/staffing/<eventId>?block=<blockId>&role=<role>`; add one "Publish N changes for <event>" item (`warn`) when drafts exist |

Seed data: no change to `lib/mock/events.js` or `staff.js` beyond switching a few seeds to `draft` so the Publish flow has something to show on first load. Bump the storage key to `vue-lowfi-prototype-v3`.

**Files**

| Action | Path |
|---|---|
| Delete | `app/(app)/staffing/availability/page.jsx`, `schedule/page.jsx`, `open-positions/` (page, `[positionId]`), `planner/page.jsx`, `publish/page.jsx`, `requests/[reqId]/`, `assignments/[assignmentId]/`, `components/StaffingStages.jsx` |
| Keep | `app/(app)/staffing/layout.jsx` (swap stage bar for the new tab bar), `lib/mock/*`, `components/ui/*` (add one drawer primitive if none exists) |
| Repurpose | Availability grid and editor code from the old Availability page into `staffing/team/page.jsx`; slot, `ListRow` and `StatusBadge` usage from the old open-position page into the panel |
| New | `staffing/page.jsx` (Week), `staffing/[eventId]/page.jsx` (with `generateStaticParams` over `events` for static export), `staffing/team/page.jsx`, `staffing/replies/page.jsx`, `components/StaffTabs.jsx`, `components/AssignPanel.jsx`, `components/PublishDialog.jsx` |
| Update links | `AppShell.jsx` (href `/staffing`, badge stays on open positions), `Landing.jsx`, `dashboard/page.jsx`, `staff/page.jsx`, `events/[id]/page.jsx`, `events/[id]/staffing/page.jsx` (keep as a read-only summary with "Open in Staff Planner"), `components/ui/domain.jsx` (assignment link goes to the board), `messages/[id]/page.jsx`, `style-guide/page.jsx` (remove the `StaffingStages` demo) |
| Docs | Update `DATA-DICTIONARY.md` (staffing rows, assignment status, offers) and `STYLE-GUIDE.md` (multi-page jobs now use `Tabs`) |

---

## D. Acceptance criteria and scope

**Acceptance (all checkable in the browser)**
1. The sidebar item "Staffing Planner" opens `/staffing`. No stage bar and no route under the old paths exists.
2. A tab bar with Week, Event board, Team availability and Staff replies appears on every screen; each tab reaches its screen from any other.
3. On the Event board, every timeline block is a row and each requirement shows `count` slots in the states listed in B.
4. Clicking an Open slot opens the Assign panel listing matching-role staff, eligible first, each with availability and conflict badges.
5. Assigning a person with a warning needs "Assign anyway" and leaves a warning mark on the chip. Assigning a clean person needs one click.
6. A new assignment is Not sent and does not reduce "Needs N more".
7. Publish and notify lists the people, warns about open positions but allows publishing, and turns Not sent into Pending. A toast confirms the count.
8. Marking Pending as Accepted reduces the shortage; marking it Declined (reason required) shows a Declined chip and an open slot, a Declined entry on Staff replies, and an Up Next item. Replacing clears all three.
9. Offering a position stores an Offer; "Simulate claim" fills the slot as Accepted and removes the open position.
10. The Up Next "Find replacement" link opens the board with the panel on the right slot.
11. Sidebar badge and Week screen counts match the derived open positions.
12. Reload keeps state; "Reset prototype" restores the seed. `next build` static export succeeds with `generateStaticParams`.
13. Copy uses couple, timeline block, open position, assignment ("shift" only in staff-facing text) and Up Next; every status has an icon and a word; one filled violet button per region.

**Deliberately out of scope**
- Time off and date-specific blockouts (the model has weekly availability only); per-event availability requests (Event Staff App).
- Staff-facing app, real notifications, auto-scheduling or recommendation scoring (Deputy, weak), fatigue and labour rules.
- Swap and drop between staff (When I Work, Sling); manager approval of claims. "Replace" covers the manager-driven case.
- Clock-in, time tracking, payroll, forecasting.
- Multi-role people, new roles, editing a block's requirements, saved staffing templates beyond "Copy staffing from another event".
- Writing to the Activity log (still static).
