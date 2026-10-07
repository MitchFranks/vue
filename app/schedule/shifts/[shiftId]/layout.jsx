import { allShiftIds } from '@/lib/routeParams'

export function generateStaticParams() {
  return allShiftIds().map((shiftId) => ({ shiftId }))
}

export const dynamicParams = false

export default function ShiftLayout({ children }) {
  return children
}
