# Event detail sheet

Step 1 of the post-survey plan: a live event detail sheet with change capture. It is one record of everything staff work from on the day. Every change to it is logged, sent to the staff working the event, and tracked until each of them has seen it.

## Why

The survey had seven respondents, all staff, and likely all from one venue.

- **Looking things up:** 7 of 7 repeatedly look up event details or client information, such as the detail sheet, the agenda, the cake-cutting time or the client file.
- **Lost information:** 6 of 7 say information gets lost or misunderstood, and 5 of 7 call it their biggest problem.
- **Current tools:** today it all lives on paper, in memory and in conversations in passing.
- **The story that sums it up:** the cake cutting moved up an hour, and nobody told the staff serving it.

Every venue already has a paper detail sheet. This replaces it with a shared one that updates, and that shows the manager who still hasn't seen a change.

## Where things are

| | |
|---|---|
| Manager's sheet | Event → **Detail sheet** tab, `/events/<id>/sheet`. `app/(app)/events/[id]/sheet/page.jsx` |
| Staff member's day-of page | `/day-of?e=<eventId>&s=<staffId>`. It is public with no sign-in, like the inquiry form. `app/day-of/page.jsx`, `components/sheet/DayOfSheet.jsx` |
| Read-only sheet (shared) | `components/sheet/SheetView.jsx` |
| Change log and reach | `components/sheet/ChangeLog.jsx` |
| Editors | `components/sheet/SheetEditors.jsx` |
| Fields, diffs, seed data | `lib/eventSheet.js` |
| State | `lib/eventSheetStore.jsx` (`EventSheetProvider`, `useEventSheet`), saved per workspace under `vue-event-sheet-v1` |

## What the sheet holds

- **Essentials (read-only).** The date, couple, guests and spaces come from the event and the Staffing Planner. Service and bar style come from the planner as well.
- **Run of show.** These are the same rows as the Run of show tab, so there is still only one list. On the sheet, **Edit times** changes times and names quickly. A staffed block keeps its length when it moves. Adding, removing or staffing an item stays on the Run of show tab.
- **Day-of contact:** name, who they are, and phone.
- **Guests:** dietary needs and allergies, and accessibility needs.
- **Food and bar:** menu and service, and bar.
- **Setup and layout:** ceremony, reception, and rain plan.
- **Outside vendors.** The vendors the venue booked are listed first, from the directory. Below them is free text for vendors the couple is bringing.
- **Notes for staff.**

Five fields are **key details**: day-of contact name and phone, dietary needs, menu, and reception layout. Any that are empty show at the top as "N of 5 key details still missing". Each one is a button that opens its section, so the sheet doubles as the checklist of what to chase.

## Change capture

Every save is diffed (`diffSheet`, `diffRun`) and logged as an entry:

```
{ id, eventId, at, by: { name, kind: 'venue' | 'couple' | 'staff' }, area,
  changes: [{ key, label, from, to }], reason, notify, team: [staffId], seenBy: { staffId: at }, remindedAt? }
```

- **Run of show tab edits are logged too.** Edits on the Run of show tab (drag, resize, add, delete, editor) go through the same log. Undo on the toast takes back both the edit and its log entry.
- **Edits fold together.** Consecutive edits by the same person to the same area merge into one entry while nobody has opened it (`mergeChanges`). Dragging a block three times sends one change, and a change moved back to where it started disappears.
- **Sending is optional.** "Send this change to the N staff working this event" is ticked by default. Untick it for a typo fix: the change is still logged, but nobody is texted.
- **Why it changed.** An optional reason travels with the change, for example "Emily called: their photographer has to leave at 8:00 PM."
- **Times use the planner's clock.** Times come from the Staffing Planner's simulated clock, so the sheet and the planner agree.

## Reaching the staff

The **team** is everyone confirmed (accepted) on the event in the Staffing Planner at the moment of the change, not counting the manager.

- **Manager's view.** Each entry in the Changes panel shows "Seen by 2 of 5 · Not yet: Caleb, Priya and Nina", a **Remind** button, and, in the prototype, links to open the change as each person.
- **Staff view.** The day-of page opens on "N changes since you last looked": what each item was, what it is now, and why. One **Got it** button marks them all seen. The sheet below keeps the changes highlighted.
- **Highlighting.** Anything changed and not yet seen by everyone is tinted on the sheet, with "Changed · was …" or "Moved from 8:30 PM to 7:30 PM".
- **Tasks.** A change some of the staff haven't seen is a task of type **Event change**, for example "3 of 5 staff haven't seen: Cake cutting: 8:30 PM → 7:30 PM". It is urgent the day before and the day of the event. When everyone has seen it, the task moves to completed.
- **The rest of the event screens.** The event's **Detail sheet** tab counts unseen changes. The **Activity log** lists every change first.

## Requests from the couple

The client portal's **Your day** screen (`/portal?c=<coupleId>&view=day`, the "Your day" card on the portal home) is where the venue captures the couple's expectations for the run of show.

- **What the couple sees.** The day's moments (staffing blocks such as setup shifts are left out). Each has **Ask for a change**: a different time, take it out, or something else. **Add something to your day** asks for a new item.
- **Every request says what they expect.** "What do you expect?" is required, so the venue hears the why, not just the what.
- **On the venue's side.** Waiting requests are a **Client portal** task and sit at the top of the Detail sheet under **Requests from the couple**, with **Accept** and **Decline**.
  - **Accept** applies a move, removal or addition to the run of show. It is logged as a change by the couple, with their note as the reason, so it reaches the staff like any other change. "Something else" is accepted as a promise; the venue makes it by hand.
  - **Decline** needs a short reply.
- **Back in the portal.** The answer shows under the item: Waiting for the venue, Accepted, or Not possible with the reply. A waiting request can be taken back.
- **State.** `requests` in `lib/eventSheetStore.jsx` (`submitRequest`, `withdrawRequest`, `acceptRequest`, `declineRequest`); wording and `applyRequest` in `lib/eventSheet.js`.
- **Sample data.** Emily Johnson has asked to add a grandparents' anniversary dance at 6:45 PM, waiting for an answer.

## Sample data

- **One set of facts.** The Johnson Wedding's sheet and its client-portal record agree on every shared field: planner Rachel Adeyemi, the shellfish allergy at table 9, the grandmother's wheelchair, Juniper Photo Co. (leaves at 8:00 PM) and the sparkler send-off. The portal's key moments match the run of show: grand entrance 5:15 PM, first dance 5:45 PM, cake cutting 7:30 PM, send-off 10:45 PM.
- **The cake cutting.** Emily moved it from 8:30 PM to 7:30 PM in the portal on Oct 9 (the portal record shows the change, already read). The manager put it on the sheet: Theo and Marisol have seen it; Caleb, Priya and Nina haven't. A menu change has been seen by everyone.
- **Missing details.** The Shah–Patel Rehearsal Dinner is missing two key details: the day-of contact's phone and dietary needs.
- **Saved data resets once.** The storage keys moved (`vue-run-of-show-v4`, `vue-event-sheet-v3`, `vue-lowfi-prototype-v11`) so testers start from the aligned data.

## How it connects to the client portal (step 2)

The client portal (branch `client-portal`) collects the couple's details and logs their changes. Its field ids match this sheet's (`dayOfName`, `dayOfRole`, `dayOfPhone`, `dietary`, `accessibility`, `outsideVendors`, `notes`).

When both are merged:

1. A couple's portal save should call `saveFields(eventId, area, values, { by: { name, kind: 'couple' } })`, so the change lands on the sheet and reaches the staff.
2. The portal's key moments (grand entrance, first dance, cake cutting, send-off) should become run-of-show rows, logged with `logRun`. That way they are not a second copy of the same times.

## Prototype limits

- **No real texts.** Nobody is texted. Staff "receive" a change by opening their day-of page, which uses the staff id in the link. A real build would send each person a private, unguessable link.
- **One browser only.** Everything is saved in this browser. The manager's tab and a day-of tab in the same browser update each other live.
- **No staff accounts.** Staff can't edit the sheet; `by.kind: 'staff'` is reserved for that.
- **Changes are a log, not an undo history.** Past versions are read from the log, not restored from it.

## Open questions for the next interviews

The survey had no owners or managers. These questions are for them:

- Who keeps the sheet current? The survey's complaint is about the manager not passing changes on.
- Do staff have phones on them during shifts, and would they open a link from a text?
- Is "seen by" enough, or does a change need a named person to act on it (the kitchen for an allergy, the captain for a time)?
