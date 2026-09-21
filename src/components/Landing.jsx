// ---------------------------------------------------------------------------
// SCREEN 0 — Landing.
// Job: say what the product is in one breath, then get out of the way.
//
// This is the only full-viewport screen in the prototype and the only one that
// does not sit inside the AppShell — it carries its own nav so the picture can
// run edge to edge. The layout follows the Figma "hero design variation":
// full-bleed photograph, a flat dusk overlay, a transparent nav across the top,
// centred serif headline, and a hairline footer strip.
//
// The copy is the product's, not the mock-up's. Every nav item and button here
// goes somewhere real — the design's "Spaces / Philosophy / Curation" labels
// would have been navigation that navigates nowhere (NO FALSE AFFORDANCE).
// ---------------------------------------------------------------------------

import { Icon } from './ui.jsx'
import villa from '../assets/villa-hero.jpg'
import { venue } from '../data.js'

export function Landing({ onNavigate }) {
  return (
    <div className="landing">
      <img className="landing__img" src={villa} alt="" />
      <div className="landing__dusk" aria-hidden="true" />

      <header className="landing__nav">
        <span className="landing__brand">{venue.name}</span>

        <nav className="landing__links" aria-label="Primary">
          <button className="landing__link" onClick={() => onNavigate('dashboard')}>
            Dashboard
          </button>
          <button className="landing__link" onClick={() => onNavigate('event')}>
            Events
          </button>
          <button className="landing__link" onClick={() => onNavigate('message')}>
            Messages
          </button>
        </nav>

        <button className="btn btn--parchment" onClick={() => onNavigate('dashboard')}>
          Open dashboard
        </button>
      </header>

      <div className="landing__body">
        <p className="landing__eyebrow">Venue operations for {venue.name}</p>
        <h1 className="landing__title">Every event, every loose end, in one quiet place.</h1>
        <p className="landing__lead">
          Timeline, vendors, staff, payments, contracts and client email for every wedding you host —
          together on one screen, instead of scattered across five systems.
        </p>
        <button className="btn btn--cream btn--lg" onClick={() => onNavigate('dashboard')}>
          See what needs attention
          <Icon name="arrowRight" size={15} />
        </button>
      </div>

      <footer className="landing__foot">
        <span className="landing__tagline">Historic spaces, calmly run.</span>
        <span className="landing__byline">
          Signed in as {venue.manager} · {venue.today}
        </span>
      </footer>
    </div>
  )
}
