'use client'

// Right-hand drawer; a bottom sheet under 640px. Escape closes it and focus
// returns to whatever opened it. Tab cycles inside the panel.

import { useEffect, useRef } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '@/components/ui/primitives'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Drawer({ open, onClose, title, subtitle, children, footer, modal = true, width = 'sm:w-[460px]', labelId = 'drawer-title' }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    const panel = ref.current
    const auto = panel?.querySelector('[data-autofocus]')
    ;(auto || panel)?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current?.()
      } else if (e.key === 'Tab' && panel) {
        const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    panel?.addEventListener('keydown', onKey)
    return () => {
      panel?.removeEventListener('keydown', onKey)
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className={cx('fixed inset-0 z-40 bg-ink/30', !modal && 'sm:hidden')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal={modal ? 'true' : undefined}
        aria-labelledby={labelId}
        className={cx(
          'fixed z-50 flex flex-col bg-surface shadow-[0_24px_60px_rgba(12,21,18,.22)] focus:outline-none',
          'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t border-line',
          'sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:rounded-none sm:rounded-l-3xl sm:border-l sm:border-t-0',
          width
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="min-w-0">
            <h2 id={labelId} className="font-display text-[20px] font-bold text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-2 py-1.5 text-muted transition-colors hover:border-accent-line hover:text-accent"
          >
            <Icon name="x" size={14} />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-line-soft bg-wash/60 px-5 py-3">{footer}</footer>}
      </div>
    </>
  )
}
