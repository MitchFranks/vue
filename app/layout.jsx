import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/lib/store'

// The only typeface outside the system sans stack. It is used on the welcome
// screen alone — the product UI stays deliberately plain.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display-src',
  display: 'swap'
})

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
    <html lang="en" className={cormorant.variable}>
      <body>
        {/* The store wraps everything so the welcome screen can read live
            counts, but the product shell only wraps the (app) route group. */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
