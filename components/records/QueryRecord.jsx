'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

/* ---------------------------------------------------------- QueryRecord -- */
// Detail and edit screens read ?id= so records made in the browser have a
// page too (the static export can only pre-build known ids). The Suspense
// boundary is what lets the rest of the page pre-render.

function WithId({ render }) {
  return render(useSearchParams().get('id'))
}

export function QueryRecord({ render }) {
  return (
    <Suspense fallback={null}>
      <WithId render={render} />
    </Suspense>
  )
}
