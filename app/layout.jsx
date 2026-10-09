import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/lib/store'

// One typeface for everything. Hierarchy comes from weight and size.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap'
})

export const metadata = {
  title: 'Vue — Wedding Venue Operations',
  description:
    'Clickable prototype of an operations platform for wedding venues. Simulated data.',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%236b4bf0'/%3E%3Ctext x='16' y='22' font-family='Arial,sans-serif' font-size='18' font-weight='800' fill='white' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
