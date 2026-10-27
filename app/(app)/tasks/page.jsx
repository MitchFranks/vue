'use client'

// ---------------------------------------------------------------------------
// SCREEN 2 — Tasks (the route is still /tasks so existing links keep
// working).
//
// The full queue, and the "second route" to every problem in the product:
// anything reachable from the dashboard, an event page or the schedule is
// also reachable from here.
//
// Everything on this page is a task: a message to answer, an open spot to
// fill, a document to sign, a payment to collect, or a task someone wrote.
// Each has a type, so one set of sorts and filters (components/tasks/
// TaskBoard.jsx) works across all of them.
// ---------------------------------------------------------------------------

import { Breadcrumbs, Button, Icon, PageHeader } from '@/components/ui/primitives'
import { TaskBoard } from '@/components/tasks/TaskBoard'

export default function TasksPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]} />
      <PageHeader
        title="Tasks"
        actions={
          <Button href="/tasks/types" variant="secondary" size="md">
            <Icon name="settings" size={14} />
            Manage task types
          </Button>
        }
      />
      <TaskBoard />
    </div>
  )
}
