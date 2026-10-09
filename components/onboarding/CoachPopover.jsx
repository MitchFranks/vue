'use client'

// ---------------------------------------------------------------------------
// THE standard for pointing at the next click in a guide.
//
// A pop-up that points at one button: a glowing Laurel ring
// around the target, a soft dim everywhere else, and a card beside it with a
// pointer. Every guide step that asks for a click uses this (the Up Next step
// of the welcome guide, each Staffing Planner step). The two welcome screens
// before it are the exception: they are stand-alone screens with no button to
// point at, so they use GuideDialog instead.
//
// Not modal. The dim layer ignores the pointer, so the target (and the rest of
// the page) stays clickable, and Tab carries on through the page as normal.
// Esc leaves the guide. When the target is not on screen (a phone with the
// sidebar folded away, or a page with nothing to click yet) the card sits at
// the bottom of the screen instead, without the ring.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { Button, Icon } from '@/components/ui/primitives'
import { StepPill } from './GuideDialog'

const POPOVER_W = 300

function sameRect(a, b) {
  return a && b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height && a.radius === b.radius
}

export function CoachPopover({ target, n, total, title, body, onBack, onSkip, onTargetClick, skipLabel = 'Skip guide' }) {
  const [rect, setRect] = useState(null)
  const [fallback, setFallback] = useState(false)
  // Which way the target is when it exists but is off screen: 'down' | 'up' | null.
  const [hint, setHint] = useState(null)
  const actionRef = useRef(null)
  const focused = useRef(false)
  const skipRef = useRef(onSkip)
  skipRef.current = onSkip
  const clickRef = useRef(onTargetClick)
  clickRef.current = onTargetClick

  // Track the target: it can move (scroll, resize, a menu sliding in) or arrive
  // late (a route change).
  useEffect(() => {
    setRect(null)
    setFallback(false)
    const measure = () => {
      const el = document.querySelector(target)
      const r = el?.getBoundingClientRect()
      const visible = r && r.width > 0 && r.right > 0 && r.left < window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight - 8
      // The ring copies the target's own corner shape, so a pill gets a pill ring
      // and a card gets a card ring, never an oval stretched over a rectangle.
      let radius = 0
      if (visible) {
        const css = parseFloat(window.getComputedStyle(el).borderTopLeftRadius)
        radius = Math.min(Number.isFinite(css) ? css : 0, Math.min(r.width, r.height) / 2)
        if (radius < 6) radius = 8
      }
      const next = visible ? { top: r.top, left: r.left, width: r.width, height: r.height, radius } : null
      setRect((prev) => (sameRect(prev, next) ? prev : next))
      setHint(!visible && r && r.width > 0 ? (r.bottom > window.innerHeight - 8 ? 'down' : r.top < 0 ? 'up' : null) : null)
      if (el && !el.hasAttribute('aria-describedby')) el.setAttribute('aria-describedby', 'coach-body')
    }
    measure()
    const late = setTimeout(() => setFallback(true), 450)
    const timer = setInterval(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(late)
      clearInterval(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      document.querySelector(target)?.removeAttribute('aria-describedby')
    }
  }, [target])

  // Clicking the target is the step's action.
  useEffect(() => {
    const onClick = (e) => {
      if (e.target instanceof Element && e.target.closest(target)) clickRef.current?.()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [target])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') skipRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const showing = rect || fallback

  // Move focus to the skip button once, when the card first appears.
  useEffect(() => {
    if (showing && !focused.current && actionRef.current) {
      focused.current = true
      actionRef.current.focus({ preventScroll: true })
    }
  }, [showing])

  if (!showing) return null

  // Beside the target when there is room, otherwise below it, otherwise above.
  let pos = null
  if (rect) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const roomRight = rect.left + rect.width + 20 + POPOVER_W < vw
    const roomLeft = rect.left - 20 - POPOVER_W > 0
    const clampTop = (t) => Math.min(Math.max(12, t), vh - 240)
    if (roomRight) pos = { left: rect.left + rect.width + 20, top: clampTop(rect.top + rect.height / 2 - 56), side: 'left' }
    else if (roomLeft) pos = { left: rect.left - 20 - POPOVER_W, top: clampTop(rect.top + rect.height / 2 - 56), side: 'right' }
    else if (rect.top + rect.height + 18 + 200 < vh) pos = { left: Math.min(Math.max(12, rect.left), vw - POPOVER_W - 12), top: rect.top + rect.height + 18, side: 'top' }
    else pos = { left: Math.min(Math.max(12, rect.left), vw - POPOVER_W - 12), top: Math.max(12, rect.top - 18 - 210), side: 'bottom' }
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
          ? 'fixed z-[60] rounded-md bg-surface p-5 motion-safe:animate-[vue-rise_.28s_ease-out]'
          : 'fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-md bg-surface p-5 motion-safe:animate-[vue-rise_.28s_ease-out]'
      }
    >
      {pos && (
        <span
          aria-hidden="true"
          className="absolute h-3.5 w-3.5 rotate-45 bg-surface"
          style={
            pos.side === 'left'
              ? { left: -6, top: Math.min(Math.max(18, rect.top + rect.height / 2 - pos.top - 7), 120) }
              : pos.side === 'right'
                ? { right: -6, top: Math.min(Math.max(18, rect.top + rect.height / 2 - pos.top - 7), 120) }
                : pos.side === 'top'
                  ? { top: -6, left: Math.min(Math.max(18, rect.left + 24 - pos.left), POPOVER_W - 30) }
                  : { bottom: -6, left: Math.min(Math.max(18, rect.left + 24 - pos.left), POPOVER_W - 30) }
          }
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <StepPill n={n} total={total} />
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-sunken hover:text-accent"
        >
          <Icon name="x" size={12} />
          <span className="sr-only">Close the guide</span>
        </button>
      </div>
      <h2 id="coach-title" className="mt-3 text-heading font-medium leading-snug text-ink">
        {title}
      </h2>
      <p id="coach-body" className="mt-1.5 text-small leading-relaxed text-ink">
        {body}
      </p>
      {!rect && hint && (
        <p className="mt-3 flex items-center gap-2 rounded-md bg-surface-sunken px-3 py-2 text-label font-medium text-accent">
          <Icon name="chevronDown" size={14} className={hint === 'down' ? 'motion-safe:animate-bounce' : 'rotate-180 motion-safe:animate-bounce'} />
          Scroll {hint} to find the button
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-auto">
            <Icon name="arrowLeft" size={13} />
            Back
          </Button>
        )}
        <Button ref={actionRef} variant="ghost" size="sm" onClick={onSkip} className={onBack ? undefined : 'ml-auto'}>
          {skipLabel}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {rect && (
        // Spotlight: a ring around the target and a soft dim everywhere else.
        // pointer-events-none, so the target underneath is still the thing you click.
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[55] motion-safe:animate-[vue-glow_1.8s_ease-in-out_infinite]"
          style={{
            top: rect.top - 5,
            left: rect.left - 5,
            width: rect.width + 10,
            height: rect.height + 10,
            borderRadius: rect.radius + 5,
            boxShadow: '0 0 0 4px var(--color-accent-line), 0 0 0 200vmax rgb(42 33 69 / 0.32)'
          }}
        />
      )}
      {popover}
    </>
  )
}
