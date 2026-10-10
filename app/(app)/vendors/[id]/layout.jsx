import { vendors } from '@/lib/mock/records'

export function generateStaticParams() {
  return vendors.map((v) => ({ id: v.id }))
}

export const dynamicParams = false

export default function VendorLayout({ children }) {
  return children
}
