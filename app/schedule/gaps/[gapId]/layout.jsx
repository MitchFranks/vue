import { allGapIds } from '@/lib/routeParams'

export function generateStaticParams() {
  return allGapIds().map((gapId) => ({ gapId }))
}

export const dynamicParams = false

export default function GapLayout({ children }) {
  return children
}
