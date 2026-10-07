import { staff } from '@/lib/mock/staff'

export function generateStaticParams() {
  return staff.map((s) => ({ id: s.id }))
}

export const dynamicParams = false

export default function StaffLayout({ children }) {
  return children
}
