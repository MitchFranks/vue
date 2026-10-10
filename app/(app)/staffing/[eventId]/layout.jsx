import { events } from '@/lib/mock/events'

// Static export: Next needs every the planner event URL up front.
export function generateStaticParams() {
  return events.map((e) => ({ eventId: e.id }))
}

export default function Staffing2EventLayout({ children }) {
  return children
}
