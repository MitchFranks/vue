'use client'

// The frame for the pages a staff member opens on their phone (their day-of
// sheet, their task list): the venue's name, one narrow column, no sidebar
// and no sign-in, and a note on what the prototype does and doesn't do.

import Link from 'next/link'
import { venue } from '@/lib/mock/events'

export function StaffFrame({ section, children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-(--header-height) w-full max-w-form items-center justify-between gap-4 px-4">
          <p className="font-display text-[1.85rem] leading-[1.1] text-ink">{venue.name}</p>
          <p className="text-small text-ink-muted">{section}</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-form flex-1 space-y-4 px-4 pt-6 pb-12">{children}</main>
    </div>
  )
}

/** "Prototype: …" and a way back to the venue's side. */
export function StaffPrototypeNote({ backHref, backLabel }) {
  return (
    <p className="text-label text-ink-muted">
      Prototype: in a real build each person gets a private link by text. Everything here is saved in this browser only.{' '}
      <Link href={backHref} className="underline underline-offset-2 hover:text-ink">
        {backLabel}
      </Link>
    </p>
  )
}
