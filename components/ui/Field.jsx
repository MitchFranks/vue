'use client'

/* ----------------------------------------------------------------- Field -- */
// A labelled value: label in muted small text, value in ink.

export function Field({ label, value, children, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{children || value}</dd>
    </div>
  )
}
