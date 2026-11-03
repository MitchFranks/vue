'use client'

import Link from 'next/link'
import { Icon } from './Icon'

/* ----------------------------------------------------------- Breadcrumbs -- */

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-small text-ink-muted">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <Icon name="chevronRight" size={12} />}
          {item.href ? (
            <Link href={item.href} className="rounded-sm px-1 py-0.5 transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="px-1 py-0.5 text-ink">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
