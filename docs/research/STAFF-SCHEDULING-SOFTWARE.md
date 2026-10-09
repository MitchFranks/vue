# Staff Scheduling Software: Research for Vue

Date: 2026-10-08. Purpose: copy proven patterns for Vue's event staffing (events split into timeline blocks, N people per role per block, weekly availability, assign, handle declines/gaps, conflicts, publish, accept/decline).

Source-quality legend:
- READ = page fetched via WebFetch; content was run through a summarizing model, so wording is paraphrase, not verbatim vendor text (quoted fragments are as returned).
- SEARCH = only a search-result summary seen; unverified.
- FAILED = fetch returned 403/404; claims not made from it.

## 1. Tools chosen (and why)

| Tool | Why relevant | Evidence quality |
|---|---|---|
| Planning Center Services | Closest model to "event + required positions + people + accept/decline". Per-plan "Needed Positions", conflict badges, matrix view | Good (several READ pages) |
| Event Staff App (+ Tripleseat integration) | Built for venues/event companies; staffing is per event with call times | Medium (READ, thin pages) |
| When I Work | Best-documented generic flow: schedule, OpenShifts, conflicts, publish and notify, swap/drop | Good (READ) |
| Deputy | Shift recommendation factors, overlap and unavailability warnings, shift statuses | Mostly SEARCH (help pages 403) |
| Sling | Conflicts view, shift acceptance (accept/deny after publish), swap/offer vocabulary | Good (READ) |
| Shiftboard (via Astalty doc as proxy) | Broadcast/express interest/approve/publish flow; markets to events | Weak (Shiftboard pages redirect; flow read from third-party Astalty docs) |

Not chosen / not verified: 7shifts (restaurant-specific, forecasting/POS oriented), Homebase (generic small-business), Connecteam (all-in-one deskless app), Planday (not researched). Only a comparison search was done; I did not read their help centers. Treat any claims about them as unverified. Other event tools seen in search but not read: Parim, Liveforce, WorkStaff, Planning Pod and Tripleseat (event management; Tripleseat delegates staffing to Event Staff App).

## 2. Per-tool findings

### Planning Center Services (volunteer/team scheduling)
Terminology (READ, https://help.planningcenter.com/en/138435-introduction-for-schedulers.html): Teams (groups), Positions (roles within teams), Plans (an individual service/event), Needed Positions ("you know how many people you want in each position, start by adding those numbers"), Scheduling Email, Blockouts, auto-scheduler, rotation templates.
Workflow order (READ): build teams and positions; ask members to set preferences and block out dates; open a Plan; schedule via individual add, imported template, Needed Positions, or auto-scheduler; send scheduling requests by email or the Matrix tool; monitor via notifications.
Templates (READ, https://help.planningcenter.com/en/142876-set-up-scheduling-templates.html): reusable sets of "Needed Positions" (e.g. 2 guitarists, 1 sound tech), optionally with named people, importable into many plans. Good fit for "wedding standard staffing".
Conflict badges (SEARCH only, https://help.planningcenter.com/en/scheduling-conflicts-and-blockouts.html; the fetch 404'd): in the plan's Teams tab, green circle = preferred, orange circle = not preferred, yellow square = conflict, red square = blockout or already declined another position for that time. Conflicts can still be scheduled; hover for detail. Blockout requests recommended to reduce declines.
Team member side (READ, https://help.planningcenter.com/en/142874-manage-your-schedule.html): My Schedule page; statuses Pending, Confirmed, Blockouts; accept/decline per position (check mark / red X) or "Accept all"/"Decline all"; "Block Out Dates" button; optional replacement: a decliner can pick a replacement who is auto-confirmed (disabled if all conflict).
Other URLs seen only via SEARCH: https://help.planningcenter.com/en/schedule-your-teams.html, https://help.planningcenter.com/en/use-the-matrix-to-schedule.html (both 404 on fetch; Matrix screen layout NOT verified). Search summary said you can drag a person to another plan and a notification is prepared.

### Event Staff App (venue/event specific)
READ: https://eventstaffapp.com/help/staffing/overview, .../creating-work-shifts/, .../staff-availability/, .../sending-work-shifts/ (index at https://www.eventstaffapp.com/help/).
- Each event has its own Staffing page (View Events > Actions > Staffing) with two tabs: Scheduled Staff and Availability.
- Event has Call Times (e.g. arrival times); shifts can attach to a call time or stand alone.
- Order: check staff availability, create work shifts, schedule staff, send work shifts, reference confirmations, monitor time tracking/clock-in, manage cancellations.
- Availability requests: Individual or Group (all staff for a position); staff reply Yes/No via a text/email link; manager sees responses in Availability tab and clicks green "+ Add Shift" for those they want. "When you create a work shift for a staff member, you are indicating that you are selecting and scheduling them to work."
- Sending: blue "Send Shifts" button, or Daily Digest auto-send; "Notified" column shows sent or "Queued to Send".
- Pages did not document conflict warnings or statuses (not stated; do not assume).
- Tripleseat integration (READ, https://tripleseat.com/partners/event-staff-app/): booked event and client data syncs to Event Staff App for staffing, day-of and payroll.

### When I Work
READ unless noted.
- Open shifts (https://help.wheniwork.com/articles/how-openshifts-work/): schedule OpenShifts, publish, eligible employees notified, first to accept gets it, or optional pickup approval ("Shift Bidding") where manager selects. Eligible = holds position tag, no conflicting published shift, no approved time off, not hidden.
- Publishing (https://help.wheniwork.com/articles/publishing-openshifts/): "Publish & Notify" button top-left of Scheduler publishes everything in the visible day/week/month; OpenShift row can publish alone; OpenShifts can be offered to specific users. Advice: publish in bulk to minimize notifications.
- Conflicts (https://help.wheniwork.com/articles/identifying-scheduling-conflicts/): shift conflict (overlap with existing shift, or breaks scheduling rule) and availability conflict (overlaps Unavailability Preference or approved time off). Banner on assignment screen. Override behavior not documented in that page.
- Availability display (https://help.wheniwork.com/articles/interpreting-availability-on-the-schedule-computer/): green = preferred, grey = unavailable, striped = pending time off, red flag in shift corner = conflict; shifts rated "Highly Preferred"/"Preferred".
- Coverage (https://help.wheniwork.com/articles/giving-your-team-schedule-flexibility/): Shift Release (to OpenShift), Shift Drop (to eligible coworker), Shift Swap; manager approval by default; manager "find replacement" notifies eligible users, first to pick up wins.
- Auto-assign and Scheduling Rules pages seen in SEARCH only.

### Deputy
Help pages returned 403 (FAILED): creating shifts, shift status, open shifts. Everything below is SEARCH summary only (unverified detail): https://help.deputy.com/hc/en-au/articles/4688731978639-Creating-shifts-on-your-schedule, .../6054132302991-Shift-status, .../4688698300687-Managing-Open-shifts, .../4688700112015-Ensure-a-team-member-is-recommended-for-a-shift.
- Shift pop-up: who, start/finish, area, break, notes; Save then Publish.
- Recommendation based on five factors: fatigue, training, availability/leave, location permission, conflicting shift. "Overlapping" warning shown in the picker, including other locations; unavailable people can be scheduled via "Schedule anyway".
- Colors: white = unpublished, green = published; with a warning icon if manager overrode a "not recommended".
- Make shift Open and invite recommended people to claim; swaps approved by manager from mobile.

### Sling
READ.
- Conflicts (https://support.getsling.com/en/articles/1821074-conflicts): filter showing people already scheduled elsewhere (other position/location) as grey shifts; day and week views only.
- Shift acceptance (https://support.getsling.com/en/articles/4319967-shift-acceptance): Business plan feature. On publish, employee prompted to accept or deny. Status marks: [?] pending, [!] denied (still assigned until manager reassigns), confirmed when accepted. Denial requires a reason; responses are final; editing a shift re-notifies; manager can reassign, offer, or make available.
- Vocabulary (https://support.getsling.com/en/articles/12824084-available-shifts-shift-swaps-and-shift-offers): Available Shifts, Shift Swap (mutual), Shift Offer (to specific coworker); manager approval before or after; originator stays liable until finalized.
- SEARCH only: publish specific shifts, auto-assign.

### Shiftboard
Shiftboard URLs redirect to UKG (not followed). Event page claims (SEARCH only): assign, self-schedule, or hybrid for events. Flow read from a third-party doc (READ, https://docs.astalty.com.au/guide/scheduling/shift-board-workflow, which is a different product's "Shift Board", so use only as a generic pattern): create unassigned shift, broadcast, worker expresses interest, "Awaiting Approval", approve, publish ("Approval alone does not finalise the shift").

## 3. Synthesis

### Common workflow (in order)
1. Define people, roles/positions (tags/qualifications), teams or locations.
2. Collect availability: recurring weekly availability/preferences plus time-off or blockout requests (approved by manager in some tools).
3. Define the work: event/plan/shift with date, time, role; either a template of needed positions (PCO) or call times (Event Staff App).
4. Assign people to slots, or leave slots as open shifts; picker shows availability, preference, and conflict badges.
5. Resolve conflicts/warnings (overlap, unavailability, time off, rule breach); warnings are soft, manager can override.
6. Publish / send: drafts are invisible to staff until published; one action notifies everyone affected.
7. Staff respond: accept/confirm or decline (reason required in Sling); statuses pending/confirmed/declined.
8. Handle gaps: declined or unfilled slots become open shifts; broadcast or offer to eligible people; first-come or bid-then-approve; manager "find replacement".
9. Ongoing changes: swap, drop/release, offer, cover; manager approval; edits to published shifts re-notify.
10. Day-of and after: clock-in, time tracking, cancellations, payroll (Event Staff App, Deputy, When I Work; out of Vue's scope).

### Common screens
- Schedule grid (day/week/month; rows = people or positions, columns = days) with draft vs published styling and per-shift conflict flag. When I Work, Sling, Deputy.
- Per-event/plan staffing page with required positions and who fills them (PCO plan Teams tab; Event Staff App Staffing page with Scheduled Staff and Availability tabs).
- Assignee picker: people list with availability, preference, conflict/overlap badges, "assign anyway".
- Open shifts row/list and approval queue (requests awaiting approval).
- Availability and time-off screens (staff set; manager reviews).
- Staff "My Schedule": Pending / Confirmed / Blockouts, accept/decline, swap or drop.
- Notifications/Publish bar ("Publish & Notify", "Send Shifts").
- Matrix (PCO): people by plans overview. Layout unverified.

### Standard terminology
Open shift / OpenShift / Available shift; publish (and notify); unpublished (draft); shift offer; swap; drop/release; cover/find replacement; time off; unavailability / availability / preferences / blockout; conflict (overlap, availability, rule); eligible / qualified (position tag); pending / confirmed / declined (denied); needed positions; call time; shift bidding / pickup approval; broadcast; template.

### Fit for event/venue staffing
- Best model for "N people per role per timeline block": Planning Center's Needed Positions (count per role per plan) plus reusable templates, extended by Vue with a block dimension. Generic shift tools model individual shifts, so a block with N servers would be N open shifts (When I Work/Sling OpenShift pattern); Vue can treat each unfilled slot as one open shift.
- Event Staff App shows the per-event page with availability requests (Yes/No per event) alongside weekly availability; Vue could ask availability per event too.
- Copy the conflict model: soft warnings with distinct kinds (double-booked overlap, outside weekly availability, time off/blockout, declined elsewhere), color or icon badges in the picker, override allowed.
- Copy the publish model: assign freely in draft, one Publish & Notify per event/week, then staff accept/decline; denied stays assigned until manager reassigns (Sling) so gaps are visible, then offered as open shifts to eligible (role + available + no conflict) people.
- Skip for a prototype: forecasting, labor cost, POS, payroll, labor compliance.

## 4. Caveats
- Deputy and Event Staff App detail on conflicts/statuses is thin; Deputy pages were 403 (search summaries only).
- Planning Center `schedule-your-teams`, `use-the-matrix-to-schedule`, and `scheduling-conflicts-and-blockouts` pages did not fetch (404); conflict badge colors come from a search summary.
- Shiftboard official pages redirected to UKG; its flow here is from a different vendor's doc.
- 7shifts, Homebase, Connecteam, Planday help centers were not read.
- Fetch results are model-summarized, so exact UI labels may differ slightly from vendors' screens.
