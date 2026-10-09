# Staffing Planner 2, research C: pain points, scheduling UX, and a critique of Staff Planner 1

Researcher C of four. Compiled 2026-10-09. Scope: (1) what hurts managers and staff when scheduling, (2) what usability research and design systems say good scheduling UI looks like, (3) a blunt critique of the first Staff Planner (`docs/STAFF-PLANNER-SPEC.md` and the built screens).

**Evidence labels** (same convention as `WEDDING-PLATFORM-COMPLAINTS.md`):
- **[read]**: I fetched the page and got its text back. The fetch tool summarises, so quotes are as that tool relayed them.
- **[summary]**: I only saw a search-engine summary. Unverified.
- **[vendor]**: the author sells scheduling software. They have a reason to make the pain sound bad.
- **[blocked]**: the fetch failed (403, redirect, unreadable). Nothing from those pages is presented as read.

**Main caveat.** The richest review sources (Capterra, G2, GetApp, TrustRadius, Reddit, Deputy help) returned 403 or were refused, the same as in the first research round. Direct user voice comes from Trustpilot (When I Work, Homebase, 7shifts), app-review aggregator pages (Deputy, Shyft), one named customer case study (Eco Caters), one peer-reviewed usability study and one interview study. Most other "pain" evidence comes from vendor blogs. Frequency below therefore means "how many independent sources raise it", not how many users. No venue managers were interviewed. That is the biggest gap, and the next step should close it.

---

## Part 1: Pain points

### 1.1 The structural finding: event staffing is not shift scheduling

The most useful source for Vue was not a complaint but a framing. FirstHR [read] [vendor] argues that weekly shift tools assume "manager publishes, staff are expected", while event staffing is "manager invites, staff confirm or decline": *"a caterer staffing a Saturday wedding … ask[s] forty people whether they are free, wait[s], and find[s] out on Wednesday that six of the eight servers they wanted have other plans."* It lists the structural differences: part-time, on-call staff who work elsewhere too; a large roster with a small subset per event; bookings weeks out with changes days out; and the failure mode "an event is short-handed with no recovery time". It argues that the essential feature is **automatic waitlist backfill when someone declines**. Quickstaff is described the same way, "staff are invited to events and respond, rather than being assigned to shifts" [summary]. Eco Caters (Instawork case study [read] [vendor]) shows the same model in practice. Before: email everyone for the month's dates, copy replies into Excel, chase non-responders, and repeat for every cancellation. That took "at least 2 hours daily" and led them to hire an assistant. After: a text with an Accept/Decline link, with responses tracked automatically, at about 5 minutes.

A wedding venue sits between the two models. Its core team (venue manager, captain) is semi-fixed. Its servers, bartenders and grounds staff are part-time and weekend-only, and many have other jobs. **Pain points 1 to 4 below all come from treating an invite-and-confirm job as a fill-the-grid job.**

### 1.2 Ranked pain points

Frequency: **H** = 4 or more independent sources, **M** = 2 to 3, **L** = 1. Severity is for a wedding venue: **Critical** = the event can go short-staffed or the couple notices; **High** = hours of manager time or staff loss; **Med** = friction.

| # | Pain point | Who | Freq | Severity | Key evidence | Design response for Planner 2 |
|---|---|---|---|---|---|---|
| P1 | **Last-minute call-outs, declines and no-shows trigger a manual scramble.** "Every callout kicks off a frantic group-text scramble." Weddings cannot move and have "no recovery time". | Manager | H | Critical | Celayix [read][vendor]; FirstHR [read][vendor]; pebb/everhour/7shifts [summary][vendor]; Shyft reviews [read]: "less than 10 call-ins in the past year"; Eco Caters [read] | A **"Can't make it" path** on the staff side and a **one-tap "Ask backups"** for the manager. It goes to a ranked list of people free that day in that role, the first yes fills the slot, and the manager gets one notice. Show the slot as "Covering…" while the ask is live. Keep a per-event **backup list** (people who said "available" but were not picked). |
| P2 | **Not knowing who is actually confirmed.** Replies arrive by text, email and in person. Follow-up is manual. | Manager | H | Critical | Eco Caters 2 h/day [read]; FirstHR invite model [read]; turnozo [read][vendor]; Deputy "CONFIRMING" label [summary]; Parim "waiting for confirmation" status [read] | One unambiguous count per event and role: **"6 of 8 confirmed · 2 waiting (asked 2 days ago)"**. Show the time since asked and send **automatic reminders** to non-responders. Set a **reply-by date** after which the position counts as open. |
| P3 | **Communication spread across group chats, SMS, email and paper.** Versions conflict, the schedule gets buried in chat, and there is no audit trail ("he said, she said"). | Both | H | High | pebb [summary][vendor]; turnozo [read][vendor]: six named failure modes; schedulingkit, liveforce [summary]; Deputy blog [read][vendor]: "8 in 10 American workers … frustrated due to poor communications" | **One link per person per event** that is always current (the "source of truth"). Event details staff need (call time, where to park, dress, contact) live there, not in chat. Keep a **change log** per event ("Jake declined Sat 3:12 PM, reason …"). |
| P4 | **Availability chaos.** Availability is re-collected for every event, is stale, and lives in texts ("marks themselves unavailable by text, but that update never makes it into the schedule"). | Manager | M | High | turnozo [read][vendor]; teamup, schedulingkit [summary]; FirstHR [read] | **Ask availability per date** ("Are you free Sat 19 Sep?", answered Yes / No / Maybe) before assigning, rather than relying only on weekly recurring windows. Add **date-specific time off**. Show answers in the picker. |
| P5 | **Notifications are unreliable or excessive.** Pushes stop arriving, "offensively persistent" prompts appear, and feeds cannot be silenced. Too many messages train staff to ignore the urgent ones. | Both | H | High (missed ask = P1) | 7shifts [summary]: notifications "unreliable, delayed, or overwhelming"; Homebase [summary]: pushes stop on one platform; Shyft [read]: "push notifications will work for a few days and then stop"; WIW Trustpilot [read]; Deputy app review [read]: "cannot silence"; RosterElf [read][vendor]; Aisle Planner C11 | **SMS link as the default channel**, needing no app install, plus email. **One message per person per event**, not one per block. Batch changes into a single "Your Saturday changed" message. Reserve urgent SMS for call-outs within about 48 h. Let the manager see what was sent and when. |
| P6 | **Changes after publishing.** Staff find shifts changed or cancelled with little notice. Managers have no way to tell exactly who is affected. Worker research ties instability to health and turnover. | Staff | M | High | Shift Project via news summaries [summary] (110,000 workers surveyed); Starbucks/Kronos worker, TechTarget [read]: "they just kind of blame it on the software"; Restaurant365 [read]: notify only affected people, deselect recipients | **Diff-style publish.** Show exactly what changes for whom: added, removed, time changed. **Removals must notify** the removed person. Changes inside about 72 h are flagged "short notice" and need a personal note. |
| P7 | **Mobile is a second-class citizen.** Managers "use laptops … to schedule"; mobile apps lack features the desktop has. | Both | H | Med (High on event day) | Deputy [summary]; Homebase [summary]; 7shifts [summary]; WIW "differences between mobile and desktop" [summary]; Vue backlog B-13 | Staff flows are **mobile-first and app-free**. Manager **day-of view** works at 375 px: who is here, who is late, call a person, ask backups. Desktop-only is acceptable for building the roster weeks out. |
| P8 | **Double-booking and overlap.** One person ends up on two events, or the manager's spreadsheet disagrees with the texts. | Manager | M | High | Catering summaries [summary]; turnozo [read]; Dubsado C27 | Warn on overlap across all events that day, including **adjacent events at the same venue** (two weddings on one Saturday is common). Warn, never block (keep v1's good rule). |
| P9 | **Labour-cost and overtime surprises.** Managers find out after payroll. | Manager | M | Med | Celayix [read][vendor]; overtime vendors [summary][vendor] | Show **hours per person for the week and the day** in the picker ("would be 11 h Saturday, 26 h this week"). Show an **estimated labour cost per event** if rates exist. A soft warning at a configurable daily/weekly threshold. Do not build payroll. |
| P10 | **Fairness and favouritism.** Staff perceive that the same people get the good shifts, and perceived bias drives leaving. | Staff | M | Med | arXiv 2001.09755 [read]: equality is the abstract norm, but conflicts are resolved by "negotiating the importance of individual needs", and transparency matters; Deputy blog [read][vendor]; Seattle report [summary] | Show **"events this month"** per person in the picker and sort ties by fewest events. Do not auto-allocate. Let people state a preference ("want more hours / fewer"). |
| P11 | **Onboarding staff onto yet another app.** Older or part-time staff do not install it. Device and privacy concerns. | Manager | M | High for part-time event staff | myshyft [summary][vendor]: SMS and web links "requiring no downloads" lead to near-full adoption; RosterElf [read][vendor]; SMS-link accept flows exist in foundU, ShiftMatch, Clairvia, Event Dispatch [summary] | **No staff login needed** to accept or decline. A signed link in an SMS or email opens a one-screen page: event, times, call time, **Accept / Can't do it**. An optional staff home page later. |
| P12 | **Tedious repetitive setup and no bulk actions.** "Does not allow you to choose multiple people with 1 click to offer a shift … 300+ individual names", and "copy and paste each day for each person". | Manager | M | Med | Deputy app review [read]; Deputy Capterra [summary] | **Multi-select in the picker** ("Ask these 5"). **Start from a standard crew** by event size. **Copy last similar wedding**, copying the requirements and suggesting the same people, not silently assigning them. |
| P13 | **No audit trail or accountability.** Nobody can tell who changed what. Disputes over whether someone was told. | Both | M | Med | WIW [summary]: "No auditing capability"; turnozo [read]; Deputy app review [read]: timesheets edited without consent | A per-event **activity line** for every ask, reply, change and message sent. Show "seen" when the link was opened. |
| P14 | **Imprecise drag-and-drop and buggy grids.** "Precision of the drag and drop feature is sometimes impossible to align with … 1PM." | Manager | L | Low | WIW [summary] | Do not make drag the primary input. Times come from timeline blocks and call times, not from dragging. |

**Praise patterns** (what to keep): ease of seeing your schedule on a phone and swapping (When I Work [summary], Shyft [read]: "just by one click of a button"); "game changer … before 7shifts we were using excel" (7shifts Trustpilot [read]); a drag-and-drop grid and templates (Homebase [summary]); instant notification of changes (Homebase [summary]); in the nurse open-shift study, "use of a particular function depended upon how effective the user perceived the function to be for the task" (WUSTL [read]). People will learn exactly as much UI as clearly pays off.

### 1.3 What this means for scope

The first planner treated P1, P2, P4 and P11 as out of scope or simulated them (Part 3). Those are the top-ranked pains. Planner 2 should be judged first on **"how fast can a manager go from 'Johnson wedding needs 8 servers' to '8 confirmed', and recover when one drops out on Friday night?"**, and only then on grid aesthetics.

---

## Part 2: UX patterns for building the schedule

### 2.1 Layout: grid vs calendar vs board vs list

| Layout | Good for | Bad for | Fit for Vue |
|---|---|---|---|
| **Week grid** (people as rows, days as columns; When I Work, Deputy, Homebase) | Recurring weekly shifts, seeing each person's week, overtime | Events: rows are mostly empty, and the event (the thing that matters) is spread across cells | Use only for **availability and hours**, read-only, not for building |
| **Calendar** (month or week) | Picking which event to work on, spotting clashes between events | Seeing roles and slots | A **"Next 6 weekends" list or calendar** is the right entry point: each wedding with "6 of 8 confirmed" |
| **Board / kanban** (columns Asked, Confirmed, Declined) | Following a reply pipeline | Showing coverage per role and time | Works as the **staff-reply view inside an event**, not as a separate tab |
| **Roster matrix** (roles as rows, needed / asked / confirmed; optionally block columns) | One event's coverage at a glance; maps to Planning Center "needed positions" | Very wide when every block is a column | **Primary event screen.** Rows are roles with a count. The default unit is "on shift for this wedding", with call time and release time. Per-block detail is progressive disclosure. |

NN/g's data-table guidance [read] applies to the roster: freeze the role column and header, put the human identifier first, add row hover, and use batch actions with checkboxes. It also notes that dense tables "excel at supporting comparison tasks", so a dense screen is acceptable when every column answers a question the manager has.

### 2.2 Drag-and-drop vs click-to-assign

- NN/g [read]: drag is for "grouping, reordering, moving, or resizing". It can be "inefficient, imprecise, and even physically challenging", so validate it with users first. On mobile, prefer menus, as Gmail does, "prioritiz[ing] overall usability, rather than simply counting clicks". Touch targets should be at least 1 cm.
- WCAG 2.2 SC 2.5.7 Dragging Movements (AA) [read]: *"All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging"*. For kanban, the compliant pattern is select, then move with a menu or buttons. Keyboard support alone does **not** satisfy it.
- Atlassian Pragmatic DnD guidelines [read]: "All draggable items should also have the ability to achieve the same outcomes using assistive technology friendly controls". Put move actions in the item's "…" menu. Use an always-visible handle when drag is primary. After a drop, flash the moved item.

**Recommendation:** click-to-assign is the primary and only required interaction (click the slot, pick people, done). Drag is an optional accelerator on desktop, for example dragging a person from the "available" list onto a role row, and it must reuse the same action. A wedding has 6 to 20 staff, so there is no volume that justifies drag-first.

### 2.3 Showing required vs filled

- Show three numbers, not one: **confirmed / needed**, plus **waiting** and **not yet asked**. Example: "Servers 6 of 8 confirmed · 1 waiting · 1 to find". v1 showed "Needs N more" even when every slot had a person, which is a false alarm (Part 3, C4).
- A bar or segment strip per role (confirmed solid, waiting outlined, gap dashed) gives an at-a-glance view, and must also carry text.
- Carbon status indicator pattern [read]: combine at least three of symbol, shape, colour and text; "never rely on color alone"; keep 3:1 contrast; use **at most 5 to 6 distinct indicators**. v1 has about 7 (Part 3, C5).
- Industry conventions worth reusing: unpublished or not sent = **outlined or striped**, waiting = **yellow/amber**, confirmed = **full colour** (Parim [read]; Deputy grey → green with a "CONFIRMING" label [summary]; Restaurant365 notched corner = unpublished [read]); an override warning = a small "!" on the chip (Deputy [summary], Employment Hero/Kenjo [summary]).

### 2.4 Conflicts and warnings

- Warnings appear **in context** (an indicator next to the person), not as toasts (NN/g indicators vs notifications [read]: a toast for critical information "fails because users may miss" it).
- Two severities only: **Warning** (unavailable, overlap, would exceed hours, declined before), which never blocks, and **Info** (other role, far from preferred hours). Each warning carries a plain sentence.
- Keep the v1 rule "warnings never block", since it matches Deputy, Planning Center and Employment Hero ("Warnings (yellow) will not block you from publishing" [summary]).

### 2.5 Undo, confirmation, drafts

- NN/g [read]: "Do go to great lengths to provide undo". Reserve confirmation for serious, irreversible actions, and avoid overuse because "if you warn people too much, they stop paying attention". Confirmations must restate the action with specific labels ("Notify 5 people", not "OK").
- Apply this to Vue:
  - **Undo toast** on assign, remove and replace while the item is not yet sent.
  - **Confirmation only when people get messaged**, and the confirmation is the preview list itself.
  - After sending, "undo" becomes "send a correction", because you cannot unsend a text.
- Keep "not sent" drafts, but the manager should not have to *think* about drafts. Better: "**Ask now**" on each assignment, *or* collect and "**Send 5 requests**" in one banner. That gives one obvious path.

### 2.6 Bulk actions and keyboard

- Multi-select in the picker: tick several people, then "Ask 3 people" (fixes P12).
- Per-role "Ask more" or "Ask backups", which sends to the next N by rank.
- "Remind everyone who hasn't replied", one click per event.
- Keyboard: the picker is a filterable list (type a name, arrow keys, Space to tick, Enter to ask). Escape closes the drawer and focus returns to the slot. v1's AssignPanel has no Escape or focus handling, while its own `Modal` does.

### 2.7 Empty and error states

NN/g empty states [read]: communicate status, teach in context, and give a direct path. For Vue:
- An event with no crew yet: "No one asked yet. Start from a standard crew for 150 guests" with buttons [Use standard crew] [Copy from Smith Wedding].
- A role with nobody available: "No server has said they're free on Sat 19 Sep" with [Ask all servers] [Show people who said Maybe].
- A failed delivery (bad phone number): show it on the person's chip, not in a log.

### 2.8 Mobile staff flows (accept, decline, swap)

- **No-install link** (foundU, ShiftMatch, Clairvia, Event Dispatch [summary]; Eco Caters [read]): one screen with the event, date, call time to release, role, where to go and what to wear, and two buttons, **Accept** and **Can't make it**. The decline reason is optional or a quick-pick ("Another job / Sick / Family / Other"). v1 required a reason, which adds friction where it is least wanted.
- **One request per event day**, not one per timeline block.
- **Swap or drop after accepting**: Sling's model [read] is that the original person "remains responsible" until someone takes it and the manager approves. For Vue, "Can't make it anymore" opens the slot, auto-asks backups, and tells the manager. Optional "Suggest someone" lets staff name a colleague. Manager approval is on by default.
- **Reminders**: a day-before reminder with the call time (RosterElf [read][vendor] suggests 24 h ahead).

### 2.9 Keeping a dense screen learnable (the low-learning-curve priority)

From NN/g progressive disclosure [read]:
- Show "only a few of the most important options" up front.
- Make the step to secondary options obvious.
- **Never go deeper than two levels**, because "users often get lost".

Applied with backlog B-04 (at most 7 controls), B-05 (concept budget) and B-06 (one term per thing):
1. **One screen per event does the whole job**: see the need, ask people, see replies, fix gaps. Replies are not a separate tab.
2. **A concept budget for staffing of five nouns: Event, Role need, Person, Request (asked / confirmed / declined), Backup list.** No separate "offer", "draft" and "overridden" concepts in the UI.
3. Primary action per state: when nothing is asked, "Ask people"; when some are waiting, "Remind"; when there is a gap, "Ask backups". Exactly one filled button.
4. Teach in place: hover text on numbers ("Waiting: asked, no reply yet").
5. Default to sensible crews by guest count, so first use is editing, not building (B-02).

---

## Part 3: Critique of Staff Planner 1

Read: `docs/STAFF-PLANNER-SPEC.md`, `app/(app)/staffing/{page,[eventId]/page,team/page,replies/page}.jsx`, `components/{AssignPanel,StaffTabs,PublishDialog}.jsx`, `lib/store.jsx` (lines 150 to 480), `lib/mock/events.js`. Judged against Part 1 and Part 2. Ordered from most to least damaging.

### C1. The unit of work is wrong: per-block assignments instead of "working this wedding"
Assignments are `(blockId, staffId, role)`, with id `${blockId}--${staffId}` in `store.jsx`. An Event Staff member working Ceremony (3 to 5 PM), Reception (5 to 9 PM) and Teardown (9 to 11 PM) at the Johnson wedding is **three assignments**:
- The manager opens the Assign panel three times.
- The publish list shows three rows.
- The person gets three accept requests.
- They can accept one and decline another, which leaves a half-staffed day.

Nobody in a venue thinks this way. Staff think "I'm on the Johnson wedding, call time 2:30, done when it's cleared". There is **no call time** (staff are asked to arrive before guests; the Ceremony block is 3 PM, but the seed note says guests arrive at 3:30). Times are integer hours only. Timeline blocks are right for *where coverage is needed*, and wrong as the unit you *ask a person for*.

### C2. It models "assign and publish" (weekly shift tools), not "invite and confirm" (event staffing)
The flow is: pick a person, they become Not sent, then Publish, then Pending, then Accepted. There is no step for **asking who is free for this date** before choosing, and that ask is the main job (P2, P4; FirstHR, Eco Caters). "Offer to everyone eligible" exists but:
- It is a secondary button inside the drawer.
- It only includes people with **zero** warnings, which silently excludes anyone a few minutes outside their weekly window.
- It has no reply-by date and no ranking.
- "Claim" bypasses the manager entirely.

### C3. The part that matters most is simulated
Every reply is entered by the manager pressing "Mark accepted / Mark declined" (board and Replies). There is no staff view, not even the "Show as staff" stretch goal. Pain P2 ("who is confirmed?") is the core value, and the prototype cannot show how it gets solved. For a stakeholder judging whether staffing is "solved", this is the single biggest reason it feels unconvincing.

### C4. The coverage signals contradict each other and cry wolf
- `openPositions` counts only `accepted`. After a manager fills every slot with drafts, the header still says **"Needs 9 more"**, each role says "Needs 2 more", and the Week card lists every role as needing people. Yet the role row shows **no open slot button**, because occupied drafts and pending people hide it. The screen says both "full" and "short" at once.
- Up Next ("Fill position") and the Week links deep-link into the Assign panel for positions that already have someone pending. That invites **over-assigning** someone extra while the first person has not yet replied.
- The "N not sent" badge and the "Draft / Published" badge describe a second state machine on top of slot status.

### C5. Too many concepts and states for a low-learning-curve product
Slot states: Open, Not sent, Pending, Accepted, Declined, Overridden. Event states: Draft, Published, N not sent. Plus Offers, Claims, "Replace" and "Copy staffing", spread across **four tabs, a drawer and a modal**. That is above Carbon's 5 to 6 indicator ceiling and the backlog's concept budget (B-05). "Not sent" versus "Pending" is a distinction the manager must learn only because of how the software works.

### C6. The four tabs split one job
Replies (where you learn of a decline) live on a different tab from the board (where you fix it). The "Event board" tab is not a place but whichever event you last viewed, read from localStorage, so the same tab opens different content. "Team availability" is a week grid for an event business (see C8). A manager handling the Johnson wedding moves between three tabs to do one thing. Better: an event list as the entry point, one event screen with replies inline, and availability inside the picker.

### C7. There is no recovery path for the day-of call-out (the top-ranked pain)
- When an accepted person drops out, the only route is the manager pressing "Mark declined" and typing a reason, which the staff member would have texted them.
- There is no **"ask backups"** with first-yes-wins and no urgency tier (SMS now).
- There is no no-show or late state and no day-of roster with tap-to-call, even though phone numbers are in `staff.js`.
- There is no backup or waitlist concept at all, which FirstHR names as *the* essential event-staffing feature.

### C8. Availability is the wrong shape
The only availability is weekly recurring windows (`person.availability[day]`), and date-specific time off is explicitly out of scope. Weekend part-timers' real answer is per date ("I can do the 19th, not the 26th"). The Team availability page is a 7-column table with `min-w-[820px]`, so it **scrolls horizontally on a phone**, which violates backlog B-13.

### C9. No hours, cost or fairness
The picker shows `preferredHours` as text ("Up to 32/week") but never computes what this assignment does to it. There is no daily-length warning (a Grounds person on Setup 9 to 3 plus Teardown 9 to 11 is a 14-hour span), no weekly total, no labour-cost estimate, and no "events this month" figure to spread work fairly. The sort order is warnings count, then role, so the same clean-availability people always float to the top (P10).

### C10. Staffing needs are fixed and unrelated to the event
`requirements` are hard-coded per block and cannot be edited ("editing a block's requirements" is out of scope). The 150-guest Johnson reception needs **one server**. Guest count changes are a top day-of change (Celayix, catering sources), and the guarantee is a first-class Vue concept. The first thing a real manager would do (set "10 servers for 150 plated") is impossible.

### C11. Changes after publishing are silent and unsafe
- **Remove** deletes an accepted, already-notified assignment with no undo and no message to the removed person. **Replace** does the same.
- The Publish dialog lists only drafts, as "New" or "Changed". **Removals never appear**, so the person taken off a wedding is never told (P6).
- There is no short-notice flag and no change log (P13).
- B-11 asks for an Undo toast on destructive actions. None exists.

### C12. Bulk and copy are thin
- Two open Event Staff slots means opening the panel twice. There is no multi-select (P12).
- "Copy staffing from" appears only when a block is empty, matches blocks by name, and copies *people* as drafts without checking whether they are free on the new date, instead of copying *needs* and *suggesting* people.

### C13. Smaller defects that confuse the counts
- From Staff replies, **Replace** links to the board without `replaceId`. The declined record therefore survives the replacement, still counts in the "Staff replies" tab badge (`declined || pending`), and still shows as a struck-through chip.
- The decline reason is **required**, which is right for a manager's record but adds friction on the staff side.
- AssignPanel has no Escape-to-close or focus trap, while the shared `Modal` does. This matters for keyboard users and for consistency.
- The overlap check is strict start/end, so back-to-back events at two venues 40 minutes apart pass clean.
- There is no way to send staff the event details they actually need (arrival, parking, dress code, contact on the day). The Messages module is not connected to staffing.

### C14. What v1 got right (keep these)
- Per-event planning rather than a weekly grid.
- Warnings that never block, with "Assign anyway" leaving a visible mark.
- Every status has an icon and a word.
- Only confirmed people count as coverage. This is the right rule, but it needs the three-number display from 2.3 so it does not cry wolf.
- A publish preview listing named people.
- Deep links from Up Next into the exact slot.
- The assign panel sorting eligible people first, with plain-language reasons.

### Bottom line
v1 is a competent copy of **weekly shift-scheduling UI** (When I Work, Sling, Planning Center) applied to a job that is really **invite, confirm, backfill**. It has more states than a venue manager needs, and it simulates the one loop that would prove it works. Staffing Planner 2 should:

1. Make "working this wedding, call time to release" the unit.
2. Make "ask people / see who said yes / ask backups" the main loop, with a real (prototype) staff link page.
3. Put replies, availability and hours inside the single event screen.
4. Derive needs from guest count, and make them editable.
5. Show "confirmed / needed · waiting · to find" instead of a single shortage number.
6. Treat removals and late changes as notifications with undo before sending.

---

## Source table

All accessed 2026-10-09.

| # | Source | URL | Status | Used for |
|---|---|---|---|---|
| 1 | FirstHR, event staff scheduling software comparison | https://firsthr.app/compare/time-tracking/event-staff-scheduling-software | read [vendor] | Invite-and-confirm model, Saturday wedding example, waitlist backfill |
| 2 | Instawork, "How Eco Caters schedules their staff in just 5 minutes" | https://www.instawork.com/blog/how-eco-caters-schedules-their-staff-in-just-5-minutes | read [vendor] | 2 h/day email/text tracking; link-based accept |
| 3 | Celayix, "Banquet managers, let's talk" | https://www.celayix.com/blog/banquet-managers-lets-talk-a-smarter-way-to-handle-scheduling-staffing | read [vendor] | Banquet call-outs, skills, overtime |
| 4 | Turnozo, "WhatsApp scheduling vs software" | https://turnozo.com/blog/whatsapp-scheduling-vs-software | read [vendor] | Six group-chat failure modes |
| 5 | Deputy blog, "Biggest shift worker complaints" | https://www.deputy.com/blog/biggest-shift-worker-complaints-and-how-to-avoid-them | read [vendor] | Transparency, communication stat, clopenings |
| 6 | Trustpilot, When I Work | https://www.trustpilot.com/review/wheniwork.com | read (6 reviews) | Notification nagging, missing breaks |
| 7 | Trustpilot, Homebase | https://www.trustpilot.com/review/joinhomebase.com | read (345 reviews; scheduling-specific content thin) | Praise for ease; performance issues |
| 8 | Trustpilot, 7shifts | https://www.trustpilot.com/review/7shifts.com | read (249 reviews, mostly payroll and billing) | Praise vs Excel; no scheduling-specific complaints found |
| 9 | Trustpilot, Sling | https://www.trustpilot.com/review/getsling.com | read (0 reviews) | n/a |
| 10 | JustUseApp, Deputy reviews | https://justuseapp.com/en/app/477070330/deputy-shift-schedule-maker/reviews | read (aggregated app-store reviews) | No multi-select for offers; notification overload; audit concern |
| 11 | JustUseApp, Shyft reviews | https://justuseapp.com/en/app/730422337/shyft-shift-swap-schedule/reviews | read | Push reliability; one-tap swap praise; fewer call-ins |
| 12 | TechTarget, Kronos and a Starbucks worker (2015) | https://www.techtarget.com/searchhrsoftware/news/4500252451/Kronos-shift-scheduling-software-a-grind-for-Starbucks-worker | read | Unpredictable schedules; blaming the software |
| 13 | arXiv 2001.09755, Fairness in collaborative shift scheduling | https://arxiv.org/abs/2001.09755 | read (abstract page) | Fairness norms, transparency |
| 14 | WUSTL, usability testing of an open-shift tool | https://profiles.wustl.edu/en/publications/usability-testing-of-a-web-based-tool-for-managing-open-shifts-on/ | read (abstract) | Perceived effectiveness drives feature use |
| 15 | Restaurant365 docs, publish/unpublish and alert | https://docs.restaurant365.com/docs/schedule-calendar-publish-unpublish-and-alert-employees | read | Unpublished marker, deselect recipients, re-alert |
| 16 | Parim support, shift statuses | https://support.parim.co/en/articles/70454-shift-statuses | read | Event-staffing status conventions (striped, yellow, full colour) |
| 17 | Sling support, available shifts vs offers vs swaps | https://support.getsling.com/en/articles/1085732-what-are-the-differences-between-available-shifts-offers-and-swaps | read | Swap and responsibility model |
| 18 | RosterElf, SMS vs app notifications | https://www.rosterelf.com/uk/blog/sms-vs-app-notifications-staff | read [vendor] | Channel tiers, notification fatigue |
| 19 | Tripleseat, Event Staff App partner page | https://tripleseat.com/partners/event-staff-app/ | read [vendor] | Venue staffing tool scope |
| 20 | NN/g, Drag-and-drop | https://www.nngroup.com/articles/drag-drop/ | read | DnD guidance and mobile alternatives |
| 21 | W3C, Understanding SC 2.5.7 Dragging Movements | https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html | read | Single-pointer alternative requirement |
| 22 | Atlassian, Pragmatic drag and drop design guidelines | https://atlassian.design/components/pragmatic-drag-and-drop/design-guidelines/ | read | Handles, drop indicators, accessible move menus |
| 23 | Carbon, Status indicator pattern | https://carbondesignsystem.com/patterns/status-indicator-pattern/ | read | Never colour alone; 5 to 6 indicator ceiling |
| 24 | NN/g, Progressive disclosure | https://www.nngroup.com/articles/progressive-disclosure/ | read | Two-level limit, learnability |
| 25 | NN/g, Indicators, validations and notifications | https://www.nngroup.com/articles/indicators-validations-notifications/ | read | Contextual warnings vs toasts |
| 26 | NN/g, User control and freedom | https://www.nngroup.com/articles/user-control-and-freedom/ | read | Undo, exits |
| 27 | NN/g, Confirmation dialogs | https://www.nngroup.com/articles/confirmation-dialog/ | read | Confirm only serious actions; undo first |
| 28 | NN/g, Visibility of system status | https://www.nngroup.com/articles/visibility-system-status/ | read | Show what was saved or sent |
| 29 | NN/g, Data tables | https://www.nngroup.com/articles/data-tables/ | read | Dense roster design |
| 30 | NN/g, Empty states | https://www.nngroup.com/articles/empty-state-interface-design/ | read | Empty-state guidelines |
| 31 | Capterra, When I Work reviews | https://capterra.com/p/121248/When-I-Work/reviews/ | blocked (403); search summary only | No audit; drag precision; mobile vs desktop |
| 32 | Capterra, Deputy reviews (several pages) | https://www.capterra.com/p/167811/Deputy/reviews/?page=5 | search summary only | Copy-paste setup; poor mobile web; doesn't capture why someone is out |
| 33 | Capterra / GetApp / softwarefinder, Homebase and 7shifts | https://capterra.com/p/153076/Homebase/reviews/ | search summary only | Notification reliability; mobile less capable |
| 34 | GetApp UK, When I Work | https://www.getapp.co.uk/reviews/90360/when-i-work | blocked (403) | n/a |
| 35 | G2, Deputy reviews | https://www.g2.com/products/deputy/reviews | blocked (403) | n/a |
| 36 | TrustRadius, Deputy reviews | https://www.trustradius.com/products/deputy/reviews | blocked (403) | n/a |
| 37 | Reddit (r/restaurantowners search) | https://www.reddit.com/r/restaurantowners/search.json?q=scheduling%20app | blocked (fetch tool refuses reddit.com) | No Reddit claims made |
| 38 | Apple App Store, When I Work reviews | https://apps.apple.com/us/app/when-i-work-employee-scheduling/id493174750?see-all=reviews | blocked (404) | n/a |
| 39 | Deputy help, schedule shift states | https://help.deputy.com/hc/en-au/articles/4688746992399 | blocked (403); search summary only | Grey/green/CONFIRMING/warning conventions |
| 40 | BookJane help, warnings and conflicts | https://help.bookjane.com/hc/en-us/articles/360061610651-Warnings-and-conflicts | blocked (403) | n/a |
| 41 | Employment Hero and Kenjo help, conflict warnings | https://help.employmenthero.com/hc/en-au/articles/17426655008527 | search summary only | "!" marker; yellow warnings don't block publish |
| 42 | Salesforce UX, 4 patterns for accessible drag and drop | https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09 | blocked (403) | n/a |
| 43 | Scholars Strategy Network, Schneider and Harknett key findings (PDF) | https://scholars.org/sites/scholars/files/ssn-key-findings-schneider-and-harknett-on-unpredictable-and-unstable-work-hours_authedi.pdf | blocked (image-only PDF, unreadable) | n/a |
| 44 | Shift Project findings via news syndication (CNN/WISH-TV) | https://kvia.com/news/2022/01/28/erratic-schedules-are-a-nightmare-for-americas-workers/ | search summary only | 110,000-worker survey; instability persists |
| 45 | Pebb, everhour, 7shifts blog, schedulingkit, liveforce, teamup (vendor pages on call-outs and group chats) | https://pebb.io/articles/shift-swapping-apps-restaurant-cafe-managers | search summary only [vendor] | Group-text scramble; channel sprawl |
| 46 | foundU, ShiftMatch, Clairvia, Event Dispatch help (SMS accept links) | https://www.foundu.com.au/discover/how-to-accept-a-shift | search summary only | No-install accept/decline links |
| 47 | Quickstaff description (via search) | (search result, no page fetched) | search summary only | "Invited to events and respond" |
| 48 | myshyft, adoption articles | https://www.myshyft.com/blog/employee-adoption-strategies | search summary only [vendor] | App adoption barriers; SMS links |
| 49 | Overtime-alert vendor pages (Employment Hero, Netchex, Timeero) | https://netchex.com/blog/automate-overtime-alerts-for-managers/ | search summary only [vendor] | Pre-publish overtime warnings |
| 50 | Hanna Louise, QuickShift case study | https://hannalouise.myportfolio.com/quickshift | blocked (redirect to "missing") | n/a |

**Not done:** venue-manager or staff interviews; reading individual Capterra/G2 reviews; Reddit. Treat P-ranks as a hypothesis list to validate with 3 to 5 venue managers. The quickest checks:
- How do you ask staff today, and how many messages does it take?
- What happened the last time someone dropped out on Friday night?
- Do staff work "the wedding" or "the reception"?
