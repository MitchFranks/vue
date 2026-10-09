'use client'

// SCREEN 7 — Event Tasks.
// Ticking a task off removes its Up Next item, because the Up Next list is
// derived from task state rather than stored separately.

import { use } from 'react'
import { useStore } from '@/lib/store'
import { Card, EmptyState } from '@/components/ui/primitives'
import { TaskRow } from '@/components/ui/domain'

export default function TasksPage({ params }) {
  const { id } = use(params)
  const { taskList, toggleTask, toast } = useStore()
  const tasks = taskList.filter((t) => t.eventId === id)
  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)

  function handleToggle(task) {
    toggleTask(task.id)
    toast(task.done ? `Reopened "${task.title}".` : `Completed "${task.title}".`)
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks on this event"
        body="Tasks added here appear in Up Next once they come due."
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card title="Open" subtitle={`${open.length} remaining`} icon="list" bodyClassName="px-0 py-0">
        {open.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted">Everything on this event is done.</p>
        ) : (
          open.map((task) => <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />)
        )}
      </Card>

      <Card title="Completed" subtitle={`${done.length} done`} icon="check" bodyClassName="px-0 py-0">
        {done.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted">Nothing completed yet.</p>
        ) : (
          done.map((task) => <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />)
        )}
      </Card>
    </div>
  )
}
