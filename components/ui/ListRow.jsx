'use client'

import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

/* --------------------------------------------------------------- ListRow -- */
// The generic row used by every list in the product. Rows are separated by
// hairlines rather than boxed one by one, so the exception stands out.

export function ListRow({ href, leading, title, sub, meta, trailing, onClick, className = '' }) {
  const inner = (
    <>
      {leading && <div className="shrink-0 text-ink-muted">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-ink">{title}</div>
        {sub && <div className="truncate text-small text-ink-muted">{sub}</div>}
        {meta && <div className="text-small text-ink-muted">{meta}</div>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2 text-small text-ink-muted">{trailing}</div>}
      {(href || onClick) && <Icon name="chevronRight" size={16} className="shrink-0 text-ink-muted" />}
    </>
  )

  const cls = cx(
    'flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 sm:px-6',
    (href || onClick) && 'transition-colors duration-150 hover:bg-surface-sunken/60',
    className
  )

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    )
  }
  return <div className={cls}>{inner}</div>
}
