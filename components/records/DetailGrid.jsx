'use client'

/* ------------------------------------------------------------ DetailGrid -- */
// Two columns on wide screens (who they are | what they do), one on phones.

export function DetailGrid({ aside, children }) {
  return (
    // grid-cols-1 (minmax 0) and min-w-0 let long rows truncate instead of widening the page on phones.
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="min-w-0 space-y-4">{aside}</div>
      <div className="min-w-0 space-y-4">{children}</div>
    </div>
  )
}
