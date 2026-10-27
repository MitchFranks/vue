'use client'

// ---------------------------------------------------------------------------
// ClampedText — a paragraph that shows its first two lines. When there is
// more, "Show more" opens the rest and "Show less" folds it back. The link
// appears only when text is actually cut off, so short text has no extra
// control, and a resize that changes the line count is picked up.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'

export function ClampedText({ children, className = '' }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [cut, setCut] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    // Only measure while clamped; once open the full height is the truth.
    const measure = () => {
      if (!open) setCut(el.scrollHeight > el.clientHeight + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children, open])

  return (
    <div className={className}>
      <p ref={ref} className={cx('text-small text-ink', !open && 'line-clamp-2')}>
        {children}
      </p>
      {(cut || open) && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="mt-0.5 text-small text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {open ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
