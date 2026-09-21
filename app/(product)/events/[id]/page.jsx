import { notFound } from 'next/navigation'
import { EventWorkspace } from '@/components/EventWorkspace'
import { johnson } from '@/lib/data'

// Only the Johnson Wedding is built out in this prototype, so it is the only
// event page the static export produces. Other ids 404 rather than pretending.
export function generateStaticParams() {
  return [{ id: johnson.id }]
}

export const dynamicParams = false

export const metadata = { title: `${johnson.name} — Willow & Stone Events` }

export default async function EventPage({ params }) {
  const { id } = await params
  if (id !== johnson.id) notFound()
  return <EventWorkspace />
}
