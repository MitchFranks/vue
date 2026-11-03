'use client'

// ---------------------------------------------------------------------------
// The persistent sidebar (a slide-over under 1024px).
//
// NON-LINEAR NAVIGATION: grouped into the product areas, every area reachable
// from everywhere. Props only: AppShell works out `activeHref` and `counts`
// from the route and the store, and passes the signed-in person's menu as
// `account`, so this draws the same way in the app and in Storybook.
//
//   counts   { [badgeName]: { n, label } }  label is what the number means,
//            for the tooltip and screen readers ("2 to do first").
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Button, Count, Icon } from '@/components/ui'
import { NAV } from './nav'

export function Sidebar({ nav = NAV, activeHref, counts = {}, open = false, account }) {
  return (
    <aside
      id="main-nav"
      className={cx(
        'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-line bg-surface pt-(--header-height) transition-transform duration-200 ease-calm lg:sticky lg:top-(--header-height) lg:z-0 lg:h-[calc(100vh-var(--header-height))] lg:translate-x-0 lg:pt-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="Main">
        {nav.map((group) => (
          <div key={group.heading} className="mb-6">
            <div className={cx('mb-1 px-3 text-label', group.quiet ? 'text-ink-muted/70' : 'font-medium text-ink')}>{group.heading}</div>
            <ul className="space-y-px">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} quiet={group.quiet} active={item.href === activeHref} badge={item.badge ? counts[item.badge] : null} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-6 border-t border-line pt-4">
          <Button href="/events/new" variant="secondary" size="md" className="w-full">
            <Icon name="plus" size={14} />
            New event
          </Button>
          <p className="mt-3 px-3 text-label text-ink-muted">Simulated data. Nothing here is saved to a real system.</p>
        </div>
      </nav>

      {/* Signed-in person, pinned to the bottom of the sidebar. Its menu opens upward. */}
      {account && <div className="border-t border-line p-3">{account}</div>}
    </aside>
  )
}

function NavLink({ item, quiet, active, badge }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex h-9 items-center gap-3 rounded-sm px-3 text-small font-medium transition-colors duration-150',
        active
          ? 'bg-surface-sunken text-ink font-semibold shadow-[inset_2px_0_0_var(--accent)]'
          : quiet
            ? 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
            : 'text-ink hover:bg-surface-sunken'
      )}
    >
      <Icon name={item.icon} size={16} className={active ? 'text-accent' : 'text-ink-muted'} />
      <span className="flex-1 truncate">{item.label}</span>
      {badge?.n > 0 && (
        <span title={badge.label}>
          <span aria-hidden="true">
            {/* Only the "to do first" count is urgent; other counts stay neutral. */}
            <Count tone={item.badge === 'openTasks' ? 'urgent' : undefined}>{badge.n}</Count>
          </span>
          <span className="sr-only">{badge.label}</span>
        </span>
      )}
    </Link>
  )
}
