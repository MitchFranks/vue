'use client'

// ---------------------------------------------------------------------------
// SCREEN 0 — Welcome.
//
// The one screen that is not the product, designed like a hospitality brand:
// large serif headlines, real venue photography, the real product in large
// screenshots, generous space, and very little text. Each section says one
// thing. For venues of every kind, not only weddings.
//
//   Hero          the promise, one way in, and photos of different venues
//                 cross-fading behind it.
//   The product   the real dashboard and a staff member's phone, rising over
//                 the edge of the hero.
//   How it works  three steps, three lines.
//   What's inside the real Staffing Planner, and the six areas as links.
//   Every venue   three kinds of venue, in photos.
//   Who it's for  managers and staff, in photos.
//   Closing       one line, the same way in.
//
// ONE WAY IN: the product is entered through "Open Tasks" everywhere on the
// page (header, hero, closing). The only other buttons go somewhere
// different on purpose: "Fill open spots" straight to the Staffing Planner,
// and "Use as client" (hero only) to the client portal a client gets, for
// testers playing the client (the Shah–Patel portal, like the sign-in page's).
//
// Photos: Unsplash (public/photos/CREDITS.md). Screenshots: Vue itself
// (public/screens/README.md says how to retake them). Motion: Motion.jsx.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { cx } from '@/lib/cx'
import { PHOTOS, SCREENS } from '@/lib/asset'
import { portalHref } from '@/lib/portal'
import { Icon } from '@/components/ui'
import { PrototypeNotice } from './onboarding/PrototypeNotice'
import { Parallax, Reveal, Slideshow, useScrolled } from './marketing/Motion'

const CTA = { href: '/tasks', label: 'Open Tasks' }

const STEPS = [
  { title: 'Vue spots the problem', body: 'A declined shift, an unanswered client, a payment due.' },
  { title: 'You see why it matters', body: 'Which event it affects and how soon.' },
  { title: 'You fix it in one click', body: 'Every item comes with the button that solves it.' }
]

const FEATURES = [
  { title: 'Tasks', body: 'One list of everything that needs you, most urgent first.', href: '/tasks' },
  { title: 'Staffing Planner', body: 'See open spots, text your team, and track who said yes.', href: '/staffing' },
  { title: 'Staff availability', body: 'Know who is free before you ask them to work.', href: '/staffing/team' },
  { title: 'Events', body: 'Weddings, galas, conferences and shows, each with its own run of show.', href: '/events' },
  { title: 'Messages', body: 'Client, vendor and staff messages, filed to the right event.', href: '/messages' },
  { title: 'Payments & documents', body: 'Balances due and contracts waiting for a signature.', href: '/events/evt-1001/payments' }
]

const VENUES = [
  { photo: PHOTOS.receptionHall, label: 'Celebrations' },
  { photo: PHOTOS.conference, label: 'Conferences' },
  { photo: PHOTOS.concertHall, label: 'Performances' }
]

const AUDIENCE = [
  { photo: PHOTOS.manager, title: 'Venue managers', body: 'See every event at a glance and stay ahead of the week.' },
  { photo: PHOTOS.staff, title: 'Event staff', body: 'Get one text with your shift, and answer yes or no.' }
]

/** A link styled as a button, in the welcome page's own light-on-dark and dark-on-light shapes. */
function CtaLink({ href, children, tone = 'light', className }) {
  return (
    <Link
      href={href}
      className={cx(
        'group inline-flex h-12 items-center gap-2 rounded-full px-6 text-body font-medium transition-[background-color,color,border-color] duration-200 ease-calm',
        tone === 'light' && 'bg-white text-[#1a1714] hover:bg-white/85',
        tone === 'outline' && 'border border-white/45 text-white hover:border-white hover:bg-white/10',
        tone === 'dark' && 'bg-ink text-on-ink hover:bg-ink/85',
        className
      )}
    >
      {children}
    </Link>
  )
}

/** A screenshot in a quiet browser frame. */
function BrowserShot({ src, alt, className }) {
  return (
    <figure className={cx('overflow-hidden rounded-[14px] border border-black/10 bg-surface shadow-[0_40px_80px_-30px_rgba(30,22,12,0.45),0_12px_24px_-12px_rgba(30,22,12,0.25)]', className)}>
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-line bg-surface-sunken/70 px-4 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-line-strong/50" />
        ))}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS */}
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
    </figure>
  )
}

/** A screenshot in a phone frame. */
function PhoneShot({ src, alt, className }) {
  return (
    <figure className={cx('overflow-hidden rounded-[2.4rem] border-[7px] border-[#1a1714] bg-[#1a1714] shadow-[0_40px_80px_-24px_rgba(30,22,12,0.55)]', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS */}
      <img src={src} alt={alt} className="block w-full rounded-[1.9rem]" loading="lazy" />
    </figure>
  )
}

function Eyebrow({ children, className }) {
  return <p className={cx('text-small font-medium tracking-[0.14em] text-accent uppercase', className)}>{children}</p>
}

export function Landing() {
  const scrolled = useScrolled(40)

  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas text-ink">
      {/* Clear over the hero; turns into the page's own surface once you scroll. */}
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-300 ease-calm',
          scrolled ? 'border-b border-line bg-surface/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 md:px-10">
          <Link href="/" className={cx('font-display text-[1.9rem] leading-none transition-colors', scrolled ? 'text-ink' : 'text-white')}>
            Vue
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <PrototypeNotice />
            <span className="ml-1 hidden sm:inline-flex">
              <Link
                href={CTA.href}
                className={cx(
                  'inline-flex h-9 items-center rounded-full px-4 text-small font-medium transition-colors',
                  scrolled ? 'bg-ink text-on-ink hover:bg-ink/85' : 'bg-white text-[#1a1714] hover:bg-white/85'
                )}
              >
                {CTA.label}
              </Link>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------------------------------- hero --------------------------------- */}
        <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-[#1a1714] pb-48 text-white sm:pb-56 lg:pb-64">
          <Parallax range={50} className="absolute inset-0 -z-20">
            <Slideshow photos={[PHOTOS.hero, PHOTOS.receptionHall, PHOTOS.conference, PHOTOS.concertHall, PHOTOS.banquet]} />
          </Parallax>
          {/* Two washes: down the page for the header and the screenshot's edge, and from the left so the headline always reads. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,14,10,0.55)_0%,rgba(18,14,10,0.2)_35%,rgba(18,14,10,0.8)_100%)]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,10,0.7)_0%,rgba(18,14,10,0.35)_45%,rgba(18,14,10,0)_75%)]" />

          <div className="mx-auto w-full max-w-7xl px-5 pt-32 md:px-10">
            <Reveal>
              <h1 className="max-w-[13ch] font-display text-hero text-balance">Know what needs fixing before the event.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-md text-heading leading-relaxed text-white/80 sm:text-[1.15rem]">
                Staff every event, answer every client, and catch loose ends before the big day.
              </p>
            </Reveal>
            <Reveal delay={220} className="mt-9 flex flex-wrap items-center gap-3">
              <CtaLink href={CTA.href}>
                {CTA.label}
                <Icon name="arrowRight" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </CtaLink>
              <CtaLink href="/staffing" tone="outline">
                Fill open spots
              </CtaLink>
              <CtaLink href={portalHref('cpl-2002')} tone="outline">
                Use as client
              </CtaLink>
            </Reveal>
            <Reveal delay={320}>
              <a href="#how-it-works" className="mt-10 inline-flex items-center gap-2 text-small text-white/70 transition-colors hover:text-white">
                How it works
                <Icon name="chevronDown" size={14} className="motion-safe:animate-bounce" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------ the product ------------------------------ */}
        {/* The real dashboard rises over the hero's edge, with a staff phone beside it. */}
        <section aria-label="Vue on a computer and a phone" className="relative z-10 -mt-36 px-5 sm:-mt-44 md:px-10 lg:-mt-52">
          <div className="relative mx-auto max-w-6xl">
            <Reveal>
              <BrowserShot src={SCREENS.dashboard} alt="Vue's dashboard: what needs the manager today, updates from clients, and the team's week" />
            </Reveal>
            <Reveal delay={250} className="absolute -right-2 -bottom-16 hidden w-[19%] min-w-36 sm:block lg:-right-10">
              <PhoneShot src={SCREENS.phone} alt="A staff member's to-dos on their phone" />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------ how it works ----------------------------- */}
        <section id="how-it-works" className="scroll-mt-16">
          <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 pt-36 pb-28 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:pt-48 lg:pb-40">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-5 max-w-[14ch] font-display text-headline text-balance">Problems come to you. You don&apos;t go looking.</h2>
            </Reveal>
            <ol className="border-t border-line">
              {STEPS.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 120} className="grid grid-cols-[3.5rem_1fr] gap-x-6 border-b border-line py-8 sm:grid-cols-[5rem_1fr]">
                  <span className="font-display text-[2.6rem] leading-none text-accent sm:text-[3.2rem]">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-[1.25rem] leading-snug font-medium">{step.title}</h3>
                    <p className="mt-2 text-body text-ink-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------- features ------------------------------- */}
        <section className="overflow-hidden bg-surface">
          <div className="mx-auto w-full max-w-7xl px-5 py-28 md:px-10 lg:py-40">
            <Reveal className="max-w-3xl">
              <Eyebrow>What&apos;s inside</Eyebrow>
              <h2 className="mt-5 font-display text-headline text-balance">Everything a venue runs on, in one place.</h2>
            </Reveal>

            <div className="mt-16 grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
              <ul className="border-t border-line">
                {FEATURES.map((f, i) => (
                  <Reveal as="li" key={f.title} delay={i * 70} className="border-b border-line">
                    <Link href={f.href} className="group flex items-start gap-4 py-5">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[1.1rem] font-medium">{f.title}</span>
                        <span className="mt-1 block text-body text-ink-muted">{f.body}</span>
                      </span>
                      <Icon name="arrowRight" size={18} className="mt-1 text-ink-muted transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  </Reveal>
                ))}
              </ul>
              {/* The real Staffing Planner, running off the right edge on wide screens. */}
              <Reveal delay={150} className="lg:-mr-48 xl:-mr-72">
                <BrowserShot src={SCREENS.staffing} alt="The Staffing Planner: each part of an event, who is confirmed, and the open spots to fill" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------------- every kind of venue ------------------------ */}
        <section>
          <div className="mx-auto w-full max-w-7xl px-5 pt-28 md:px-10 lg:pt-40">
            <Reveal className="max-w-3xl">
              <Eyebrow>For every kind of venue</Eyebrow>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
              {VENUES.map((v, i) => (
                <Reveal as="figure" key={v.label} delay={i * 120} className={cx('group', i === 1 && 'sm:mt-16')}>
                  <div className="aspect-[4/3] overflow-hidden rounded-[10px] bg-surface-sunken sm:aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS */}
                    <img src={v.photo.src} alt={v.photo.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-calm group-hover:scale-[1.04]" />
                  </div>
                  <figcaption className="mt-4 font-display text-[1.6rem] leading-none">{v.label}</figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------- audience ------------------------------- */}
        <section>
          <div className="mx-auto w-full max-w-7xl px-5 py-28 md:px-10 lg:py-40">
            <Reveal className="max-w-3xl">
              <Eyebrow>Who it&apos;s for</Eyebrow>
              <h2 className="mt-5 font-display text-headline text-balance">Built for the people who run the day.</h2>
            </Reveal>
            <div className="mt-16 grid gap-12 sm:grid-cols-[1.25fr_1fr] sm:gap-10 lg:gap-16">
              {AUDIENCE.map((a, i) => (
                <Reveal as="figure" key={a.title} delay={i * 150} className={cx(i === 1 && 'sm:mt-32')}>
                  <div className={cx('overflow-hidden rounded-[10px] bg-surface-sunken', i === 0 ? 'aspect-[4/3]' : 'aspect-[4/5]')}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS */}
                    <img src={a.photo.src} alt={a.photo.alt} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="mt-6">
                    <h3 className="font-display text-[2rem] leading-none">{a.title}</h3>
                    <p className="mt-3 max-w-sm text-body text-ink-muted">{a.body}</p>
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ closing CTA ----------------------------- */}
        <section className="relative isolate overflow-hidden bg-[#1a1714] text-white">
          <Parallax range={70} className="absolute inset-0 -z-20">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS */}
            <img src={PHOTOS.closing.src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </Parallax>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(18,14,10,0.62)]" />
          <div className="mx-auto w-full max-w-4xl px-5 py-36 text-center md:px-10 lg:py-48">
            <Reveal>
              <h2 className="font-display text-headline text-balance">Run every event with nothing slipping through.</h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-6 max-w-md text-heading text-white/80">Your staff, your clients and your deadlines, all in one place.</p>
            </Reveal>
            <Reveal delay={220} className="mt-10 flex flex-wrap justify-center gap-3">
              <CtaLink href={CTA.href}>
                {CTA.label}
                <Icon name="arrowRight" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </CtaLink>
              <CtaLink href="/staffing" tone="outline">
                Fill open spots
              </CtaLink>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-8 md:px-10">
          <span className="font-display text-[1.6rem] leading-none">Vue</span>
          <p className="text-small text-ink-muted">Early prototype. All data is simulated.</p>
          <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="text-small text-ink-muted underline-offset-4 hover:text-ink hover:underline sm:ml-auto">
            Photos from Unsplash
          </a>
        </div>
      </footer>
    </div>
  )
}
