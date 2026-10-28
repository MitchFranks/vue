'use client'

// Edit a vendor (?id=).

import { Breadcrumbs, PageHeader } from '@/components/ui/primitives'
import { QueryRecord } from '@/components/ui/records'
import { VendorForm } from '@/components/directory/VendorForm'
import { RecordNotFound } from '@/components/directory/RecordNotFound'
import { vendorHref } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'

function EditVendor({ id }) {
  const { vendorById, hydrated } = useDirectory()
  const vendor = vendorById(id)
  if (!hydrated) return null
  if (!vendor) return <RecordNotFound noun="vendor" backHref="/vendors" backLabel="Back to vendors" />
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Vendors', href: '/vendors' },
          { label: vendor.name, href: vendorHref(id) },
          { label: 'Edit' }
        ]}
      />
      <PageHeader title={`Edit ${vendor.name}`} />
      <VendorForm key={id} vendor={vendor} />
    </div>
  )
}

export default function EditVendorPage() {
  return <QueryRecord render={(id) => <EditVendor id={id} />} />
}
