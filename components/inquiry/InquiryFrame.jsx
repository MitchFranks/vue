'use client'

// The frame for the venue's public pages (the inquiry form and the couple's
// client portal): the venue's name, one narrow column, the same canvas and
// type as the app. No sidebar and no sign-in, because the people using them
// are the venue's clients, not its staff.

/** The heading's id: each step change moves focus here (ClientInquiry). */
export const INQUIRY_TITLE_ID = 'inquiry-title'

const INQUIRY_NOTE =
  "Prototype: what you send is saved in this browser only, where the venue's Tasks can pick it up. Nothing is emailed."

/**
 * `section` names the page in the header; `above` sits over the title (a back
 * link, "Step 2 of 4"); `note` is the prototype footnote; `after` sits outside
 * the column (toasts).
 */
export function InquiryFrame({ venueName, title, lead, children, section = 'Inquiries', note = INQUIRY_NOTE, above, after }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-(--header-height) w-full max-w-form items-center justify-between gap-4 px-4">
          <p className="truncate text-title font-light text-ink">{venueName}</p>
          <p className="shrink-0 text-small text-ink-muted">{section}</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-form flex-1 px-4 pt-10 pb-12 sm:pt-16">
        {above}
        <h1 id={INQUIRY_TITLE_ID} tabIndex={-1} className="text-title font-light text-balance text-ink outline-none sm:text-display">
          {title}
        </h1>
        {lead && <p className="mt-3 max-w-prose text-heading text-ink-muted">{lead}</p>}
        <div className="mt-8 space-y-4">{children}</div>
        <p className="mt-8 text-label text-ink-muted">{note}</p>
      </main>
      {after}
    </div>
  )
}
