'use client'

// SCREEN 29 — Vendors.

import { useState } from 'react'
import { vendors } from '@/lib/mock/records'
import {
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  ListRow,
  PageHeader,
  Select,
  StatusBadge
} from '@/components/ui/primitives'

export default function VendorsPage() {
  const categories = ['All categories', ...new Set(vendors.map((v) => v.category))]
  const [category, setCategory] = useState('All categories')
  const filtered = vendors.filter((v) => category === 'All categories' || v.category === category)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Vendors' }]} />
      <PageHeader title="Vendors" lead={`${vendors.length} suppliers working across the season's events.`} />

      <div className="mb-4">
        <Select
          label="Category"
          id="vendor-category"
          options={categories}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="max-w-[240px]"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No vendors in this category"
          action={
            <Button variant="secondary" size="sm" onClick={() => setCategory('All categories')}>
              Show all
            </Button>
          }
        />
      ) : (
        <Card bodyClassName="px-0 py-0">
          {filtered.map((v) => (
            <ListRow
              key={v.id}
              href={`/vendors/${v.id}`}
              title={v.name}
              sub={`${v.category} · ${v.contact}`}
              meta={`On ${v.eventIds.length} event${v.eventIds.length === 1 ? '' : 's'}`}
              trailing={
                <StatusBadge tone={v.statusTone} size="sm">
                  {v.status}
                </StatusBadge>
              }
            />
          ))}
        </Card>
      )}
    </div>
  )
}
