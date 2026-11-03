'use client'

import { Button, Card, EmptyState } from '@/components/ui'

/* ------------------------------------------------------------- EntityList -- */
// The rows inside one card, or an empty state that offers to clear filters.

export function EntityList({ items, renderRow, emptyTitle = 'Nothing matches', emptyBody = 'Try a different filter or clear the search.', onClear }) {
  if (!items.length) {
    return (
      <EmptyState
        icon="search"
        title={emptyTitle}
        body={emptyBody}
        action={
          onClear && (
            <Button variant="secondary" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          )
        }
      />
    )
  }
  return <Card bodyClassName="px-0 py-0">{items.map(renderRow)}</Card>
}
