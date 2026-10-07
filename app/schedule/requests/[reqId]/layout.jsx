import { allGapIds } from '@/lib/routeParams'

export function generateStaticParams() {
  return allGapIds().map((reqId) => ({ reqId }))
}

export const dynamicParams = false

export default function RequestLayout({ children }) {
  return children
}
