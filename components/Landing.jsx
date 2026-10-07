'use client'

// ---------------------------------------------------------------------------
// SCREEN 0 — Welcome.
//
// The one screen that is not the product. Its job is to say what Vue is in a
// single breath and then get out of the way.
//
// This follows the Figma reference hero directly: full-bleed photograph, a
// two-axis dusk gradient, a transparent header that sits over the image, a
// wide-tracked eyebrow, a large Playfair headline with an italic emphasis, a
// brass primary action beside a ghost secondary, and a divided stat row.
//
// The difference from the reference: the three figures are read from the live
// store rather than hard-coded, so this screen can never quote a number the
// dashboard disagrees with.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { events, venue } from '@/lib/mock/events'
import { staff } from '@/lib/mock/staff'
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
    <div className="relative flex min-h-screen min-h-dvh flex-col overflow-hidden bg-night text-white">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={asset('/images/villa-hero.jpg')}
        alt=""
        aria-hidden="true"
      />
      {/* Two-axis scrim, as in the reference: horizontal for the copy, a
          vertical lift at the foot so the footer rule stays legible. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,29,26,.86)_0%,rgba(19,29,26,.46)_55%,rgba(19,29,26,.12)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(19,29,26,.7)_0%,transparent_48%)]" />

      {/* ------------------------------ header ------------------------------ */}
      <header className="relative z-10 border-b border-white/20">
        <div className="mx-auto flex h-20 w-[min(100%-2rem,1200px)] items-center justify-between gap-6 md:h-24">
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/70 font-serif text-[18px]">
              V
            </span>
            <span className="leading-none">
              <strong className="block text-[13px] font-semibold tracking-[0.18em]">VUE</strong>
              <small className="mt-1.5 block text-[9px] tracking-[0.18em] text-white/60">VENUE OPERATIONS</small>
            </span>
          </span>

          <nav className="hidden items-center gap-10 text-sm font-medium lg:flex" aria-label="Welcome">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-underline py-2 text-white/85 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/dashboard"
            className="inline-flex min-h-[3rem] items-center gap-3 border border-white/55 px-5 text-[12px] font-semibold tracking-[0.06em] transition-all duration-200 hover:-translate-y-[2px] hover:bg-white hover:text-ink"
          >
            Open dashboard
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </header>

      {/* ------------------------------- hero -------------------------------- */}
      <div className="relative z-10 flex flex-1 items-end">
        <div className="mx-auto w-[min(100%-2rem,1200px)] pb-14 pt-24 md:pb-20 md:pt-32">
          <p className="eyebrow text-sage-light">Venue operations for {venue.name}</p>

          <h1 className="display mt-6 max-w-4xl text-[clamp(2.9rem,6.5vw,5.6rem)] leading-[0.98]">
            Every event, every loose end,
            <br />
            in <em className="font-medium italic">one quiet place.</em>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 md:text-lg">
            Timeline, vendors, staff, payments, contracts and client email for every event you host — together on
            one screen, instead of scattered across five systems.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[3.25rem] items-center gap-3 bg-brass px-6 text-[13px] font-semibold tracking-[0.05em] text-white shadow-[0_10px_28px_rgba(15,22,20,.3)] transition-all duration-200 hover:-translate-y-[2px] hover:bg-brass-dark"
            >
              See what needs attention
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link
              href="/schedule/gaps"
              className="inline-flex min-h-[3.25rem] items-center gap-3 border border-white/45 px-6 text-[13px] font-semibold tracking-[0.05em] transition-all duration-200 hover:-translate-y-[2px] hover:bg-white hover:text-ink"
            >
              Review staffing
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          <p className="mt-5 flex items-center gap-2.5 text-xs text-white/65">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-light" />
            {attention.length} {attention.length === 1 ? 'item needs' : 'items need'} attention right now
          </p>

          {/* Divided stat row, straight from the reference — but live. */}
          <div className="mt-14 grid max-w-2xl grid-cols-3 divide-x divide-white/25 border-t border-white/25 pt-6">
            <div>
              <strong className="block font-serif text-[clamp(1.7rem,4vw,2.4rem)] font-medium">
                {events.length}
              </strong>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-white/60">Live events</span>
            </div>
            <div className="pl-5 md:pl-8">
              <strong className="block font-serif text-[clamp(1.7rem,4vw,2.4rem)] font-medium">
                {staff.length}
              </strong>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-white/60">On the team</span>
            </div>
            <div className="pl-5 md:pl-8">
              <strong className="block font-serif text-[clamp(1.7rem,4vw,2.4rem)] font-medium">{gaps.length}</strong>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-white/60">Shifts to fill</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ footer ------------------------------- */}
      <footer className="relative z-10 border-t border-white/20">
        <div className="mx-auto flex w-[min(100%-2rem,1200px)] flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-[12px] leading-relaxed text-white/65">
            <span className="mt-px shrink-0 border border-white/40 px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em]">
              PROTOTYPE
            </span>
            <span className="max-w-[58ch]">
              Everything past this screen is simulated and is being tested for usability.
            </span>
          </p>
          <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.14em] text-white/55 sm:block">
            {venue.manager} · {venue.today}
          </span>
        </div>
      </footer>
    </div>
  )
}
