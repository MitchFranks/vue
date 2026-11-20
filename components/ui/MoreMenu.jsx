'use client'

// A "More" button that opens a short list of links: for screens people need
// now and then (set-up, settings), so the header keeps one or two buttons
// that matter. Escape or a click outside closes it and focus returns to the
// button.

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

/** items: [{ href, label, icon?, hint?, newTab? }] */
export function MoreMenu({ label = 'More', items }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const button = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={box} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={cx(
          'inline-flex h-9 items-center gap-2 rounded-sm border px-4 text-small font-medium transition-colors',
          open ? 'border-ink bg-surface-sunken text-ink' : 'border-line-strong bg-surface text-ink hover:bg-surface-sunken'
        )}
      >
        {label}
        <Icon name="chevronDown" size={14} className={cx('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul id={id} className="surface-card absolute right-0 z-40 mt-1 w-72 overflow-hidden py-1 shadow-overlay">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                target={it.newTab ? '_blank' : undefined}
                rel={it.newTab ? 'noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="mx-1 flex items-start gap-3 rounded-sm px-3 py-2 hover:bg-surface-sunken"
              >
                {it.icon && <Icon name={it.icon} size={15} className="mt-0.5 text-ink-muted" />}
                <span className="min-w-0">
                  <span className="block text-small font-medium text-ink">{it.label}</span>
                  {it.hint && <span className="block text-label text-ink-muted">{it.hint}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
