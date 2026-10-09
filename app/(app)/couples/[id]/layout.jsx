import { couples } from '@/lib/mock/records'
import { FIRST_COUPLE_ID } from '@/lib/onboarding'

export function generateStaticParams() {
  // FIRST_COUPLE_ID: the couple a new user adds in the first-run guide.
  return [...couples.map((c) => ({ id: c.id })), { id: FIRST_COUPLE_ID }]
}

export const dynamicParams = false

export default function CoupleLayout({ children }) {
  return children
}
