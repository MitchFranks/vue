import { AppShell } from '@/components/AppShell'
import { RequireAccount } from '@/components/account/RequireAccount'

// Everything inside the (app) route group is the product itself and gets the
// persistent shell: sidebar, top bar, breadcrumbs, toasts and the early-stage
// notice. The welcome screen at / and sign-in deliberately sit outside this.
// Every screen here needs a signed-in account (RequireAccount).
export default function ProductLayout({ children }) {
  return (
    <RequireAccount>
      <AppShell>{children}</AppShell>
    </RequireAccount>
  )
}
