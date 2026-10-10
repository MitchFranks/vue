# 01 — How the best workforce scheduling tools work, screen by screen

Researcher A, Staffing Planner 2 research run. Accessed 2026-10-09.

## How to read this document

- **Evidence rule.** Every claim in sections 1 to 4 comes from a vendor help article whose full text was retrieved and read in this run, unless it carries a tag:
  - **[unverified]**: the claim comes from search-engine summaries, vendor marketing pages or inference. No help article was read for it.
  - **[inference]**: my own synthesis or design judgement. It is not a vendor statement.
- **How the pages were read.** WebFetch returned HTTP 403 for the Deputy and 7shifts Zendesk help centres. Their articles were read in full through the public Zendesk Help Center API (`/api/v2/help_center/{locale}/articles/{id}.json`). That API returns the same article body that the HTML page shows. When I Work articles were read through the help site's public WordPress REST API (`/wp-json/wp/v2/ht-kb/{id}`). Sling, Connecteam, Planday and Microsoft Teams Shifts pages are server-rendered and were fetched directly. Homebase's help centre is a JavaScript-only Salesforce site. Its articles were rendered in a Chrome tab and their text extracted. The help centre for Humanity (now "TCP Humanity Schedule") requires a login, so it was **blocked**. Section 5 lists every source and its status.
- **Terminology.** Vendor terms are kept exactly, including capitalisation and spacing: OpenShifts (When I Work), Open shift (Deputy), Shift Pool (7shifts), Available shifts (Sling), Sell (Planday) and so on.
- **Coverage.** Seven tools were read from primary docs: When I Work, Deputy, 7shifts, Homebase, Sling, Connecteam and Planday. Microsoft Teams Shifts was added as a reference baseline. Humanity was blocked; only its marketing page was read.

---

## 1. Per-tool sections

### 1.1 When I Work

**Screens and names.** The main screen is the **Scheduler** tab. The Scheduler Reference Guide labels its parts as follows.

- **Schedule area:** an Annotation button per date, an **OpenShifts** row, shift blocks, and availability flags.
- **Header controls:**
  - **Viewing** switches between "schedules", When I Work's term for locations or departments.
  - **Users Sort**, **Date(s)** and **Today**.
  - **By** selects Day, Week, Two week or Month.
  - **As** selects user, position, job site or coverage.
- **Filters panel:**
  - Positions, Job sites, User and Tags.
  - **Forecast tools**, which show labor cost.
  - **Display options:** Hide Unscheduled Users, Highlight Unconfirmed Shifts, Highlight OpenShifts and Show Shifts at Other Schedules.
  - **View Shift Colors By:** Shift, Position or Job Site.
  - Task lists.
- **Tools menu:** **Auto-Assign**, **Bulk Edit Shifts**, **Copy Previous Day/ Week**, **Load Schedule Template**, **Save Schedule Template**, **Update Existing Schedule Template**, **Print Schedule**, **Export Schedule** and **Clear Schedule**.
- **User options menu** (per user):
  - an **N / N** readout of scheduled hours against max hours
  - Publish [user]'s Shifts and Unpublish [user]'s Shifts
  - Edit availability
  - Copy [user]'s Previous Day / Week
  - Edit Details and Delete Shifts
- **Other screens:**
  - **My Schedule**, the employee dashboard with an "Available Open Shifts" section.
  - **Shift Requests** (swap and drop), with tabs **Requests I Can Approve**, **Requests I Can Accept**, **My Requests** and **All Requests**.
  - **OpenShift Requests**.
  - **Scheduling Settings**.
  - A Notification Bell with a count badge.

**Building a schedule.**

1. Click a cell. A picker offers your **shift templates**, grouped as "Suggestions" and "Unqualified", or **Create Custom Shift**.
2. Fill in the shift modal:
   - Assign To, Time, Unpaid Break, Color, Position, Job Site, Tags, Shift Task List and Shift Notes
   - **Repeat Shift**
   - **Save As Shift Template**
   - When Assign To is OpenShift: **How Many**, **Require pick up approval**, **Share shift with other schedules** and **View who's currently eligible**
3. **Publish & Notify.**

**Drag and drop.**

- Drag a shift to reassign it. Ctrl-drag (Cmd on Mac) copies it.
- While dragging, **thumbs up / thumbs down** icons show whether the target user is qualified by position. Per the Scheduling Rules reference, the drag shows a green checkmark when there are no concerns, max-hours or OT issues, and a concern icon otherwise.
- Month view has no drag and drop.
- Dragging a shift into the OpenShifts row turns it into an OpenShift.

**Templates and copying.**

- **Shift templates** are sorted against the user's availability: **Highly Preferred** (fits inside preferred hours), **Preferred** (overlaps them), **Qualified** (right position, no overlap), **U/A** (overlaps unavailability, shown greyed with the time struck through, but still selectable) and **Other**.
- **Schedule templates** exist for Day and Week only. Loading one asks how to handle collisions:
  - **Overwrite Conflicts**
  - **Allow Duplicates**
  - **Avoid Conflicts**, which moves conflicting shifts to the OpenShifts row
  - **Load to OpenShifts**
- **Copy Previous Week** and **Copy Previous Day** offer the same choices: Allow Conflicts, Avoid Conflicts, Overwrite Conflicts, or copy into OpenShifts. Avoid Conflicts checks against existing shifts and pending or approved time off.

**Open shifts.**

- The default is first come, first served: "the first user to view and accept the OpenShift gets it automatically".
- Ticking **Require pick up approval** turns this into "Shift Bidding". Requests then appear on the OpenShift Requests page, ordered by request date. The manager selects a user and clicks **Approve**.
- Who is eligible: qualified by position and tags, no published shift at that time, no approved time off, and not hidden.
- Managers can narrow the offer through **View who's currently eligible**.
- An optional **Overlapping OpenShift** pick-up lets a user take part of a shift. The default threshold is 75%.

**Availability and time off.**

- Users set **Preferred** and **Unavailable** preferences.
- In day view, preferred time is a green bar and unavailable time a grey bar. In week view they show as green or grey **flags**.
- Pending time off has diagonal stripes.
- A **red flag** in the top-left corner of a shift marks a conflict: approved time off, unavailability, or an overlapping shift.
- "Users can still be scheduled for a shift during times set as unavailable."

**Conflict and overtime warnings.**

- The Scheduling Rules settings cover:
  - minimum hours between shifts on the same day
  - minimum hours between shifts on different days
  - maximum days in a row
  - maximum days per week
- These "Scheduling Concerns" are shown in five places:
  1. the create-shift dialog
  2. drag and drop
  3. OpenShift edits and manager drops
  4. next to the user's name
  5. a **confirmation dialog when publishing**, which lists the concerns and has a **View Employees With Concerns** button that filters the Scheduler
- Concerns warn the manager but do not block. For employees they are enforced: shifts that would create a concern are not shown to them as available OpenShifts or swap/drop targets.
- **Overtime Visibility:**
  - An alert icon under the user's name; hover shows OT, double-OT and over-max hours.
  - An **Hours mode / Sales mode** toggle.
  - OT alerts on the day and week totals.
  - OT and max badges in the Assign To list and on shift templates.
  - **Deselect OT/Max** buttons when offering OpenShifts or processing swaps and drops.
- **Max Hours Enforcement** hides OpenShifts and swap/drop offers from users who would exceed their max. "Users can still be scheduled past their configured max hours" by a manager.

**Auto-schedule.** **Auto-Assign** works in week view only. It assigns *unpublished OpenShifts* using positions, tags, existing shifts, approved time off and the active filters. Options:

- respect max hours
- respect unavailable preferences
- respect preferred work preferences (70% overlap counts as preferred)
- schedule weekend shifts first
- allow multiple shifts per day
- max hours per day
- include or exclude users

**Run Auto-Assign** then offers **Save Shifts** or **Revert**.

**Publishing and notifications.**

- The **Publish & Notify** button shows how many changes are pending and is colour-coded:
  - **green:** everything in view is ready to publish
  - **orange:** some shifts are already published and only new changes will go out
  - **grey:** nothing to publish
- Unpublished shifts have **diagonal stripes**. Published shifts are solid.
- The advanced publish dropdown offers:
  - **Recipients**, which can be OpenShifts, users or positions
  - **Date Range**
  - **Notify users with changes** or **Notify all users**
  - **Message**
  - **Publish Shifts** and **Unpublish Shifts**
  - **Re-Send Notifications**

**Staff-side flows.**

- **Shift confirmation** is on by default. Users are prompted to confirm newly published shifts for the next two weeks.
- In the Scheduler, a green badge with a tick means all shifts are confirmed. A **yellow badge with "!"** means some or none are.
- **Get Shift Covered** offers three options:
  - **Release Shift**, which turns the shift into an OpenShift
  - **Drop Shift**, which offers it to chosen eligible coworkers
  - **Swap Shift**, which offers it in exchange for coworkers' shifts within ±7 days
- Mobile shows an "I Understand" **Shift Responsibility** message: the shift remains yours until someone takes it.
- Request statuses: **Pending Approval** (only when **Require Manager Review for Swaps and Drops** is on), **Pending Acceptance**, **Accepted**, **Canceled**, **Declined**, **Expired** and **Denied**.
- When processing a request, the manager can uncheck users or shifts, post into a **Conversation/Activity** thread, then **Approve** or **Deny**.

**Labor cost.**

- **Forecast Tools** add a budget menu at the bottom of the schedule with **Sales Budget**, **Labor % Target** and **Assigned Labor**, plus **Weekly Projections** on the left.
- Overtime wages are *not* included in the forecast tools.
- Clicking the hours under a user's name shows that user's cost.

**Mobile.**

- The mobile apps have Scheduler, the + button, the template list and **Custom Shift**.
- Assign To can be set to OpenShift, with How many, a pick-up approval toggle and View eligible employees.
- The dashboard has cards for **Shift Requests**, **OpenShift Requests** and **Open Shifts Available**.

---

### 1.2 Deputy

**Screens and names.**

- **Schedule tab**, laid out as follows:
  - **Location and Area selector** (Quick select or **Select multiple**), **Date Selector**, **View Selector** (Day, Week, 2-week or Month, each **by Area** or **by Team member**) and **Refresh**.
  - **Auto-Schedule** button with a dropdown.
  - **Copy Schedule** button (Save Template / Load Template).
  - **Insights** (Business Insights, stats panel, coverage planner).
  - **Options** (print, calendar sync, Remove all team members, Remove Empty Shifts, **Mark all empty shifts as Open**, Delete All Shifts, Bulk update, Enter Sales).
  - **Publish Shifts** button, which shows a count.
  - **Team member list** on the left, with avatar, name, scheduled hours and cost for the view.
  - A **Time off** area at the top of the grid.
  - A **status bar** at the bottom: empty, unpublished, published, requiring confirmation, open, warnings, leave approved, leave pending, people unavailable.
- **Me tab**, the employee home, with Upcoming Shifts and **Available Shifts**.
- **Business Insights** (budgets, metrics, labour model).
- **People**, where each profile has Availability, Employment and Stress profile.
- **Locations > Edit Settings > Scheduling**.
- Key principle: "what you see is what you get". Every bulk action and every publish applies only to the shifts currently displayed.

**Building a schedule.**

1. Pick location, date and view.
2. Click "+" or double-click an area to open the shift popup: who, area, start and finish, break, and shift notes, which are sent on publish.
3. Use the **right-click quick action menu** for copy/paste, **Paste and Replace**, **Find replacement**, delete, **Bulk Actions** and freeze first row.
4. Keyboard shortcuts exist, for example C and V to copy and paste a shift.

**Drag and drop.**

- Drag **Open Shift** from the top of the team list into an area and day.
- Selecting a shift turns it **dark purple** and that person's other shifts **lavender**.
- Areas get their own colour code.

**Templates and copying.**

- **Copy Schedule** copies single shifts, days or weeks.
- **Save Template / Load Template** cover Day, Week and 2-week. There are no monthly templates.
- Templates are tied to one location. Only templates that fit the current view length are listed.
- A separate **Shift templates** feature exists for the U.S. only. **[unverified detail; article title seen, body not read]**

**Open shifts.**

- Shift types:
  - **Empty shift:** no person, not offered, and cannot be published.
  - **Open shift:** offered to recommended team members; the first to claim it wins.
  - **Open Shift with approval:** team members **Request Shift**; the manager picks from requests sorted by **cost of shift**, **hours** this week, or **request time**.
- How open shifts look on the grid:
  - "OPEN"
  - a person icon next to OPEN when approval is required and there are no requests yet
  - a request count when there are requests
- **Send offers** invites selected team members, starting from a **RECOMMENDED** section, and can reach other locations. "You can still select a team member even if they are not recommended by overriding the warning."
- Offers cannot be combined with approval mode.

**Availability and time off.**

- Availability and unavailability need no approval. Recurrence options are none, weekly, 2-weekly, 4-weekly or monthly.
- Entering availability for part of a day implies the person is unavailable for the rest of that day.
- Unavailability shows in the Time off area and on hover in the team list.
- Scheduling over it raises a warning with **Schedule anyway**.
- The team member "will get a notification that a shift was added".

**Conflict and overtime warnings.** This is Deputy's core concept: **"Recommended" vs "Not recommended"**. The factors are:

1. Overlapping Shifts
2. Training ("Not trained")
3. Unavailability
4. Approved Leave ("not recommended - on leave")
5. **Stress Profiles** ("Not recommended - Stressed"). These cover max hours per shift, max hours per week, max days per week, max hours per day, minimum hours between overnight shifts, and a custom gap.
6. Onboarding completed
7. Preferred team members

How the warnings appear:

- In the assign dropdown, recommended people are listed first. Non-recommended people have a **yellow dot**. Overlapping people are greyed out and cannot be selected.
- Every factor except Overlap can be overridden with **Schedule anyway** / **Roster anyway** / OK.
- An overridden shift keeps a **triangle warning icon** in its top-right corner. Opening the shift shows the reasons.
- Overtime warnings are a beta feature: an **Overtime** tag, a "Team member not recommended" alert, a cost breakdown under **Total**, and a red warning status.
- The override permission can be withheld from some roles.

**Auto-schedule.**

- **Auto-Schedule** combines **Auto Build Shift Structure** (empty shifts from demand) and **Auto Fill Empty Shifts**.
- **Auto-schedule agreed regular working hours** builds shifts from contracted patterns.
- **Auto-build** settings:
  - shift lengths
  - Shift requirements: **Required staff**, **Minimum Coverage** or **Based on previous schedules**
  - start-time granularity
- **Auto-fill** settings:
  - **Cost** (keep low / not important)
  - **Equal hours**
  - **Learn from me**
  - "How long do you want to wait?": a minute, a few minutes, or "As long as it takes"
  - **Advanced recipes** in JSON
- Auto-fill fills Empty shifts only, never Open shifts. Results are left unpublished for review.

**Publishing and notifications.**

- Unpublished shifts are **grey**. Published shifts are **green**. An unpublished open shift is white.
- The **purple "Publish X Shifts"** button turns green when everything is published.
- The publish flow has three steps:
  1. **Publish updates** (notify only people with changes) or **Publish all**
  2. Choose the areas
  3. Choose the notification type: **Require confirmation (SMS, email, app)**, **Notify (SMS, email, app)**, **Notify (Email and app only)** or **Mark as published (team members not notified)**
- SMS costs money.
- An optional setting notifies people when their published shift is removed.

**Staff-side flows.**

- **Shift confirmation:**
  - The shift shows a **CONFIRMING** label until the person responds.
  - People respond from the app ("Confirm all" / Confirm Shift / Decline Shift with a reason), the web, email links, or by replying to an SMS with a code.
  - If the confirmation window lapses, the shift **automatically becomes an Open Shift**.
  - A declined shift shows "DECLINED" and becomes an EMPTY shift with a warning flag.
- **Can't Work** gives two options:
  - **Offer Shift:** to eligible colleagues; no manager approval, but the manager is notified.
  - **Swap Shift:** one-for-one, with manager approval optional. A pending swap is marked **SWAP** on the grid and a "squiggly" icon on mobile.
- **Find replacement:** the manager offers a published shift to others. The shift shows the original name with an **OPEN** label until someone claims it.

**Labor cost.**

- The **Stats panel** (graph or table view) shows Required Staff, Filled shifts, Budgeted hours, Scheduled Wages, Actual wages, Budgeted Wages, Sales (forecast, manager forecast, actual), Sales per hr and Labor %.
- Hovering shows hourly values.
- **Budgets** are set by hours or wages, daily or weekly, per location or area. Variance is **green when under budget and red when over**, and a **triangle warning icon** marks over-budget days.
- Supervisors do not see costs.

**Mobile.**

- Managers can load Daily and Weekly templates (not 2-week), approve swaps from Home, and edit availability.
- Staff get **Available Shifts** on Home, Claim shift, Request Shift / Decline shift / Withdraw request, and a push notification on approval.

---

### 1.3 7shifts

**Screens and names.**

- Web left navigation: **Schedule**, with sub-pages for **Shift Pool**, **Time Off** (including **Blocked Days**) and **Availability**.
- Schedule page header: Location filter, Department/Role filter (with "Only"), Employee search, date pickers, **Day / Week** toggle, and a **Layout** dropdown (**List by role** is the default, then List and Time frames).
- Other header items:
  - Sort employees and an Employee Count hover
  - **Copy icon**, which holds templates and copy to/from
  - **Tools icon**: print, download, import sales, calendar sync, **Optimal Labor Tool**, month view and revert/clear
  - **Warnings** button with a **Last published** timestamp
  - **Publish Schedule** button
- Employees sit in the left column. A grey **Open Shifts** row and an **Unassigned** section appear in the grid.
- The **Labor Budget Tool** is a tab at the bottom of the page.
- Mobile: a Calendar icon opens a day list with a week strip, + and Copy.

**Building a schedule.**

1. Filter to a location and department.
2. Click the "+" cell where an employee row meets a day.
3. Enter start, end, role, breaks and notes, with optional repeat days.
4. Shifts auto-save as **drafts in light yellow**.
5. Use right-click for Copy/Paste, Edit, Delete, Duplicate, **Publish shift** and **Shift flags**.
6. The shift modal can be dragged around the screen.

Faded or greyed shifts belong to another department or location.

**Drag and drop.** Shift-drag (Option on Mac) copies a shift. Unassigned and open shifts are dragged onto employees.

**Templates and copying.**

- **Copy to** a target week, up to three weeks ahead. It can also copy labor targets and shift notes.
- If shifts already exist, choose **Delete existing shifts** or **Merge with existing shifts**. Merge de-duplicates on same employee, role, start and end.
- Conflicts are shown after copying.
- **Scheduling templates** (Copy icon > Manage Template) are location and department specific. They hold a Labor Target % and Projected Sales.
- Each template shift has a type: **Skill level**, **Specific Person** or **Open Shift**.
- **Fill from Template** auto-assigns available employees using approved availability and time off. Shifts it cannot fill land in **Unassigned Shifts** with a "Review your schedule" prompt.

**Open shifts.**

- Shifts are created in the grey Open Shifts row, for everyone in the department or for a role. **Open Shift - All Locations** is also available.
- Open shifts require **Shift Pool**.
- Employees **bid**. Managers are notified on each bid and **Assign to [Employee]**.
- Other bidders are notified that their bid was declined.

**Availability and time off.**

- **Recurring** availability and **Temporary** availability. Temporary availability overrides recurring for a date range.
- Availability changes can require manager approval. Declining an updated recurring request marks the whole profile **Declined**, which makes the person appear fully available.
- Overnight shifts are checked against the start day, unless more than 50% falls after midnight.
- Time off is approved from Schedule > Time Off or by clicking the **Pending Time Off** cell in the grid. A comment can be sent with the decision.
- **Blocked Days** stop requests on chosen dates.

**Conflict and overtime warnings.**

- All warnings are consolidated in one **Warnings** dropdown with five types:
  - **Exceptions:** state labor law
  - **Overtimes:** daily or weekly
  - **Conflicts:** duplicate shifts, or shifts over approved time off or availability
  - **Unassigned shifts**
  - **Minor warnings**
- **View on Schedule** highlights the affected shifts. Hovering the warning icon on a shift explains it.
- An **M** indicator marks under-18 staff.
- "Schedules can still be published when warnings are present." 7shifts explains this as a deliberate choice: the system warns rather than blocks.
- **Quick Fix**: "Fix them for me" reassigns shifts to fix warnings. It checks the same day, clopen, near-OT, consecutive days, time off, availability, labor exceptions and past role history. Unresolved items lead to "Review my schedule".
- On mobile, scheduling warnings are labelled in red. Mobile overtime warnings during the shift itself are yellow when an employee is within 120 minutes of OT and red when in OT.

**Auto-schedule.**

- Read in this run: Fill from Template auto-assigns, and Quick Fix reassigns.
- A separate "auto-scheduler" feature was not found in the KB search. The "Optimal Labor Tool" exists, but its article was not read. **[unverified]**

**Publishing and notifications.**

- **Publish Schedule** opens a modal pre-filled from the current view. Departments, roles and days can be checked individually. The modal shows a change count per department and a total.
- Notify options: **Only those with changes** (the default), **Everyone** or **No one**. Then **Publish shift changes**.
- Published shifts turn **white**.
- A **yellow warning banner** in the modal flags uninvited employees. It is "a warning, not a blocker".
- A single shift can be published by right-clicking it. Its notify options are "Only [Employee]", Everyone or No one.
- The header shows a publish status: **Published**, **Partial** or **Mixed**, with an Activity Log.

**Staff-side flows.**

- The **Shift Pool** has four sections: **Shift Pool Requests**, **Up for Grabs**, **Trade Requests** and **My Trades**.
- Employee actions:
  - **Find Cover > Offer Up**: full or partial shift, to everyone in the role or to specific coworkers, with a comment
  - **Take back**
  - **Find Cover > Trade Shift**
- Manager approval is an account setting (**Require Approval**). When off, a trade completes as soon as the coworker accepts.
- The approve screen shows **Conflicts** (scheduling conflicts, labor exceptions, overtime) before the manager acts.
- A trade auto-cancels if either shift is republished with changes or a shift starts.

**Labor cost.**

- **Labor Budget Tool** with the **Target** dropdown: **Labor %**, **SPLH**, **Hours** or **IPLH**.
- Projected Sales come from the POS, the importer, manual entry or AI projection. A re-sync icon is green when synced and grey when overridden.
- A **red pill** means over target. A **green pill** means on or below target.
- Compare to last week, last year or actuals.

**Mobile.** Managers can add multi-day shifts and see conflicts before saving, publish with a "Publish (x shifts)" button, copy the schedule, save to template, approve the Shift Pool and approve time off.

---

### 1.4 Homebase

**Screens and names.**

- Web: **Shifts > Schedule**, called the **Schedule Builder**.
- Header: Date Range, **View By** (including Custom ordering), **Filters**, **Tools** (Manage templates, Copy week to, Draft schedule, Print, Show/Hide) and **Publish**.
- An **Open Shifts** row near the top.
- A **forecast bar** at the bottom: Hours forecast, Wage forecast, People forecast, Estimated sales forecast, Weather forecast and Labor percentage by department.
- An AI **Schedule Builder** review canvas with a **Conflicts** sidebar.
- Mobile: Schedule, **My Shifts**, **More > Requests** (including Open Shifts) and **Cover > My Requests**.

**Building a schedule.**

1. Hover a cell and click "+". Choose **Add Shift** or **Time Off**, or pick from "frequent shifts that employees have worked previously".
2. Set the time range, role and role colour, and optionally "apply the shift to other days".
3. Click **Add**.
4. To copy, use the purple copy icon, click target cells, then **Finish pasting**.
5. Shifts can be dragged to other employees.
6. Repeating a schedule up to 4 weeks ahead is possible; the repeated shifts still need publishing.

**Templates and copying.**

- **Tools > Manage templates**: weekly templates only.
- **Apply** creates drafts.
- **Tools > Copy week to** copies all of the schedule or a subset: departments, roles or team members.

**Open shifts.**

- Create in the Open Shifts row, or drag existing shifts into it. Employees are notified by email and claim the shift.
- The manager opens the shift, toggles the team member on and clicks **Approve**.
- On mobile: Requests > Open Shifts > select > **Assign**.

**Availability and time off.**

- Time off can be added from the shift builder (Category, Reason, Note, All Day or hours). It applies immediately without publishing.
- The employee availability and time-off request articles were found in the sitemap but not read. **[unverified]**

**Conflict and overtime warnings.**

- The AI Schedule Builder **blocks publishing** until "blocking" conflicts are resolved:
  - **Pending time off:** approve or decline the request
  - **Overtime:** approve the overtime or reassign
  - **Insufficient rest** (clopen): keep or reassign
  - **No coverage available:** assign manually
- **Missing availability** is non-blocking.
- How warnings look in the classic Schedule Builder was not read. **[unverified]**

**Auto-schedule.**

- **Recommended Schedule / Draft schedule**, under "Jumpstart your schedule" or Tools, builds from a **base week** (by default the last published week, changeable) plus updated time off, availability and team changes. Weekly only.
- The newer AI **Schedule Builder** appears only on an *empty unpublished week*. Its prompt is **Build my draft schedule**. Users can switch back through **Build manually**.

**Publishing.**

- **Publish** is **purple when there are unpublished changes**.
- The user selects which team members receive notifications. Notifications follow each person's preferences.
- On Plus and higher plans, publishing can be done per department or role.

**Staff-side flows.**

- **Find Cover** offers **Trade Shift** or **Request Cover**, to all or specific teammates.
- The teammate accepts, then the **Manager gives final approval**. Only pending trades can be cancelled.
- Manager-initiated **Request cover** (mobile) shows a "recommended covers" list based on role and availability, plus "Other available team members". It asks for a reason and special requirements. The invitee accepts, then the manager approves.

**Labor cost.** The forecast bar shows hours, wages, people, estimated sales (average of the past 2 weeks, or POS data), Labor Percent Target and By Department. A "Target Labor & Sales by Hour" graph requires a POS.

---

### 1.5 Sling (by Toast)

**Screens and names.**

- **Schedule** page with Day, Week and Month views and a custom range.
- Rows: **Unassigned**, **Available shifts** and employees.
- Controls:
  - **Group by** (including chronological) and **Filters** (locations, positions, groups, tags, Events)
  - a **Conflicts** filter
  - **Auto** button, **Copy** button, options menu (View shift templates, Save schedule to template, Load schedule from template)
  - **undo**
  - green **Publish** button
- **Pending approval** tab for shift applications.
- **Dashboard** (notifications) and **Roster** (today's snapshot).
- Settings > **Labor cost**.

**Building a schedule.**

1. Click **Create shift** or the "+" on hover. The row you click decides the shift kind: an employee row, Unassigned, or Available.
2. The modal has tabs: **Custom**, **Template** and **Time off**.
3. Location and position are required. The employee is optional.
4. Fill in time or **time block**, recurrence, break, tags, tasks and notes.
5. A toggle chooses **unpublished vs published** on save.
6. Shifts save automatically.

**Drag and drop.**

- Drag shifts to move them. Ctrl/Cmd-drag copies.
- Moving a shift by drag requires re-publishing it.
- Shift templates can be dragged from a right-hand **shift template panel**, or placed in a copy-paste mode.

**Templates and copying.**

- **Schedule templates** (Premium and Business) respect the current filters. Options: unassign shifts, and include unpublished shifts. They are applied as unpublished.
- **Copy** offers from/to dates (more than a week is allowed), **Ignore attendees** (revert to unassigned), include unpublished, and skip conflicts and labor checks. Copies land unpublished.

**Open shifts.**

- Sling distinguishes two kinds:
  - **Unassigned** shifts are visible to managers only, as a coverage reminder.
  - **Available** shifts are visible to employees, who **apply** for them.
- **Slots** set how many people are needed. The count goes down as people apply or are assigned.
- With automatic approval, the first applicants are assigned until the slots run out.
- Managers can approve multiple applicants and keep the shift open or close it.
- **Auto > Make all unassigned shifts available**.

**Availability and time off.**

- **Unavailability** is recurring, every 1 to 4 weeks.
- **Time off** is a one-off and can be a partial day. A pending request shows on its grey block.
- Managers can require approval for unavailability changes.

**Conflict and overtime warnings.**

- The **Conflicts** filter shows, greyed, where an employee is already scheduled under another position or location.
- Overtime alerts and **Labor % goals** are set in Settings > Labor cost. Labor goals "pop up alerts when you attempt to schedule over the goal".
- The exact wording and visuals of these alerts were not read. **[unverified]**

**Auto-schedule.**

- **Auto > Auto-assign** (Business plan) assigns *unassigned* shifts using unavailability, time off, position and location.
- It respects filters and selected shifts. There is an option to allow multiple shifts per day. Undo reverts it.
- Assignment stays manual when there are conflicts.

**Publishing.**

- Pick a range and filters, then click **Publish**. Only filtered shifts are published, and each employee gets one summary notification.
- Individual shifts can also be published from the shift modal.
- Undo reverses an accidental publish.

**Staff-side flows.**

- **Shift acceptance** (Business plan):
  - A published shift shows **[?]** until accepted.
  - Accepting adds a **checkmark**.
  - Denying requires a reason and shows **[!]**. The shift *stays assigned* to the employee until the manager acts.
  - Mobile has **Accept all shifts**.
- **Make shift available:** coworkers in the same location and position apply, and the manager approves.
- **Offer shift:** to one specific coworker.
- **Swap shift** (Premium and Business): limited to shifts within 2 weeks. The coworker accepts, then the manager approves if required.
- In every case, "the employee originally assigned to the shift is responsible for it until an exchange is approved".

**Labor cost.** Settings cover wages (per employee or position), daily sales projections per location, overtime thresholds and multiplier, holiday rate, spread of hours and Labor % goal. How labor cost appears on the schedule itself was not read. **[unverified]**

**Mobile.** Shifts tab > options > Create shift, with a toggle for available. Save asks whether to save as draft or publish. **Roster** colours: red = running late, green = clocked in, yellow = on break, grey = clocked out / no-show / later.

---

### 1.6 Connecteam

**Screens and names.**

- **Job Scheduler**, with a "Job Schedule Lobby" to pick a schedule.
- Day, Week and Month views, plus a List view.
- **View by** users, jobs or **layers** (resources such as trucks or rooms).
- View options: work preferences, availability, **Issues**, labor costs, claim requests and Daily totals.
- Right-hand **Templates** tab with Shifts, Days and Weeks.
- **Actions** menu, **Add** button (single shift, multiple shifts, import from Excel), **Requests** button, **Settings** (General, Display, Limitations, Issues and Notifications tabs) and **Publish**.
- An Issues tab with **Upcoming** and **History**.
- Mobile: the Admin tab > Schedule, with an **Unresolved Issues bar**.

**Building a schedule.**

1. Create a shift with Add > Add single shift, or "+" on hover. Each new shift can be published instantly or saved as a draft.
2. Use Add multiple shifts or import a CSV for bulk work.
3. **Shifts without users** sit at the top of the board. Drag one to a user to assign it.
4. **Jobs** are colour-coded, one colour per job, client or site.

**Templates and copying.**

- **Shift**, **Day** and **Week** templates. Templates can be dragged in, and Day and Week templates can be previewed.
- A "start the week from a template" flow exists.
- Loading into a populated schedule asks whether to replace or add.
- Templates come from the Advanced plan upward.

**Open shifts.**

- Turn on **Enable users to claim this shift**, set the number of spots, and optionally **Require admin approval for claimed shifts**.
- Admins approve in three places:
  1. On the user's row, shown as a dashed frame, after turning on the "Claim requests" view option.
  2. Through the **Requests** button under the shift. Requests can be sorted by claims this week, shifts this week or claim time. An overtime flag shows before and after approval.
  3. In the Requests modal, using a blue tick or a red X, then **Confirm assigning** or a bell icon for a custom notification.
- Hovering the **red or green corners** of a shift shows availability: red means unavailable, green means preferred.

**Availability and time off.** Unavailability and preferred working hours, with a submission cutoff. Admins can block unavailability requests on chosen days.

**Conflict and overtime warnings.**

- **Issues** types:
  - Overlapping Shifts, Unavailability, Scheduling Rules and Working Hours
  - Rejected Shifts, Unassigned Shifts, Pending Replacement Requests and Unconfirmed Shifts
  - Unpublished Shifts, Running Late and Short notice alerts
- Each type has an on/off toggle.
- A **red exclamation point** marks a shift; hovering explains it. Rule totals show under the user's name.
- **Scheduling Rules** come as Company Policies (for example Full-Time 40 hours) or Custom Rules. **Prevent users from exceeding this rule when claiming shifts** is optional.
- Admins are warned when they publish or save drafts that violate rules.

**Auto-schedule.**

- The **auto-assign** "magic marker" next to the unassigned shifts takes into account overlap, approved time off, unavailability, qualification, coverage, fairness, work preferences and scheduling rules.
- Assignments are created as drafts.
- **Undo Assign** and **Reshuffle** are available. Shifts it cannot place stay unassigned.

**Publishing.** The Publish button. Notifications can be customised through the bell icon.

**Staff-side flows.**

- **Confirm** (green) or **Reject** (red), with an optional note. On the admin grid these show as a **green or red dot**. A grey shift means a confirmation is pending.
- **Shift Replacement** has two forms:
  - **Offer Shift:** one-way, through **Find Replacement**, which lists qualified and available coworkers with overlap and availability warnings.
  - **Swap Shift:** two-way.
- Approval can be required separately for each. The approval screen shows hours before and after and a calendar. Going over the limit is flagged **red**.

**Labor cost.**

- View options > Labor costs shows **Scheduled labor** and **Actual labor** at the top of each day.
- Sales data comes from POS or import, giving Projected and Actual Labor %.
- Only daily overtime is counted. Unclaimed open shifts are excluded. Admins without pay-rate permission do not see costs.

---

### 1.7 Planday

**Screens and names.**

- **Schedule** page. Top left: Department, **Employees / Groups / Positions** view, and Day, Week, 2 Weeks, Month or Calendar.
- Top right:
  - **View settings** (staff, payroll, revenue, availability, bank holidays)
  - **Templates**
  - **Tools**: Approve multiple shifts, Delete this week, Export, **Hide/show period**, **Working time rule report**, Contracted hours, **Schedule history** and Shifts overview
  - **Filters**
  - **Publish shifts**
- A shifts counter shows daily shifts and availability.
- Revenue and payroll cost appear at the bottom.
- **Schedule > Pending requests** has two tabs: Swap requests and Shift requests.

**Shift status colours.** These come from the help article:

| Colour | Status |
| --- | --- |
| Red | Open Shift, and Open Shift (Requested) |
| Green | Approved (ready for payroll) |
| Yellow | Shift for Sale |
| Orange | Draft |
| Grey | Normal shift |
| Highlighted colour | Shift type, such as Training or Sick |

Contracted hours have their own indicator: green means exact, yellow means under, red means over.

**Building a schedule.**

1. Click "+" to open the shift popup. Fields: Time, **Assigned to** (an employee or **Open shift**), Group/Position, **Shift type**, breaks, **Approve shifts for payroll**, **Notify employee**, and Show more (shift note, wage override, supplements, skills, admin note, **Copies**).
2. Turn on **Save as draft** to keep the shift unpublished.
3. Copy a shift with Alt/Option-drag, "Copy shift" from the ⋯ menu, or Shift copies.
4. Drag open shifts onto employees to assign them.

**Templates and copying.**

- **Week template** or **Day template**, with a template editor.
- **Apply template** options:
  - **Update existing, and add new shifts**
  - **Delete all and add new shifts**
  - **Keep existing shifts and add new shifts**
- Set how many times to apply it, and filter by employees, shift types or positions.
- **Apply as draft** or **Apply**, which publishes immediately.
- Working time rules are checked on apply.
- **Copy week** overwrites the target week's unapproved shifts.

**Open shifts.**

- Open shifts are shown in red. Eligible staff (right group, skills, available, no conflict) get an automatic push notification and **Request shift**.
- The manager assigns from **Pending requests** > Assign employee. Other requesters remain visible with a blue icon, which is useful for last-minute changes.

**Availability.**

- When assigning, a **green thumbs up** means available and a **red thumbs down** means unavailable. Hovering shows the employee's comment.
- Availability can be collected as Can / cannot work, as Intervals, or as start and end times.
- Managers can lock availability.
- People can still be scheduled when unavailable.

**Conflict warnings.**

- **Intelligent shift assignment** (Plus and Pro) sorts by **Basic Priority**, **Rule-Based Matching** or **Smart Recommendations**. Each person carries a status:
  - 🟢 "Available with xx hours remaining"
  - 🟠 **Caution**: for example "Will exceed contract rules by 2h", or not available
  - 🔴 **Critical conflict**: "Overlapping shift", "Absent", "Working time rules conflict", or "Will exceed contract by xx hours"
- No one is assigned automatically. "Schedule managers always have the final say."
- On mobile, a rule-breaking assignment is allowed but shows a **warning banner**.

**Auto-schedule.**

- The new agentic **Auto Schedule** (beta, Plus and Pro) takes 1 to 11 weeks and lets you exclude positions, employees or shift types.
- Start analysing takes about a minute. The result is applied **as a draft** with a banner and an **Undo available until** countdown. Hours and cost update live. **Keep changes** confirms it.
- It needs at least 2 weeks of history.
- An older Pro-only Auto-schedule tool also exists; its article was not read. **[unverified]**

**Publishing and notifications.**

- **Publish shifts** can cover all drafts or selected ones, can exclude employees, and can skip open shifts.
- Notify by Message (free) or SMS (paid). Each employee gets one notification.
- **Hide/show period** is a separate tool: it makes published shifts invisible without notifying anyone.

**Staff-side flows.**

- Three actions: **Swap**, **Hand over** (direct to one colleague) and **Sell**, which makes the shift appear yellow as an open shift for others to request.
- The colleague confirms first, then the manager.
- **Approval cutoff** (hours before the shift): 0 means never require approval, 50000 means always, 48 means require it within 2 days.

**Labor cost.** Revenue (actual and forecast) against payroll costs is shown at the bottom of the schedule. Payroll cost, salaried cost and Data Center formulas can also be displayed. Those articles were found but not read. **[unverified detail]**

---

### 1.8 Microsoft Teams Shifts (baseline reference)

- Each team gets one schedule. Schedule **groups** organise people by role or department.
- Each group has an **Open shifts** row.
- Add shifts by double-clicking or More options > Add shift.
- **Share with team** is Microsoft's word for publish. It opens a dialog with the timeframe and a choice to notify affected members, notify group members about open shifts, or **Do not notify**.
- Staff request open shifts, swap or offer shifts, and request time off.

### 1.9 Humanity (TCP Humanity Schedule): blocked

- help.humanity.com redirects to a login page.
- The marketing page was read. It mentions AI demand forecasting, auto-built compliant schedules, a drag-and-drop shift planning interface, conflict settings, and a mobile app (including Apple Watch) for open shifts, trades and time off.
- No help article was read. **Everything about Humanity is [unverified].** It is excluded from the matrix below.

---

## 2. Comparison matrix

Key: ✔ = read in docs. ✔* = read, with a plan restriction. ? = not verified. — = not offered according to the docs read.

| Capability | When I Work | Deputy | 7shifts | Homebase | Sling | Connecteam | Planday |
|---|---|---|---|---|---|---|---|
| Grid with people as rows and days as columns | ✔ users view | ✔ by Team member | ✔ List | ✔ | ✔ | ✔ | ✔ Employees |
| Alternative axis | position, job site, coverage | by Area | List by role, Time frames | View By dept/role | Group by | jobs, layers, list | Groups, Positions |
| Day / week / month views | D, W, 2W, M | D, W, 2W, M | D, W (+month in Tools) | W (+D) ? | D, W, M, custom | D, W, M | D, W, 2W, M, Calendar |
| Drag to move / modifier-drag to copy | ✔ / Ctrl | ✔ / C+V | ✔ / Shift | ✔ / copy-paste | ✔ / Ctrl | ✔ | ✔ / Alt |
| Live eligibility cue while dragging | thumbs up/down, green check | — ? | — ? | — ? | — ? | — ? | — ? |
| Shift templates | ✔ (sorted by availability fit) | ✔ US only ? | via scheduling templates | "frequent shifts" | ✔ panel + drag | ✔ panel + drag | Shift types |
| Week/day schedule templates | ✔ D/W | ✔ D/W/2W | ✔* | ✔ W | ✔* | ✔* | ✔ D/W |
| Copy previous week | ✔ with conflict modes | ✔ | ✔ up to +3 weeks | ✔ subset | ✔ any range | via templates | ✔ Copy week |
| Conflict handling on copy/load | Overwrite / Allow / Avoid→OpenShifts / all→OpenShifts | — ? | Merge / Delete | — ? | skip checks option | replace / add | Update / Delete all / Keep |
| Unassigned "structure" shifts (manager-only) | — (OpenShifts row) | **Empty shift** | Unassigned section | — ? | **Unassigned** row | Shifts without users | — (open) |
| Open shifts, first come first served | ✔ | ✔ | — (always bid) | — (claim then approve) | ✔ (auto-approve slots) | ✔ | — (request) |
| Open shifts with manager pick | ✔ Require pick up approval | ✔ with approval | ✔ bids | ✔ | ✔ applications | ✔* | ✔ |
| Headcount slots on one shift | How Many (copies) | — ? | — ? | — ? | ✔ Slots | ✔ spots | Copies |
| Targeted offer to chosen people | ✔ View who's eligible | ✔ Send offers | ✔ role or people | ✔ cover invites | Offer shift | ✔ | ✔ |
| Availability shown on grid | green/grey bars & flags | Time off area, hover | ✔ | ? | ✔ | red/green corners | thumbs in picker |
| Time-off approval in scheduler | ✔ | ✔ | ✔ click cell | add only ? | ✔ | ✔ | ✔ |
| Conflict warnings | red flag, Scheduling Concerns | Not recommended, triangle | Warnings dropdown | Conflicts sidebar | Conflicts filter | Issues, red ! | Caution / Critical |
| Overtime visibility while building | ✔ badges + totals | ✔ beta tag | ✔ in Warnings | ✔ in AI builder | ✔ alerts ? | ✔ limits in red | ✔ contract rules |
| Manager can override | ✔ (not for employees) | ✔ except overlap | ✔ | ✔ except blocking AI conflicts | ✔ | ✔ | ✔ |
| Pre-publish concern summary | ✔ publish dialog | status bar counts | Warnings + Quick Fix | Conflicts sidebar (blocking) | — ? | Issues tab | Working time rule report |
| Auto-fill people into existing shifts | Auto-Assign | Auto Fill Empty Shifts | Fill from Template / Quick Fix | Recommended Schedule | Auto-assign* | auto-assign | Intelligent assignment (suggest only) |
| Auto-generate shift structure | — | Auto Build Shift Structure | — ? | ✔ AI Schedule Builder | — | — | ✔ Auto Schedule beta |
| Draft vs published visual | stripes vs solid | grey vs green | light yellow vs white | purple button | toggle | draft vs published | orange vs grey |
| Publish scope | date range, users, positions, OpenShifts | areas in view | depts, roles, days, single shift | dept/role* | filters in view | ✔ | selected drafts |
| Notify options | changed / all / message | updates vs all × confirm / notify / silent | changed / everyone / no one | choose recipients | auto | custom bell | Message / SMS |
| Shift confirmation by staff | ✔ (default on) | ✔ CONFIRMING, auto-open on lapse | ? | ? | ✔* [?] / ✔ / [!] | ✔ green/red dot | ? |
| Swap | ✔ | ✔ | ✔ Trade | ✔ Trade | ✔* | ✔ | ✔ |
| Drop / offer to coworker | ✔ Drop | ✔ Offer | ✔ Offer Up | ✔ Request Cover | ✔ Offer | ✔ Offer | ✔ Hand over |
| Release to open pool | ✔ Release | — (manager Find replacement) | Offer Up to all | — ? | Make available | — ? | ✔ Sell |
| Manager approval configurable | ✔ | ✔ swaps only | ✔ | always | ✔ | ✔ per type | ✔ hours-before cutoff |
| "Still your shift until approved" rule | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Labor cost while scheduling | Forecast Tools | Stats panel + budgets | Labor Budget Tool | Forecast bar | settings ✔, display ? | Labor costs row | revenue vs payroll |
| Over/under budget colour | difference in $ | green/red + triangle | green/red pill | ? | alert pop-up ? | red over limit | ? |
| Mobile manager scheduling | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

---

## 3. The common workflow and the screens every serious tool has

### 3.1 The common workflow [inference, built from the per-tool evidence above]

All seven tools describe the same loop, in nearly the same order:

1. **Set up** locations or departments, then roles or positions, then people with wages and qualifications. Deputy, 7shifts and When I Work all say employees will not appear in the builder until this is done.
2. **Open the week** on the schedule grid and filter it to one department or area.
3. **Seed the week.** Copy the previous week, load a template, or run auto-schedule. Every tool lands the seeded shifts as unpublished drafts.
4. **Adjust by hand.** Click a cell, use a template or custom shift, drag, and copy.
5. **Fill gaps.** Turn uncovered shifts into open or available shifts, or send targeted offers.
6. **Review warnings.** Look at conflicts, overtime, rest, availability and unassigned shifts. Then fix them, override them or auto-fix them.
7. **Check cost** against a budget or sales target in a bar or panel docked to the grid.
8. **Publish** a chosen scope and choose who gets notified (only changes, everyone, or nobody).
9. **Staff respond.** They confirm or decline, claim or bid on open shifts, and request swaps, drops or covers.
10. **Approve requests** in an inbox: claims, swaps and time off.
11. **Republish changes.** Notify only the people affected.

### 3.2 The 10 screens every serious tool has

| # | Screen | What it holds | Evidence |
|---|---|---|---|
| 1 | **Schedule grid (week view)** | Rows are people, or roles/areas; columns are days. It has an open/unassigned row at the top, per-person hours and cost in the left column, and per-day totals. | All 7 |
| 2 | **Shift editor (modal or drawer)** | Who (or Open), time, break, role or area, notes, repeat, how many, approval-required toggle, save as template, draft/publish toggle. The **assignee picker ranks people by fit**. | All 7. Ranking is in Deputy, WIW, Planday and Homebase cover. |
| 3 | **Template / copy chooser** | Copy previous week or day, load or save a template, and a conflict-handling choice. | All 7 |
| 4 | **Warnings / issues panel** | Counts by type (conflict, overtime, rest, unavailable, unassigned, unconfirmed). "Show on schedule" filters the grid; an optional auto-fix is offered. | 7shifts, Connecteam, Homebase, Deputy status bar, WIW publish dialog |
| 5 | **Labor/budget strip** | Hours, wages, sales, labor % and target per day, with over or under colours. | WIW, Deputy, 7shifts, Homebase, Connecteam, Planday |
| 6 | **Publish dialog** | Scope (dates, departments, roles, people), notify mode (changes / all / none), message, change count. | All 7 |
| 7 | **Requests inbox (manager)** | Open-shift claims or bids, swaps, drops or offers, and time-off requests. Each item shows status, applicants and impact warnings, with Approve or Deny. | All 7 |
| 8 | **Availability and time off** | Recurring and one-off availability or unavailability; time-off requests with approval; blocked days. | All 7 (Homebase partially read) |
| 9 | **Staff "My Schedule" home (mobile-first)** | Upcoming shifts with Confirm or Decline; **Available / Open shifts** list; a "Can't work / Find cover / Get Shift Covered" entry point. | All 7 |
| 10 | **Staff cover flow** | Choose swap, offer or release; pick eligible coworkers; add a message; see the responsibility notice; track status. | All 7 |

Two more screens appear in the more mature tools:

- **Shift history / activity log**: Deputy, 7shifts, Sling, Planday and Connecteam.
- **Rules / settings**: scheduling rules or stress profiles, and swap approval policy.

---

## 4. Patterns that differ, and which looks best

| Pattern | Variants seen | Best for Vue, and why [inference] |
|---|---|---|
| **Placeholder vs offered shift** | Deputy separates **Empty** (planning scaffold, cannot be published) from **Open** (offered). Sling separates **Unassigned** (manager-only) from **Available** (staff-visible). 7shifts has an Unassigned section. WIW and Planday merge the two into "open". | **Keep them separate (the Deputy/Sling model).** Wedding staffing starts from a structure such as "6 servers, 2 bartenders" before anyone is known. An unfilled slot is not the same thing as an offer to staff. Sling's **Slots** count (people still needed) maps directly onto event headcount. |
| **How an override is surfaced** | Deputy ranks the picker (Recommended first, yellow dot for the rest), blocks only overlap, and keeps a **triangle** on overridden shifts. WIW marks conflicts with a red flag and repeats concerns in the publish dialog. 7shifts gathers everything in one **Warnings** dropdown with View on Schedule. Planday labels Caution and Critical with plain-language reasons ("Will exceed contract by 2h"). | **Combine three of these.** Use Planday-style reason text inside a Deputy-style ranked picker, then a 7shifts-style single warnings summary before publish. Block only physical impossibilities (double-booking), as Deputy does. The override should be explicit, recorded, and stay visible on the shift. |
| **Blocking vs warning** | 7shifts states that it never blocks ("final decision remains with" the manager). Homebase's AI builder **blocks publish** until pending time off, overtime and rest conflicts are resolved. WIW warns managers but *enforces* rules on staff self-service. | **Use WIW's asymmetry.** Managers get warnings they can override. Staff self-service (claims, swaps) silently filters out anyone it would make ineligible. This stops staff from creating violations without slowing the manager. |
| **Open-shift claiming** | First come first served (WIW default, Deputy, Connecteam default). Bid then pick (7shifts always, WIW and Deputy "with approval", Planday). Auto-approve up to N slots (Sling). | **Default to bid-then-pick, with a per-shift toggle.** At weddings, the manager cares who works (lead bartender, experience). Deputy's sort keys for choosing among requests (cost, hours this week, request time) are worth copying. |
| **Seeding the week** | Copy with explicit conflict modes (WIW: Avoid Conflicts sends collisions to OpenShifts). Merge vs Delete (7shifts). Templates as staffing blueprints with skill-level slots and auto-fill (7shifts). Generative drafts with Undo (Planday, Homebase). | **Event-type templates, built like 7shifts' blueprint.** Each slot is a role plus count plus optional specific person, and filling it auto-assigns available people. Add WIW's "send conflicts to open" fallback. Weddings recur by event type ("Saturday ceremony + reception, 120 guests") rather than by week, so the template should attach to an event, not a calendar week. |
| **Publish scope and notify** | Deputy: Publish updates vs Publish all, crossed with Require confirmation / Notify / Silent. 7shifts: department, role and day checkboxes, single-shift publish, Only those with changes as the default, and Published / Partial / Mixed status. WIW: publish button colour shows state (green, orange, grey). | **7shifts' modal with Deputy's confirmation option.** Default to "only people with changes". Offer "require confirmation" for event staff. Show a count of pending changes on the button, as WIW and Deputy do. |
| **Staff confirmation** | Deputy: CONFIRMING label, and the shift auto-converts to Open if the window lapses. Sling: [?], ✓ and [!], and a denied shift stays assigned. Connecteam: green or red dot, grey while pending. WIW: a badge per person. | **Deputy's lapse-to-open rule plus a per-person badge.** A wedding cannot run on unconfirmed staff. Turning a lapsed confirmation automatically into an offer is the strongest pattern seen. |
| **Swap/cover approval policy** | Always (Homebase). Toggle (WIW, 7shifts, Sling, Deputy for swaps; Deputy offers never need approval). Per request type (Connecteam). **Time-based cutoff** (Planday: approval only within N hours of the shift). | **Planday's cutoff.** Changes far ahead can flow freely; changes close to the event need sign-off. This matches how event risk grows as the date approaches. |
| **Auto-schedule shape** | Assign people into existing shifts (WIW, Sling, Connecteam, Deputy Auto-fill). Build the structure, then fill (Deputy). Generate a whole draft from history (Planday, Homebase). All land as drafts; Planday and Connecteam give Undo or Reshuffle. | **Fill-only, with Undo and Reshuffle (Connecteam), ranked by fairness and cost (Deputy).** Structure should come from the event (guest count to headcount), not from history. Deputy's "Required staff" model is the right idea for that. |
| **Cost display** | A bottom strip with targets (7shifts, WIW, Homebase, Planday). A collapsible stats panel with graphs (Deputy). A row per day (Connecteam). | **Per-event cost against budget, with a green or red pill (7shifts).** Weddings are priced per event, so cost per event matters more than labor % of daily sales. |

**Overall best reference per area [inference]:**

| Area | Reference tool | Why |
|---|---|---|
| Warnings model | Deputy | Most complete and most consistent model of a recommended person |
| Pre-publish review | 7shifts | Clearest review step, with Warnings, Quick Fix and the publish modal |
| Templates | When I Work | Best template and copy ergonomics: availability-sorted templates and conflict modes on copy |
| Request inboxes | Connecteam | Best approval screens, showing hours before and after plus a calendar |
| Swap policy | Planday | The hours-before-shift approval cutoff |
| Slots and draft visibility | Sling | Unassigned vs available rows, slot counts, and the draft/publish toggle in the modal |

---

## 5. Source table

Accessed 2026-10-09 for every row. Status values:

- **read**: the full article text was retrieved and read.
- **search-summary-only**: seen only in WebSearch result summaries.
- **blocked**: could not be retrieved.

Notes on retrieval method:

- Deputy and 7shifts HTML pages return 403 to WebFetch. Their article bodies were read through each vendor's public Zendesk Help Center API, which serves the same article body.
- When I Work articles were read through the help site's public WordPress REST API.
- Homebase articles were rendered in Chrome and their text extracted.

### When I Work

| URL | Status |
|---|---|
| https://help.wheniwork.com/articles/scheduler-reference-guide-computer/ | read |
| https://help.wheniwork.com/articles/creating-and-managing-schedules-computer/ | read |
| https://help.wheniwork.com/articles/how-shift-templates-work/ | read |
| https://help.wheniwork.com/articles/using-schedule-templates-computer/ | read |
| https://help.wheniwork.com/articles/copying-shifts-and-schedules-computer/ | read |
| https://help.wheniwork.com/articles/publishing-the-schedule-computer/ | read |
| https://help.wheniwork.com/articles/how-openshifts-work/ | read |
| https://help.wheniwork.com/articles/scheduling-an-openshift-computer/ | read |
| https://help.wheniwork.com/articles/process-openshift-requests-computer/ | read |
| https://help.wheniwork.com/articles/bid-on-openshifts-openshift-requests/ | read |
| https://help.wheniwork.com/articles/getting-your-shifts-covered/ | read |
| https://help.wheniwork.com/articles/processing-shift-requests-computer/ | read |
| https://help.wheniwork.com/articles/accepting-shift-swap-and-drop-requests/ | read |
| https://help.wheniwork.com/articles/identifying-scheduling-conflicts/ | read |
| https://help.wheniwork.com/articles/interpreting-availability-on-the-schedule-computer/ | read |
| https://help.wheniwork.com/articles/auto-assign-shifts/ | read |
| https://help.wheniwork.com/articles/scheduling-rules-reference/ | read |
| https://help.wheniwork.com/articles/viewing-labor-costs-while-scheduling-computer/ | read |
| https://help.wheniwork.com/articles/overtime-visibility/ | read |
| https://help.wheniwork.com/articles/max-hours-enforcement-reference/ | read |
| https://help.wheniwork.com/articles/using-shift-confirmation-computer/ | read |

### Deputy

| URL | Status |
|---|---|
| https://help.deputy.com/hc/en-au/articles/4688713423759-Schedule-overview | read (API) |
| https://help.deputy.com/hc/en-au/articles/17528718577807-Get-started-with-scheduling | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/17528671575567-Create-and-edit-shifts | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/17528687998095-Build-schedules-faster-with-templates-and-bulk-actions | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/4688863723791-Saving-and-loading-schedule-templates | read (API) |
| https://help.deputy.com/hc/en-au/articles/17528716522127-Publish-and-share-schedules | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/4688746992399-Publishing-shifts | read (API) |
| https://help.deputy.com/hc/en-au/articles/17528745867535-Fix-scheduling-issues | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/15192896170895-How-do-I-turn-on-and-understand-overtime-warnings-on-the-schedule-BETA | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688892429839-Using-Auto-scheduling | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688889483919-Auto-fill-empty-shifts-in-the-schedule | read (API) |
| https://help.deputy.com/hc/en-au/articles/17528691686415-Manage-schedule-costs-budgets-and-Business-Insights | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/4764591177871-Using-the-stats-panel-for-smarter-scheduling | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688698300687-Managing-Open-shifts | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688725542415-Open-shifts-with-approval | read (API) |
| https://help.deputy.com/hc/en-au/articles/17528717515279-Manage-open-shifts-swaps-and-schedule-changes | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/4614775254671-How-to-swap-or-offer-your-shift-to-a-co-worker | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688726501135-Allow-team-members-to-swap-or-offer-shifts | read (API) |
| https://help.deputy.com/hc/en-au/articles/17634845156367-View-and-manage-your-shifts | read (API; index page) |
| https://help.deputy.com/hc/en-au/articles/4688987465743-How-do-I-find-a-replacement-for-a-team-member-that-can-t-work | read (API) |
| https://help.deputy.com/hc/en-au/articles/4658282900111-Add-update-or-delete-your-team-member-s-availability-and-unavailability | read (API) |
| https://help.deputy.com/hc/en-au/articles/6054132302991-Shift-status | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688700112015-How-do-I-ensure-that-a-team-member-is-recommended-for-a-shift | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688708441487-Shift-confirmation | read (API) |
| https://help.deputy.com/hc/en-au/articles/4658226793999-Set-up-stress-profiles-and-fatigue-management | read (API) |
| https://help.deputy.com/hc/en-au/articles/4764614694927-Setting-schedule-budgets | read (API) |
| https://help.deputy.com/hc/en-au/articles/4688788027151-Shift-templates-U-S-only | search-summary-only (title only) |
| https://help.deputy.com/hc/en-au/articles/11087009582351-How-to-approve-and-decline-leave-requests | search-summary-only (title only) |

### 7shifts

| URL | Status |
|---|---|
| https://kb.7shifts.com/hc/en-us/articles/49201034124691-7shifts-101-How-to-navigate-the-Schedule | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/31134884076563-Build-and-Publish-Your-First-Schedule | read (API); WebFetch 403 |
| https://kb.7shifts.com/hc/en-us/articles/4417514096915-Add-shifts-to-a-schedule | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417514210067-How-to-publish-a-schedule | read (API); WebFetch 403 |
| https://kb.7shifts.com/hc/en-us/articles/53539700601491-What-s-new-on-the-Schedule-page | read (API); WebFetch 403 |
| https://kb.7shifts.com/hc/en-us/articles/4417514429459-How-to-create-and-use-scheduling-templates | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417513461267-Copying-a-Schedule | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417519854227-Open-Shifts | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/31854832817299-7shifts-101-The-Shift-Pool | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417505005459-Approve-or-Deny-Shift-Pool-Requests | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417514302995-Set-Up-and-View-Shift-Trading | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/5715358216595-Overtime-Warnings | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/31604382787603-Scheduling-with-Compliance | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/5130561132819-Quick-Fix-Scheduling | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/38813443647379-Why-does-7shifts-allow-scheduled-shifts-that-violate-labor-rules-configured-in-our-account | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417514442771-Use-the-Labor-Budget-Tool-to-plan-labor-costs | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417513664659-7shifts-101-Availability | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417513783827-Approving-Declining-Time-Off-Requests | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/31927861673235-How-to-Bid-on-an-Open-Shift | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417520138643-Offer-up-a-shift-to-the-Shift-Pool | read (API) |
| https://kb.7shifts.com/hc/en-us/articles/4417505341715-How-to-Trade-Shifts-for-Employees | read (API) |

### Homebase

| URL | Status |
|---|---|
| https://support.joinhomebase.com/s/article/Schedule-Builder | read (Chrome render); WebFetch and curl returned an empty shell |
| https://support.joinhomebase.com/s/article/Step-3-Adding-Editing-Shifts-in-the-Schedule | read (Chrome) |
| https://support.joinhomebase.com/s/article/How-to-Create-Templates-Copy-Schedules | read (Chrome) |
| https://support.joinhomebase.com/s/article/Open-Shifts-in-Homebase | read (Chrome) |
| https://support.joinhomebase.com/s/article/Trading-and-covering-shifts | read (Chrome) |
| https://support.joinhomebase.com/s/article/How-to-Find-Coverage-for-Your-Team-s-Shifts | read (Chrome) |
| https://support.joinhomebase.com/s/article/How-to-Automatically-Create-a-Schedule | read (Chrome) |
| https://support.joinhomebase.com/s/article/Labor-Control-Forecasting | read (Chrome) |
| https://support.joinhomebase.com/s/article/Compliance-Breaks-and-Overtime | read (Chrome); about breaks and time clock, not scheduling |
| https://support.joinhomebase.com/s/article/How-to-Set-Your-Availability-on-Homebase | search-summary-only (URL from sitemap, not read) |
| https://support.joinhomebase.com/s/article/Requesting-time-off | search-summary-only (URL from sitemap, not read) |
| https://www.joinhomebase.com/employee-scheduling/auto-scheduling | search-summary-only |
| https://www.joinhomebase.com/employee-scheduling/shift-swapping-software | search-summary-only |

### Sling

| URL | Status |
|---|---|
| https://support.getsling.com/en/articles/511129-creating-a-shift | read |
| https://support.getsling.com/en/articles/1821074-conflicts | read |
| https://support.getsling.com/en/articles/2772240-publishing-the-schedule | read |
| https://support.getsling.com/en/articles/511209-unassigned-versus-available-shifts | read |
| https://support.getsling.com/en/articles/1078483-available-shifts | read |
| https://support.getsling.com/en/articles/5617417-shift-applications | read |
| https://support.getsling.com/en/articles/5203721-auto-assign-shifts | read |
| https://support.getsling.com/en/articles/511144-schedule-templates | read |
| https://support.getsling.com/en/articles/3527630-shift-templates | read |
| https://support.getsling.com/en/articles/511136-copying-shifts | read |
| https://support.getsling.com/en/articles/4319967-shift-acceptance | read |
| https://support.getsling.com/en/articles/3609219-shift-icons-legend | read |
| https://support.getsling.com/en/articles/1997150-publish-specific-shifts | read |
| https://support.getsling.com/en/articles/1407661-available-slots | read |
| https://support.getsling.com/en/articles/3104957-getting-your-coverage-right | read |
| https://support.getsling.com/en/articles/1085732-what-are-the-differences-between-available-shifts-offers-and-swaps | read |
| https://support.getsling.com/en/articles/1084628-how-do-i-offer-my-shift-to-another-employee | read |
| https://support.getsling.com/en/articles/2686630-how-do-i-swap-a-shift | read |
| https://support.getsling.com/en/articles/1246075-unavailability-versus-time-off | read |
| https://support.getsling.com/en/articles/5590033-review-time-off-requests | read |
| https://support.getsling.com/en/articles/1085726-how-do-i-set-up-the-labor-cost-function | read |
| https://support.getsling.com/en/articles/660998-how-do-i-measure-overtime | read |
| https://support.getsling.com/en/articles/1092985-group-by | read |
| https://support.getsling.com/en/articles/2686633-roster | read |
| https://support.toasttab.com/en/article/Sling-by-Toast-Create-a-Schedule?lang=en_US | search-summary-only |

### Connecteam

| URL | Status |
|---|---|
| https://help.connecteam.com/en/articles/4100339-starting-guide-to-the-job-scheduler | read |
| https://help.connecteam.com/en/articles/16643905-master-your-schedule-how-to-make-it-work-for-you | read |
| https://help.connecteam.com/en/articles/3524929-schedule-templates | read |
| https://help.connecteam.com/en/articles/5770700-open-shift-approval | read |
| https://help.connecteam.com/en/articles/10511320-reject-and-confirm-shifts | read |
| https://help.connecteam.com/en/articles/16644414-let-s-settle-this-once-and-for-all-shift-swap-or-shift-replacement | read |
| https://help.connecteam.com/en/articles/12829136-starting-guide-to-scheduling-rules-and-shift-quotas | read |
| https://help.connecteam.com/en/articles/10165649-how-to-view-scheduled-labor-actual-labor-and-sales-data-in-the-schedule | read |
| https://help.connecteam.com/en/articles/5134735-how-to-use-layers-in-the-job-schedule | read |
| https://help.connecteam.com/en/articles/9745134-job-schedule-issues | read |
| https://help.connecteam.com/en/articles/8123269-your-scheduling-flow-with-connecteam | read |
| https://help.connecteam.com/en/articles/8886939-automatically-assign-shifts-in-connecteam | read |
| https://help.connecteam.com/en/articles/6800236-admin-approval-for-shift-replacements | read |
| https://connecteam.com/employee-scheduling-app/ | search-summary-only |

### Planday

| URL | Status |
|---|---|
| https://help.planday.com/en/articles/30153-scheduling-explained | read |
| https://help.planday.com/en/articles/30397-create-or-edit-shifts | read |
| https://help.planday.com/en/articles/30569-how-to-use-draft-shifts-in-planday | read |
| https://help.planday.com/en/articles/30398-move-copy-delete-or-approve-shifts | read |
| https://help.planday.com/en/articles/30399-open-shifts-shift-requests-and-shift-swaps-for-schedule-managers | read |
| https://help.planday.com/en/articles/30423-create-and-use-schedule-templates | read |
| https://help.planday.com/en/articles/30427-schedule-based-on-employee-availability | read |
| https://help.planday.com/en/articles/572390-how-planday-suggests-employees-for-shifts | read |
| https://help.planday.com/en/articles/760172-how-to-generate-a-schedule-automatically-with-the-new-auto-schedule-beta-plus-pro | read |
| https://help.planday.com/en/articles/30314-how-to-swap-handover-or-sell-shifts-in-the-planday-app | read |
| https://help.planday.com/en/articles/30312-how-to-pick-up-open-shifts-in-the-planday-app | read |
| https://help.planday.com/en/articles/114705-schedule-related-notifications | read |
| https://help.planday.com/en/articles/30439-how-to-use-the-auto-schedule-tool-pro-plan-only | search-summary-only (title from collection list) |

### Microsoft Teams Shifts

| URL | Status |
|---|---|
| https://support.microsoft.com/en-us/teams/shifts/schedule-staff-shifts | read |

### Humanity

| URL | Status |
|---|---|
| https://help.humanity.com/ (redirects to /app/ login) | blocked |
| https://humanity.tcpsoftware.com/blog/tech-tip-introduction-to-the-shiftplanning-module.html | read; now redirects to the Humanity Schedule marketing page, so marketing claims only |
| https://www.humanity.com/blog/convenient-and-efficient-shift-trading-processed-on-our-mobile-scheduling-app.html | blocked (404) |

### Other

| URL | Status |
|---|---|
| Generic results such as mangoapps.com, zoomshift and shiftflow, returned by the first searches | search-summary-only; not used |
