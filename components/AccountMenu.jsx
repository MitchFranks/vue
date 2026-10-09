'use client'

// ---------------------------------------------------------------------------
// The initials circle in the top bar, as a menu button.
//
// A small rounded pop-out with the signed-in person (name and role, not
// interactive) and two links: Account and Settings. Behaves like a menu:
// aria-haspopup / aria-expanded on the button, closes on outside click, Esc,
// Tab out and choosing an item, and focus returns to the button. Arrow keys,
// Home and End move between items; Tab and Enter work as normal.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/cx'
import { venue } from '@/lib/mock/events'
import { Icon } from './ui/primitives'

const ITEMS = [
  { href: '/account', label: 'Account', icon: 'user' },
  { href: '/settings', label: 'Settings', icon: 'list' }
]

export function AccountMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const button = useRef(null)
  const menuId = useId()

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) button.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) close(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      const links = [...(wrap.current?.querySelectorAll('[role="menuitem"]') || [])]
      const at = links.indexOf(document.activeElement)
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const next = e.key === 'ArrowDown' ? (at + 1) % links.length : (at - 1 + links.length) % links.length
        links[at === -1 && e.key === 'ArrowUp' ? links.length - 1 : next]?.focus()
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        links[e.key === 'Home' ? 0 : links.length - 1]?.focus()
      } else if (e.key === 'Tab') {
        // Tabbing out of the menu closes it and lets focus carry on.
        const last = links[links.length - 1]
        const onButton = document.activeElement === button.current
        if ((!e.shiftKey && document.activeElement === last) || (e.shiftKey && onButton)) close(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'grid h-9 w-9 place-items-center rounded-full bg-surface-sunken font-medium text-label text-ink transition-shadow',
          'hover: focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-line-strong',
          open && 'ring-2 ring-accent'
        )}
      >
        {venue.managerInitials}
        <span className="sr-only">Account menu for {venue.manager}</span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-line bg-surface motion-safe:animate-[vue-rise_.18s_ease-out]"
        >
          <div role="presentation" className="border-b border-line bg-surface-sunken/60 px-4 py-3">
            <div className="text-small font-medium text-ink">{venue.manager}</div>
            <div className="text-label text-ink-muted">{venue.managerRole}</div>
          </div>
          <ul role="none" className="p-1.5">
            {ITEMS.map((item) => (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => close()}
                  className="flex h-9 items-center gap-3 rounded-sm px-3 text-small font-medium text-ink transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-offset-0"
                >
                  <Icon name={item.icon} size={15} className="text-ink-muted" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
