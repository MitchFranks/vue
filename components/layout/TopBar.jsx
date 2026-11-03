'use client'

// The bar across the top of every screen: the mobile nav toggle, the product
// name, the venue this workspace belongs to, and a slot on the right
// (AppShell puts the prototype notice there). Props only, no store.

import Link from 'next/link'
import { Icon } from '@/components/ui'

export function TopBar({ venueName, navOpen = false, onToggleNav, actions }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface text-ink">
      <div className="flex h-(--header-height) items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onToggleNav}
          aria-expanded={navOpen}
          aria-controls="main-nav"
          className="grid h-9 w-9 place-items-center rounded-sm border border-line-strong bg-surface text-ink transition-colors hover:bg-surface-sunken lg:hidden"
        >
          <Icon name="menu" size={16} />
          <span className="sr-only">Toggle navigation</span>
        </button>

        {/* No logo yet: the name is set in Geist Light wherever a mark would go. */}
        <Link href="/" className="flex items-baseline gap-2 rounded-sm" title="Back to the welcome screen">
          <span className="text-title font-light text-ink">Vue</span>
        </Link>
        {venueName && (
          <span className="hidden items-center gap-2 text-small font-medium text-ink sm:flex">
            <span aria-hidden="true" className="text-line-strong">/</span>
            {venueName}
          </span>
        )}

        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
