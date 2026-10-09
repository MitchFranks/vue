'use client'

// ---------------------------------------------------------------------------
// SCREEN 0 — Welcome.
//
// The one screen that is not the product. Its job is to say what Vue is in a
// single breath and then get out of the way.
//
// Light, soft and a little playful: a blush-to-lilac wash, big rounded type,
// pill buttons, and three floating stat bubbles. The figures are read from the
// live store rather than hard-coded, so this screen can never quote a number
// the dashboard disagrees with. See docs/STYLE-GUIDE.md.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { upNextLabel, useStore } from '@/lib/store'
import { events, venue } from '@/lib/mock/events'
import { staff } from '@/lib/mock/staff'
import { Icon } from './ui/primitives'

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Weddings', href: '/events' },
  { label: 'Staffing', href: '/staffing' },
  { label: 'Messages', href: '/messages' }
]

export function Landing() {
  const { attention, openPositions } = useStore()

  const bubbles = [
    { value: events.length, label: 'Weddings & events', tone: 'bg-accent-soft text-accent' },
    { value: staff.length, label: 'On the team', tone: 'bg-done-soft text-done' },
    { value: openPositions.length, label: 'Open positions', tone: 'bg-warn-soft text-warn' }
  ]

  return (
    <div className="relative flex min-h-screen min-h-dvh flex-col overflow-hidden bg-canvas text-ink">
      {/* Soft colour washes — decoration only. */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-blush/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/4 h-[30rem] w-[30rem] rounded-full bg-accent-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[24rem] w-[24rem] rounded-full bg-done-soft/80 blur-3xl" />

      {/* ------------------------------ header ------------------------------ */}
      <header className="relative z-10">
        <div className="mx-auto flex h-20 w-[min(100%-2rem,1200px)] items-center justify-between gap-6 md:h-24">
          <span className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent font-display text-[20px] font-extrabold text-white shadow-pop">
              v
            </span>
            <span className="leading-none">
              <strong className="block font-display text-[22px] font-extrabold tracking-tight">vue</strong>
              <small className="mt-0.5 block text-[12px] font-medium text-muted">wedding venue ops</small>
            </span>
          </span>

          <nav className="hidden items-center gap-1 rounded-full bg-surface/80 p-1.5 shadow-card backdrop-blur lg:flex" aria-label="Welcome">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-5 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-accent-soft hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-[2px] hover:bg-accent"
          >
            Open dashboard
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </header>

      {/* ------------------------------- hero -------------------------------- */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-[min(100%-2rem,1200px)] py-14 md:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13px] font-semibold text-accent shadow-card">
            <span className="h-2 w-2 rounded-full bg-blush-deep" />
            Wedding operations for {venue.name}
          </p>

          <h1 className="display mt-7 max-w-4xl text-[clamp(2.8rem,6.4vw,5.4rem)] leading-[1.02]">
            Every wedding, every loose end,
            <br />
            <span className="rounded-[2rem] bg-accent px-4 text-white">in one happy place.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-ink-2 md:text-lg">
            Timeline, vendors, staff, payments, contracts and couple email for every wedding you host — together on
            one screen, instead of scattered across five systems.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-[14px] font-bold text-white shadow-pop transition-all duration-200 hover:-translate-y-[2px] hover:bg-accent-dark"
            >
              See what's up next
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link
              href="/staffing"
              className="inline-flex items-center gap-3 rounded-full bg-surface px-8 py-4 text-[14px] font-bold text-ink shadow-card transition-all duration-200 hover:-translate-y-[2px] hover:text-accent"
            >
              Review staffing
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          <p className="mt-6 flex items-center gap-2.5 text-sm font-medium text-ink-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            Up next: {upNextLabel(attention)}
          </p>

          {/* Live stat bubbles. */}
          <div className="mt-14 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {bubbles.map((b) => (
              <div key={b.label} className="surface-card px-6 py-5">
                <strong className={`inline-block rounded-full px-4 py-1 font-display text-[clamp(1.6rem,3.6vw,2.2rem)] font-extrabold ${b.tone}`}>
                  {b.value}
                </strong>
                <span className="mt-2 block text-[13px] font-semibold text-muted">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------ footer ------------------------------- */}
      <footer className="relative z-10">
        <div className="mx-auto flex w-[min(100%-2rem,1200px)] flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-[13px] leading-relaxed text-muted">
            <span className="mt-px shrink-0 rounded-full bg-blush px-3 py-0.5 text-[11px] font-bold text-ink-2">
              Prototype
            </span>
            <span className="max-w-[58ch]">
              Everything past this screen is simulated and is being tested for usability.
            </span>
          </p>
          <span className="hidden shrink-0 text-[12px] font-medium text-muted sm:block">
            {venue.manager} · {venue.today}
          </span>
        </div>
      </footer>
    </div>
  )
}
