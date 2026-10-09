'use client'

import { useEffect, useState } from 'react'
import { Button, Textarea } from './ui/primitives'
import { Modal } from './ui/domain'

// Records a decline. A reason is required (Sling), and it is what the manager
// sees next to the Declined chip. In the prototype this simulates the staff reply.
export function DeclineDialog({ open, personName, slotLabel, onClose, onConfirm }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Record a decline for ${personName || 'this person'}`}
      labelledBy="decline-title"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>
            Record decline
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-ink-2">
        {slotLabel ? `${slotLabel} will show as an open position again.` : 'The slot will show as an open position again.'}
      </p>
      <Textarea
        label="Reason"
        id="decline-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Class until 4:00 PM"
        hint="Required. The manager sees this next to the declined assignment."
      />
    </Modal>
  )
}
