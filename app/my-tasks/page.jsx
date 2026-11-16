'use client'

// SCREEN — A staff member's own task list (public). No sign-in and no app
// shell: the page someone opens to see what the venue has assigned them.
// See components/tasks/MyTasks.jsx.

import { Suspense } from 'react'
import { MyTasks } from '@/components/tasks/MyTasks'

export default function MyTasksPage() {
  // MyTasks reads ?s=, which needs a Suspense boundary on a static export.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy="true" />}>
      <MyTasks />
    </Suspense>
  )
}
