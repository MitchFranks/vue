'use client'

// ---------------------------------------------------------------------------
// SCREEN 0 — Welcome.
//
// The one screen that is not the product. Its job is to say what Vue is in a
// single breath and then get out of the way, so a first-time viewer arrives at
// the dashboard already knowing what they are looking at.
//
// It sits outside the product shell (its own nav, full-bleed photograph) and is
// the only place in the prototype that uses a display serif or an image. The
// product UI past this point stays deliberately plain and low-fidelity, and the
// banner at the bottom of this screen says so before anyone clicks in.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { venue } from '@/lib/mock/events'
import { asset } from '@/lib/asset'
import { Icon } from './ui/primitives'

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Events', href: '/events' },
  { label: 'Staffing', href: '/schedule' },
  { label: 'Messages', href: '/messages' }
]

export function Landing() {
  const { attention, gaps } = useStore()

  return (
    <div className="relative flex min-h-screen min-h-dvh flex-col bg-night text-cream">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={asset('/images/villa-hero.jpg')}
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-night/55" aria-hidden="true" />

      {/* ---- nav: every item goes somewhere real ---- */}
      <header className="relative z-10 flex items-center justify-between gap-6 px-6 pt-7 md:px-16 md:pt-10">
        <span className="font-display text-[20px] font-semibold tracking-[0.02em] text-cream md:text-2xl">
          Vue
        </span>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Welcome">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-0.5 py-1 text-sm font-medium text-parchment transition-colors hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="rounded-box border border-parchment/50 px-3 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-cream/15"
        >
          Open dashboard
        </Link>
      </header>

      {/* ---- the promise ---- */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center md:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-parchment">
          Venue operations for {venue.name}
        </p>

        <h1 className="mb-6 max-w-[800px] font-display text-5xl font-light leading-[1.08] text-cream md:text-7xl">
          Every event, every loose end, in one quiet place.
        </h1>

        <p className="mb-9 max-w-[580px] text-base leading-relaxed text-cream/80">
          Timeline, vendors, staff, payments, contracts and client email for every event you host — together on one
          screen, instead of scattered across five systems.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-box bg-cream px-6 py-3 text-[15px] font-semibold text-night transition-colors hover:bg-white"
        >
          See what needs attention
          <Icon name="arrowRight" size={16} />
        </Link>

        {/* Live from the same store the product uses, so the welcome screen can
            never quote a number the dashboard disagrees with. */}
        <p className="mt-5 text-sm text-parchment">
          {attention.length} {attention.length === 1 ? 'item needs' : 'items need'} attention right now
          {gaps.length > 0 && ` · ${gaps.length} shift${gaps.length === 1 ? '' : 's'} without cover`}
        </p>
      </div>

      {/* ---- the honest bit, before anyone clicks in ---- */}
      <footer className="relative z-10 border-t border-parchment/20 px-6 pt-5 pb-7 md:px-16 md:pt-6 md:pb-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-parchment">
            <span className="mt-0.5 shrink-0 rounded-pill border border-parchment/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Prototype
            </span>
            <span className="max-w-[62ch]">
              This is an early-stage, low-fidelity prototype. Everything past this screen is simulated and is being
              tested for usability.
            </span>
          </p>
          <span className="hidden shrink-0 text-[11px] uppercase tracking-[0.12em] text-parchment/80 sm:block">
            Signed in as {venue.manager} · {venue.today}
          </span>
        </div>
      </footer>
    </div>
  )
}
