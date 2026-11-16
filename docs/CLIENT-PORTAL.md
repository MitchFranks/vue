# Client portal

Step 2 of the post-survey plan: one place where the couple signs, pays, fills in their details and books a meeting. It does two jobs:

- It moves the "chasing brides" work onto the couple. 5 of 7 managers said they would hand this off.
- It gives the venue a record of contract and payment status, which nobody has today.

## Where things are

| | |
|---|---|
| Couple's portal | `/portal?c=<coupleId>`, public with no sign-in, like the inquiry form. `app/portal/page.jsx`, `components/portal/ClientPortal.jsx` |
| The four steps | `components/portal/PortalAgreements.jsx`, `PortalPayments.jsx`, `PortalDetails.jsx`, `PortalMeeting.jsx` |
| Manager's record | On the couple's page (`/couples/<id>`): `components/portal/PortalRecord.jsx` |
| Rules and wording | `lib/portal.js`: detail fields, change diff, meeting kinds and times, validation, step summary |
| State | `lib/store.jsx`: `state.portal`, `state.portalPayments`, and the `portal*` actions |
| Sample data | `lib/mock/records.js`: `portalSeed`, and documents with `signer: 'couple'` |

For demos, the sign-in page has an "Open the client portal" button that opens the Shah–Patel couple's portal.

## How it is laid out

The guiding rule: anyone using it should know what each button does and what to do next.

- **Home:** "Hi, Priya", how far along they are ("2 of 4 done" with a bar), **one "Up next" card with the only filled button on the page**, then the four steps as a checklist. Done steps open to view or change.
- **One job per screen** (`?step=sign|pay|details|meeting`): a back link to the checklist, "Step n of 4", one sentence on what happens, and one button that names exactly what it does: "Sign agreement", "Pay $4,600", "Send to Willow Stone", "Book final walkthrough".
- **Confirmation after each step** (`?done=<step>`): what just happened, progress, and the next step as the only button ("Next: Make a payment →").
- **Choices are visible, not hidden in dropdowns.** Meeting types are large cards (`ChoiceCards`) and times are pills (`ChoicePills`), both in `components/ui/Choice.jsx`.
- **Real URLs**, so the browser's Back button works.
- **Copy for every step** lives in one place: `STEP_COPY` in `lib/portal.js`.

On the venue's side, unread changes come first as one banner: what changed (old value struck through, new value bold) and one **Mark as read** button. Below that are the portal's progress, with "Copy link to send" and "Preview portal", and the event details with the change history folded away.

## Your day (run-of-show requests)

Below the checklist, a **Your day** card opens `?view=day`: the couple's run of show, where they ask for changes and say what they expect. It is not a checklist step, because there is nothing to finish. Requests go to the event's Detail sheet for the venue to accept or decline; see "Requests from the couple" in `docs/EVENT-DETAIL-SHEET.md`.

## The four steps

1. **Sign.** Every document for the event with `signer: 'couple'` shows up here.
   - The couple reads the terms, types their full name (it must match one of the partners) and ticks "I agree".
   - The signature `{ name, at }` is saved in `state.portal[coupleId].signatures`.
   - The venue's Documents tab shows the document as Signed, and Tasks counts it as done.
2. **Pay.** This uses the event's existing payment schedule.
   - Paying an installment that is due saves `{ at, by, method }` in `state.portalPayments`.
   - The Payments tab shows "Paid online … by …", the "Collect the …" task disappears, and the done list says who paid.
   - Checkout is simulated, so no card is charged.
3. **Details.** The fields are listed in `DETAIL_GROUPS` (`lib/portal.js`):
   - guest count and number of children
   - key moment times: grand entrance, first dance, cake cutting, send-off
   - day-of contact
   - dietary and accessibility needs
   - outside vendors
   - notes

   The first save is logged as **sent**. Every later save logs **what changed** (field, from, to) in `history`.
4. **Meeting.** The couple picks a final walkthrough, planning meeting or call, plus a date and time. It appears in the venue's Tasks on that date. The couple can change or cancel it.

The "Who's here?" picker records which partner signed, paid or changed something.

## How it feeds step 1 (live event detail sheet)

The details are the start of the event sheet: one record the couple keeps current, instead of paper, memory and conversations in passing.

A change the manager hasn't read becomes a **Tasks item**, for example "Priya Shah changed 1 detail: Cake cutting: 7:30 PM → 8:00 PM". It is urgent within a week of the event. The couple's page highlights it until the manager clicks **Mark as read**, and the **change log** keeps every version.

This addresses the survey's main complaint: a moved cake cutting can't get lost. The next step is to push read changes to the staff, which is what the event sheet will do.

If the manager hasn't read even the first version, the whole set of details counts as new, so Tasks says "sent their details" rather than listing changes.

## Prototype limits

- The link uses the couple id. A real build would use a private, unguessable token per couple.
- Everything is stored in this browser, like the rest of the prototype, so the couple and the manager must use the same browser to see each other's changes.
- Payments are simulated, and signatures are typed names, not a legal e-signature service.
- Couples come from the sample data. Creating a couple from an inquiry, and real accounts' own couples, are not built yet.
- Meeting times are a fixed list, not the manager's real calendar.
