'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

/* ------------------------------------------------------- ConfirmDialog ----- */
// ERROR PREVENTION: wraps a destructive/confusing action in an explicit step.

export function useConfirm() {
  const [pending, setPending] = useState(null)
  const confirm = (config) => setPending(config)
  const close = () => setPending(null)
  const dialog = (
    <Modal
      open={!!pending}
      onClose={close}
      title={pending?.title || ''}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={pending?.danger ? 'danger' : 'primary'}
            onClick={() => {
              pending?.onConfirm?.()
              close()
            }}
          >
            {pending?.confirmLabel || 'Confirm'}
          </Button>
        </>
      }
    >
      <p className="text-ink">{pending?.body}</p>
    </Modal>
  )
  return { confirm, dialog }
}
