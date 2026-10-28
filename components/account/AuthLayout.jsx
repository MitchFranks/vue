'use client'

// The frame for signing in and creating an account: the wordmark, one narrow
// column of cards, and the same canvas and type as the app behind it.

import Link from 'next/link'

export function AuthLayout({ title, lead, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-(--header-height) w-full max-w-form items-center px-4">
          <Link href="/" className="rounded-sm text-title font-light text-ink" title="Back to the welcome screen">
            Vue
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-form flex-1 px-4 pt-10 pb-12 sm:pt-16">
        <h1 className="text-title font-light text-balance text-ink sm:text-display">{title}</h1>
        {lead && <p className="mt-3 max-w-prose text-heading text-ink-muted">{lead}</p>}
        <div className="mt-8 space-y-4">{children}</div>
        {footer && <div className="mt-6 text-small text-ink-muted">{footer}</div>}
      </main>
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
