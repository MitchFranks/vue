import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/lib/store'

// The two faces from the Figma reference: Playfair for display headings,
// DM Sans for everything else.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata = {
  title: 'Vue — Venue Operations',
  description:
    'Clickable prototype of an operations platform for small event venues. Simulated data.',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2317231f'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='18' font-weight='600' fill='%23ae7950' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
