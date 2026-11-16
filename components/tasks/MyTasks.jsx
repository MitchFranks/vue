'use client'

// ---------------------------------------------------------------------------
// A staff member's own task list (public, phone first, no sign-in).
//
// The other half of delegation: the manager assigns a task (Tasks, or the
// task editor), and it shows up here for the person who has it. They see
// what's overdue, due today, this week and later, and tap Mark done; the
// manager's Tasks then says "Done by Caleb · Sat 10:05 AM", so nobody has to
// follow up to find out. Below the tasks are the events they're working,
// with a count of sheet changes they haven't read yet.
//
// ?s=<staffId>. Without one (or with someone not in the directory) it asks
// who you are. A written task is marked done here; one the product raised (a
// reply, a document) is finished in Vue, so it links there instead.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useEventSheet } from '@/lib/eventSheetStore'
import { events, TODAY_KEY } from '@/lib/mock/events'
import { directoryStaff } from '@/lib/directory/registry'
import { personById, personFirst } from '@/lib/assignees'
import { WEEK } from '@/lib/tasks'
import { stampLabel } from '@/lib/staffing/derive'
import { Alert, Avatar, Button, Card, ClampedText, Icon, StatusBadge } from '@/components/ui'
import { StaffFrame, StaffPrototypeNote } from '@/components/sheet/StaffFrame'
import { dayOfHref, myTasksHref } from '@/components/sheet/links'

const GROUPS = [
  { id: 'overdue', title: 'Overdue', test: (t) => t.dueDate < TODAY_KEY },
  { id: 'today', title: 'Today', test: (t) => t.dueDate === TODAY_KEY },
  { id: 'week', title: 'This week', test: (t) => t.dueDate > TODAY_KEY && t.dueDate <= WEEK.end },
  { id: 'later', title: 'Later', test: (t) => t.dueDate > WEEK.end }
]

const byDue = (a, b) => (a.dueDate === b.dueDate ? (a.dueTime || '').localeCompare(b.dueTime || '') : a.dueDate < b.dueDate ? -1 : 1)

function Back() {
  return <StaffPrototypeNote backHref="/tasks" backLabel="Back to the venue's Tasks" />
}

export function MyTasks() {
  const staffId = useSearchParams().get('s')
  const person = personById(staffId)
  if (!person) return <WhoAreYou />
  return <ForPerson key={staffId} staffId={staffId} person={person} />
}

function WhoAreYou() {
  const people = directoryStaff().filter((p) => !p.inactive)
  return (
    <StaffFrame section="Your tasks">
      <h1 className="text-title font-light">Your tasks</h1>
      <p className="text-ink-muted">Who are you? Pick your name to open your list.</p>
      <Card bodyClassName="px-0 py-0">
        <ul className="divide-y divide-line">
          {people.map((p) => (
            <li key={p.id}>
              <Link href={myTasksHref(p.id)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken">
                <Avatar initials={p.initials} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{p.name}</span>
                  <span className="block text-small text-ink-muted">{p.roles.join(' · ')}</span>
                </span>
                <Icon name="chevronRight" size={14} className="text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <Back />
    </StaffFrame>
  )
}

function TaskItem({ task, staffId, onToggle }) {
  const event = events.find((e) => e.id === task.eventId)
  return (
    <li className="space-y-2 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={task.dueTone} size="sm">
          {task.due}
        </StatusBadge>
        {event && (
          <span className="text-small text-ink-muted">
            {event.name} · {event.dateShort}
          </span>
        )}
      </div>
      <p className={task.done ? 'font-medium text-ink-muted line-through' : 'font-medium text-ink'}>{task.title}</p>
      {task.what && !task.done && <ClampedText>{task.what}</ClampedText>}
      {task.done && task.completedBy && (
        <p className="text-small text-ink-muted">
          {task.completedBy.by === staffId ? 'Done by you' : `Done by ${personFirst(task.completedBy.by)}`} · {stampLabel(task.completedBy.at)}
        </p>
      )}
      {task.source !== 'manual' ? (
        !task.done && (
          <Link href={task.href} className="inline-flex items-center gap-1 text-small text-ink underline underline-offset-2">
            Finish it in Vue
            <Icon name="arrowRight" size={13} />
          </Link>
        )
      ) : task.input ? (
        <p className="text-small text-ink-muted">Finished by entering the number on the event&apos;s Tasks tab in Vue.</p>
      ) : (
        <Button size="sm" variant={task.done ? 'ghost' : 'secondary'} onClick={() => onToggle(task)}>
          <Icon name={task.done ? 'refresh' : 'check'} size={14} />
          {task.done ? 'Reopen' : 'Mark done'}
          <span className="sr-only"> {task.title}</span>
        </Button>
      )}
    </li>
  )
}

function ForPerson({ staffId, person }) {
  const { tasksAssignedTo, toggleManualTask } = useStore()
  const sheet = useEventSheet()
  const [said, setSaid] = useState('')

  const mine = tasksAssignedTo(staffId)
  const open = [...mine.open].sort(byDue)
  const done = [...mine.done].sort((a, b) => ((a.completedBy?.at || '') < (b.completedBy?.at || '') ? 1 : -1)).slice(0, 5)
  const working = events
    .filter((e) => e.dateKey >= TODAY_KEY && sheet.teamOf(e.id).includes(staffId))
    .map((e) => ({ event: e, unseen: sheet.unseenFor(e.id, staffId).length }))

  const toggle = (task) => {
    toggleManualTask(task.recordId, staffId)
    setSaid(task.done ? `Reopened "${task.title}".` : `Done: "${task.title}". The venue manager can see it.`)
  }

  return (
    <StaffFrame section="Your tasks">
      <div>
        <p className="text-small text-ink-muted">Hi {person.first}</p>
        <h1 className="text-title font-light">Your tasks</h1>
        <p className="mt-1 text-ink-muted">
          {open.length ? `${open.length} open` : 'Nothing open'}
          {open.some((t) => t.dueDate < TODAY_KEY) && ` · ${open.filter((t) => t.dueDate < TODAY_KEY).length} overdue`}
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      {said && <Alert tone="done" title={said} />}

      {open.length === 0 ? (
        !said && <Alert tone="done" title="You're all caught up">
          New tasks the venue gives you will show up here.
        </Alert>
      ) : (
        GROUPS.map((g) => {
          const list = open.filter(g.test)
          if (!list.length) return null
          return (
            <Card key={g.id} title={`${g.title} (${list.length})`} icon={g.id === 'overdue' ? 'alert' : 'clock'} bodyClassName="px-0 py-0">
              <ul className="divide-y divide-line">
                {list.map((t) => (
                  <TaskItem key={t.id} task={t} staffId={staffId} onToggle={toggle} />
                ))}
              </ul>
            </Card>
          )
        })
      )}

      {working.length > 0 && (
        <Card title="Events you're working" icon="calendar" bodyClassName="px-0 py-0">
          <ul className="divide-y divide-line">
            {working.map(({ event, unseen }) => (
              <li key={event.id}>
                <Link href={dayOfHref(event.id, staffId)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{event.name}</span>
                    <span className="block text-small text-ink-muted">{event.date}</span>
                  </span>
                  {unseen > 0 && (
                    <StatusBadge tone="warn" size="sm">
                      {unseen} {unseen === 1 ? 'change' : 'changes'} to read
                    </StatusBadge>
                  )}
                  <Icon name="chevronRight" size={14} className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {done.length > 0 && (
        <Card title="Done recently" icon="check" bodyClassName="px-0 py-0">
          <ul className="divide-y divide-line">
            {done.map((t) => (
              <TaskItem key={t.id} task={t} staffId={staffId} onToggle={toggle} />
            ))}
          </ul>
        </Card>
      )}

      <Back />
    </StaffFrame>
  )
}
