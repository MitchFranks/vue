'use client'

import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Count } from './Count'

/* ------------------------------------------------------------------ Tabs -- */
// Rendered as real links so every tab is its own URL — that is what makes the
// navigation non-linear and deep-linkable. The active tab is ink with a Laurel
// underline; a count announces what sits behind a tab without opening it.
//
// Because each tab is a page, this is navigation, not the ARIA tabs widget:
// a labelled <nav> of links with aria-current on the page you are on. (role
// "tab" would promise arrow-key switching and a tabpanel that do not exist.)

export function Tabs({ tabs, active, label = 'Sections' }) {
  return (
    <nav aria-label={label} className="mb-6 flex gap-6 overflow-x-auto border-b border-line">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <Link
            key={tab.id}
            href={tab.href}
            data-guide={tab.guide}
            aria-current={isActive ? 'page' : undefined}
            className={cx(
              '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-small font-medium transition-colors duration-150',
              isActive ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            {tab.label}
            {tab.count != null && <Count tone={tab.tone}>{tab.count}</Count>}
          </Link>
        )
      })}
    </nav>
  )
}
