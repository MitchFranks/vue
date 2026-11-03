'use client'

import { cx } from '@/lib/cx'

/* ------------------------------------------------------------------ Icon -- */
// One outline set: 1.5px stroke on a 24px grid, drawn in the current text
// colour. Status icons have fixed jobs: alert = act now, clock = coming up,
// check = handled. Never use a status icon as a navigation icon.
//
// Navigation icons, one per destination (do not reuse across destinations):
//   inbox Tasks · users Staffing Planner · home Dashboard · list Events ·
//   user Staff Directory · calendar Calendar · mail Messages · heart Couples ·
//   truck Vendors · settings Settings · menu the mobile nav toggle.

const PATHS = {
  alert: <path d="M12 3.6 2.8 19.6h18.4L12 3.6Zm0 5.8v4.4m0 3h.01" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  dash: <path d="M6 12h12" />,
  users: (
    <>
      <path d="M16 20v-1.6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M17 4.2a3.5 3.5 0 0 1 0 6.6M22 20v-1.6a4 4 0 0 0-3-3.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.5" />
      <path d="m3.4 6.5 8.6 6.2 8.6-6.2" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 2.8v18.4" />
      <path d="M16.5 6.7H9.9a2.9 2.9 0 0 0 0 5.8h4.2a2.9 2.9 0 0 1 0 5.8H7" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  arrowRight: <path d="M5 12h13.5M13 5.5l5.5 6.5-5.5 6.5" />,
  arrowLeft: <path d="M19 12H5.5M11 5.5 5.5 12 11 18.5" />,
  chevronRight: <path d="m9.5 5.5 7 6.5-7 6.5" />,
  chevronDown: <path d="M5.5 9.5 12 16.5l6.5-7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  grip: <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeWidth="3" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v5.5M14 11v5.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </>
  ),
  filter: <path d="M3.5 5h17l-6.5 7.5V19l-4 1.5v-8Z" />,
  sort: <path d="M7 20V4M3.5 7.5 7 4l3.5 3.5M17 4v16m-3.5-3.5L17 20l3.5-3.5" />,
  truck: (
    <>
      <path d="M2 7h12v9H2zM14 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8.2h.01" />
    </>
  ),
  send: <path d="M21.5 2.5 2.5 9.2l8 3.8 3.8 8 7.2-18.5Z" />,
  home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />,
  inbox: (
    <>
      <path d="M3 13.5 5.5 5h13l2.5 8.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M3 13.5h5l1.5 2.5h5l1.5-2.5h5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.4m0 13.6v2.4M2.8 12h2.4m13.6 0h2.4M5.5 5.5l1.7 1.7m9.6 9.6 1.7 1.7M5.5 18.5l1.7-1.7m9.6-9.6 1.7-1.7" />
    </>
  ),
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5" />,
  book: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Zm16 0A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  phone: (
    <>
      <rect x="6.5" y="2.8" width="11" height="18.4" rx="1.5" />
      <path d="M11 18h2" />
    </>
  )
}

export function Icon({ name, size = 16, className = '' }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      className={cx('shrink-0', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  )
}
