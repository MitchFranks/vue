'use client'

// Add a vendor.

import { Breadcrumbs, PageHeader } from '@/components/ui/primitives'
import { VendorForm } from '@/components/directory/VendorForm'

export default function NewVendorPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vendors', href: '/vendors' }, { label: 'Add vendor' }]} />
      <PageHeader title="Add vendor" lead="Who they are, what they provide and how to reach them. You can book them onto events later." />
      <VendorForm />
    </div>
  )
}
