'use client'

/* ------------------------------------------------------------ PageHeader -- */
// The one display-size anchor of a screen. A light weight at size reads as
// expensive; the lead stays in muted body text.

export function PageHeader({ title, lead, actions, children }) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title font-light text-balance text-ink sm:text-display">{title}</h1>
          {lead && <p className="mt-3 max-w-prose text-heading text-ink-muted">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  )
}
