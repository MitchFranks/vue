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

import { Suspense } from 'react'
import { Breadcrumbs, Button, Icon, PageHeader } from '@/components/ui'
import { TaskBoard } from '@/components/tasks/TaskBoard'

export default function TasksPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]} />
      <PageHeader
        title="Tasks"
        actions={
          <>
            {/* Prototype only: the public form a client fills in. What they send lands here as an Inquiry task. */}
            <Button href="/inquire" target="_blank" rel="noreferrer" variant="ghost" size="md">
              Client inquiry form (prototype)
              <Icon name="arrowRight" size={14} />
            </Button>
            <Button href="/tasks/team" variant="secondary" size="md">
              <Icon name="users" size={14} />
              Team
            </Button>
            <Button href="/tasks/templates" variant="secondary" size="md">
              <Icon name="list" size={14} />
              Planning templates
            </Button>
            <Button href="/tasks/types" variant="secondary" size="md">
              <Icon name="settings" size={14} />
              Manage task types
            </Button>
          </>
        }
      />
      {/* TaskBoard reads ?assignee=, which needs a Suspense boundary on a static export. */}
      <Suspense fallback={null}>
        <TaskBoard />
      </Suspense>
    </div>
  )
}
