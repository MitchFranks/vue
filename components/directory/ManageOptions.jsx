'use client'

// ---------------------------------------------------------------------------
// One editor for the venue's own lists: staff roles and vendor categories.
// Add, rename and remove in a draft, then save. A name in use by a record
// can be renamed (records point at its id) but not removed; a locked name is
// one the Staffing Planner plans by.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useDirectory } from '@/lib/directory/store'
import { useStore } from '@/lib/store'
import { Button, Icon, TextInput } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/domain'

const COPY = {
  roles: {
    title: 'Staff roles',
    noun: 'role',
    subtitle: 'Renaming a role updates every staff member who has it.',
    users: (n) => `${n} staff ${n === 1 ? 'member' : 'members'}`,
    lockedNote: 'Used by the Staffing Planner'
  },
  categories: {
    title: 'Vendor categories',
    noun: 'category',
    subtitle: 'Renaming a category updates every vendor in it.',
    users: (n) => `${n} ${n === 1 ? 'vendor' : 'vendors'}`,
    lockedNote: ''
  }
}

export function ManageOptionsButton({ kind }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Icon name="list" size={14} />
        Edit {COPY[kind].title.toLowerCase()}
      </Button>
      {open && <ManageOptionsModal kind={kind} onClose={() => setOpen(false)} />}
    </>
  )
}

function ManageOptionsModal({ kind, onClose }) {
  const dir = useDirectory()
  const { toast } = useStore()
  const copy = COPY[kind]
  const [draft, setDraft] = useState(() => dir[kind].map((o) => ({ ...o })))
  const [adding, setAdding] = useState('')
  const [error, setError] = useState('')

  const names = (list) => list.map((o) => o.name.trim().toLowerCase())
  const rename = (i, name) => setDraft((d) => d.map((o, j) => (j === i ? { ...o, name } : o)))

  const add = () => {
    const name = adding.trim()
    if (!name) return setError(`Type a ${copy.noun} name.`)
    if (names(draft).includes(name.toLowerCase())) return setError(`There is already a ${copy.noun} called ${name}.`)
    setDraft((d) => [...d, { name }])
    setAdding('')
    setError('')
  }

  const save = () => {
    const all = names(draft)
    if (all.some((n) => !n)) return setError(`Every ${copy.noun} needs a name.`)
    if (new Set(all).size !== all.length) return setError(`Two ${copy.noun} names are the same.`)
    dir.saveOptions(kind, draft)
    toast(`${copy.title} saved.`)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save {copy.title.toLowerCase()}
          </Button>
        </>
      }
    >
      <ul className="divide-y divide-line">
        {draft.map((o, i) => {
          const used = o.id ? dir.usage(kind, o.id) : 0
          const reason = o.locked ? copy.lockedNote : used ? copy.users(used) : ''
          return (
            <li key={o.id || `new-${i}`} className="flex items-start gap-2 py-2">
              <TextInput
                id={`opt-${kind}-${i}`}
                aria-label={`${copy.noun} name`}
                value={o.name}
                onChange={(e) => rename(i, e.target.value)}
                readOnly={o.locked}
                hint={reason || undefined}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-0.5"
                disabled={o.locked || used > 0}
                title={o.locked || used ? `Can't remove: ${reason.toLowerCase()}` : `Remove ${o.name}`}
                onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}
              >
                <Icon name="trash" size={13} />
                <span className="sr-only">Remove {o.name}</span>
              </Button>
            </li>
          )
        })}
      </ul>

      <div className="mt-3 flex items-start gap-2 border-t border-line pt-4">
        <TextInput
          id={`opt-${kind}-new`}
          label={`Add a ${copy.noun}`}
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          error={error || undefined}
          className="flex-1"
        />
        <Button className="mt-6" onClick={add}>
          <Icon name="plus" size={13} />
          Add
        </Button>
      </div>
    </Modal>
  )
}
