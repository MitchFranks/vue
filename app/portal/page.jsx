'use client'

// SCREEN — Client portal (public, for the couple). No sign-in and no app
// shell: the venue sends the couple this link. See components/portal/ClientPortal.jsx.

import { Suspense } from 'react'
import { ClientPortal } from '@/components/portal/ClientPortal'

export default function PortalPage() {
  // ClientPortal reads ?c=, which needs a Suspense boundary on a static export.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy="true" />}>
      <ClientPortal />
    </Suspense>
  )
}
