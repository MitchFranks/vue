'use client'

// ---------------------------------------------------------------------------
// Step 3/3: a spotlight on the "Up Next" menu item, which is now in the
// user's own colour.
//
// Not modal. The dim layer ignores the pointer, so the menu item (and the rest
// of the page) stays clickable, and Tab carries on through the page as normal.
// Focus is moved to the popover's button once, Esc leaves the guide, and the
// menu item is described by the popover text for screen readers.
//
// When the menu item is not on screen (the welcome page, or a phone where the
// sidebar is folded away) the popover sits at the bottom of the screen instead,
// with the same button.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/components/ui/primitives'
import { StepPill } from './GuideDialog'

const TARGET = '[data-onboarding="up-next"]'
const POPOVER_W = 300

function sameRect(a, b) {
  return a && b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

export function CoachMark({ onSkip, onFinish }) {
  const [rect, setRect] = useState(null)
  const [fallback, setFallback] = useState(false)
  const actionRef = useRef(null)
  const focused = useRef(false)
  const skipRef = useRef(onSkip)
  skipRef.current = onSkip

  // Track the menu item: it can move (scroll, resize, mobile nav sliding in)
  // or arrive late (the route change from the welcome screen).
  useEffect(() => {
    let timer
    const measure = () => {
      const el = document.querySelector(TARGET)
      const r = el?.getBoundingClientRect()
      const visible = r && r.width > 0 && r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight
      const next = visible ? { top: r.top, left: r.left, width: r.width, height: r.height } : null
      setRect((prev) => (sameRect(prev, next) ? prev : next))
      if (el && !el.hasAttribute('aria-describedby')) el.setAttribute('aria-describedby', 'coach-body')
    }
    measure()
    const late = setTimeout(() => setFallback(true), 450)
    timer = setInterval(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(late)
      clearInterval(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      document.querySelector(TARGET)?.removeAttribute('aria-describedby')
    }
  }, [])

  useEffect(() => {
    const previous = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') skipRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous && previous !== document.body && document.contains(previous)) previous.focus?.()
    }
  }, [])

  const showing = rect || fallback

  // Move focus to the button once, when the popover first appears.
  useEffect(() => {
    if (showing && !focused.current && actionRef.current) {
      focused.current = true
      actionRef.current.focus({ preventScroll: true })
    }
  }, [showing])

  if (!showing) return null

  // Beside the menu item when there is room, otherwise below it.
  let pos = null
  if (rect) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const beside = rect.left + rect.width + 20 + POPOVER_W < vw
    pos = beside
      ? { left: rect.left + rect.width + 20, top: Math.min(Math.max(12, rect.top + rect.height / 2 - 56), vh - 240), side: 'left' }
      : { left: Math.min(Math.max(12, rect.left), vw - POPOVER_W - 12), top: rect.top + rect.height + 18, side: 'top' }
  }

  const popover = (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="coach-title"
      aria-describedby="coach-body"
      style={pos ? { left: pos.left, top: pos.top, width: POPOVER_W } : undefined}
      className={
        pos
          ? 'fixed z-[60] rounded-3xl bg-surface p-5 shadow-pop motion-safe:animate-[vue-rise_.28s_ease-out]'
          : 'fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-3xl bg-surface p-5 shadow-pop motion-safe:animate-[vue-rise_.28s_ease-out]'
      }
    >
      {pos && (
        <span
          aria-hidden="true"
          className="absolute h-3.5 w-3.5 rotate-45 bg-surface"
          style={
            pos.side === 'left'
              ? { left: -6, top: Math.min(Math.max(18, rect.top + rect.height / 2 - pos.top - 7), 120) }
              : { top: -6, left: Math.min(Math.max(18, rect.left + 24 - pos.left), POPOVER_W - 30) }
          }
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <StepPill n={3} />
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-line p-1.5 text-muted transition-colors hover:border-accent-line hover:bg-accent-soft hover:text-accent"
        >
          <Icon name="x" size={12} />
          <span className="sr-only">Close the guide</span>
        </button>
      </div>
      <h2 id="coach-title" className="mt-3 text-[18px] font-bold leading-snug text-ink">
        This is Up Next, in your colour
      </h2>
      <p id="coach-body" className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
        The things that need you wait here, most useful first. Open it to add your first couple.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button ref={actionRef} href="/up-next" onClick={onFinish} variant="primary" size="sm">
          Open Up Next
          <Icon name="arrowRight" size={13} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip guide
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {rect && (
        // Spotlight: a ring around the menu item and a soft dim everywhere else.
        // pointer-events-none, so the menu item underneath is still the thing you click.
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[55] rounded-full motion-safe:animate-[vue-glow_1.8s_ease-in-out_infinite]"
          style={{
            top: rect.top - 5,
            left: rect.left - 5,
            width: rect.width + 10,
            height: rect.height + 10,
            boxShadow: '0 0 0 4px var(--color-accent-line), 0 0 0 200vmax rgb(42 33 69 / 0.32)'
          }}
        />
      )}
      {popover}
    </>
  )
}
