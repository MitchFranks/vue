'use client'

// ---------------------------------------------------------------------------
// The sign-in gate around every app screen. Signed out: go to /login and come
// back here after. Signed in to a different workspace than the one loaded
// (another tab signed in or out): reload so the right data loads. Nothing is
// drawn until that check has run, so a page never flashes the wrong venue.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ACTIVE_ACCOUNT, currentAccount } from '@/lib/account/session'
import { venue } from '@/lib/mock/events'

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

export function RequireAccount({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const account = currentAccount()
    if (!account) {
      const back = `${pathname}${window.location.search}`
      router.replace(`/login?next=${encodeURIComponent(back)}`)
      return
    }
    // The sample data loads when no one is signed in, so the demo needs no reload.
    if (account.id !== (ACTIVE_ACCOUNT?.id ?? 'demo')) {
      window.location.reload()
      return
    }
    // The signed-in person and venue, wherever the screens name the manager.
    if (!account.demo) {
      Object.assign(venue, {
        name: account.venueName,
        manager: account.name,
        managerRole: account.title,
        managerInitials: initialsOf(account.name),
        managerPhone: account.phone || ''
      })
    }
    setReady(true)
    // Checked once per load: signing in or out always reloads the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ready ? children : <div className="min-h-screen bg-canvas" aria-busy="true" />
}
