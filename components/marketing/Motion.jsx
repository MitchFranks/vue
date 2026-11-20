'use client'

// ---------------------------------------------------------------------------
// Restrained motion for the welcome page. Motion supports the page; it never
// becomes the page:
//
//   Reveal      fades a block up into place the first time it scrolls into
//               view. `delay` staggers siblings (in ms).
//   Parallax    moves its child a little slower than the page (a background
//               photo), at most a few dozen pixels.
//   Slideshow   cross-fades a few photos slowly, each easing in from a
//               slight zoom (the hero: every kind of venue, no words needed).
//   useScrolled true once the page has scrolled past `px` (the header turns
//               solid).
//
// Everything is skipped for people who ask for reduced motion: blocks are
// simply there, photos hold still, and the slideshow shows its first photo.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { cx } from '@/lib/cx'

const REDUCED = '(prefers-reduced-motion: reduce)'

function subscribeReduced(cb) {
  const m = window.matchMedia(REDUCED)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false)
}

/** Fades and lifts its children into place the first time they are on screen. */
export function Reveal({ as: Tag = 'div', delay = 0, className, children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={cx('transition-[opacity,transform] duration-[900ms] ease-calm motion-reduce:transition-none', shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100', className)}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Moves its child up to `range` px slower than the page while it is on screen. */
export function Parallax({ range = 60, className, children }) {
  const ref = useRef(null)
  const inner = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el || !inner.current) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (r.bottom < 0 || r.top > vh) return
      // -1 when the block enters at the bottom, 1 when it leaves at the top.
      const progress = (vh - r.top) / (vh + r.height) * 2 - 1
      inner.current.style.transform = `translate3d(0, ${(progress * range).toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [range, reduced])
  return (
    <div ref={ref} className={cx('overflow-hidden', className)}>
      <div ref={inner} className="h-full w-full will-change-transform" style={{ height: `calc(100% + ${range * 2}px)`, marginTop: -range }}>
        {children}
      </div>
    </div>
  )
}

/** Slowly cross-fades `photos` ([{ src, alt }]), each settling from a slight zoom. Decorative. */
export function Slideshow({ photos, interval = 6500, className }) {
  const reduced = useReducedMotion()
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (reduced || photos.length < 2) return undefined
    const t = setInterval(() => setAt((i) => (i + 1) % photos.length), interval)
    return () => clearInterval(t)
  }, [reduced, photos.length, interval])
  return (
    <div aria-hidden="true" className={cx('absolute inset-0 overflow-hidden', className)}>
      {photos.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS
        <img
          key={p.src}
          src={p.src}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : undefined}
          className={cx(
            'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] ease-out',
            i === at ? 'scale-100 opacity-100 duration-[2400ms,9000ms]' : 'scale-[1.06] opacity-0 duration-[2400ms,0ms] delay-[0ms,2400ms]'
          )}
        />
      ))}
    </div>
  )
}

function subscribeScroll(cb) {
  window.addEventListener('scroll', cb, { passive: true })
  return () => window.removeEventListener('scroll', cb)
}
/** True once the page has scrolled more than `px`. */
export function useScrolled(px = 24) {
  return useSyncExternalStore(subscribeScroll, () => window.scrollY > px, () => false)
}
