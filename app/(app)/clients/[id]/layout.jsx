import { clients } from '@/lib/mock/records'

export function generateStaticParams() {
  return clients.map((c) => ({ id: c.id }))
}

export const dynamicParams = false

export default function ClientLayout({ children }) {
  return children
}
