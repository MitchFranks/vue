'use client'

import { RECORD_STATUS } from '@/lib/directory/model'
import { StatusBadge } from '@/components/ui'

/* ------------------------------------------------------ RecordStatusBadge -- */

export function RecordStatusBadge({ status, size = 'md' }) {
  const s = RECORD_STATUS[status] || RECORD_STATUS.active
  return (
    <StatusBadge tone={s.tone} size={size}>
      {s.label}
    </StatusBadge>
  )
}
