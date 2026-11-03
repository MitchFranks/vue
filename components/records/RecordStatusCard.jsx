'use client'

import { Button, Card, Icon, useConfirm } from '@/components/ui'
import { RecordStatusBadge } from './RecordStatusBadge'

/* ------------------------------------------------------- RecordStatusCard -- */
// Deactivate keeps the record (and its history) but stops offering it for new
// work. Delete is only offered when nothing points at the record yet.

export function RecordStatusCard({ noun, name, status, onToggleStatus, onDelete, deleteBlockedReason, inactiveNote }) {
  const { confirm, dialog } = useConfirm()
  const active = status !== 'inactive'
  return (
    <Card title="Status" icon="settings" action={<RecordStatusBadge status={status} size="sm" />}>
      <p className="text-small text-ink-muted">
        {active ? `Active ${noun}s can be assigned to events.` : inactiveNote || `Inactive ${noun}s stay on file but are not offered for new work.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onToggleStatus}>
          {active ? 'Mark inactive' : 'Mark active'}
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            disabled={!!deleteBlockedReason}
            title={deleteBlockedReason || undefined}
            onClick={() =>
              confirm({
                title: `Delete ${name}?`,
                body: `This removes the ${noun} from the venue for good. To keep their details, mark them inactive instead.`,
                confirmLabel: `Delete ${noun}`,
                danger: true,
                onConfirm: onDelete
              })
            }
          >
            <Icon name="trash" size={13} />
            Delete
          </Button>
        )}
      </div>
      {deleteBlockedReason && <p className="mt-2 text-small text-ink-muted">{deleteBlockedReason}</p>}
      {dialog}
    </Card>
  )
}
