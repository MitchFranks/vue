import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import { PrototypeProvider } from '@/lib/prototype'
import './globals.css'

// The two typefaces from the hero design. Serif for the few large headlines,
// sans for everything else. Exposed as CSS variables that globals.css maps to
// the `font-display` and `font-body` utilities.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap'
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap'
})

export const metadata = {
  title: 'Vue — Venue Operations',
  description: 'Prototype venue management platform for Vue (IS 551).',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232a2421'/%3E%3Ctext x='16' y='22' font-family='serif' font-size='20' font-weight='600' fill='%23eadecc' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${instrument.variable}`}>
      <body className="min-h-screen bg-bg text-ink">
        <PrototypeProvider>{children}</PrototypeProvider>
      </body>
    </html>
  )
}
