'use client'

// SCREEN — Client inquiry form (public). No sign-in and no app shell: this is
// the page a venue links from its website. What is sent becomes a task in
// Tasks. See components/inquiry/ClientInquiry.jsx.

import { Suspense } from 'react'
import { ClientInquiry } from '@/components/inquiry/ClientInquiry'

export default function InquirePage() {
  // ClientInquiry reads ?type=, which needs a Suspense boundary on a static export.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy="true" />}>
      <ClientInquiry />
    </Suspense>
  )
}
