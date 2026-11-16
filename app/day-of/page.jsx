'use client'

// SCREEN — A staff member's day-of sheet (public). No sign-in and no app
// shell: this is the page a staff member opens from the text they get when
// an event changes. See components/sheet/DayOfSheet.jsx.

import { Suspense } from 'react'
import { DayOfSheet } from '@/components/sheet/DayOfSheet'

export default function DayOfPage() {
  // DayOfSheet reads ?e= and ?s=, which needs a Suspense boundary on a static export.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy="true" />}>
      <DayOfSheet />
    </Suspense>
  )
}
