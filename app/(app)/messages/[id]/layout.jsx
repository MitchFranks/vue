import { messages } from '@/lib/mock/records'

export function generateStaticParams() {
  return messages.map((m) => ({ id: m.id }))
}

export const dynamicParams = false

export default function MessageLayout({ children }) {
  return children
}
