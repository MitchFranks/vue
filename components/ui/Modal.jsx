'use client'

import { useEffect, useEffectEvent, useRef } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

/* ----------------------------------------------------------------- Modal --- */
// The one overlay in the product. Two shapes, same behaviour:
//   variant="dialog"  centred box (confirmations, short forms)
//   variant="sheet"   right-hand panel, a bottom sheet under 640px (longer
//                     work: asking staff, reviewing texts, a staff phone)
// Focus moves in on open (to [data-autofocus] if present), Tab cycles inside,
// Escape and backdrop click close, and focus returns to the opener. USER
// CONTROL: never trap the tester.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  labelledBy = 'modal-title',
  variant = 'dialog',
  width = 'sm:w-[460px]'
}) {
  const ref = useRef(null)
  // Always the latest onClose, without re-running the effect when it changes.
  const close = useEffectEvent(() => onClose?.())

  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    const panel = ref.current
    ;(panel?.querySelector('[data-autofocus]') || panel)?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
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

  const sheet = variant === 'sheet'

  return (
    <div
      className={cx(
        'fixed inset-0 z-50 flex bg-black/45',
        sheet ? 'items-end sm:items-stretch sm:justify-end' : 'items-end justify-center sm:items-center sm:p-4'
      )}
      onClick={onClose}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx(
          'flex w-full flex-col border-line bg-surface shadow-overlay focus:outline-none',
          sheet
            ? cx('max-h-[88vh] rounded-t-3xl border-t sm:max-h-none sm:rounded-none sm:rounded-l-3xl sm:border-t-0 sm:border-l', width)
            : 'max-h-[90vh] max-w-lg rounded-t-md border sm:rounded-md motion-safe:animate-[vue-rise_.2s_ease-out]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id={labelledBy} className="text-title font-light text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-small text-ink-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <Icon name="x" size={14} />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>
  )
}
