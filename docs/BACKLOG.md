# Vue: product backlog from competitor complaints

Derived from [`research/WEDDING-PLATFORM-COMPLAINTS.md`](./research/WEDDING-PLATFORM-COMPLAINTS.md) (Dubsado and Aisle Planner). Complaint IDs `C#` and complexity causes `L#` refer to that file. Vue context: a wedding-venue operations web app (events split into timeline blocks, staffing, couples, vendors, tasks, messages, documents, payments, an Up Next list; Staff Planner in progress). See [`DATA-DICTIONARY.md`](./DATA-DICTIONARY.md), [`STYLE-GUIDE.md`](./STYLE-GUIDE.md), [`STAFF-PLANNER-SPEC.md`](./STAFF-PLANNER-SPEC.md).

Evidence caveat: the complexity theme is well supported (Dubsado strongly, Aisle Planner weakly). Most other complaints rest on one or two sources and are hypotheses. Reddit, G2 and Capterra reviews could not be read directly.

---

## Scoring method

`Score = Impact x Frequency / Effort`

- **Impact (1 to 5):** how much it hurts a venue manager or coordinator if Vue gets this wrong. Complexity items that block first use score 5.
- **Frequency (1 to 5):** how often the complaint appears in the research (5 = the dominant theme, 1 = a single source), adjusted for whether a venue user would meet it.
- **Effort:** S = 1 (days), M = 2 (about 1 to 2 weeks), L = 4 (multi-week).
- **Priority:** P0 = score 10 or more, P1 = 5 to 9.9, P2 = under 5. Complexity items are listed first regardless of score, since that is the stated focus; no complexity item is below P1.

---

## Summary table

| ID | Title | Answers (platform) | Pri | Effort | Score |
|---|---|---|---|---|---|
| **Learning curve and complexity** | | | | | |
| B-01 | Time-to-first-value target: first event in under 10 minutes | L2, L3 (D) | P0 | M | 12.5 |
| B-02 | Opinionated defaults, no blank canvas | L1, L10 (D); AP templates | P0 | M | 12.5 |
| B-03 | Guided first-run checklist and sample data | L2, L8, L9 (D); AP "how to get started" | P0 | M | 10 |
| B-04 | Progressive disclosure of advanced options | L13 (D); AP breadth | P0 | M | 10 |
| B-05 | Concept budget and a small, fixed navigation | L3, L6 (D) | P0 | S | 16 |
| B-06 | Plain wording and one term per thing | L6, L3 (D) | P0 | S | 12 |
| B-07 | Consistent page pattern and "where is it?" search | L6, C34 (D); AP "zero user friendliness" | P0 | S | 12 |
| B-08 | Few, named templates (copy an event, not build one) | L1, L7 (D) | P1 | M | 8 |
| B-09 | Teach in the product: empty states, hints, short help | L8, L9, C32 (D) | P1 | M | 6 |
| B-10 | Built-in reminders instead of user-built automations | L3, L4, L5, L12 (D) | P1 | M | 8 |
| B-11 | Safe to explore: drafts, previews, undo | C7 (D); L4 | P1 | S | 6 |
| **Other themes** | | | | | |
| B-12 | Notification control and quiet digest | C11 (AP) | P1 | S | 9 |
| B-13 | Phone-ready core flows (staff, day-of) | C16, C17 (D); C18 (AP) | P1 | M | 8 |
| B-14 | Real help and support promise | C30, C31, C32 | P1 | S | 9 |
| B-15 | Space and date clash guard | C27 (D) | P1 | S | 6 |
| B-16 | Fast pages | C33 (D) | P2 | M | 3 |
| B-17 | Simple reports (coverage, payments, guarantees) | C29 (D) | P2 | M | 4.5 |
| B-18 | Roles and permissions | C35, C36 (D) | P2 | M | 3 |
| B-19 | Couple view and replies inside Vue | C12, C13, C15 (AP, D) | P2 | L | 2.3 |
| B-20 | Payment schedule reminders and safe bank entry | C22, C23, C24 | P2 | M | 3 |
| B-21 | Import couples, events, vendors, staff from CSV | C40 (AP) | P2 | M | 4 |
| B-22 | Printable run of show and day-of sheet | C37 (D); C38 (AP) | P2 | M | 4 |
| B-23 | Calendar sync (multiple calendars) | C20 (D) | P2 | M | 3 |
| B-24 | Vendor confirmation links | C37 (D) | P2 | M | 3 |
| B-25 | Floor plan and layout (deferred) | C18, C39 (AP) | P2 | L | 1 |

### Dropped (not applicable to a venue app)

| ID | Item | Complaint | Reason |
|---|---|---|---|
| X-01 | Subscription tiers, per-project and per-user pricing | C1 to C6 (D, AP) | Business model, not an app feature. Lesson kept informally: do not gate core value behind a plan. |
| X-02 | Contractor payouts and 1099 | C25 | Payroll and clock-in are out of scope in the Staff Planner spec. |
| X-03 | Card and ACH processing fees | C26 | Vue is not a payment processor. |
| X-04 | Zola, The Knot and wedding-website integrations | C19 | Guest-facing planner tools; venues are not the system of record for guest sites. |
| X-05 | RSVP, guest lists, table configuration | C38 | Couple and planner territory; Vue tracks only the guarantee. |
| X-06 | Task dependencies and Gantt charts | C8 | Over-scoped for event checklists; Up Next covers priority. Revisit only if venues ask. |
| X-07 | Full lead-capture, proposal and contract builder | L3 (D) | Building a CRM is exactly the complexity being avoided. Vue keeps booking status only. |
| X-08 | Multilingual interface | C42 | No venue demand seen; revisit later. |
| X-09 | Native mobile app | C16 | Web app only for now; B-13 covers mobile web. |
| X-10 | Branded client forms, style guides, design studio | L3 (D, AP) | Planner marketing features, not venue operations. |

---

## Details

### Learning curve and complexity

#### B-01: Time-to-first-value target
- **Answers:** Dubsado needs 15 to 25 hours before it works; trials end before value (L2, L3).
- **Story:** As a venue manager trying Vue, I want to see my first real event staffed and on Up Next in under 10 minutes, so I decide quickly that it is worth keeping.
- **Priority P0:** the most-cited competitor weakness; Vue can win on it directly.
- **Effort:** M
- **Acceptance criteria:**
  - A new user can create an event with a couple, date and guarantee using only three required fields (name, date, couple name).
  - After that, the event shows the default timeline blocks and staffing needs without further setup.
  - Event appears in Up Next and Week within the same session.
  - Measured with a stopwatch test on 5 first-time users: median under 10 minutes to "first event staffed". Record it in this file.
  - No screen in the first-run path requires a setting, template or automation to be configured.

#### B-02: Opinionated defaults, no blank canvas
- **Answers:** "Build every automation, form and contract from scratch" (D, L1); plan-gated automation (L10); AP template structuring.
- **Story:** As a new user, I want Vue to arrive already shaped like a wedding venue day, so I edit instead of build.
- **Priority P0:** removes the largest cause of Dubsado setup time.
- **Effort:** M
- **Acceptance criteria:**
  - New events get a default set of timeline blocks (Setup, Ceremony, Reception, Teardown) with the existing `kind` values.
  - Each block gets a default staffing requirement per role, editable.
  - A default task list for a wedding (guarantee, final payment, vendor confirmations) is created with dates calculated from the event date.
  - Roles, event types and booking statuses are pre-filled from `ROLES`, `EVENT_TYPES` and `BOOKING_STATUSES`.
  - No feature requires the user to create a template before first use.

#### B-03: Guided first-run checklist and sample data
- **Answers:** Dubsado "must watch tutorials" (L8); Aisle Planner "not easy to figure out how to get started" (L2).
- **Story:** As a first-time user, I want a short checklist and a sample event I can poke at, so I learn by doing.
- **Priority P0:** Dubsado users report that learning happens outside the product.
- **Effort:** M
- **Acceptance criteria:**
  - A dismissible card on the dashboard lists at most 5 steps (add an event, add staff, assign someone, publish, see Up Next) and ticks them automatically.
  - A "Try with sample data" option loads the seed events, and a "Clear sample data" action removes them with one confirm.
  - Sample items are labelled "Sample" so they cannot be confused with real data.
  - The checklist never blocks any other screen and can be reopened from Help.

#### B-04: Progressive disclosure of advanced options
- **Answers:** "Too heavy for what they needed" (D, L13); AP "loaded with features you may never use".
- **Story:** As a venue manager with one small team, I want to see only the common options, so the screen feels simple, and find the rest when I need it.
- **Priority P0:** keeps the first impression calm without removing power.
- **Effort:** M
- **Acceptance criteria:**
  - Each screen shows its primary action plus a "More options" section for rare ones (for example Offer to everyone, Assign anyway, Copy staffing).
  - Features appear after they are relevant (Publish dialog options only once an assignment exists).
  - No setting is hidden more than one click deep, and nothing disappears permanently.
  - A review of every screen records how many controls are visible by default; target at most 7 interactive controls beyond navigation.

#### B-05: Concept budget and fixed navigation
- **Answers:** Ten separate concepts to wire together in Dubsado (L3); poor sections (L6).
- **Story:** As a new user, I want a handful of ideas to learn, so I can explain Vue in one minute.
- **Priority P0:** cheap, and sets the rule that guards every later feature.
- **Effort:** S
- **Acceptance criteria:**
  - A "concept budget" is written in this file: Vue has at most 8 top-level nouns (event, couple, timeline block, staff, vendor, task, message, document) plus Up Next.
  - The sidebar has at most 8 items, no nested menus, and the same order on every page.
  - Any proposal for a new top-level concept must name which existing one it replaces or sits under.
  - The Staff Planner stays inside one sidebar item with a four-tab bar (per spec).

#### B-06: Plain wording, one term per thing
- **Answers:** Users cannot find sections or understand setup (L6); "workflow triggers" jargon (L5).
- **Story:** As a venue manager, I want the words on screen to match what I would say aloud.
- **Priority P0:** zero-cost win; the style guide already asks for it.
- **Effort:** S
- **Acceptance criteria:**
  - A glossary section in DATA-DICTIONARY.md lists the one approved word per concept; screens use only those words ("assignment" and "shift" only where the spec allows).
  - No screen uses terms like workflow, trigger, automation, canned email, smart file.
  - Buttons say what happens ("Publish and notify 4 people"), per STYLE-GUIDE section 5.
  - A copy check (grep list of banned words) is run before release.

#### B-07: Consistent page pattern and findability
- **Answers:** "I struggle understanding what sections to find things" (D, L6); AP "zero user friendliness" (L5); dated and inconsistent UI (C34).
- **Story:** As a user, I want every page to work the same way, so I never wonder where something lives.
- **Priority P0:** the dominant sub-complaint inside complexity.
- **Effort:** S
- **Acceptance criteria:**
  - Every page uses `PageHeader`, `Breadcrumbs` and `Tabs` as the style guide describes; one filled primary button per region.
  - Event sub-pages (Tasks, Messages, Documents, Payments, Staffing, Timeline, Activity) always appear in the same tab order.
  - A global "Go to" search (events, couples, staff, vendors) is reachable from the top bar on every page.
  - Audit: 10 listed tasks (for example "find who declined the ceremony") each reachable in 3 clicks or fewer.

#### B-08: Few, named templates (copy an event)
- **Answers:** Template piles with no folders (L7); "structure templates and workflows" (AP).
- **Story:** As a coordinator, I want to start a new event by copying one I already ran, so I do not build structure again.
- **Priority P1:** valuable, but B-02 defaults already cover first use.
- **Effort:** M
- **Acceptance criteria:**
  - "Copy from another event" is offered when creating an event; it copies blocks, staffing needs and tasks but not people, payments or messages.
  - At most 5 saved starting points are shown (recent events); no template management screen exists.
  - The Staff Planner "Copy staffing from another event" uses the same mechanism.

#### B-09: Teach in the product
- **Answers:** Dependence on videos, courses and consultants (L8, L9, C32).
- **Story:** As a new user, I want each empty screen to tell me what it is for and what to do next.
- **Priority P1:** removes the need for outside teaching.
- **Effort:** M
- **Acceptance criteria:**
  - Every `EmptyState` has one sentence of purpose and one action.
  - Hover or tap hints on technical terms (guarantee, open position, Up Next).
  - A "Help" page with at most 8 short articles, each under 150 words, linked from relevant screens.
  - No task in the 10-task audit in B-07 requires leaving the product to learn.

#### B-10: Built-in reminders instead of user-built automations
- **Answers:** Automation takes several tries and is hard to maintain (L4, L12); trigger confusion (L5).
- **Story:** As a venue manager, I want Vue to remind me and my couples at the right times without me designing rules.
- **Priority P1:** captures the value of Dubsado workflows at none of the cost.
- **Effort:** M
- **Acceptance criteria:**
  - Reminders (guarantee due, final payment due, vendor confirmation, unanswered message) appear in Up Next from fixed rules with dates from the event.
  - Each rule has an on/off switch and nothing else; no rule builder.
  - Rule behaviour is described in one sentence beside its switch.
  - Rules are derived (not stored), consistent with how Up Next works today.

#### B-11: Safe to explore
- **Answers:** Fear of breaking automations, several tries needed (C7).
- **Story:** As a cautious user, I want to see what will happen before it happens and be able to undo it.
- **Priority P1:** lowers the cost of learning by trying.
- **Effort:** S
- **Acceptance criteria:**
  - Publish and notify always shows a preview of who is notified (already in the Staff Planner spec).
  - Destructive actions (remove, clear sample data) offer Undo in the toast for 10 seconds.
  - Assignments stay in "Not sent" until published.

### Other themes

#### B-12: Notification control and quiet digest
- **Answers:** "Constant annoying email notifications" (AP, C11).
- **Story:** As a manager, I want to choose what emails or alerts I get, so Vue never nags.
- **Priority P1:** cheap and fits the "priority without stress" principle.
- **Effort:** S
- **Acceptance criteria:**
  - A notification settings screen with three choices: each event, daily digest, off.
  - Default is a daily digest.
  - Counts in the interface remain soft violet and show "to do first" only (STYLE-GUIDE section 8).

#### B-13: Phone-ready core flows
- **Answers:** Dubsado mobile "near-unusable"; AP floor plan hard on touch (C16, C17, C18).
- **Story:** As a venue manager walking the floor on event day, I want to check Up Next, staffing and the timeline on my phone.
- **Priority P1:** venue work happens on site.
- **Effort:** M
- **Acceptance criteria:**
  - Up Next, event overview, run of show and the Staff Planner board are usable at 375 px width with no horizontal scrolling.
  - Tap targets at least 44 px; the Assign panel becomes a bottom sheet (per spec).
  - Tested on iOS Safari and Android Chrome.

#### B-14: Real help and a support promise
- **Answers:** Dismissive or slow support; docs filled by third parties (C30, C31, C32).
- **Story:** As a user stuck on something, I want to ask for help inside the app and know when I will hear back.
- **Priority P1:** cheap trust builder.
- **Effort:** S
- **Acceptance criteria:**
  - A Help link on every page opens the Help page (B-09) and a "Contact us" form.
  - The form states the response time and confirms receipt.
  - Context (page, event) is sent with the request.

#### B-15: Space and date clash guard
- **Answers:** Scheduler double-booking (C27).
- **Story:** As a manager, I want a warning if two events want the same space at the same time.
- **Priority P1:** double-booking a venue space is costly; Vue already has `dateKey` and `spaces`.
- **Effort:** S
- **Acceptance criteria:**
  - Creating or editing an event warns when another event uses the same space and date.
  - Warnings do not block (consistent with the Staff Planner rule); the override is recorded in Activity.
  - Week and Calendar views show the clash.

#### B-16: Fast pages
- **Answers:** Lag when switching pages (C33).
- **Priority P2:** not reported for Vue; keep as a guardrail.
- **Effort:** M
- **Story:** As a user, I want pages to respond immediately.
- **Acceptance criteria:** Route changes render within 200 ms on a mid-range laptop for seed data; no loading spinner over 1 second on core screens.

#### B-17: Simple reports
- **Answers:** Thin reporting (C29).
- **Priority P2:** only one source; venues likely want a few numbers.
- **Effort:** M
- **Story:** As an owner, I want to see staffing coverage, guarantees and payments across the next 90 days.
- **Acceptance criteria:** One Reports page with three tiles (coverage by week, guarantees due, payments outstanding), each linking to the underlying list. No custom report builder.

#### B-18: Roles and permissions
- **Answers:** No role-based permissions (C35, C36).
- **Priority P2:** matters once more than one person uses Vue.
- **Effort:** M
- **Story:** As an owner, I want staff to see only what they need.
- **Acceptance criteria:** Three roles (Owner or manager, Coordinator, Staff). Staff see only their own assignments. Role is a single selector per person, no permission matrix.

#### B-19: Couple view and replies inside Vue
- **Answers:** No stand-alone portal; cannot see client replies in app; portal underused (C12, C13, C15).
- **Priority P2:** wanted, but large and not needed for the staffing focus.
- **Effort:** L
- **Story:** As a couple, I want one link to see my timeline, tasks and documents and message the venue.
- **Acceptance criteria:** A private share link per event shows timeline, tasks, documents and a message box; replies arrive in Messages linked to the couple; links can be revoked.

#### B-20: Payment schedule reminders and safe bank entry
- **Answers:** Failed ACH from a truncated digit; no auto recurring charge; re-entry of details (C22, C23, C24).
- **Priority P2:** payments are a mock in the prototype.
- **Effort:** M
- **Story:** As a manager, I want payments due dates reminded and bank details checked before they are saved.
- **Acceptance criteria:** Installment schedule drives Up Next reminders. Any bank or card field shows the entered value back for confirmation (masked) and validates length before submit. Failed payments appear in Up Next with a retry action.

#### B-21: CSV import
- **Answers:** Migration takes time (C40).
- **Priority P2:** helps onboarding for venues with existing spreadsheets.
- **Effort:** M
- **Story:** As a new customer, I want to upload my couples, events, vendors and staff from a spreadsheet.
- **Acceptance criteria:** Downloadable CSV templates; preview with row-level errors; import creates records and reports counts; nothing is overwritten without confirmation.

#### B-22: Printable run of show and day-of sheet
- **Answers:** No day-of tools in Dubsado; limited day-of in AP (C37, C38).
- **Priority P2:** core venue need, but outside the complaints' strongest evidence.
- **Effort:** M
- **Story:** As an event captain, I want a one-page printout of the timeline, staff and vendor contacts.
- **Acceptance criteria:** Print-friendly page per event listing blocks with times, assigned staff and vendor contacts; fits on two pages; works without sign-in via PDF download.

#### B-23: Calendar sync
- **Answers:** Only one synced calendar (C20).
- **Priority P2:** one source.
- **Effort:** M
- **Story:** As a manager, I want events in my own calendar.
- **Acceptance criteria:** Read-only iCal feed per user covering events and their own assignments; works with Google, Apple and Outlook.

#### B-24: Vendor confirmation links
- **Answers:** No vendor management or collaboration (C37).
- **Priority P2:** fits the vendor entity; one source.
- **Effort:** M
- **Story:** As a manager, I want vendors to confirm arrival time and guarantee with one link.
- **Acceptance criteria:** Link per vendor per event with Confirm and Question buttons; response updates the vendor status and appears in Activity; no vendor login.

#### B-25: Floor plan and layout (deferred)
- **Answers:** Glitchy, hard-to-learn floor plan tool (C18, C39).
- **Priority P2:** a real venue need, but a heavy feature; risk of recreating AP's complexity.
- **Effort:** L
- **Story:** As a manager, I want to record the room layout for an event.
- **Acceptance criteria:** Start with a list of layout options per space (for example "Ceremony: 120 chairs, theatre") and an attached image. A drag-and-drop editor is out of scope until requested.

---

## Suggested order of work

1. B-05, B-06, B-07 (small, set the rules).
2. B-01, B-02, B-03, B-04 (the first-run experience).
3. B-10, B-11, B-08, B-09.
4. B-12, B-14, B-15, B-13.
5. P2 items by demand.

Re-score after real venue interviews; the frequency column in particular rests on a thin source pool.
