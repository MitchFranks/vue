'use client'

// SCREEN 12 — Event Documents.
// Marking a document signed removes its attention item.

import { use } from 'react'
import { useStore } from '@/lib/store'
import { Button, Card, EmptyState, ListRow, StatusBadge } from '@/components/ui/primitives'

export default function DocumentsPage({ params }) {
  const { id } = use(params)
  const { documentList, signDocument, toast } = useStore()
  const docs = documentList.filter((d) => d.eventId === id)

  return (
    <Card title="Documents & contracts" icon="file" subtitle={`${docs.length} files`} bodyClassName="px-0 py-0">
      {docs.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No documents" body="Contracts and plans attached to this event will show here." />
        </div>
      ) : (
        docs.map((d) => (
          <ListRow
            key={d.id}
            leading={
              <span className="rounded-xl border border-line bg-wash-deep px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                {d.kind}
              </span>
            }
            title={d.name}
            sub={`Updated ${d.updated}`}
            trailing={
              <>
                <StatusBadge tone={d.tone} size="sm">
                  {d.status}
                </StatusBadge>
                {d.tone === 'urgent' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      signDocument(d.id)
                      toast(`${d.name} marked as signed.`)
                    }}
                  >
                    Mark signed
                  </Button>
                )}
              </>
            }
          />
        ))
      )}
    </Card>
  )
}
