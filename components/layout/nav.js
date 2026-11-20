// ---------------------------------------------------------------------------
// The sidebar's destinations.
//
// Grouped by what the manager is doing, in plain words (user test v4: "I
// can't find anything"). Your day first: the dashboard, every to-do, and who
// on the team has what. Then the events and the couples behind them. Then the
// people and vendors who work them. Every item has a `hint`: the tooltip, and
// what the search box matches ("who has what", "texts").
//
// `badge` names a count AppShell works out from the store; `match` lets one
// item own a whole section (the staffing workflow owns every /staffing/*
// page); `exact` stops a parent lighting up on its child routes. Icons follow
// the mapping at the top of components/ui/Icon.jsx.
// ---------------------------------------------------------------------------

export const NAV = [
  {
    heading: 'Your day',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'home', exact: true, hint: 'What needs you today, and updates from couples' },
      { href: '/tasks', label: 'Tasks', icon: 'inbox', badge: 'openTasks', hint: 'Every to-do across your events' },
      { href: '/tasks/team', label: 'Who’s doing what', icon: 'team', hint: 'Each person’s open to-dos this week, and handing them off' }
    ]
  },
  {
    heading: 'Events and couples',
    items: [
      { href: '/events', label: 'Events', icon: 'list', hint: 'Each event’s detail sheet, run of show, payments and documents' },
      { href: '/couples', label: 'Couples', icon: 'heart', hint: 'What each couple has signed, paid and sent' },
      { href: '/messages', label: 'Messages', icon: 'mail', badge: 'messages', hint: 'Conversations with couples and vendors' },
      { href: '/calendar', label: 'Calendar', icon: 'calendar', hint: 'Events and meetings by date' }
    ]
  },
  {
    heading: 'Staff and vendors',
    items: [
      // One workflow, one menu item. The tab bar inside it links its screens.
      { href: '/staffing', match: '/staffing', label: 'Staffing Planner', icon: 'users', badge: 'openPositions', hint: 'Fill open spots and text staff' },
      { href: '/staff', label: 'Staff Directory', icon: 'user', hint: 'Everyone on your team: roles, availability and contact' },
      { href: '/vendors', label: 'Vendors', icon: 'truck', hint: 'Caterers, florists and everyone you book' }
    ]
  }
]

/**
 * The href of the most specific nav item for a route, so a parent is not
 * also lit up on a child route.
 */
export function activeHrefFor(pathname, nav = NAV) {
  return nav
    .flatMap((g) => g.items)
    .filter((item) => {
      const base = item.match ?? item.href
      return pathname === base || (!item.exact && pathname.startsWith(`${base}/`))
    })
    .sort((a, b) => (b.match ?? b.href).length - (a.match ?? a.href).length)[0]?.href
}
