import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'

// Geist for all UI text, Geist Mono for times, money and counts that need to
// line up, and Instrument Serif (one weight, with its italic) for the large
// display headings only: page titles and the welcome page. That pairing is
// the "hospitality brand × operations software" voice. Every font file is
// self-hosted (the `geist` package and app/fonts), so the build never depends
// on reaching Google Fonts. Instrument Serif is under the SIL Open Font
// License (app/fonts/InstrumentSerif-LICENSE.txt).

const display = localFont({
  src: [
    { path: './fonts/InstrumentSerif-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/InstrumentSerif-Italic.woff2', weight: '400', style: 'italic' }
  ],
  variable: '--font-instrument-serif',
  display: 'swap'
})

export const metadata = {
  title: 'Vue — Venue Operations',
  description: 'Clickable prototype of an operations platform for event venues of every kind. Simulated data.',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2323201c'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='19' fill='%23fdfcfa' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${display.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
