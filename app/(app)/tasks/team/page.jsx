'use client'

// ---------------------------------------------------------------------------
// Team tasks — who has what, at a glance.
//
// The manager's view by person (venue manager interview: "who's responsible
// for each thing without having to constantly follow up"). One row per
// person: open, overdue and due today, what's next, and what they finished
// this week. A row opens Tasks filtered to that person; "Their list" opens
// what they see on their phone. Unassigned work is its own row, so nothing
// sits with nobody unnoticed.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { useDirectory } from '@/lib/directory/store'
import { fullName, initialsOf } from '@/lib/directory/model'
import { managerId, UNASSIGNED } from '@/lib/assignees'
import { TODAY_KEY } from '@/lib/mock/events'
import { WEEK } from '@/lib/tasks'
import { Avatar, Breadcrumbs, Button, Card, Icon, PageHeader, StatusBadge } from '@/components/ui'
import { myTasksHref } from '@/components/sheet/links'

const byDue = (a, b) => (a.dueDate === b.dueDate ? (a.dueTime || '').localeCompare(b.dueTime || '') : a.dueDate < b.dueDate ? -1 : 1)

function counts(open, done) {
  const weekAgo = new Date(Date.parse(`${TODAY_KEY}T00:00:00Z`) - 6 * 86400000).toISOString().slice(0, 10)
  return {
    open: open.length,
    overdue: open.filter((t) => t.dueDate < TODAY_KEY).length,
    today: open.filter((t) => t.dueDate === TODAY_KEY).length,
    week: open.filter((t) => t.dueDate > TODAY_KEY && t.dueDate <= WEEK.end).length,
    doneThisWeek: done.filter((t) => t.completedBy && t.completedBy.at.slice(0, 10) >= weekAgo).length,
    next: [...open].sort(byDue)[0] || null
  }
}

function PersonRow({ href, avatar, name, sub, c, listHref }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 hover:underline">
        {avatar}
        <span className="min-w-0">
          <span className="block font-medium text-ink">{name}</span>
          <span className="block truncate text-small text-ink-muted">
            {c.next ? `Next: ${c.next.title} · ${c.next.due}` : sub}
          </span>
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {c.overdue > 0 && (
          <StatusBadge tone="urgent" size="sm">
            {c.overdue} overdue
          </StatusBadge>
        )}
        {c.today > 0 && (
          <StatusBadge tone="urgent" size="sm">
            {c.today} today
          </StatusBadge>
        )}
        {c.week > 0 && (
          <StatusBadge tone="warn" size="sm">
            {c.week} this week
          </StatusBadge>
        )}
        <span className="w-16 text-right font-mono text-small tabular-nums text-ink">{c.open} open</span>
        {c.doneThisWeek > 0 && <span className="text-small text-ink-muted">{c.doneThisWeek} done this week</span>}
        {listHref && (
          <Button href={listHref} variant="ghost" size="sm">
            Their list
            <Icon name="arrowRight" size={13} />
          </Button>
        )}
      </div>
    </li>
  )
}

export default function TeamTasksPage() {
  const { tasksAssignedTo, openTasks, manualTaskList } = useStore()
  const { staff, roles } = useDirectory()
  const me = managerId()

  const people = staff
    .filter((p) => p.status !== 'inactive')
    .sort((a, b) => (a.id === me ? -1 : b.id === me ? 1 : fullName(a).localeCompare(fullName(b))))

  // Nobody has these yet: open written tasks without an assignee, and raised ones reassigned to nobody.
  const unassignedOpen = [
    ...openTasks.filter((t) => !t.assigneeId),
    ...manualTaskList.filter((t) => !t.done && t.dueTone === 'info' && !t.assigneeId)
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks', href: '/tasks' }, { label: 'Team' }]} />
      <PageHeader
        title="Team tasks"
        lead="Who has what. Open a person to see their tasks, or their list as they see it on their phone."
        actions={
          <Button href="/tasks" variant="secondary" size="md">
            <Icon name="arrowLeft" size={14} />
            Back to Tasks
          </Button>
        }
      />
      <div className="max-w-4xl space-y-4">
        <Card bodyClassName="px-0 py-0">
          <ul className="divide-y divide-line">
            {people.map((p) => {
              const mine = tasksAssignedTo(p.id)
              const roleNames = p.roleIds.map((id) => roles.find((r) => r.id === id)?.name).filter(Boolean)
              return (
                <PersonRow
                  key={p.id}
                  href={`/tasks?assignee=${encodeURIComponent(p.id)}`}
                  avatar={<Avatar initials={initialsOf(p)} size="sm" />}
                  name={p.id === me ? `${fullName(p)} (you)` : fullName(p)}
                  sub={roleNames.join(' · ') || 'Nothing open'}
                  c={counts(mine.open, mine.done)}
                  listHref={p.id === me ? null : myTasksHref(p.id)}
                />
              )
            })}
            <PersonRow
              href={`/tasks?assignee=${UNASSIGNED}`}
              avatar={<Icon name="user" size={16} className="mx-1.5 text-ink-muted" />}
              name="Unassigned"
              sub="Nothing waiting for an owner"
              c={counts(unassignedOpen, [])}
            />
          </ul>
        </Card>
        <p className="text-small text-ink-muted">Counts include every open task: ones you wrote, template steps, and ones Vue raised and you handed on.</p>
      </div>
    </div>
  )
}
