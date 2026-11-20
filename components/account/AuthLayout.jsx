'use client'

// The frame for signing in and creating an account. Wide screens split in
// two: a venue photograph with the wordmark and one serif line on the left,
// the cards on the right. Phones get a short photo band over the cards. The
// cards and their buttons are the app's own, so nothing moves for testers
// (the survey says "In the box called Try the demo, click Open the demo").

import Link from 'next/link'
import { PHOTOS } from '@/lib/asset'
import { OnboardingOverlay } from '@/components/onboarding/OnboardingProvider'
import { Reveal } from '@/components/marketing/Motion'

export function AuthLayout({ title, lead, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ---- the photograph ---- */}
      <aside className="relative isolate h-56 overflow-hidden bg-[#1a1714] text-white sm:h-72 lg:sticky lg:top-0 lg:h-dvh">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export: plain images, sized by CSS */}
        <img src={PHOTOS.exteriorDusk.src} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover motion-safe:animate-[vue-settle_14s_ease-out_both]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,14,10,0.45)_0%,rgba(18,14,10,0.15)_40%,rgba(18,14,10,0.75)_100%)]" />
        <div className="flex h-full flex-col justify-between p-6 sm:p-10">
          <Link href="/" className="self-start font-display text-[2rem] leading-none text-white" title="Back to the welcome screen">
            Vue
          </Link>
          <p className="hidden max-w-sm font-display text-[2.4rem] leading-[1.05] text-balance lg:block">Every event, every shift, every client. In one calm place.</p>
        </div>
      </aside>

      {/* ---- the cards ---- */}
      <main className="w-full flex-1 px-5 pt-10 pb-14 sm:px-10 sm:pt-14 lg:overflow-y-auto lg:px-16 lg:pt-20">
        <div className="mx-auto w-full max-w-form">
          <Reveal>
            <h1 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.01em] text-balance text-ink sm:text-[3.2rem]">{title}</h1>
            {lead && <p className="mt-3 max-w-prose text-heading text-ink-muted">{lead}</p>}
          </Reveal>
          <Reveal delay={120} className="mt-8 space-y-4">
            {children}
          </Reveal>
          {footer && <div className="mt-6 text-small text-ink-muted">{footer}</div>}
        </div>
      </main>
      <OnboardingOverlay />
    </div>
  )
}

/** Accounts live in this browser for now; say so wherever someone signs in or signs up. */
export function LocalAccountsNote() {
  return (
    <p className="text-label text-ink-muted">
      Prototype: accounts and their data are saved in this browser only. They don&apos;t follow you to another device.
    </p>
  )
}
