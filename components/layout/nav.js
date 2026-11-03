// ---------------------------------------------------------------------------
// The sidebar's destinations.
//
// The two things the product is for come first and are the only items with
// full weight: Tasks and the Staffing Planner. Everything else is
// supporting context and sits under "More", visually quieter. Icons follow
// the mapping at the top of components/ui/Icon.jsx.
//
// `badge` names a count AppShell works out from the store; `match` lets one
// item own a whole section (the staffing workflow owns every /staffing/*
// page); `exact` stops a parent lighting up on its child routes.
// ---------------------------------------------------------------------------

export const NAV = [
  {
    heading: 'Start here',
    items: [
      { href: '/tasks', label: 'Tasks', icon: 'inbox', badge: 'openTasks' },
      // One workflow, one menu item. The tab bar inside it links its screens.
      { href: '/staffing', match: '/staffing', label: 'Staffing Planner', icon: 'users', badge: 'openPositions' }
    ]
  },
  {
    heading: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'home', exact: true },
      { href: '/events', label: 'Events', icon: 'list' },
      { href: '/staff', label: 'Staff Directory', icon: 'user' }
    ]
  },
  {
    heading: 'More',
    quiet: true,
    items: [
      { href: '/calendar', label: 'Calendar', icon: 'calendar' },
      { href: '/messages', label: 'Messages', icon: 'mail', badge: 'messages' },
      { href: '/couples', label: 'Couples', icon: 'heart' },
      { href: '/vendors', label: 'Vendors', icon: 'truck' }
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
