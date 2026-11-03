# Client inquiry flow: spec

Status: **approved** (Nov 3, 2026), with these changes from the draft: no Inquiries list page, one seeded sample inquiry, and a fourth kind (call / virtual tour) added.

## Goal

A potential client (usually a couple) can contact the venue without an account, and what they send
shows up in the manager's **Tasks** with nobody re-typing it. There are four kinds of inquiry:

| Kind | Client wording | What the manager has to do |
|---|---|---|
| `walkthrough` | Schedule a walkthrough | Confirm a date and time for a visit |
| `quote` | Ask for a quote | Send a price for their date and guest count |
| `services` | Ask about services | Answer a question about what the venue offers |
| `call` | Schedule a call or virtual tour | Set up a phone call or video tour |

This stays inside the product's scope. BACKLOG X-07 rules out a full lead-capture, proposal and
contract builder, so there are **no** pipelines, stages, proposal documents or conversion to a booked
event here. An inquiry is a task with the client's details attached. It is done when the manager has
dealt with it.

## Prototype constraints

- The app has no backend. Inquiries are saved in the **same browser's localStorage** as the rest of
  the store, so the client form and the manager's view have to run in the same browser. The form
  says so in a prototype note, like `LocalAccountsNote`.
- When nobody is signed in, the form submits to the sample venue (Willow Stone). When someone is
  signed in, it submits to their venue. This uses the same `scopedKey` rule every store already
  follows. If another tab moves the browser to a different workspace, the form reloads so it never
  saves to the old one (anything typed so far is lost).
- If the manager has the app open in another tab, a new inquiry shows up there without a reload,
  through a `storage` event listener.
- The prototype's "today" is fixed at `TODAY_KEY` (Sat, Oct 10, 2026). Submission and due dates use
  it so the inquiry sorts correctly against the seeded tasks.

---

## 1. Client side: `/inquire` (public)

The page sits outside the `(app)` route group, with no sign-in and no sidebar. It uses a light frame
in the style of `AuthLayout`, headed with the venue name. The steps are on one page, and only the
current step's card is shown.

### Step 1: What can we help with?

There are four large choice cards (radio semantics, keyboard accessible), each with an icon, a
title and one line of text:

- **Schedule a walkthrough**: "See the spaces in person."
- **Ask for a quote**: "Get pricing for your date and guest count."
- **Ask about services**: "Catering, bar, rentals and more."
- **Schedule a call or virtual tour**: "Talk it through, or see the venue on video."

The choice can be deep-linked with `/inquire?type=walkthrough|quote|services|call`, which skips straight
to step 2 so a venue website can link each button to its own form.

### Step 2: Details

Everyone fills in **About you**:

| Field | Rule |
|---|---|
| Your name | required |
| Partner's name | optional |
| Email | required, valid email |
| Phone | optional; required if the preferred contact is "Text" or "Phone" |
| Best way to reach you | Email (default) · Phone · Text |

Each kind then adds its own fields:

**Walkthrough**
| Field | Rule |
|---|---|
| Preferred date | required, today or later |
| Time of day | Morning · Afternoon · Evening, required |
| Backup date | optional, today or later, different from the preferred date |
| How many people are coming | 1–6, default 2 |
| Anything we should know | optional |

**Quote**
| Field | Rule |
|---|---|
| Type of event | `EVENT_TYPES`, default Wedding |
| Event date | required, unless "We're flexible" is ticked |
| We're flexible | checkbox. When ticked, the date becomes an optional "Month you're thinking of", which if filled in must be `YYYY-MM` and this month or later |
| Estimated guests | required, 1–500 |
| Services you're interested in | checkboxes, using the services list below |
| Anything else | optional |

**Services**
| Field | Rule |
|---|---|
| Services you're asking about | checkboxes, at least one |
| Your question | required, 10–1000 characters |
| Event date, if you have one | optional |

**Call or virtual tour**
| Field | Rule |
|---|---|
| Phone call or video tour | Phone call · Video tour, required |
| Preferred date | required, today or later |
| Time of day | Morning · Afternoon · Evening, required |
| Anything you'd like to cover | optional |

For a phone call, the phone number in **About you** is required.

Services list: In-house catering · Bar service · Day-of coordination · Rentals (tables, chairs,
linens) · AV and sound · Rehearsal dinner · Overnight stay.

Errors show inline and are only checked on submit, which matches the existing `useRecordForm`
behaviour (red, with an icon, `aria-invalid`). **Back** returns to step 1 and keeps what was typed.

### Step 3: Review and send

A read-only summary of everything entered, with **Edit** to go back and **Send inquiry** as the
primary button.

### Confirmation

"Thanks, Alex. Willow Stone will get back to you within one business day by email." It shows a
reference number (the inquiry id) and a short "What happens next" list for that kind, for example
"We'll confirm a time for your walkthrough." There is one secondary action, **Send another inquiry**.

---

## 2. Manager side: into Tasks

### State (`lib/store.jsx`)

A new `inquiries: []` array in the store's persisted state. Reset clears it like everything else.

```js
{
  id: 'inq-…',                 // newId('inq')
  kind: 'walkthrough' | 'quote' | 'services',
  submittedOn: '2026-10-10',   // TODAY_KEY
  name, partnerName, email, phone, contactPref,
  // kind-specific
  preferredDate, timeOfDay, backupDate, attendees,               // walkthrough
  eventType, eventDate, flexible, month, guests,                // quote
  services: [], question,                                        // quote / services
  format,                     // call: 'phone' | 'video' (plus preferredDate, timeOfDay)
  message,
  status: 'new' | 'done' | 'closed',
  outcome: null | { label, note, on }   // what the manager did
}
```

New actions: `submitInquiry(fields)` returns the id, `resolveInquiry(id, outcome)`,
`closeInquiry(id, reason)` and `reopenInquiry(id)`.

### Derived task (the funnel)

Every inquiry with status `new` adds an item to `allOpenTasks`, in the same shape as the other
sources. There is no separate inbox to check.

| | Walkthrough | Quote | Services | Call |
|---|---|---|---|---|
| **title** | Confirm a walkthrough with Alex Rivera | Send a quote to Alex Rivera | Answer Alex Rivera's question | Set up a video tour with Alex Rivera |
| **what** | Asked for Sat, Oct 17 · Afternoon (backup Sun, Oct 18). 2 people. | Wedding · Sat, Jun 12, 2027 · 140 guests. Interested in catering, bar. | "Do you allow outside caterers…" (first 120 characters) | Asked for Tue, Oct 13 · Evening. |
| **why** | New inquiry. Reply within one business day so the date doesn't go elsewhere. | (same) | (same) | (same) |

- `source: 'inquiry'`, `type: 'Inquiry'`. **Inquiry** joins `SYSTEM_TASK_TYPES`, so it is locked on
  the Task types screen and available as a filter.
- **Due:** the day it arrives (`submittedOn`), so a new inquiry lands in **Do first** with tone
  `urgent`. That fits the "one business day" promise made on the confirmation screen.
- **Who:** no couple or contact tags, because the client is not a couple record yet. `eventName` is
  the request type ("Schedule a walkthrough") instead of "No event".
- `href` is `/inquiries/view?id=…`, which is the **Action** button.
- When resolved or closed, it moves to `completedTasks` ("Walkthrough booked with Alex Rivera",
  "Quote sent to Alex Rivera", "Closed: Alex Rivera's inquiry"), so it can be seen under Status →
  Completed.

The dashboard's Do first list and the sidebar's Tasks count pick it up without any changes, because
they already read `openTasks`.

### Inquiry detail: `/inquiries/view?id=`

The page uses the `?id=` query pattern from `vendors/profile`, because a static export can't
pre-render ids created at runtime. It has breadcrumbs (Tasks → Inquiry), a header with the client's
name, a kind badge and a status badge, and two cards:

- **What they asked**: every submitted field as a `DetailGrid`, with the message shown in full.
- **Contact**: email, phone and preferred contact method (`ContactInfo`).

There is one primary action for each kind:

- **Walkthrough → Book walkthrough**: a modal with the date (prefilled with their preferred date,
  today or later) and a time (prefilled from the time of day: 10:00 AM, 2:00 PM or 5:00 PM). Saving:
  1. resolves the inquiry with `"Walkthrough booked for Sat, Oct 17 at 2:00 PM"`. While the booked
     task exists, this line reads its current date and time, so rescheduling the task updates it.
  2. **creates a task** "Walkthrough with Alex Rivera", type **Venue prep**, due on that date and
     time and linked back to the inquiry, so the visit itself is tracked in Tasks and on its due
     date. Its description says how many people are coming and how to reach the client.
  3. shows a toast with Undo, which reverses both steps.
- **Call → Book call**: works the same way as Book walkthrough. It creates the task "Call with Alex
  Rivera" or "Video tour with Alex Rivera", type **Couple follow-up**.
- A venue can rename or delete those two task types. If it no longer has the usual one, the booked
  task takes the locked **Inquiry** type instead.
- **Quote → Mark quote sent**: a modal with an optional amount and an optional note. It resolves the
  inquiry and shows a toast with Undo.
- **Services → Mark answered**: a modal with an optional note. It resolves the inquiry and shows a
  toast with Undo.

A secondary **Close without follow-up** action (for spam, not a fit, or a date that is taken) asks
for confirmation and has Undo. A done or closed inquiry shows its outcome and a **Reopen** button.

Tasks created from an inquiry have no `eventId`. `taskFromRecord` and the store currently assume
they do (`/events/undefined/tasks`), so the fix is: `href` falls back to the linked inquiry, or to
`/tasks`, and `eventName` to "From an inquiry".

### Getting to the client form (prototype)

There is no separate Inquiries list. Tasks is the only way in (decided at spec review). So that
testers can play both sides, the Tasks page header gets a secondary button, **Client inquiry form
(prototype)**, which opens `/inquire` in a new tab. The welcome screen doesn't link to it because
it's the manager's product page.

### Seed

The demo workspace starts with one sample inquiry (`inq-sample-walkthrough`): Jordan Ellis and Sam
Okafor asking for a weekend walkthrough. It's due today, so testers see the funnel without filling in
the form first. Other workspaces start with none, as with every other sample record
(`lib/mock/scope.js`).

---

## 3. Out of scope (later)

- Turning an inquiry into a couple and event with `bookingStatus: 'Inquiry'` or `'Tentative hold'`
- Real availability or calendar checking on the walkthrough date (it is a request, not a booking)
- Email or text notifications, spam protection, file uploads
- A quote builder or pricing rules

## 4. Files

| New | |
|---|---|
| `app/inquire/page.jsx` | public form (steps, review, confirmation) |
| `components/inquiry/*` | `KindPicker`, `InquiryForm`, `InquiryReview`, `InquiryConfirmation`, `InquiryDetails`, resolve modals |
| `lib/inquiries.js` | kinds, services list, validation, task-wording helpers (pure functions) |
| `app/(app)/inquiries/view/page.jsx` | detail and actions |

| Changed | |
|---|---|
| `lib/store.jsx` | `inquiries` state and actions, derived open and completed tasks, cross-tab `storage` sync |
| `lib/tasks.js` | `Inquiry` system type; `taskFromRecord` handles tasks without an event |
| `lib/mock/records.js`, `lib/mock/scope.js` | the seeded sample inquiry |
| `components/tasks/TaskEditor.jsx` | the Event field is optional for a task that came from an inquiry |
| `app/(app)/tasks/page.jsx` | **Client inquiry form (prototype)** button |
| `README.md` | screen map and the loop |

## 5. Acceptance check

1. Signed out, go to `/inquire?type=walkthrough`, fill it in and send it. The confirmation screen
   appears.
2. Sign in to the demo. Tasks → Do first shows the seeded Jordan Ellis inquiry and "Confirm a walkthrough with Alex Rivera · Inquiry ·
   Due today", and the sidebar count goes up by 1.
3. Click Action, then Book walkthrough and save. The inquiry task moves to Completed, and a new task
   "Walkthrough with Alex Rivera" appears with the chosen due date. Undo reverses both.
4. Do the same for quote, services and call. Filtering Tasks by type **Inquiry** shows only inquiries.
5. Reset prototype data removes every inquiry.
6. `npm run lint` and `npm run build` pass.
