import { notFound } from 'next/navigation'
import { Communication } from '@/components/Communication'
import { johnson, thread } from '@/lib/data'

export function generateStaticParams() {
  return [{ id: johnson.id, messageId: 'decor-time' }]
}

export const dynamicParams = false

export const metadata = { title: `${thread.subject} — Vue` }

export default async function MessagePage({ params }) {
  const { id, messageId } = await params
  if (id !== johnson.id || messageId !== 'decor-time') notFound()
  return <Communication />
}
