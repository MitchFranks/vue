'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Count } from './Count'
import { Icon } from './Icon'

/* ------------------------------------------------------------------ Tabs -- */
// Rendered as real links so every tab is its own URL — that is what makes the
// navigation non-linear and deep-linkable. The active tab is ink with a Laurel
// underline; a count announces what sits behind a tab without opening it.
//
// Because each tab is a page, this is navigation, not the ARIA tabs widget:
// a labelled <nav> of links with aria-current on the page you are on. (role
// "tab" would promise arrow-key switching and a tabpanel that do not exist.)
//
// Fewer choices at once: tabs marked `more: true` sit behind a last "More"
// tab that opens a short list. When the page you are on is one of them, the
// More tab takes its name, so you can always see where you are.

const TAB = '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-small font-medium transition-colors duration-150'

function MoreTab({ tabs, active }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const current = tabs.find((t) => t.id === active)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cx(TAB, current ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink')}
      >
        {current ? current.label : 'More'}
        <Icon name="chevronDown" size={13} className={cx('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="surface-card absolute right-0 z-30 mt-1 w-48 overflow-hidden py-1 shadow-overlay">
          {tabs.map((t) => (
            <li key={t.id}>
              <Link
                href={t.href}
                onClick={() => setOpen(false)}
                aria-current={t.id === active ? 'page' : undefined}
                className={cx('mx-1 flex items-center gap-2 rounded-sm px-3 py-2 text-small hover:bg-surface-sunken', t.id === active ? 'font-medium text-ink' : 'text-ink')}
              >
                {t.label}
                {t.count != null && <Count tone={t.tone}>{t.count}</Count>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Tabs({ tabs, active, label = 'Sections' }) {
  const main = tabs.filter((t) => !t.more)
  const more = tabs.filter((t) => t.more)
  return (
    <div className="mb-6 flex items-end gap-6 border-b border-line">
      <nav aria-label={label} className="flex min-w-0 flex-1 gap-6 overflow-x-auto">
        {main.map((tab) => {
          const isActive = tab.id === active
          return (
            <Link
              key={tab.id}
              href={tab.href}
              data-guide={tab.guide}
              aria-current={isActive ? 'page' : undefined}
              className={cx(TAB, isActive ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink')}
            >
              {tab.label}
              {tab.count != null && <Count tone={tab.tone}>{tab.count}</Count>}
            </Link>
          )
        })}
      </nav>
      {more.length > 0 && <MoreTab tabs={more} active={active} />}
    </div>
  )
}
