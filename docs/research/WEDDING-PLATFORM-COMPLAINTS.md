# Dubsado and Aisle Planner: user complaints

Research for Vue (wedding-venue operations app). Compiled 2026-10-08 from web searches and page fetches.
Read the [Caveats](#4-sources-and-caveats) first: evidence quality is uneven, and the richest review sites (G2, Capterra, Software Advice) blocked direct reading.

Labels used throughout:
- **[read]** I fetched the page and text was returned to me (through a summarising fetch tool, so quotes are as relayed by that tool).
- **[summary]** I only saw a search-engine summary or snippet of the page. Treat as unverified.
- **[vendor/competitor]** The author sells or competes with the product. Biased.
- **[unverified]** A claim I could not trace to a primary review.

---

## 1. Learning curve and complexity (priority finding)

### 1.1 Headline

**Dubsado** has a strong, consistent reputation for a steep learning curve. It is the single most repeated complaint in every source I saw. Realistic effort quoted by several reviews: **15 to 25 hours** of setup before "production-ready" (Agiled [read], Taskip [read]; Demilked [read] says "hours"). Whole businesses exist to do the setup for users.

**Aisle Planner** is described as comprehensive and therefore overwhelming at first, but the evidence is much thinner (a handful of reviews, mostly editorial). Its complexity is mostly breadth of features and migrating from spreadsheets, not building automations from a blank canvas.

### 1.2 What makes Dubsado complex (specific causes)

| # | Cause | Evidence | Source (status) |
|---|---|---|---|
| 1 | **Blank-canvas product.** The core strength (brand customisation) comes with a "complexity tax". | "You have to build every automation, form, and contract from scratch." | Taskip [read] |
| 2 | **Time to first value is days, not minutes.** 15 to 25 hours of setup; "many clients spend their trial period just configuring their first Flow", so trials end before value is seen. | "Steep learning curve preventing effective trial evaluation" | Agiled [read], Taskip [read], search summary |
| 3 | **Many interlocking concepts that must be learned and wired together:** lead capture forms, Smart Files / proposals, contracts, questionnaires, invoices, canned emails, scheduler, workflows (now "Flows") with triggers, client portal, brand settings, to-dos. | Dubsado's own "12 common mistakes" post is effectively a list of concepts users fail to set up: branding, canned emails, packaged proposals, proposal templates, automated reminders, scheduler, multiple workflows, to-dos in workflows, "not understanding workflow triggers", optimising the client portal. | Dubsado blog [read] (vendor, but telling) |
| 4 | **Workflow builder is confusing; automations take several tries.** | "The workflow builder can be confusing for new users, and getting automations to work smoothly may take several tries." | Assembly [read] |
| 5 | **Trigger logic is not obvious.** Users must decide which exact event starts each automated action; Dubsado's own advice is to split one long workflow into inquiry / onboarding / project / offboarding workflows. | Dubsado mistakes #9 and #11 | Dubsado blog [read] |
| 6 | **Poor information architecture.** Tools "buried behind menus, so navigation takes practice." | "I think it's very clunky. I struggle understanding what sections to find things or how to properly set them up. Very overwhelming." (long-time user) | Agiled [read], Assembly [read] |
| 7 | **No folders for templates, so assets pile up.** | Users wish for folders: "10+ workflows and 30+ canned emails without folders becomes confusing." | Search summary [summary] |
| 8 | **Must watch tutorials to use it.** | "Don't even try to use it without watching tutorials, but once it clicks, it's a game-changer." "You have to watch a lot of videos." | Agiled [read]; search summary [summary] |
| 9 | **Documentation gaps filled by third parties.** Users "rely on help articles or community tutorials to fill gaps." A paid-course and consultant economy exists (Productive Co "Dubsado Rockstar" course; Fiverr "optimize Dubsado" gigs; "people who literally specialize in Dubsado setup"). | Quotes and listings | Assembly [read]; Agiled [read]; course and Fiverr listings [summary] |
| 10 | **Feature gating by plan.** Workflows, scheduling and Zapier sit on the higher Premier plan, so the cheap plan cannot deliver the automation that is the main value. | Quote | Maroo [read], Taskip [read] |
| 11 | **Dated, inconsistent UI.** Dubsado 3.0 (Nov 2025) added a visual Flows builder, kanban and inline invoice editing, which "improved this somewhat", but the mobile app and structure were not fixed. | "Dated UX"; "parts of the interface are dated." | Demilked [read]; Taskip [read]; Agiled [read] |
| 12 | **Maintenance burden after launch.** | "Difficulty maintaining workflows over time." | Search summary [summary] |
| 13 | **Perceived over-capability.** People who give up call it "clunky, overwhelming, and too heavy for what they needed" (too many features for what they use). | Summary phrase | Search summary [summary] |
| 14 | **The defence is "worth it once learned".** | "Stick with it, it now runs my entire business on autopilot" (G2 designer). "Hours of setup in exchange for a fully automated system in the future." | G2 via search summary [summary]; Demilked [read] |

**Net read of Dubsado:** the pain is not any one screen. It is the combination of (a) a blank canvas with no opinionated defaults, (b) around ten separate concepts that all need configuring before the automation pays off, (c) poor discoverability, and (d) learning that happens outside the product (videos, courses, consultants). Value arrives only after the whole system is wired.

### 1.3 What makes Aisle Planner complex (weaker evidence)

| # | Cause | Evidence | Source (status) |
|---|---|---|---|
| 1 | **Breadth.** | "Can feel overwhelming at first"; "expensive, overwhelming, and loaded with features you may never use." | Search summary of review sites [summary] |
| 2 | **Getting started is unclear.** | "I like the look of it, but it is not easy to figure out how to get started to use it." (2018, anonymous, single review) | Spotsaas [read] |
| 3 | **Templates and migration.** New planners "struggle with structuring templates and workflows"; migrating from spreadsheets or several tools takes time. | Paraphrase | Search summary [summary] |
| 4 | **Floor-plan tool is hard to navigate and glitchy** (object placement). | Paraphrase | Search summary [summary] |
| 5 | **Disorganised, "zero user friendliness".** One 1-star review, Sept 2025. | "Disorganized wedding planning platform with zero user friendliness. Constant annoying email notifications" | Trustpilot [read] |
| 6 | **Tutorial and course dependence.** No strong evidence either way. | none | [unverified] |

**Net read of Aisle Planner:** the platform is pre-shaped for wedding planners (timelines, checklists, vendor lists already exist), so users report less blank-canvas pain and more "too much surface area, unclear starting point". The sample is small, so confidence is low.

### 1.4 Patterns that matter for Vue

1. Value should arrive before configuration, not after.
2. A product with many named concepts (flows, smart files, canned emails, triggers) needs a teacher. Fewer concepts remove the teacher.
3. Users blame navigation and naming as much as feature depth ("what sections to find things").
4. Blank templates and unfoldered template lists are a quiet source of overwhelm.
5. Plan-gating the automation makes the cheap tier feel pointless.
6. Competitors rely on the "worth it once learned" defence; Vue should not need it.

---

## 2. Other complaints (grouped)

Frequency key: **High** = three or more independent sources; **Med** = two; **Low** = one source or only a search summary.
Platform: **D** = Dubsado, **AP** = Aisle Planner.

### 2.1 Pricing and billing

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C1 | D | Price rose 1 Dec 2025: Starter $20 to $35 (+75%), Premier $40 to $55 (+38%); existing users grandfathered. | Agiled [read]; Trustpilot themes [summary] | Med |
| C2 | D | Cheap Starter plan lacks workflows, scheduling and Zapier, so automation is paywalled. | Maroo [read]; Taskip [read] | Med |
| C3 | D | Extra users cost more (4th user about $25/month). | Taskip [read] | Low |
| C4 | AP | Pricing scales with active projects ($39.99 for 10 up to $169.99 for 100): "the better your year goes, the bigger your software bill." | Planning.wedding [read] [vendor/competitor]; pricing roundups [summary] | Med |
| C5 | AP | Expensive for small teams or many lower-budget events. | Spotsaas editorial [read]; search summary | Med |
| C6 | AP | Payment processing fees not clearly published. | Maroo [read] | Low |

### 2.2 Automation and workflow reliability

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C7 | D | Automations need several attempts to behave; testing is hard. | Assembly [read] | Low |
| C8 | D | No task dependencies, Gantt charts or milestones; thin project management. | Agiled [read]; Demilked [read] | Med |
| C9 | D | Workflows are hard to maintain as they multiply (no folders). | Search summary [summary] | Low |
| C10 | AP | Limited automation compared to workflow-first tools (competitor claim). | Planning.wedding [read] [vendor/competitor] | Low |

### 2.3 Notifications and client portal

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C11 | AP | "Constant annoying email notifications." | Trustpilot [read] (1 review) | Low |
| C12 | AP | No stand-alone client portal; clients are invited into the account instead. | Planning Pod comparison [read] [vendor/competitor]; Softwares [summary] | Med |
| C13 | AP | Cannot receive or view clients' email replies inside the app. | Same as C12 | Med |
| C14 | AP | Couple-side access may involve a paywall (competitor's claim). | Planning.wedding [read] [vendor/competitor] [unverified] | Low |
| C15 | D | Client portal is set up but underused; clients do not know where to look. | Dubsado blog (mistake #12) [read] | Low |

### 2.4 Mobile app

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C16 | D | Mobile app "near-unusable", no meaningful improvement in 3.0. | Agiled [read]; Demilked [read]: weak mobile | Med |
| C17 | D | Some reviews say there is no dedicated app at all, just a phone browser (sources conflict about the app's state). | Assembly [read] | Low |
| C18 | AP | Floor-plan editing is glitchy, object placement is difficult. | Search summary [summary] | Low |

### 2.5 Integrations

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C19 | AP | No integration with Zola or The Knot. | GeniusFirms [read]; Softwares [summary] | Med |
| C20 | D | Scheduler syncs only one calendar; limited currencies. | Search summary [summary] | Low |
| C21 | D | Zapier locked to Premier. | Maroo [read] | Low |

### 2.6 Payments and invoicing

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C22 | AP | Bank-detail entry dropped the last digit, ACH failed, $50 fee, support dismissed it (Apr 2026). | Trustpilot [read]; Capterra [summary] | Low |
| C23 | D | No automatic recurring charges. | Agiled [read] | Low |
| C24 | D | Auto-billing inconsistent; clients re-enter payment details when subscriptions change. | Assembly [read] | Low |
| C25 | D, AP | No contractor payout or 1099 workflow. | Maroo [read] | Low |
| C26 | D | Card fees (2.9% + $0.30) add up if the business absorbs them. | Maroo [read] | Low |

### 2.7 Calendar and scheduling

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C27 | D | Scheduler double-booking issues. | Agiled [read] | Low |
| C28 | D | Scheduler setup is clunky. | Search summary [summary] | Low |

### 2.8 Reporting

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C29 | D | Thin financial reporting; no visual dashboards; reviews are manual. | Agiled [read]; Assembly [read] | Med |

### 2.9 Support and documentation

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C30 | AP | Support dismissed a case without investigating; payment processor also unresponsive. | Trustpilot [read] | Low |
| C31 | D | Slow follow-up, unresolved technical issues, time-zone delays (though many praise chat and forum support). | Search summary [summary] | Low |
| C32 | D | Documentation gaps filled by community tutorials and paid courses. | Assembly [read] | Low |

### 2.10 Performance, bugs, UI

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C33 | D | Lag and small bugs when switching pages or editing workflows. | Assembly [read] | Low |
| C34 | D | Dated interface. | Demilked [read]; Taskip [read] | Med |

### 2.11 Team and vendor collaboration

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C35 | D | No role-based permissions. | Agiled [read] | Low |
| C36 | D | Permissions, reporting and collaboration do not scale to larger teams. | Assembly [read] | Low |
| C37 | D | Weak at event execution: no vendor management, timelines or day-of tools (planners add another tool). | Maroo [read] | Low |

### 2.12 Timelines and day-of tools

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C38 | AP | Limited RSVP, guest interaction and table configuration. | GeniusFirms [read] | Low |
| C39 | AP | Limited customisation to adapt to specialised workflows. | GeniusFirms [read] | Low |

### 2.13 Data import, export, language, email

| # | Plat | Complaint | Example source | Freq |
|---|---|---|---|---|
| C40 | AP | Migrating from spreadsheets and other tools takes time. | Search summary [summary] | Low |
| C41 | AP | Email feature "needs to be updated". | Capterra via search summary [summary] | Low |
| C42 | AP | English only. | Planning.wedding [read] [vendor/competitor] | Low |

**Total: 42 distinct complaints** (plus 14 Dubsado and 6 Aisle Planner complexity causes in section 1). "Frequency" counts the sources I could reach. Almost all are Low or Med, because the source pool is small and often repeats itself.

---

## 3. Takeaways

- Complexity is the dominant, most-repeated theme and the only one with strong evidence.
- Everything else is thinly evidenced and mostly appears once. Use the list as a hypothesis list, not a ranking.
- Several complaints (pricing tiers, contractor payouts, RSVP, Zola and Knot integrations) belong to planner-business tools and not a venue app.

---

## 4. Sources and caveats

### 4.1 Pages read directly (via WebFetch, text returned through a summarising model)
| Source | Used for | Note |
|---|---|---|
| Agiled "Dubsado Review 2026" (agiled.app/blog/dubsado-review) | 15 to 25 hours, 3.0 rebuild, price change, mobile, scheduler, reporting, permissions, user quotes | Agiled is a competing CRM [vendor/competitor] |
| Assembly "Dubsado reviews" (assembly.com/blog/dubsado-reviews) | Builder confusion, navigation, mobile, performance, billing, scale | Assembly is a competitor [vendor/competitor] |
| Taskip "Dubsado 3.0 reviews" | Complexity tax, blank canvas, user cost, Starter limits | Affiliate-style review site |
| Demilked Dubsado review | Hours of setup, dated UX, mobile | Affiliate-style |
| Dubsado "12 common mistakes" (dubsado.com) | Concept inventory | Vendor's own blog |
| Trustpilot, aisleplanner.com | 2 reviews total (Sept 2025 and Apr 2026) | Tiny sample, 3.1/5 |
| Spotsaas Aisle Planner reviews | 2018 "not easy to figure out how to get started" | One old review |
| GeniusFirms Aisle Planner | Integrations, RSVP, customisation | Page showed 0 customer reviews; editorial |
| Maroo "Dubsado alternatives" | Fees, plan gating, contractor gap | Competitor/affiliate |
| Planning.wedding Aisle Planner alternatives | Project-based pricing, English only | Competitor [vendor/competitor] |
| Planning Pod comparison | No stand-alone portal, no inbound email | Competitor; may be outdated |

### 4.2 Seen only through search summaries
G2 (Dubsado, Aisle Planner), Capterra (Dubsado, Aisle Planner), Software Advice, Trustpilot for Dubsado, SaaSworthy, GetApp, Productive Co course page, Fiverr listing, makerstack.co, research.com, Harpsen. **Direct fetches of G2, Capterra and Software Advice returned HTTP 403**, so I could not read or verify individual reviews there. Quotes attributed to them come from the search tool's summaries.

### 4.3 Not reached
- **Reddit** (r/weddingplanning and similar): searches returned no Reddit threads. No Reddit claims are made. Facebook groups were not accessible.
- **App Store / Google Play reviews:** not read. The Dubsado mobile claims are secondhand.
- **YouTube reviews:** not examined.
- techsuggest.io and makerstack.co pages returned a redirect or empty content.

### 4.4 Quality caveats
1. Many sources are competitors or affiliate sites (Agiled, Assembly, Maroo, Planning Pod, Planning.wedding). They have reasons to stress weaknesses.
2. Many articles repeat the same few claims, so frequency overstates independent confirmation. Treat "15 to 25 hours" as a convention among reviews, not a measured figure.
3. Aisle Planner has very little public critical data (two Trustpilot reviews, one or two Capterra reviews). Its complaint list is mostly editorial and should be weighted low.
4. Dubsado 3.0 (Nov 2025) changed the product; older complaints may be out of date. I could not date most quotes.
5. Both are planner/freelancer business tools. Their users (wedding planners) differ from venue managers, so CRM-related complaints may not transfer.
6. Sources disagree on Dubsado mobile (poor app versus no dedicated app).
