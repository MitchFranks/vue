import { AppShell } from '@/components/AppShell'

// Everything inside the (app) route group is the product itself and gets the
// persistent shell: sidebar, top bar, breadcrumbs, toasts and the early-stage
// notice. The welcome screen at / deliberately sits outside this.
export default function ProductLayout({ children }) {
  return <AppShell>{children}</AppShell>
}
