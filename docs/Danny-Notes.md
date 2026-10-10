# Danny's notes organized by MoSCoW

## Must have

- [ ] ****

- [ ] **The Couples page needs a button to add a new couple**


- [ ] **Upcoming Events should have a sort feature so you can see events in chronological order**


- [x] **Guide the user quickly into solving problems that need attention for weddings, with small, rapid wins.** *(batch 2, #7)*
  I think we need to guide the user quickly into solving problems that need attention for weddings. To encourage this behavior, we want to give them a series of small, rapid wins that make them feel like they're making progress. The first thing I can think of is customizing the platform look to their own preference and typing something in that makes it feel like the system is getting updated with information it "needs to know". I think they should choose their preferred color and then the system updates to use their chosen color. We strategically design the system so that the buttons/elements that we use to direct their attention adopt their chosen color. It will immediately stand out to them. use this to guide their attention through the platform right to inputting their first couple's names. Basic screen flow: 1. (From Home page) Welcome to the platform pop up (allow them to exit the guide but signify that the guide is only 3 steps and they're already on the 1st one: signify this with a "1/3" label on the pop up). 2. Choose your theme pop up. 3. point to the "Up Next" menu button (conveniently the very color they chose).

  Follow up: When the user clicks "Up next" on the guide pop up, it should then end the guide since they just clicked the final button. Also, add the ability to click the account initials icon and give that a pop out menu for Account, Settings. Add those pages and make sure settings has the ability to change the theme from the same choices as the original menu in the guide. 


- [x] **Focus on the wedding niche.** *(batch 2, #2)*
  Right now, the platform is a generic event planner. I think we should focus on the wedding niche to keep scope and context easier to manage. I would do the same thing if I were starting a business.

- [x] **Reframe "Needs Attention" so it signals priority without chronic stress.** *(batch 2, #3)*
  The "Needs Attention" framing will create chronic stress for the user. We need a reframe that signals the same priority without the stress.

- [x] **Make staffing one workflow, launched from a single Staffing Planner menu item.** *(batch 2, #5)*
  The Open Positions, Staff Planner, Publish Schedule, Availability pages are all elements of the same workflow. The job to be done here is "Help me organize my staff into the roles I need them to fill at the times they should be assigned". Instead of separate tabs in the side menu, this should be a single workflow that allows the user to visit any stage from any other stage. The side menu should have Staffing Planner as the sole menu option. When clicked, it should take the user to the first logical page. The remainder of these pages should be arranged in a logical order. I want to treat it like a Salesforce Opportunity stages with the pipeline stage progress bar at the top, but when the user clicks on a stage it takes them to that page. It should highlight the stage they are on.

- [x] **Build staffing from existing software, as the Staff Planner.** *(batch 2, #6)*
  The staffing problem is an already solved one. We don't need to reinvent it. Have an agent lookup what software already does this well and report back. Have a separate agent use the documentation to copy/create the workflow and screenflow. Implement it as the Staff Planner feature launched from the existing side menu button. This will replace the current 5 step workflow that exists.

---

## Should have

- [x] **A more unique design, with a style guide to keep it consistent.** *(batch 2, #1)*
  The whole site looks like a 2025 Claude Spin-Up. We need a more unique design with a style guide to keep it consistent.

- [x] **Availability reachable from the Staff Directory.** *(batch 2, #4)*
  Availability should also be a sub-function of Staff Directory. make this a button accessible from the Staff Directory page.

- [ ] **Two buttons on the home page say different things but go to the same place.** *(batch 1, #1)*
  I notice that there are 2 buttons on the home page that say different things and lead to the same place. This makes me think when i shouldn't need to.

- [x] **Sidebar kept two items highlighted.**
  Fix the bug as seen in the screenshots folder on my computer (it's labelled "double-selection-menu-bug"). When I select a different menu item, it doesn't unselect the previous one i was on.

- [x] **Clients became Couples.**
  I like couples instead of clients. Run that through. Delete the unnecessary Data Dictionary Proposal. make the changes everywhere.

- [x] **Research Dubsado and Aisle Planner: learning curve first.**
  Spin up another agent to research the two popular wedding planner platforms (Dubsado and Aisle Planner) and find a big list of complaints about these. The first known issue is steep learning curve due to complexity so the first bit of research should focus on what exactly makes it complex or hard to learn quickly and we'll target that pain point in the backlog. Create a prioritized backlog md file from these as they apply to our web app.

- [x] **A second Staffing Planner, built in parallel to compare.**
  I'm not sure we really solved the staffing problem in our app. We need a more robust research->implementation run. I want a parallel changeover so i can compare. Make a 2nd Staffing Planner button on the side menu literally called Staffing Planner 2. Rerun the learning and implementation agent orchestration with subagents of opus 5.5 model.

---

## Could have

- [ ] **Native AI: read and write the system with natural language.** *(batch 2, #8, originally "Lesser Priority")*
  I also think there should be native AI functionality to enable read and write to the system via natural language to streamline inputs.
  ↳ Not started.
  I like the page lineage shown on the event board page under staffing planner. we could put this everywhere.

---

## Won't have (this round)

Nothing deliberately excluded yet. The competitor-complaint backlog (`docs/BACKLOG.md`) lists 10 items already dropped as not applicable to a venue app.

