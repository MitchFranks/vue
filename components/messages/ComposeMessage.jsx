'use client'

// Write a new message to a staff member, vendor or couple. Opened from the
// Messages tab ("New message") and from a staff profile ("Message …").
// Asking someone to work an event stays in the Staffing Planner, where the
// reply fills the spot; picking a staff member here says so and links there.

import { Alert, Button, Modal, Select, TextInput, Textarea } from '@/components/ui'
import { useRecordForm } from '@/components/records'
import { fullName, optionName, validate } from '@/lib/directory/model'
import { useDirectory } from '@/lib/directory/store'
import { couples } from '@/lib/mock/records'
import { useStore } from '@/lib/store'

const TYPE_LABEL = { staff: 'Staff', vendor: 'Vendor', couple: 'Couple' }

/** Everyone a message can go to, as select options keyed "type:id". */
function useRecipients() {
  const { staff, vendors, roles, categories } = useDirectory()
  const live = (r) => r.status !== 'inactive'
  return [
    ...staff.filter(live).map((p) => ({ type: 'staff', id: p.id, name: fullName(p), sub: optionName(roles, p.roleIds[0]), firstName: p.firstName })),
    ...vendors.filter(live).map((v) => ({ type: 'vendor', id: v.id, name: v.name, sub: optionName(categories, v.categoryId) })),
    ...couples.map((c) => ({ type: 'couple', id: c.id, name: c.name, sub: '' }))
  ].map((r) => ({ ...r, key: `${r.type}:${r.id}`, label: `${r.name} · ${[TYPE_LABEL[r.type], r.sub].filter(Boolean).join(', ')}` }))
}

/** `to` preselects a recipient ("staff:stf-4001"). */
export function ComposeMessage({ to = '', onClose }) {
  const recipients = useRecipients()
  const { sendMessage, toast } = useStore()
  const form = useRecordForm(
    { to: recipients.some((r) => r.key === to) ? to : '', subject: '', body: '' },
    { idPrefix: 'compose', validate: (v) => validate(v, { required: { to: 'Choose who this is for.', body: 'Write a message.' } }) }
  )
  const { field, values } = form
  const recipient = recipients.find((r) => r.key === values.to)

  const send = form.submit((v) => {
    sendMessage({ to: { type: recipient.type, id: recipient.id, name: recipient.name }, subject: v.subject.trim(), body: v.body.trim() })
    toast(`Message sent to ${recipient.name}.`)
    onClose()
  })

  return (
    <Modal
      open
      onClose={onClose}
      title="New message"
      variant="sheet"
      width="sm:w-[520px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="compose-form" variant="primary">
            Send
          </Button>
        </>
      }
    >
      <form id="compose-form" onSubmit={send} noValidate className="space-y-4">
        <Select label="To" options={[{ value: '', label: 'Choose a person, vendor or couple' }, ...recipients.map((r) => ({ value: r.key, label: r.label }))]} {...field('to')} />
        {recipient?.type === 'staff' && (
          <Alert
            tone="info"
            title={`Asking ${recipient.firstName} to work an event?`}
            action={
              <Button size="sm" href="/staffing">
                Open the Staffing Planner
              </Button>
            }
          >
            Do it in the Staffing Planner, so their reply fills the open spot. Use this for anything else.
          </Alert>
        )}
        <TextInput label="Subject" hint="Optional." {...field('subject')} />
        <Textarea label="Message" rows={6} {...field('body')} />
        <p className="text-label text-ink-muted">Prototype: messages are saved here but not delivered.</p>
      </form>
    </Modal>
  )
}
