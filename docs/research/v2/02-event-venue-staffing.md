# 02 — How event, banquet and wedding-venue staffing works (Researcher B)

Researched 2026-10-09 for Staffing Planner 2. Angle: event, venue and catering staffing software, and how venues actually staff a wedding or banquet.

**How to read this document**
- "Read" means I fetched the page and read what it says. All fetches except two PDFs went through a summarizing fetch tool. For those pages I recorded only what the tool quoted or plainly stated.
- I extracted the Caterease staffing guidebook and the CMU catering policy PDF to full text and read them myself. These are the strongest primary sources here.
- "Search-only" means I saw only a search-engine summary or snippet, not the page. These are flagged at the point of use and in the source table (section 7).
- Confidence ratings: **High** = several independent sources agree, or a primary source (a regulation, or a caterer's own policy) states it. **Medium** = one good source, or a few vendor blogs that agree. **Low** = a single vendor blog or marketing page, search-only, or my own inference.
- Many ratio sources are blogs from staffing-software or marketplace vendors (Qwick, Breakroom, Turnozo, Workstaff). They have a commercial interest in "more staff" and "more buffer". Treat them as practitioner rules of thumb, not data.

---

## 1. Per-tool summaries

### 1.1 Event Staff App (and its Tripleseat integration). This tool comes closest to the flow we are building.
Sources read: help index, call times, availability, staffing page overview, staff tour, Tripleseat integration help, 2026 partnership news, Tripleseat partner page.

- **Data model.** The structure is Event → **Call times** → Work shifts. Help text: "Call times will contain a group of staff who are scheduled to work a position at a specific time slot." Each call time has a **position**, **how many staff are needed for that position**, and a **start and end time**, which "can differ from the overall event duration".
  - This is the key concept: positions are staggered inside one event.
  - On the events overview, filled call times show **green** and unfilled ones show **light red**.
- **Flow.** The help index runs in this order: create staff accounts → create events and call times → check availability → create work shifts and schedule staff → send work shifts → time tracking → payroll reports.
- **Availability before assignment.** There are two request types:
  - an Individual Availability Request, sent to chosen staff;
  - a Mass/Group request, sent to "all staff who work a position". It is created automatically when the call-time option "Ask relevant staff if they are available for this call time?" is ticked.
  - Requests go out by SMS and email as a link. Staff tap Yes or No in the phone browser.
  - The manager sees replies on the event's **Availability tab**. "Add Shift" turns a Yes into a work shift and copies the request details.
- **Staffing page.** Each event has one, with two tabs: **Scheduled Staff** and **Availability**. Its jobs are availability, creating shifts, sending shifts, "referencing confirmations", time tracking and clock-in details, and "managing work shift cancellations".
- **Sending and confirming.**
  - A blue **Send Shifts** button sends an SMS and email with a link.
  - If the company enables it, staff see **Confirm** and **Cancel** buttons. The search snippet I saw did not say whether the business can turn this off; the staff tour I read says Confirm/Cancel appear "if the company … has it enabled".
  - **Daily Digest mode** batches outgoing messages. Availability requests are sent at 10am Pacific the next day, which cuts message volume.
- **Day-of.**
  - Staff get a green Clock In or red Clock Out button, or a **QR code shown to the supervisor on site**.
  - Reminders are sent before the shift to clock in and before the end to clock out.
  - Manual time entry is available if the clock-in window is missed.
  - Staff can block time with "Add Unavailability" in "My Work Schedule".
  - Supervisors have their own time-tracking view.
- **Tripleseat sync.**
  - One-way: Tripleseat → Event Staff App. Events, bookings, accounts and contacts sync through webhook and API keys. You can choose to sync only events with status "Definite" (the help says "Definitive").
  - Later changes in Tripleseat ("a time shift, a room change, an updated guest count") flow through.
  - Older events are matched by hand with "Match Events".
  - Claimed scale: more than 10,000 events staffed through this integration in its first year.
- **Gaps.** I found no documented guest-count-to-headcount rules (contrast Caterease). The news article mentions "AI automations", unspecified.

### 1.2 Tripleseat (sales/event management; does not schedule staff itself)
- A Tripleseat BEO contains: client and sales manager contacts, event details, **guest count**, **timeline**, space, menu/F&B, setup/AV/vendor notes, billing, terms, special requests and a signature line (read).
- A search summary says BEOs carry "Staff Notes", e.g. "use specific entrances" (search-only).
- Tripleseat hands staffing to **Event Staff App** through the native integration above.
- **Takeaway:** the sales system owns the guest count and timeline, and the staffing system consumes them. Changes to the guest count must flow downstream.

### 1.3 Caterease (catering software). Strongest evidence that **ratio-driven position generation is a real, shipped pattern**.
Source: the official guidebook "Managing Your Event Staff" (v18 PDF), extracted and read in full.

- **Position setup (Shift Wizard Setup).** Fields: Position, **Uniform**, **Agency** (for outside staffing agencies), Category, **Est Cost** per hour, **Price** per hour (what the client is charged), Flat Rate, **Default Shift Times** (taken from the sub-event's start and end), and Notes.
- **Shift rules.** Verbatim: "whenever you book a wedding, you need to assign one wait-staff for every ten guests."
  - A rule applies to "all new events" or to "events with a theme of / category of …".
  - It sets "the number of guests to add for every shift", with an option to **round up**.
  - "Once you add an event, Caterease will apply your shift rules based on the guest count, and will give you the total required amount of staff needed for the event."
  - The **View Shift Rules** button shows which rule produced a required number.
  - "Reports and management tools allow you [to] track events that are understaffed."
- **Employees.**
  - Each person has multiple positions, each with its own uniform, regular wage, overtime wage and flat flag.
  - Records also hold skills, emergency contact, photo and attached documents (e.g. a driver's license).
  - An **Inactive** flag removes seasonal or student staff from selection lists.
  - Recurring unavailability is set in "Enter Weekdays And Times Employee CANNOT Work" (all day or up to two time ranges per weekday).
  - Date-specific unavailability is set in "Employee Vacations" and also covers week-to-week variable availability.
  - "Employees by Weekday Availability" lists who can work on a given day.
- **Staffing an event.**
  - The Event Manager → Sub-Event → **Staffing** tab has two nested grids: the *shifts* grid (positions with required number, price, uniform, markup) and, inside it, the *employees* grid.
  - "Select Staff" groups employees by position. Unavailable people show in **red**, with a "View Conflicts" button. Selecting them needs a setting override: "Allow Selection of Unavailable Employees".
  - Staff can be tracked as unnamed shifts ("how many unnamed 'waiters'") before people are named.
  - A **Conf** checkbox marks confirmed staff. There is an option to auto-mark staff as confirmed on selection, and optional "Confirmed By" and "Confirmed On" columns.
  - Shift cost estimates and total wages are computed automatically. Additional compensation is supported.
- **Multiple events.** The **Shift Manager** (Professional edition) works on a day or date range of shifts across events. It can book employees, **batch-email confirmation requests**, and confirm.
- **Reports.** Staffing calendar; employee staffing schedule; **Scheduled Shifts report**, with an option to "Suppress Fully Booked & Confirmed Shifts" so only shifts needing staff are shown; staffing query.
- **Sub-events matter.** Staffing is attached per sub-event (e.g. ceremony vs reception), not only per event.

### 1.4 Total Party Planner (catering)
- The vendor page (read) says only: "assign staff roles", "manage catering schedules", and "align teams with shared schedules". No detail on positions, confirmation or labor cost was given.
- A search summary suggests TPP events can be imported into **Nowsta** for staffing (search-only). That is the same "booking system → specialist staffing tool" pattern as Tripleseat → Event Staff App.
- Confidence that TPP has deep staffing: low.

### 1.5 Perfect Venue (venue sales/booking)
- The features page (read) lists proposals, payments, calendar, analytics and auto-generated **BEOs**, including staff-facing BEOs. It lists **no** staff scheduling or assignment.
- Its blog on venue staff management (read) is generic: it lists management roles and says to use scheduling software, without naming its own features.
- **Takeaway:** a leading small-venue tool leaves staffing out entirely, so a gap exists.

### 1.6 Planning Center Services (church volunteer scheduling; the best UX reference for request/decline/replace)
Sources read: changelog, blog, and three help pages.

- **Model.** Plans (the services, i.e. our "events") have **Needed Positions**: "specify how many people you need to fill each position in the plan". These can come from a **template**.
- **Scheduling.**
  - Schedulers add people manually, by template, by **auto-schedule**, by **signup sheets** (self-service) or in the **matrix** (multi-week view).
  - A **conflict badge** appears beside anyone with a blockout or a conflict.
  - A "+5w" indicator shows each person's last scheduled plan, which helps fairness and rotation.
- **Prepared vs sent.** People can be placed with a "prepared" notification that has not been sent yet. Unconfirmed people "cannot see the plan until you send the scheduling email". One email can consolidate many plans per person.
- **Volunteer side.**
  - My Schedule shows pending requests.
  - Accept or decline is per position, with "Accept pending / Decline all". Split responses are possible when someone is asked for multiple times.
  - Volunteers set **Blockout dates**.
- **Declines.**
  - Leaders get an email for each decline and can reschedule from it.
  - **Auto-reschedule** of declines has two options: auto-send to "the next available team member" in the same position, or email a **signup sheet** to qualified teammates.
  - **Volunteer replacements:** a decliner picks an eligible teammate in the same position and must tick "I've confirmed with [Name] that they can cover this". The replacement is then added **as confirmed**.
  - If no one is available: "No available teammates were found. Your team leader has been notified," and a needed position is recreated.

### 1.7 Shiftboard (now part of UKG). **Blocked.**
- shiftboard.com/industries/events redirects to ukg.com/shiftboard, which returned 403. Everything below is search-only.
- Assigned, self-scheduled or hybrid shifts; shift trading within rules.
- **Qualification/credential checks before scheduling** (orientation, training, certifications).
- Auto shift assignment by team, location or role; teams segmented by role and venue; applicant screening; broadcast emails.
- Relevance: the credential gate before scheduling is a pattern we need for alcohol certifications.

### 1.8 Nowsta (catering and event workforce tool)
Sources read: two help articles.

- **Publishing modes:**
  - direct **shift request** (confirm or decline; turns green or red in the Weekly View);
  - **First-come, first-serve**: invite more workers than slots. "Once all available positions are filled, the remaining workers can no longer accept the shift";
  - **Publish → Apply**: workers apply and the manager picks. Unpicked applicants keep an **Applied** status as backups.
- **Pre-publish filters:** availability, tags, assignment conflicts, **client/venue restrictions** (e.g. a worker banned from one venue), prior responses, and partial availability.
- **Settings:** auto-remove a worker on decline; lock responses.
- Notifications are push or SMS per worker, not both.

### 1.9 Liveforce (UK/US event staffing software)
Source read: staff-app page.

- Crew set availability, and "you only offer shifts to people who can actually work them".
- Crew can use a private job board to apply.
- "A tap confirms attendance before the shift."
- **GPS check-in and check-out**; timesheets submitted automatically at shift end, with photo expenses.
- "Briefings, call times and sudden changes" go only to crew on that shift.

### 1.10 staff.cloud and Parim: status models worth copying
- **staff.cloud** "Staff Planning Key" (read) has seven assignment states:
  1. ignored invitation;
  2. not applied;
  3. applied;
  4. **provisionally assigned (not yet informed)**;
  5. assigned (informed);
  6. **assigned and confirmed**;
  7. declined by the planner.
  - It also gives drag-feedback colors.
  - The "provisional/not informed" state equals Planning Center's "prepared, not sent".
- **Parim "event shift reconfirmation"** (read). A confirmed shift **reverts to unconfirmed (yellow)** at a manager-set interval before the shift until the worker reconfirms. Workers can respond by app or SMS.
  - This is the software form of the industry's "confirm 24–48 hours before" practice.

### 1.11 Instawork (marketplace)
Sources read: how-it-works page and partner cancellation help.

- **Posting a shift:** role and time, plus "requirements like skills, attire, or experience level". Workers are matched, and the business sees the profiles of who accepted.
- **Day-of:** clock-in by app, an on-site PIN, or GPS.
- **After:** businesses rate workers, add good ones to a **roster** for rebooking, or block poor ones.
- Safeguards: "on-time and cancellation tracking, automated reminders, GPS clock-ins, and paid backup workers for critical shifts".
- **W-2 or 1099** engagement models are available, and Instawork handles payroll and taxes.
- **Cancellation:** free if more than 24 hours before the start. Under 24 hours, the business is charged "up to 4 hours of pay for any Professional booked on the shift". There is no charge if no one is booked.
- **No-show handling** (search-only): the business marks a no-show in the app and contacts support for a replacement.
- Event roles listed (search-only): Event Server, Bartender, Busser, Food Service Worker, cooks, Dishwasher; hotels also used it for banquet servers and "house men".

### 1.12 Qwick (hospitality marketplace)
- **Business cancellation** (read): no fee if more than 24 hours before the start. Under 24 hours, the business may pay "up to a 4-hour minimum". Sending a worker home early may also trigger the 4-hour minimum.
- **Worker penalties** (search-only): a call-out within 24 hours brings a 5-day suspension the first time, then 14 days, then a permanent ban.
- Qwick's blog supplies one of the ratio sources (section 2).

### 1.13 "Eventeam"
- I found no staffing marketplace by this name.
- Search shows an App Store app "Eventeam" described as general event organization, founded 2021 in Baku (search-only; listing not opened).
- **Conclusion:** the brief's "Eventeam-style marketplaces" maps to Instawork, Qwick, Liveforce-style crew platforms and local staffing agencies.

### 1.14 Cross-tool synthesis
| Step | Pattern across tools |
|---|---|
| Event arrives | Synced from the sales/BEO system (Tripleseat → ESA; TPP → Nowsta). Guest count and time changes propagate. |
| Positions required | Explicit **position × count × time window** ("call time" in ESA, "needed positions" in PCO, shifts in Caterease). Only Caterease auto-derives counts from guest count, by event type, with rounding up. |
| Find people | Availability request (ESA), blockouts (PCO, Caterease), filters for conflicts, tags and venue bans (Nowsta), credential gate (Shiftboard). |
| Offer | Direct assign, mass ask, first-come, or apply-then-pick. |
| Not yet told | "Prepared/provisional" state before notifying (PCO, staff.cloud). |
| Confirm | Explicit confirm or decline per position. Reconfirmation close to the date (Parim). Batch confirmation emails (Caterease). |
| Decline | Auto-offer to the next eligible person, signup sheet, or self-found replacement with attestation (PCO). |
| Day-of | QR, PIN or GPS clock-in; supervisor view; briefings to on-shift crew only. |
| After | Timesheets → payroll export; ratings, rosters, block lists; no-show tracking. |
| Coverage view | Filled vs unfilled coloring per position; an "understaffed events" report; a "show only shifts needing staff" filter. |

---

## 2. How a venue really staffs a wedding

### 2.1 The process (from BEO to payroll)
1. **Booking and BEO.** The event is booked with a provisional guest count, service style (plated, buffet, stations, family-style, cocktail/passed), bar package (beer/wine, full, signature cocktails), and timeline (ceremony, cocktail hour, dinner, dancing, end).
   - The BEO carries a **staffing section** listing needed staff "such as banquet servers, bartenders, coat checks, parking, and security attendants" (search-only summary of BEO guides).
   - Perfect Venue (read) describes split versions of the BEO: the Main BEO, a Chef/Kitchen sheet, and a FOH BEO. Its BEO staffing/vendor section covers "Staffing requirements, Security needs, Parking logistics, Setup crews".
   - *Confidence: High.*
2. **Derive positions from the guest count and service style** using house ratios (2.2). Add fixed roles that do not scale: captain/lead, venue manager on duty, setup crew, dish. **Round up**, as Caterease's rule option does.
   - *Confidence: High that venues do this; ratios vary.*
3. **Set call times per position.** Positions arrive in waves, not all at once (see the ESA call-time model and 2.3).
4. **Ask and assign.** Ask the on-call pool who is available (ESA availability requests; Caterease weekday availability and vacations). Assign people, accounting for qualifications (bartenders need alcohol certification where required) and uniform. Fill gaps from an agency or marketplace (Caterease "Agency" field; Instawork/Qwick).
   - *Confidence: High.*
5. **Send and confirm.** Publish the schedule as early as possible. Turnozo says "ideally 2–4 weeks out" (vendor blog). Require **confirmation 24–48 hours before** with automatic reminders (Turnozo, read; Parim reconfirmation, read).
   - *Confidence: Medium.*
6. **Final guarantee → adjust staffing.** The client's final count locks before the event:
   - "48 hours prior" in the CMU catering policy (read);
   - "Most venues lock the guaranteed count 48 to 72 hours before" (search-only);
   - dietary counts "at least 14 days out" (Mayfair Farms, read).
   - Staffing is re-derived from the guaranteed count, and adding or cutting staff then interacts with marketplace 24-hour cancellation fees and state reporting-time pay.
   - *Confidence: High for the guarantee window; the link to staffing re-planning is my inference, though Tripleseat → ESA explicitly syncs "an updated guest count".*
7. **BEO meeting and pre-shift.**
   - A captain job posting (read; Merrill Hotel) says: "Hold preshift meeting reviewing BEO and reviewing a selected service standard", "Assign stations and side work to Servers", and supervise "attendance" and "break schedules".
   - Search-only captain postings mention attending "weekly BEO meetings".
   - A pre-shift SOP template (read; low-authority template site) covers the uniform check (closed-toe non-slip shoes), the **table assignment chart** (tables, station, VIP coverage), and menu and allergen review.
   - *Confidence: High.*
8. **Day-of execution.** Check-in (QR, PIN or GPS in software; a sign-in sheet in practice), sections, the ceremony→reception **room flip**, breaks, staggered **cuts** as service winds down, and teardown.
9. **Post-event.** Timesheets → payroll. **Gratuity or service-charge distribution** (2.4). Ratings and notes on staff, and the no-show record.

### 2.2 Staff-to-guest ratios (rules of thumb)

| Role | Rule of thumb | Sources (all read unless marked) | Confidence |
|---|---|---|---|
| Servers, plated dinner | **1 per 10 guests** (about 1 per table of 10). Range 1:8 (fine dining, wine service) to 1:12. | CMU catering policy "Served Meals – 1 Wait Staff per 10 guests" (caterer's own policy); Caterease guide's example rule "one wait-staff for every ten guests" for weddings; Mayfair Farms "1 per 8 to 12"; Breakroom "1 per 10–12". Outliers: Turnozo 1:20; Qwick "minimum" 1 server + 1 busser per 25. | **High** for 1:10 as the anchor |
| Servers, buffet | **1 per 25–30**, plus attendants at stations | CMU 1:30; Turnozo 1:30; Mayfair 1:15–20; Qwick 1 per 3 dishes + 1 busser per 25; Paperlust ~1:40 (search-only) | Medium |
| Servers, passed hors d'oeuvres or cocktail hour | **1 per 25** | Qwick 1:25; Breakroom 1:25; Turnozo 1:25; CMU 1:30 | Medium-High |
| Bartenders, full bar | **1 per 50**; tighten to 1:30–40 for cocktail-heavy; 1:60–80 for beer/wine only | Qwick 1:50; On The Fly Tapsters 1:50; Breakroom (all three bands); Turnozo 1:50 (1:40 cocktail). CMU 1:100 (a campus with likely lighter drinking). Search snippet 1:75. | **High** for 1:50 |
| Barbacks | 1 per 2 bartenders, or 1 per active bar once above ~100 guests | Qwick; On The Fly Tapsters table (0 below 100 guests; 1 at 100–150; 1–2 at 150–200) | Medium |
| Bussers | About 1 per 3 servers, or 1 per 25 guests | Breakroom; Qwick | Low-Medium |
| Food runners | 1 per 75 (plated) | Turnozo only | Low |
| Captain / service lead | 1 per event once there are **5+ staff** or **100+ guests**; large events need more | Qwick ("100+ guests"); Breakroom ("five or more staff"); CMU lists Captain as a billable role | Medium |
| Kitchen (if in-house catering) | About 3 per 50 guests plated; chef lead above 75 | Breakroom only | Low |
| Setup/teardown crew | 2–4 per event | Turnozo only | Low |
| Coat check | 1 per 100 guests in winter; 1 per 100–150 in spring/fall depending on weather | Columbia University facilities "Coat Attendant Guidelines" (**blocked 403; search-only**) | Low-Medium |
| Valet | 1 per 30–50 guests (better driven by expected cars and lot distance) | Tempguru (search-only) | Low |
| Venue manager / coordinator on duty | 1 per event; may cover two or more events at once | Venue-vs-DOC articles (read, 2.5) | Medium |

**Worked example** (my synthesis, not a quoted source): a 150-guest plated wedding with a full bar.
- About 15 servers. Some venues run 12 with bussers.
- 3 bartenders and 1 barback.
- 1 captain.
- 3–5 bussers/runners.
- 2–4 flip/setup crew.
- Coat check if in season (1–2).
- 1 venue manager on duty.

A search-only snippet from a staffing blog proposes a 150-person wedding with only "2-3 Servers … 1 Bartender". That contradicts every ratio above and should be ignored. It shows that web numbers vary widely, so **ratios must be configurable per venue**.

### 2.3 Call times, shift length, minimums, split shifts
- **Staggered calls.**
  - "A four in the afternoon call for a seven o'clock seating, followed by a breakdown that runs past midnight, is a normal event for banquet service" (search-only snippet from a banquet-server job guide).
  - CMU: "we may need up to two hours prior to your set-up time and two hours following your scheduled event time" (read).
  - A wedding venue's event-staff posting describes three shifts: Morning 7:00–12:00 (prep venue), Afternoon 13:00–18:00 (ceremony→reception transition), Closing 19:00–01:00 (teardown and reset) (search-only; the posting had expired).
  - *Confidence: Medium.* Rule of thumb: setup crew earliest; servers 2–3 hours before guest arrival; bartenders about 1 hour before cocktail hour; staggered cuts after dinner, with a closing crew for teardown.
- **Shift length.** Weddings run 8–12 hours including setup and breakdown; cocktail receptions 4–6 hours (search-only).
- **Minimum hours.**
  - Caterers bill staff with minimums: CMU "four (4) hour minimum" with rates per 4 hours (read); Princeton captain "5 hour minimum" (search-only); "most catering companies have a minimum call time of 5 hours" (search-only).
  - Marketplaces charge up to 4 hours for late cancellation (Instawork and Qwick, read).
  - **California reporting-time pay** (read; DIR, primary). If an employee reports but gets less than half the scheduled shift, they are paid "for half the usual or scheduled day's work, but in no event for less than two hours nor more than four hours". A second report in the same day carries a 2-hour minimum.
  - *Confidence: High.*
- **Split shifts.**
  - California split-shift premium: one hour at minimum wage when unpaid time between shifts exceeds a meal break (search-only; DIR page not opened).
  - New York hospitality "spread of hours": one extra hour at minimum wage when the workday spans more than 10 hours including breaks (search-only; Paychex summary).
  - A morning setup plus evening close for the same person can trigger these.
  - *Confidence: Medium.*
- **Overtime.** California daily overtime after 8 hours (Breakroom, read; vendor blog). Long wedding days push captains and managers over.

### 2.4 Workforce types, pay and tips
- **On-call / part-time pool (W-2).** This is the dominant hotel and venue model.
  - "On-call banquet server" is a standard hotel job title; many postings were found (search-only).
  - Caterease's Inactive flag exists for "seasonal" and "in school" staff (read).
  - Union contracts can apply **seniority** to banquet scheduling and call-ins (Law Insider clause, search-only).
  - Turnozo suggests a roster mix of about 60% core / 30% rotation / 10% on-call bench, and that a "40-person roster for … 8–10 events per month is healthy" (read; vendor opinion).
  - *Confidence: High for the pool model; Low for the specific numbers.*
- **Agency and marketplace (Instawork, Qwick, local agencies).** Used to fill gaps. Agencies are said to charge a "40–60% markup" (Breakroom, read; unsourced). Caterease has an "Agency" field per position.
- **1099 contractors.** Search-only (Tempguru, a vendor). Servers and bartenders at events "almost always qualify as employees", and venues hiring setup crews fail ABC-test prong B.
  - Instawork offers both W-2 and 1099 (read).
  - *Confidence: Medium.* Software should record worker type, not judge it.
- **Service charge vs gratuity.**
  - Federal: under **29 CFR 531.55** (read; primary), "a compulsory charge for service, such as 15 percent of the amount of the bill … is not a tip". It is wages, even if distributed.
  - States add tax rules. For New York (read; primary, Tax Bulletin ST-320), a banquet gratuity is non-taxable only if it is separately stated, called a "gratuity", and **paid in full to employees**.
  - Distribution formulas seen in contracts (search-only): at least 77% of the service charge to servers, bussers, captains, bartenders and hosts; or 88% to servers/captains/bartenders and 12% to porters. Sometimes the **lead/captain distributes** by formula, or the pool is split equally among banquet staff on the meal period.
  - *Confidence: High for the legal distinction; Low for specific splits.*
- **Pay and price.** The venue tracks the staff **wage** (cost) and often a client-facing **staff charge** (price). Caterease has both Est Cost and Price per position (read). CMU publishes client rates per 4 hours: Server $175, Bartender $275, Captain $200, Chef $200 (read).

### 2.5 Roles and leads: who is who on a wedding day
- **Venue manager / venue coordinator** (venue employee).
  - Responsible for the space, venue policy, in-house kitchen, bar and staff.
  - "May handle multiple events on the same day"; "primarily present during venue rental hours" (Mint Tahoe, read).
  - Coordinates in-house services but is **not** responsible for managing outside vendors such as the photographer or band (Coco Wedding Venues, search-only).
- **Day-of coordinator (DOC)** (works for the couple). Timeline, vendor wrangling, crisis management, guest liaison, décor placement. Often first in and last out (Green Acres, read; Mint Tahoe, read).
  - **Implication:** the DOC is an external contact on the event, not venue staff to schedule.
- **Banquet captain.** Runs the BEO pre-shift, assigns stations and side work, supervises attendance and breaks, liaises with the kitchen, and is the day-of client contact and sometimes manager on duty (Merrill Hotel posting, read; other postings search-only).

### 2.6 Alcohol-service certification
- **Mandatory statewide** per TIPS (read; TIPS is a trainer and has an interest): AK, CA, DE, IL, IN, LA, MT, NV, NM, OK, OR, PA, RI, TN, UT, VT.
- **Local mandates** in parts of AL, GA, HI, ID, KY, ME, MO, NE, NJ, ND, WY.
- **None:** KS, MA, MN, MS, WV.
- **Sources conflict on WA and MI.** TIPS lists them as voluntary or not mandatory. A ServingAlcohol summary (search-only) says Washington requires a MAST permit within 60 days of hire and Michigan requires renewal every 3 years. California RBS has been mandatory since July 2022, and Oregon since 2025 requires training before serving.
- **Implication:** a venue needs a per-person certification record with **expiry**, and a rule blocking assignment to bar roles when it is missing or expired, configurable by state.
- *Confidence: High that requirements vary by state and expire; Medium on the exact state list.*

### 2.7 No-shows, cancellations and buffers
- **No-show rate:** Breakroom claims 10–15% in food service and suggests a 10–15% float, e.g. 3 backups for a 20-person crew (read; vendor blog, no citation). Turnozo suggests adding 1 buffer person above €5k event budget and 2 above €10k (read; vendor).
  - *Confidence: Low on numbers, High that venues keep backups.*
- **Prevention:** confirmation deadlines (24–48 hours), automatic reminders for anyone unconfirmed, GPS check-in (Turnozo, read); reconfirmation (Parim, read); marketplace suspensions for late call-outs (Qwick, search-only).
- **Cancellation costs (venue side):** marketplaces charge up to 4 hours inside 24 hours (Instawork and Qwick, read). California reporting-time pay if staff are sent home (DIR, read).

---

## 3. Roles and terminology
- **BEO (Banquet Event Order)**: the master operational sheet. It has variants: Main BEO, Kitchen/Chef sheet, FOH BEO.
- **Guarantee / final count**: the guest count locked 48–72 hours out. It is the billing floor and drives final staffing.
- **Call time**: when a position must report. In ESA it is also the grouping unit "position × count × window".
- **Shift / work shift**: one person's assignment within a call time.
- **Position / station / section**: role; physical post (bar 1, carving station); group of tables a server covers.
- **Side work**: pre- and post-service tasks such as polishing, rolling and resets.
- **Pre-shift / line-up**: briefing led by the captain, covering the BEO, timeline, allergens, sections and a service standard.
- **Room flip / turn**: converting the ceremony space to the reception during cocktail hour.
- **Cuts**: releasing staff in sequence as service winds down.
- **Captain / banquet captain / service lead**: floor lead.
- **Banquet manager**: senior to the captain at hotels.
- **Venue manager on duty (MOD) / venue coordinator**: venue-side lead.
- **Day-of coordinator (DOC)**: works for the couple. External to the venue.
- **Server, busser, runner, barback, bartender, houseman/houseperson** (setup and teardown of tables, chairs and dance floor), **porter**, **dishwasher/steward**, **coat check attendant**, **valet attendant / parking**, **security**, **chef/cook**, **carver/attendant** (station).
- **On-call / PRN / extra board**: pool staff with no guaranteed hours.
- **Agency / marketplace pro**: external fill.
- **Service charge vs gratuity**: see 2.4.
- **RBS / TIPS / BASSET / MAST / OLCC permit / ServSafe Alcohol**: names for alcohol-service certifications.
- **Blockout / unavailability**: dates or times a person cannot work.
- **Prepared vs sent; provisional vs assigned; confirmed; declined; applied**: assignment states (see 1.6 and 1.10).
- **Reconfirmation**: reconfirming close to the date.
- **No-show / call-out / late cancel**: staff did not come / cancelled late.

## 4. Edge cases a planner must handle
1. **Guest count changes after staffing.** Re-derive needs from the new count and show the delta per position: "now need 2 more servers" or "1 bartender surplus". Cuts made inside 24 hours have cost implications.
2. **Sub-events with different headcounts.** For example, ceremony 180, cocktail 180, dinner 150 after family-only, and an after-party. Caterease staffs per sub-event.
3. **Service-style change** (plated → stations) swings server counts by 2–3×.
4. **Staggered call times within one position**, e.g. 4 servers at 15:00 for setup and 11 at 16:30.
5. **The same person in two positions** (bartends at cocktail hour, serves at dinner), or **split shifts** (morning setup plus evening close), with California split-shift and New York spread-of-hours exposure.
6. **Multiple events on the same day.**
   - Shared pool and conflicts: Caterease flags unavailable people in red; Nowsta filters "assignment conflicts".
   - One venue manager covering two events.
   - Transfer windows between buildings.
   - The Caterease Shift Manager and PCO matrix exist to view many events at once.
7. **Overnight events** crossing midnight: the date boundary, and pay-period attribution.
8. **Uncertified staff on bar roles.** Block, or warn with an override. Same for certifications expiring before the event date.
9. **Declines, late cancels and no-shows.** Auto-offer to the next eligible person; a backup or standby list; marking a no-show; reliability history.
10. **Overstaffing on purpose** (buffer) vs understaffing (an "understaffed events" report, as in Caterease).
11. **Venue-specific bans** ("client/venue restrictions" in Nowsta), and favorites or rosters (Instawork).
12. **Agency or marketplace fills** that are not in the venue's staff list. Record as an unnamed or external body with an agency name.
13. **Event cancelled or postponed**: mass-notify assigned staff, with cancellation-fee exposure.
14. **Weather-dependent roles**: coat check season; rain plan, i.e. an indoor flip needing more crew.
15. **Selecting someone who is unavailable**: an explicit override with the conflict shown (Caterease setting).
16. **Unnamed placeholders**: "need 12 servers" before anyone is named.
17. **Minors**: some states bar under-18s or under-21s from serving alcohol (general knowledge; not researched; verify).

## 5. What a venue manager needs that general shift tools (When I Work, Deputy, Sling) do not give
1. **Event-first, not week-first.** The unit of work is an event with a BEO, guest count, service style and timeline, not a weekly rota. Shifts hang off events and sub-events.
2. **Guest-count-driven position generation.** Configurable ratios per service style and event type, plus fixed roles, rounding up, and "why this number" transparency (Caterease "View Shift Rules"). Generic tools have nothing equivalent.
3. **Automatic re-planning when the BEO changes.** Guest count and times sync from sales (Tripleseat → ESA), with a delta view.
4. **Staggered call times per position inside one event**, with a coverage view of filled and unfilled per call time.
5. **Pool-based offering flows.** Availability request, mass ask, first-come, apply-and-pick; prepared vs sent; reconfirmation 24–48 hours out; decline → next eligible.
6. **Qualification gates for alcohol roles** with expiry, by state.
7. **Role leads and briefing artifacts.** Captain assignment, pre-shift notes, section/station chart, uniform per position, and staff-facing BEO distribution to on-shift crew only (Liveforce, Perfect Venue).
8. **Cost and price per event.** Labor cost estimate vs the client's staff charge (Caterease Est Cost and Price), minimum-hour rules, and service-charge distribution.
9. **Multi-event day board.** Shared pool across concurrent weddings, conflict detection, and a manager covering several events.
10. **External fills.** Agency and marketplace bodies recorded alongside W-2 staff, with worker type tracked.
11. **Day-of tools.** Check-in (QR/PIN/GPS), arrival status, cuts, no-show marking, and an after-event rating and reliability record.

## 6. Open questions and caveats
- I could not open the Shiftboard/UKG page, several Planning Center help pages (404 after URL changes), Toast's BEO guide, the Columbia coat-check guideline, the Princeton staffing page, or live banquet-captain postings (most had expired).
- Numbers in 2.2–2.7 marked Low come from vendor blogs with no stated data. Validate them with a real venue manager before hard-coding defaults.
- The National Constitution Center wedding packet was downloaded but not read (a 9MB PDF that would not render). It is not used.

---

## 7. Source table (accessed 2026-10-09)

| # | URL | Status | Reliability / notes |
|---|---|---|---|
| 1 | https://www.eventstaffapp.com/help/ | Read | Vendor help center. High for product behavior. |
| 2 | https://www.eventstaffapp.com/help/events/call-times/ | Read | Same as #1 |
| 3 | https://www.eventstaffapp.com/help/staffing/staff-availability/ | Read | Same as #1 |
| 4 | https://eventstaffapp.com/help/staffing/overview | Read | Same as #1 |
| 5 | https://eventstaffapp.com/help/staff/tour-for-staff | Read | Same as #1 |
| 6 | https://www.eventstaffapp.com/?p=1595 (Tripleseat integration help) | Read | Same as #1 |
| 7 | https://www.eventstaffapp.com/news/tripleseat-partnership-update-2026/ | Read | Vendor news. Claims unverified. |
| 8 | https://www.eventstaffapp.com | Read | Marketing |
| 9 | https://tripleseat.com/partners/event-staff-app/ | Read | Vendor partner page |
| 10 | https://tripleseat.com/blog/everything-you-need-to-know-about-tripleseats-beos | Read | Vendor blog. Good for BEO fields. |
| 11 | https://caterease.com/wp-content/uploads/2018/06/GB_v18_Managing_Your_Event_Staff.pdf | Read (full text extracted locally) | Official product guidebook. High. Version 18 (2018); current UI may differ. |
| 12 | https://www.caterease.com/wp-content/uploads/CateringSoftDocs/QuickReferenceGuides/QuickReference-EmployeeManager.pdf | Fetch returned unrelated or marketing content; not used | n/a |
| 13 | https://eventrentalsystems.com/total-party-planner/ | Read | Marketing. Thin. |
| 14 | https://perfectvenue.com/features | Read | Vendor. Shows no staffing features. |
| 15 | https://www.perfectvenue.com/post/venue-staff-management | Read | Vendor blog. Generic. |
| 16 | https://www.perfectvenue.com/post/what-is-a-beo | Read | Vendor blog. Good on BEO sections. |
| 17 | https://www.planningcenter.com/changelog/services/new-volunteer-replacements-for-your-teams | Read | Vendor changelog. High. |
| 18 | https://planningcenter.com/blog/2024/09/auto-reschedule-declined-volunteer-requests-in-services | Read | Vendor blog. High. |
| 19 | https://help.planningcenter.com/en/142874-manage-your-schedule.html | Read | Vendor help. High. |
| 20 | https://help.planningcenter.com/en/142868-schedule-your-teams.html | Read | Vendor help. High. |
| 21 | https://help.planningcenter.com/en/138435-introduction-for-schedulers.html | Read | Vendor help |
| 22 | https://help.planningcenter.com/en/my-schedule.html, /manage-your-schedule.html, /schedule-your-teams.html, /use-the-matrix-to-schedule.html, /introduction-for-team-leaders.html | Blocked (404) | n/a |
| 23 | https://www.shiftboard.com/industries/events → https://www.ukg.com/shiftboard | Blocked (301 → 403) | Shiftboard content is search-only |
| 24 | https://intercom.help/nowstasupport/en/articles/16311050-publishing-shifts-to-workers-in-nowsta | Read | Vendor help. High. |
| 25 | https://intercom.help/nowstasupport/en/articles/16171026-scheduling | Read | Vendor help |
| 26 | https://liveforce.co/staff-scheduling-features/event-staff-app/ | Read | Marketing |
| 27 | https://support.staff.cloud/en-US/kb/article/17/staff-planning-key | Read | Vendor help. High. |
| 28 | https://support.parim.co/en/articles/434122-event-shift-reconfirmation | Read | Vendor help. High. |
| 29 | https://instawork.com/how-it-works | Read | Marketing |
| 30 | https://help.instawork.com/en/articles/9658420-canceling-a-shift-partner-support | Read | Vendor help. High. |
| 31 | https://support.qwick.com/en/articles/5567169 | Read | Vendor help. High. |
| 32 | https://support.qwick.com/en/categories/1336513 | Read (index page only) | n/a |
| 33 | https://www.qwick.com/blog/catering-calculations-guide | Read | Marketplace blog. Medium-Low. |
| 34 | https://workstaff.app/blog/how-to-calculate-staffing-needs-for-caterers | Read | Vendor blog. No numbers. |
| 35 | https://www.breakroomapp.com/blog/large-event-catering-staffing | Read | Vendor blog. Unsourced statistics. Low-Medium. |
| 36 | https://www.ontheflytapsters.com/staffing-guide | Read | Mobile-bar operator's own guide. Medium. |
| 37 | https://turnozo.com/blog/event-catering-staff-scheduling | Read | Vendor blog (EU). Low-Medium. |
| 38 | https://www.cmu.edu/dining/catering/catering-policies-page-2026.pdf | Read (full text extracted locally) | Caterer's own published policy. High for that operator. |
| 39 | https://www.mayfairfarms.com/?p=124 | Read | Venue/caterer blog. Medium. |
| 40 | https://www.greenacreseventcenter.com/?p=3671 | Read | Venue blog. Medium. |
| 41 | https://www.mintahoe.com/2026/05/19/venue-manager-vs-day-of-coordinator/ | Read | Planner blog. Medium. |
| 42 | https://gms.applicantstack.com/x/detail-riley/a2cn4cao8sqv | Read (closed posting, text still shown) | Real hotel job posting. High for duties. |
| 43 | https://www.mangoapps.com/templates/sop/banquet-server-pre-shift-standards-sop | Read | Generic SOP template. Low. |
| 44 | https://www.law.cornell.edu/cfr/text/29/531.55 | Read | Primary regulation. High. |
| 45 | https://www.dir.ca.gov/dlse/faq_reportingtimepay.htm | Read | Primary (CA DLSE). High. |
| 46 | https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/gratuities.htm | Read | Primary (NY DTF). High. |
| 47 | https://www.gettips.com/blog/which-states-require-alcohol-server-training | Read | Trainer with an interest. Medium. Conflicts with #63 on WA and MI. |
| 48 | https://bash.828venues.com/2025/07/room-flips/ | Read | Venue marketing. No numbers. |
| 49 | https://www.theeventcollective.co.nz/why-you-need-service-staff-at-your-wedding/ | Read | NZ staffing firm. No numbers. |
| 50 | https://chesapeakeconference.com/wp-content/uploads/2024/07/Job-Description-Banquet-Captain-FB.pdf | Blocked (403) | n/a |
| 51 | https://pos.toasttab.com/blog/on-the-line/what-is-a-beo-in-catering | Blocked (403) | n/a |
| 52 | https://operations.cufo.columbia.edu/content/coat-attendant-guidelines-and-staffing-allotments | Blocked (403); coat-check ratio is search-only | University operations page. Medium if confirmed. |
| 53 | https://www.princeton.edu/prospecthouse/university4.html | Blocked (403); rates are search-only | n/a |
| 54 | https://careers.marriott.com/banquet-captain-250/job/9C903CACDA9F4079F20E91F1B192FCAD | Blocked (404) | n/a |
| 55 | https://recruiting.paylocity.com/Recruiting/Jobs/Details/3318782 and /4237204; https://social.icims.com/job/On-Call-Banquet-Server-Job-US-CA-Carlsbad-46875277.html | Expired postings; not read | The three-shift venue schedule is search-only |
| 56 | https://constitutioncenter.org/media/files/NCC-Wedding-Package.pdf | Downloaded, not read (binary) | Not used |
| 57 | https://www.ecfr.gov/... 531.55 | Blocked (redirect to unblock page); used #44 instead | n/a |
| 58 | https://tripleseat.com/blog/banquet-event-order-samples ("Staff Notes") | Search-only | n/a |
| 59 | https://www.instawork.com/partnerships/ezcater and https://help.instawork.com/en/articles/10114076-what-happens-if (no-show flow) | Search-only | n/a |
| 60 | https://help.qwick.com/articles/2316269-what-is-the-cancellation-policy (worker suspensions) | Search-only | n/a |
| 61 | https://tempguru.co/w2-vs-1099-staffing and https://tempguru.co/insights/wedding-staffing (valet ratio, 150-guest example) | Search-only | Staffing vendor. Low. The 150-guest example looks wrong. |
| 62 | https://www.lawinsider.com/clause/gratuity-distribution and /clause/scheduling-practice (77%, 88/12 splits; seniority) | Search-only | Contract excerpts. Low-Medium. |
| 63 | https://servingalcohol.com/rbs-programs-by-state-national-comparison/ | Search-only | Medium |
| 64 | https://dir.ca.gov/dlse/split_shift.htm; https://www.paychex.com/articles/payroll-taxes/new-york-state-spread-of-hours-rule | Search-only | Primary and payroll-vendor sources; not opened |
| 65 | https://paperlust.co/blog/plated-vs-buffet-wedding/; https://forums.theknot.com/... ; https://www.weddingwire.com/wedding-forums/... | Search-only | Consumer and forum. Low. |
| 66 | https://eventplanning.com/difference-day-of-wedding-coordinator-venue/; https://cocoweddingvenues.co.uk/... | Search-only | Medium |
| 67 | Banquet-captain postings (Paylocity, Marriott, iHireHospitality, Pendry) via search; "4pm call for 7pm seating"; "8–12 hour wedding shifts"; "5-hour minimum" (Fash/Airbnb listings) | Search-only | Low-Medium |
| 68 | https://apps.apple.com/app/id1625176323 ("Eventeam") | Search-only | n/a |
| 69 | https://nowsta.com and Capterra/GetApp listings for Caterease, Nowsta, Total Party Planner | Search-only | Review-aggregator snippets. Low. |
