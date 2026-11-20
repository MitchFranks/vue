'use client'

/* ------------------------------------------------------------ PageHeader -- */
// The one display-size anchor of a screen, set in the display serif
// (Instrument Serif) for a calm, editorial voice; the lead stays in muted
// body text in the UI sans.

export function PageHeader({ title, lead, actions, children }) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[2.1rem] leading-[1.05] tracking-[-0.01em] text-balance text-ink sm:text-[2.9rem]">{title}</h1>
          {lead && <p className="mt-3 max-w-prose text-heading text-ink-muted">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  )
}
