# Danny's notes, organized by MoSCoW

Your original wording is kept. `[x]` = done, `[ ]` = not done yet. The notes came in two batches; the tag after each item (e.g. *(batch 2, #3)*) says where it came from. The bucket each item sits in is my proposal, so move anything that feels wrong. A line starting with ↳ is a status note.

---

## Must have

- [ ] **Guide the user quickly into solving problems that need attention for weddings, with small, rapid wins.** *(batch 2, #7)*
  I think we need to guide the user quickly into solving problems that need attention for weddings. To encourage this behavior, we want to give them a series of small, rapid wins that make them feel like they're making progress. The first thing I can think of is customizing the platform look to their own preference and typing something in that makes it feel like the system is getting updated with information it "needs to know". I think they should choose their preferred color and we use this to guide their attention through the platform right to their first creating their first to do item.
  ↳ Not started. Related backlog items: B-01 (first event in under 10 minutes), B-03 (guided first run with sample data). The style guide's single accent colour makes the "choose your colour" step a one-token change.

- [ ] **Dashboard reads like a sales pitch; it should streamline the next action.** *(batch 1, #2)*
  when i visit the dashboard is that it still reads like a sales demo pitch rather than a useful platform. I think these should be separate. Once on the platform, it should be streamline your thought process to the next action you want to take, not reselling the value of the platform back to you.
  ↳ Not done. The dashboard now says "Here's what to tackle next across your weddings" and leads with Up Next, but it still has a headline and lead paragraph. Needs a pass to remove the pitch framing.

- [x] **Focus on the wedding niche.** *(batch 2, #2)*
  Right now, the platform is a generic event planner. I think we should focus on the wedding niche to keep scope and context easier to manage. I would do the same thing if I were starting a business.
  ↳ Done. Seed events, event types, copy, README and dictionary are wedding-only.

- [x] **Reframe "Needs Attention" so it signals priority without chronic stress.** *(batch 2, #3)*
  The "Needs Attention" framing will create chronic stress for the user. We need a reframe that signals the same priority without the stress.
  ↳ Done. Now **Up Next**, with "Do first" / "Coming up", violet instead of red, and "All caught up". See README "Up Next Design".

- [x] **Make staffing one workflow, launched from a single Staffing Planner menu item.** *(batch 2, #5)*
  The Open Positions, Staff Planner, Publish Schedule, Availability pages are all elements of the same workflow. The job to be done here is "Help me organize my staff into the roles I need them to fill at the times they should be assigned". Instead of separate tabs in the side menu, this should be a single workflow that allows the user to visit any stage from any other stage. The side menu should have Staffing Planner as the sole menu option. When clicked, it should take the user to the first logical page. The remainder of these pages should be arranged in a logical order. I want to treat it like a Salesforce Opportunity stages with the pipeline stage progress bar at the top, but when the user clicks on a stage it takes them to that page. It should highlight the stage they are on.
  ↳ Done, then superseded by the next item. A five-stage pipeline bar was built first, then replaced by the Staff Planner's four-tab bar. The sidebar still has Staffing Planner as its only staffing item.

- [x] **Build staffing from existing software, as the Staff Planner.** *(batch 2, #6)*
  The staffing problem is an already solved one. We don't need to reinvent it. Have an agent lookup what software already does this well and report back. Have a separate agent use the documentation to copy/create the workflow and screenflow. Implement it as the Staff Planner feature launched from the existing side menu button. This will replace the current 5 step workflow that exists.
  ↳ Done. Research: `docs/research/STAFF-SCHEDULING-SOFTWARE.md`. Spec: `docs/STAFF-PLANNER-SPEC.md`. The 5-step workflow is deleted. Not yet clicked through: decline, replace, offer, claim, copy staffing, phone widths.

---

## Should have

- [x] **A more unique design, with a style guide to keep it consistent.** *(batch 2, #1)*
  The whole site looks like a 2025 Claude Spin-Up. We need a more unique design with a style guide to keep it consistent.
  ↳ Done. New palette (five hues), one typeface, pill shapes. Rules in `docs/STYLE-GUIDE.md`, live at `/style-guide`.

- [x] **Availability reachable from the Staff Directory.** *(batch 2, #4)*
  Availability should also be a sub-function of Staff Directory. make this a button accessible from the Staff Directory page.
  ↳ Done. "View availability" button on the Staff Directory opens the Staff Planner's Team availability tab.

- [ ] **Two buttons on the home page say different things but go to the same place.** *(batch 1, #1)*
  I notice that there are 2 buttons on the home page that say different things and lead to the same place. This makes me think when i shouldn't need to.
  ↳ Not done. On the welcome screen, "Open dashboard" (header) and "See what's up next" (hero) both go to `/dashboard`. Pick one, or give them different destinations.

---

## Could have

- [ ] **Native AI: read and write the system with natural language.** *(batch 2, #8, originally "Lesser Priority")*
  I also think there should be native AI functionality to enable read and write to the system via natural language to streamline inputs.
  ↳ Not started.

---

## Won't have (this round)

Nothing deliberately excluded yet. The competitor-complaint backlog (`docs/BACKLOG.md`) lists 10 items already dropped as not applicable to a venue app.

---

## Progress

| Bucket | Done | Open |
|---|---|---|
| Must | 4 of 6 | Guided quick wins; dashboard as next action |
| Should | 2 of 3 | Duplicate home page buttons |
| Could | 0 of 1 | Native AI |
