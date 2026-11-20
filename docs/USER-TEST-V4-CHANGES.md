# User test v4: what testers said, and what changed

Four venue managers and coordinators on Prolific tried three tasks in Vue (Nov 18–19, 2026). All four passed the attention check.

| Task | Gave up | Answered correctly | Ease in Vue (avg, 1 to 7) |
|---|---|---|---|
| 1. Get a couple's change to the staff | 0 | 3 of 4 ("Theo") | 3.3 |
| 2. Get a couple to sign and pay | 1 | 2 of 4 ("4242") | 3.5 |
| 3. Hand off a to-do, see who has what | 3 | 1 of 4 | 1.3 |

"Would use it at my venue" averaged 2.75 out of 7.

## What they said, and the change for each

| What testers said | What changed | Where |
|---|---|---|
| "Its hard to get a grip of what is there." "I can't find anything." | **Search** on every page finds people (and their to-dos), events, couples, vendors, to-dos and everyday jobs. Press `/` to jump to it. | Top bar. `components/search/FindAnything.jsx` |
| "A demo first but with pointers where to find what to find." | **Help** ("Where do I…?") lists nine everyday jobs, step by step, each with a button that goes there. The welcome message now points to Search, Help and Updates. | Top bar. `components/help/HelpPanel.jsx`, `lib/help.js`, `components/onboarding/IntroModal.jsx` |
| "There was no alert, it was rather hidden… I probably would have missed it." | **Updates** (the bell) counts couple requests waiting for an answer, plus anything couples did today. A **pop-up** appears the moment a couple asks, signs or pays. If the venue tab is in the background, it waits until the tab is looked at again. Every event page shows a banner while its couple is waiting, and the Detail sheet tab counts waiting requests. | Top bar, every event page. `components/updates/`, `lib/updates.js`, `components/events/EventHeader.jsx` |
| "I made the payment but can't see where it says paid." "It took me a moment to find where to view the completed payment and signature." | **Where the couple stands**, at the top of every event: each agreement signed or not (by whom, when), what is paid and still owed, the next due date, and requests waiting. The dashboard's **From your couples** lists signatures and payments as they happen. | Event → Overview. `components/events/CoupleStanding.jsx`. Dashboard. |
| "Nothing flagged on the system that it was overdue in the first place." | Agreements can have a sign-by date. Once it passes, they show as **Overdue** on the event, on the dashboard ("Still waiting on couples") and as an urgent to-do. The Shah–Patel AV addendum was due Oct 9, so it starts overdue. Payments due within the week show there too. | `lib/updates.js`, `lib/store.jsx` (section 4b), `lib/mock/records.js` (`signBy` on d11) |
| "I would have expected it to have been on my dashboard, or even automated if he is off sick." | **Who's doing what** is a sidebar item. Each person shows one plain number, **open this week**. **See to-dos** lists theirs with an Assigned to picker on each. **Hand off** moves any or all of someone's to-dos to another person at once, with Undo. The dashboard has a **Your team this week** card. | `app/(app)/tasks/team/page.jsx`, dashboard |
| Assigning was hard to find | On every task card, **Assigned to** is a labelled dropdown with a border and an arrow. Before, it looked like plain text. | `components/tasks/TaskCard.jsx` |
| "Maybe make it a tiny little bit more simple." "Too much complicated and time consuming." | **Tasks:** "Show to-dos for" and "Event" pickers are always in view. The list is split into Overdue, Today, Tomorrow, Later this week and Later. Search also reads descriptions. The header has one button (Who's doing what), with set-up screens under **More**. Every task button says what it does ("Answer request", "Reply", "Ask staff") instead of "Action". "Edit details" is a real button. | `components/tasks/`, `lib/taskAction.js`, `lib/tasks.js`, `components/ui/MoreMenu.jsx` |
| Professional but warm (team brief) | Warm ivory neutrals replace the cool greys; the Laurel green and status colors are unchanged. The dashboard opens with "Welcome back, Dana". The sidebar is grouped by job: Your day, Events and couples, Staff and vendors. Each item has a tooltip. | `app/globals.css`, `components/layout/nav.js`, dashboard |
| The couple's side of task 1 | In the portal, "Your day's schedule" sits right under "Up next" with a button that says **See your day and ask for a change**. Each item's "Ask for a change" is a bordered button. | `components/portal/ClientPortal.jsx`, `components/portal/PortalRunOfShow.jsx` |
| "Integrated fully with our systems." | Not in this round. It needs a real back end and imports. | |

## Undo on everything

Every action that changes something now confirms in a toast with an **Undo** button, for 10 seconds. Undo puts things back exactly as they were and says so ("Undone. Jake Miller is back."). One helper does it everywhere: `useUndoable` in `lib/undo.jsx`. It snapshots the stores before the action and restores them on Undo. Pass `eventId` and the run of show comes back too.

This round added Undo to:
- accepting or declining a couple's request, which also takes the change back off the run of show
- reminders, message replies and new messages ("Undo send")
- saving the venue profile, and adding, editing, deactivating or deleting staff and vendors (a deleted person or vendor comes back with everything they had)
- task types, roles and categories, and planning-template steps (add, save and delete)
- new tasks and task edits, ticking off a task or sending the guest count on an event's Tasks tab, and resetting a run of show
- on the couple's side: sending or taking back a request, cancelling a meeting
- on staff phones: Mark done and Got it

Undo already existed for detail sheet edits, staffing, reassigning, hand-offs, marking a document signed, recording a payment and closing an inquiry.

These stay final: a couple's own signature and card payment (in real life these are legal and money records, so the pay button says exactly what it does), deleting an account, and Reset prototype data. Each asks first. Warnings that said "This can't be undone" now say "You can undo it straight after" where that is true.

## Simplicity pass (before merging)

One tester didn't finish at all. To make Vue easy to pick up the first time:

- **"New here? Vue in three steps"** sits at the top of the dashboard: check Updates, do the to-dos, and use Search or Help when lost. "Got it" hides it. Help's "Show the 3-step guide on the dashboard again" brings it back, and so does Reset prototype data. Code: `components/help/FirstSteps.jsx`.
- **Fewer tabs on event pages.** Vendors and Activity log sit behind a last "More" tab. When you're on one of them, the More tab takes its name, so you can always see where you are. Code: `components/ui/Tabs.jsx` (`more: true`).
- **Shorter, plainer page introductions** on Tasks, Who's doing what, Staff directory, Couples and Messages.

## The three tasks now

1. **Couple's change:** Priya sends a request in "Your day". On Dana's side, a pop-up appears with **Review request**, and the bell shows it. Review request opens the Detail sheet at the request. After **Accept**, the Changes card says "Seen by 0 of 1 · Not yet: Theo".
2. **Sign and pay:** after Priya signs and pays, Dana gets a pop-up for each. The dashboard's **From your couples** lists "Priya signed…" and "Priya paid the balance of $4,600". The event's **Where the couple stands** card says "Signed" and "Paid in full".
3. **Hand off:** on Tasks, choose **Show to-dos for: Caleb Ross**. Change **Assigned to** on "Schedule the floral pickup" to Sarah Chen. **Who's doing what** then shows Caleb's **open this week**.

**For the survey team:** Caleb has 3 to-dos open this week before the hand-off and 2 after it. Task 3's question doesn't say which it means. Respondent 4 answered 3. Consider "after handing off the floral pickup" in the wording.

## Not changed

- Survey wording, user flows and data, except the AV addendum's sign-by date (which adds an overdue flag and an urgent to-do).
- Staffing Planner, Detail sheet editing, templates, the client portal's steps.
