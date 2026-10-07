import './globals.css'
import { StoreProvider } from '@/lib/store'
import { AppShell } from '@/components/AppShell'

export const metadata = {
  title: 'Vue — Venue Operations (low-fidelity prototype)',
  description:
    'Low-fidelity, clickable prototype of an operations platform for small event venues. Simulated data.',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='3' fill='%231c1c1f'/%3E%3Ctext x='16' y='22' font-family='sans-serif' font-size='18' font-weight='700' fill='%23ffffff' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  )
}
