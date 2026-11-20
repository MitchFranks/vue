# Task View Requirements: prompt for a blank canvas

Paste everything below the line into a fresh Claude session. It restates the Tasks feature as built on the `danny-tasks` branch, so it can be rebuilt or extended without this conversation. Adjust the stack lines at the top if the target is not this project.

---

## Prompt

Build (or verify, if it already exists) the **Tasks** view for a wedding-venue operations app. The app is a Next.js static export (App Router, client components, a context store persisted to localStorage, Tailwind design tokens). Read `AGENTS.md` and the docs in `node_modules/next/dist/docs/` before writing code, because this Next.js version has breaking changes.

### 1. What a task is

Everything the venue manager must act on is a **task**. A message to answer, an open staffing spot, a document to sign, a payment to collect, and a task someone wrote are all the same list. One set of sorts and filters works across all of them. There are no separate "Show" or "Event" chip rows.

- The page is called **Tasks** (route `/tasks`). The old name "Up Next" is retired. "Up Next" may return later as a specific saved view, so use neutral names in code: `Task`, `taskId`, `openTasks`, `completedTasks`. Do not use "attention" or "item".
- No subtitle under the page title.
- Every task has: name, due date (required), optional due time, type, optional description, event (required), who it is for (couples or contacts), vendor tags, and a source (`staffing`, `message`, `document`, `payment`, `manual`).
- Only **manual** tasks (written by the venue) are stored and can be edited or ticked off. The others are derived from their own records and finish where they live.
- Show tasks that are not due yet, so the manager can plan ahead.

### 2. Task types

- System types are locked: **Message, Payment, Sign Document, Staff**. The product assigns them.
- Venue types are managed on a separate screen, `/tasks/types`, opened from **More → Manage task types** on the Tasks page. It supports add, rename and delete.
- Defaults: Couple follow-up, Other, Paperwork, Vendor coordination, Venue prep.
- Names are unique (case-insensitive), at most 40 characters, and cannot reuse a built-in name.
- Renaming moves tasks to the new name. Deleting asks which type the affected tasks should move to.

### 3. Task card

One card for every source, in this reading order: due badge, then type · event name · event date (for example "Staff · Johnson Wedding · Sat, Oct 10"), then the task name, then the description, then tags (couples with a heart icon, contacts with a user icon, vendors with a truck icon), then buttons.

- **Description:** show only the first two lines. If it is cut off, show a "Show more" link that expands it and becomes "Show less". No link when the text fits.
- **No "Why" line.** It duplicated the description.
- **Main button:** names what it does, from the task's source (`lib/taskAction.js`): Answer request, Reply, Ask staff, Review and send, See replies, Open document, See agreement, See payment, Open inquiry, Open couple, Open to-do. The task name follows as screen-reader-only text. (User test v4 replaced the old generic "Action" label: testers didn't know what it would do.)
- **No Hide feature** anywhere. Sort and filter replace it.
- **Edit:** shown only on open manual tasks, to the left of the buttons.
- **No checkbox.** Under the main button, a second button of the same width, **Mark done** (check icon), completes a manual task. Completing shows a toast with Undo. A manual task that needs a number (the catering guest count) has no Mark done, because it is completed by entering the number. Messages, documents, payments and staffing spots have none either, since they finish where they live.
- Completed tasks are muted and struck through, and the same slot reads **Reopen** (refresh icon) to bring one back.

### 3b. Assigned to (delegation)

From the venue manager interview: "helps me delegate and track responsibilities with my team ... who's responsible for each thing without having to constantly follow up."

- Every task names one person from the staff directory, or **Unassigned**. The manager is a staff record too, shown as "(you)".
- Any task, written or raised by the product, is assigned in the editor (**Assigned to**, defaulting to the manager) or straight from its card with an inline picker. Reassigning shows a toast with Undo.
- Raised tasks (messages, open spots, documents, payments, inquiries, sheet changes) are edited in the same editor as written ones: name, due date and time, type, event, description, tags and assignee. The changes are kept by task id and laid over the raised task, so the message or spot itself is untouched. They are still finished where they live; on the assignee's list they link to Vue ("Finish it in Vue") instead of Mark done.
- **Assigned to** is a filter property (multi-select, with Unassigned). `/tasks?assignee=<staffId>` opens Tasks filtered to one person; each staff profile has a Tasks card linking there.
- Above the list, two pickers are always in view: **Show to-dos for** (a person, or Everyone) and **Event**. `/tasks?event=<eventId>` and `/tasks?q=<words>` open Tasks filtered the same way; search matches the name, the description and the event. Sorted by due date, the list is split under Overdue, Today, Tomorrow, Later this week and Later.
- On the card, **Assigned to** is a labelled, bordered dropdown (not borderless text), so handing a to-do on is visible.
- **The assignee's view**: `/my-tasks?s=<staffId>`, public and phone first. Open tasks grouped Overdue, Today, This week, Later, each with **Mark done**; then the events they're working (with unread sheet changes); then Done recently with Reopen.
- When a task is done, the card says who did it and when ("Done by Marisol · Sat 10:00 AM").

### 3c. Team view

- `/tasks/team`, **Who's doing what** (its own sidebar item, and a button on Tasks): one row per active person, the manager first, then a **Nobody yet** row. Each row leads with **open this week** (overdue, today and the next six days), then open in total. **See to-dos** opens the person's to-dos with an **Assigned to** picker on each; **Hand off** moves any or all of them to someone else at once (for someone out sick), with Undo.
- Each row shows open, overdue, due today and this week, what's next, and how many they finished this week.
- A row opens Tasks filtered to that person; **Their list** opens their phone view.

### 3d. Planning templates

From the venue manager interview: "a centralized system that automatically organizes tasks ... see what's coming up, what still needs to be done."

- `/tasks/templates` (**More → Planning templates** on Tasks). Two templates: **Wedding plan** (weddings) and **Event plan** (every other event type).
- A step is: when (days before, on the day, or days after the event), what, task type, who usually does it (the manager, or a role), and an optional description.
- Every event gets its template's steps as ordinary written tasks, dated from the event and assigned to the first active person in the role. They show on Tasks and the event's Tasks tab with the template's name next to the event, and are edited, reassigned and marked done like any other task.
- Editing a step changes it on every event, except what was changed on a task itself. A new step only creates tasks due from today on. Deleting a step asks first, then removes its tasks from every event.

### 4. Toolbar (modelled on Notion)

Above the list: the task count on the left, and on the right three small icon buttons followed by a filled **+ New** button.

Order: **Filter** (funnel), **Sort** (up/down arrows), **Search** (magnifier), **New**. Panels open only when asked for, one at a time, anchored under the buttons. Escape or a click outside closes a panel and returns focus to its button.

**Indicators next to the count.** Under the count line, show one removable chip for every filter and sort in force, for example "Task type: Staff", "Due: this week", "Sorted by due date, soonest first". Clicking the label opens that panel. The ✕ removes it. The Filter button reads "N filters" and highlights while any filter is active. The Sort button reads "1 sort" and highlights while a sort is set, and is just the icon otherwise.

**Search.** The icon opens an inline box that filters by task name. It stays open while it has text. Escape clears and closes it.

**Filter panel.** Rows read "Where / And · [property] · is any of · [value] · trash". "+ Add filter" adds a row and "Delete all filters" clears them. Properties are Assigned to, Task type, Due, Couple, Vendor and Status. A property can be used once. Changing a row's property clears its old value.

- **Status** is a filter, not a button: Open (default), Completed, Open and completed. Completed tasks live in the pool always, and Status decides whether they show. Open and completed tasks appear in separate cards.
- **Due** is one choice: any time, overdue, today, this week, or on a date. "This week" is today plus six days. One choice means the options cannot contradict each other.
- **Task type, Couple, Vendor** are multi-select. Several values inside one filter are OR. Different filters are AND.

**Sort panel.** One row: [property] [direction] [trash]. Properties: Due date, Contact, Couple, Vendor, Task name. Direction labels follow the property ("Soonest first / Latest first", "A–Z / Z–A"). The default is due date, soonest first. Removing the sort leaves the list in its original order, and a "+ Add sort" button brings it back. Tasks with nothing to sort on (no vendor, say) always go last. Due date sorts on date, and within a day tasks with no time come first, then by time. Couple names sort by the first partner's first name, because couple names are stored alphabetically ("Ava & Zack").

**Exclusions.** Choices that cannot be combined are disabled, with the reason shown:

- A couple and one of its own partners exclude each other ("Already included in Emily & Marcus Johnson"). Partners of different couples can be combined.
- Any choice that would leave zero results is disabled with a count of 0 and a reason ("No tasks match your other filters" or "No tasks yet"). Counts beside each choice reflect every other active filter.
- Stay gender-agnostic everywhere: people are contacts, never "bride" or "groom".

**+ New.** Opens the task editor in a side sheet titled "New task", with a button "Save". It starts empty and is owned by the signed-in venue manager. Adding shows a toast.

### 5. Pickers that scale

Use one searchable multi-select combobox for couples, contacts, vendors and types. It must work with 18 couples or 200 vendors: no long checkbox lists.

- Chosen values appear as removable chips inside the field. Typing narrows a dropdown. At most 50 options draw, with a "keep typing" note beyond that.
- Follow the ARIA combobox + listbox pattern: arrows move, Enter toggles, Escape closes only the list (not the surrounding sheet), Backspace on an empty box removes the last chip.
- Disabled options show their reason under the label.

**People Tag (couple or contact).** In the task editor the field is labelled "People Tag (optional)". Couples are the default and the only choice offered. A quiet link under the field, **Tag individual contact instead of couple**, reveals a Couple / Individual contact switch and moves the list to contacts. The switch only changes what the list offers, so nothing already chosen is lost. The same component is used in the Filter panel's Couple property.

### 6. Task editor

Side sheet. Fields: Task name (required), Due date (required), Event (required, starts on "Choose an event"), Due time (optional), Task type (select, with a "Manage task types" link), Description (optional), People Tag, Vendor tags.

A required field the user tries to submit without gets a **light red background**, a red border and a red message beneath it. This is the shared error style for every form field.

### 7. Wedding date on cards

Every card shows the event's own date next to the event name, so tasks for different weddings are told apart at a glance.

### 8. Acceptance checks

1. Tasks page shows 19+ tasks across all five sources in one list, sorted by due date by default.
2. Filter by two task types at once: results include both.
3. Filter by a couple, then open the Couple filter's contact mode: that couple's own partners are disabled with a reason.
4. Add a Status filter of "Open and completed": completed tasks appear in a separate card and the count says how many.
5. Remove the sort: the Sort button returns to just the icon and the list keeps its original order. Add it back with "+ Add sort".
6. Filter and sort chips appear under the count and each ✕ removes only its own.
7. Click + New, submit empty: name, due date and event turn light red. Fill all three and click Save: the count goes up by one.
8. A task with a very long description shows two lines and "Show more".
9. Every task's main button names its action (never "Action"), and manual tasks have "Mark done" beneath it (no checkbox). No Hide button or "hidden" text exists anywhere.
10. Mark done removes a manual task from the open list and Undo restores it. A completed task (Status filter) shows Reopen.
11. `/tasks/types`: adding a duplicate or a built-in name is refused. Deleting a type in use asks where its tasks go.

### 9. Working notes

- Prototype "today" is frozen (2026-10-10) so the data stays consistent. The saved-state key is bumped whenever the stored shape changes.
- Stop the dev server before `git mv`, and never run `next build` while `next dev` is running (it corrupts `.next`).
- Keep sort and filter logic as pure functions in one module (`lib/tasks.js`), separate from the UI.
- Do not commit or push unless asked.
