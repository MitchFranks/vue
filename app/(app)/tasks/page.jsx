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
//
// User test v4 ("make it simpler"): one header button that matters (Who's
// doing what), the set-up screens tucked under "More", and the person and
// event pickers always in view above the list.
// ---------------------------------------------------------------------------

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Breadcrumbs, Button, Icon, MoreMenu, PageHeader } from '@/components/ui'
import { TaskBoard } from '@/components/tasks/TaskBoard'

export default function TasksPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]} />
      <PageHeader
        title="Tasks"
        lead="Everything that needs doing. Pick a person or an event to see just theirs."
        actions={
          <>
            <Button href="/tasks/team" variant="secondary" size="md">
              <Icon name="team" size={14} />
              Who’s doing what
            </Button>
            <MoreMenu
              label="More"
              items={[
                { href: '/tasks/templates', icon: 'list', label: 'Planning templates', hint: 'The steps every wedding and event gets' },
                { href: '/tasks/types', icon: 'settings', label: 'Manage task types', hint: 'Add, rename or remove types' },
                // Prototype only: the public form a client fills in. What they send lands here as an Inquiry task.
                { href: '/inquire', icon: 'arrowRight', label: 'Client inquiry form (prototype)', hint: 'Opens in a new tab', newTab: true }
              ]}
            />
          </>
        }
      />
      {/* TaskBoard reads ?assignee=, ?event= and ?q=, which need a Suspense boundary on a static export. */}
      <Suspense fallback={null}>
        <LinkedBoard />
      </Suspense>
    </div>
  )
}

/** A new link (Search, a person's to-dos) starts the board fresh with its filters, even when already on Tasks. */
function LinkedBoard() {
  const params = useSearchParams()
  return <TaskBoard key={params.toString()} />
}
