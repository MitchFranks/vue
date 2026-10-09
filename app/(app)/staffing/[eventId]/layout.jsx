import { events } from '@/lib/mock/events'

// The site is a static export, so Next needs every event board URL up front.
export function generateStaticParams() {
  return events.map((e) => ({ eventId: e.id }))
}

export default function EventBoardLayout({ children }) {
  return children
}
