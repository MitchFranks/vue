// ---------------------------------------------------------------------------
// SCREEN 0 — Landing.
// Job: say what the product is in one breath, then get out of the way.
//
// This is the only full-viewport screen in the prototype and the only one that
// does not sit inside the product shell — it carries its own nav so the picture
// can run edge to edge. The layout follows the Figma "hero design variation":
// full-bleed photograph, a flat dusk overlay, a transparent nav across the top,
// centred light-serif headline, and a hairline footer strip.
//
// The copy is the product's, not the mock-up's. Every nav item and button here
// goes somewhere real — the design's "Spaces / Philosophy / Curation" labels
// would have been navigation that navigates nowhere (NO FALSE AFFORDANCE).
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { Button, Icon } from './ui'
import { venue } from '@/lib/data'
import { asset } from '@/lib/asset'

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Events', href: '/events/johnson' },
  { label: 'Messages', href: '/events/johnson/messages/decor-time' }
]

export function Landing() {
  return (
    <div className="on-photo relative flex min-h-screen min-h-dvh flex-col bg-night text-cream">
      <img className="absolute inset-0 h-full w-full object-cover" src={asset('/images/villa-hero.jpg')} alt="" />
      <div className="absolute inset-0 bg-night/48" aria-hidden="true" />

      <header className="relative z-10 flex items-center justify-between gap-6 px-6 pt-7 md:px-16 md:pt-10">
        <span className="font-display text-[19px] font-semibold tracking-[0.02em] text-cream md:text-2xl">{venue.name}</span>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-0.5 py-1 text-sm font-medium text-parchment transition-colors hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button variant="parchment" href="/dashboard">
          Open dashboard
        </Button>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center md:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-parchment">
          Venue operations for {venue.name}
        </p>
        <h1 className="mb-6 max-w-[760px] font-display text-5xl font-light leading-[1.08] text-cream md:text-7xl">
          Every event, every loose end, in one quiet place.
        </h1>
        <p className="mb-10 max-w-[560px] text-base leading-relaxed text-cream/80">
          Timeline, vendors, staff, payments, contracts and client email for every wedding you host — together on
          one screen, instead of scattered across five systems.
        </p>
        <Button variant="cream" size="lg" href="/dashboard">
          See what needs attention
          <Icon name="arrowRight" size={15} />
        </Button>
      </div>

      <footer className="relative z-10 flex items-center justify-between gap-4 border-t border-parchment/20 px-6 pt-5 pb-7 md:px-16 md:pt-6 md:pb-10">
        <span className="font-display text-[17px] italic text-parchment">Historic spaces, calmly run.</span>
        <span className="hidden text-[11px] uppercase tracking-[0.12em] text-parchment sm:block">
          Signed in as {venue.manager} · {venue.today}
        </span>
      </footer>
    </div>
  )
}
