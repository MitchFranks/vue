import { AppShell } from '@/components/AppShell'

// Every product screen sits inside the same shell; the landing page does not.
export default function ProductLayout({ children }) {
  return <AppShell>{children}</AppShell>
}
