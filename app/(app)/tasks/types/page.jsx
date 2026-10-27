'use client'

// ---------------------------------------------------------------------------
// Task types — add, rename and delete the types a task can have.
//
// Opened from the Tasks page ("Manage task types"). A type is just a label
// that groups tasks (the Task type filter and the task editor both use this
// list), so this screen stays small: one add field, one list.
//
// Built-in types (Message, Payment, Sign Document, Staff) are shown but
// locked: the product gives them to the tasks it creates itself, so
// renaming or deleting one would orphan those tasks.
//
// Renaming moves every task that uses the type. Deleting a type that tasks
// still use asks where they should move first, so no task is left untyped.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { SYSTEM_TASK_TYPES, TASK_TYPE_MAX } from '@/lib/tasks'
import { Modal } from '@/components/ui/domain'
import { Breadcrumbs, Button, Card, Icon, PageHeader, Select, StatusBadge, TextInput } from '@/components/ui/primitives'

function TypeRow({ name, count, locked, editing, onEdit, onCancel, onRename, onDelete }) {
  const [draft, setDraft] = useState(name)
  const [error, setError] = useState(null)

  function submit(e) {
    e.preventDefault()
    const err = onRename(name, draft)
    if (err) setError(err)
  }

  return (
    <li className="px-4 py-3 sm:px-6">
      {editing ? (
        <form onSubmit={submit} noValidate className="flex flex-wrap items-start gap-2">
          <TextInput
            label={`New name for ${name}`}
            id={`rename-${name}`}
            value={draft}
            maxLength={TASK_TYPE_MAX}
            onChange={(e) => {
              setDraft(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => e.key === 'Escape' && onCancel()}
            error={error}
            className="min-w-0 flex-1"
            data-autofocus
          />
          <div className="flex gap-2 pt-6">
            <Button type="submit" variant="primary" size="md">
              Save
            </Button>
            <Button variant="secondary" size="md" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-ink">{name}</p>
            <p className="text-small text-ink-muted">
              {count} {count === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          {locked ? (
            <StatusBadge tone="info" size="sm">
              Built in
            </StatusBadge>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Rename ${name}`}>
                Rename
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} aria-label={`Delete ${name}`}>
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default function TaskTypesPage() {
  const { taskTypes, manualTaskList, openTasks, addTaskType, renameTaskType, deleteTaskType, toast } = useStore()

  const [name, setName] = useState('')
  const [addError, setAddError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [moveTo, setMoveTo] = useState('')

  // Tasks using each type: written tasks, plus the items the product creates.
  const usage = (type) =>
    manualTaskList.filter((t) => t.type === type).length + openTasks.filter((a) => a.source !== 'manual' && a.type === type).length

  function add(e) {
    e.preventDefault()
    const err = addTaskType(name)
    setAddError(err)
    if (!err) {
      toast(`Added the type "${name.trim()}".`)
      setName('')
    }
  }

  function rename(from, to) {
    if (from === to.trim()) {
      setEditing(null)
      return null
    }
    const err = renameTaskType(from, to)
    if (!err) {
      setEditing(null)
      toast(`Renamed "${from}" to "${to.trim()}".`)
    }
    return err
  }

  function askDelete(type) {
    setDeleting(type)
    setMoveTo(taskTypes.find((t) => t !== type) || '')
  }

  function confirmDelete() {
    const n = usage(deleting)
    deleteTaskType(deleting, n ? moveTo : null)
    toast(n ? `Deleted "${deleting}". ${n} ${n === 1 ? 'task moved' : 'tasks moved'} to "${moveTo}".` : `Deleted "${deleting}".`)
    setDeleting(null)
  }

  const deletingCount = deleting ? usage(deleting) : 0

  return (
    <div>
      <Breadcrumbs
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks', href: '/tasks' }, { label: 'Task types' }]}
      />
      <PageHeader
        title="Task types"
        lead="Group tasks your own way. Types show up in the Task type filter and when you edit a task."
        actions={
          <Button href="/tasks" variant="secondary" size="md">
            <Icon name="arrowLeft" size={14} />
            Back to Tasks
          </Button>
        }
      />

      <div className="max-w-2xl space-y-6">
        <form onSubmit={add} noValidate className="flex flex-wrap items-start gap-2 rounded-md border border-line bg-surface px-4 py-4 sm:px-6">
          <TextInput
            label="New task type"
            id="new-type"
            value={name}
            maxLength={TASK_TYPE_MAX}
            placeholder="For example, Tasting or Rentals"
            onChange={(e) => {
              setName(e.target.value)
              setAddError(null)
            }}
            error={addError}
            className="min-w-0 flex-1"
          />
          <Button type="submit" variant="primary" size="md" className="mt-6">
            <Icon name="plus" size={14} />
            Add type
          </Button>
        </form>

        <Card title={`All types (${taskTypes.length})`} icon="list" bodyClassName="px-0 py-0">
          <ul className="divide-y divide-line">
            {taskTypes.map((t) => (
              <TypeRow
                key={t}
                name={t}
                count={usage(t)}
                locked={SYSTEM_TASK_TYPES.includes(t)}
                editing={editing === t}
                onEdit={() => setEditing(t)}
                onCancel={() => setEditing(null)}
                onRename={rename}
                onDelete={() => askDelete(t)}
              />
            ))}
          </ul>
        </Card>

        <p className="text-small text-ink-muted">
          Built-in types are created by Vue for messages, open spots, documents and payments, so they cannot be renamed or
          deleted.
        </p>
      </div>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting}”?`}
        labelledBy="delete-type-title"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete type
            </Button>
          </>
        }
      >
        {deletingCount > 0 ? (
          <div className="space-y-3">
            <p className="text-body text-ink">
              {deletingCount} {deletingCount === 1 ? 'task uses' : 'tasks use'} this type. Choose the type{' '}
              {deletingCount === 1 ? 'it' : 'they'} should move to.
            </p>
            <Select
              label="Move tasks to"
              id="move-type"
              options={taskTypes.filter((t) => t !== deleting)}
              value={moveTo}
              onChange={(e) => setMoveTo(e.target.value)}
            />
          </div>
        ) : (
          <p className="text-body text-ink">No tasks use this type. You can add it again later.</p>
        )}
      </Modal>
    </div>
  )
}
