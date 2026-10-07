import { notFound } from 'next/navigation'
import { eventById, events } from '@/lib/mock/events'
import { EventHeader } from '@/components/EventHeader'

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }))
}

export const dynamicParams = false

export default async function EventLayout({ children, params }) {
  const { id } = await params
  const event = eventById(id)
  if (!event) notFound()
  return (
    <div>
      <EventHeader event={event} />
      {children}
    </div>
  )
}
