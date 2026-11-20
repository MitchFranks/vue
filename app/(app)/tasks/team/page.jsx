'use client'

// ---------------------------------------------------------------------------
// Who's doing what — each person's to-dos, and handing them on.
//
// The manager's view by person (venue manager interview: "who's responsible
// for each thing without having to constantly follow up").
//
// User test v4: 3 of 4 testers gave up on "How many to-dos does Caleb still
// have open this week?", and one expected to cover a sick colleague in one
// go. So each person's row leads with one plain number, "open this week",
// opens to show those to-dos with an "Assigned to" picker on each, and has
// Hand off: move any or all of their to-dos to someone else at once.
//
// "This week" is overdue, today, and the next six days (WEEK in lib/tasks.js),
// the same as the Due filter on Tasks.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useDirectory } from '@/lib/directory/store'
import { fullName, initialsOf } from '@/lib/directory/model'
import { assigneeOptions, managerId, personFirst, UNASSIGNED } from '@/lib/assignees'
import { dateLabel } from '@/lib/staffing/derive'
import { TODAY_KEY } from '@/lib/mock/events'
import { WEEK } from '@/lib/tasks'
import { cx } from '@/lib/cx'
import { Avatar, Breadcrumbs, Button, Card, Icon, Modal, PageHeader, Select, StatusBadge } from '@/components/ui'
import { myTasksHref } from '@/components/sheet/links'

const byDue = (a, b) => (a.dueDate === b.dueDate ? (a.dueTime || '').localeCompare(b.dueTime || '') : a.dueDate < b.dueDate ? -1 : 1)
const thisWeek = (t) => t.dueDate <= WEEK.end
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function counts(open) {
  return {
    open: open.length,
    week: open.filter(thisWeek).length,
    overdue: open.filter((t) => t.dueDate < TODAY_KEY).length,
    today: open.filter((t) => t.dueDate === TODAY_KEY).length
  }
}

/** One to-do inside a person's row: what, when, and who has it (changeable). */
function TodoLine({ task, onAssign }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{task.title}</p>
        <p className="text-small text-ink-muted">
          <span className={cx(task.dueDate < TODAY_KEY && 'font-medium text-status-now')}>{task.due}</span>
          {task.eventName && ` · ${task.eventName}`}
        </p>
      </div>
      <label className="relative inline-flex items-center">
        <span className="mr-2 text-small text-ink-muted">Assigned to</span>
        <select
          value={task.assigneeId || ''}
          onChange={(e) => onAssign(task, e.target.value || null)}
          className="h-8 max-w-56 cursor-pointer appearance-none truncate rounded-sm border border-line-strong bg-surface py-0 pr-8 pl-3 text-small font-medium text-ink hover:bg-surface-sunken focus:border-accent"
        >
          <option value="">Unassigned</option>
          {assigneeOptions(task.assigneeId ? [task.assigneeId] : []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={14} className="pointer-events-none absolute right-2.5 text-ink-muted" />
        <span className="sr-only">: {task.title}</span>
      </label>
    </li>
  )
}

function PersonRow({ id, name, sub, avatar, open, isMe, expanded, onToggle, onAssign, onHandOff }) {
  const c = counts(open)
  const shown = [...open].sort(byDue)
  const weekTasks = shown.filter(thisWeek)
  const laterTasks = shown.filter((t) => !thisWeek(t))
  return (
    <li className={cx('px-4 py-4 sm:px-6', expanded && 'bg-surface-sunken/40')}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-3 text-left" disabled={!c.open}>
          {avatar}
          <span className="min-w-0">
            <span className="block font-medium text-ink">{name}</span>
            <span className="block truncate text-small text-ink-muted">{sub}</span>
          </span>
        </button>

        <div className="flex items-center gap-5">
          {/* The answer to "how many does X have this week?", in words and big. */}
          <div className="text-right">
            <p className={cx('font-mono text-title font-light tabular-nums', c.week ? 'text-ink' : 'text-ink-muted/60')}>{c.week}</p>
            <p className="text-label text-ink-muted">open this week</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className={cx('font-mono text-heading tabular-nums', c.open ? 'text-ink-muted' : 'text-ink-muted/60')}>{c.open}</p>
            <p className="text-label text-ink-muted">open in total</p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {c.overdue > 0 && (
            <StatusBadge tone="urgent" size="sm">
              {c.overdue} overdue
            </StatusBadge>
          )}
          {c.open > 0 ? (
            <>
              <Button size="sm" variant={expanded ? 'primary' : 'secondary'} onClick={onToggle} aria-expanded={expanded}>
                {expanded ? 'Hide to-dos' : 'See to-dos'}
                <Icon name="chevronDown" size={13} className={cx('transition-transform', expanded && 'rotate-180')} />
              </Button>
              {id !== UNASSIGNED && (
                <Button size="sm" variant="secondary" onClick={onHandOff}>
                  <Icon name="handoff" size={13} />
                  Hand off
                </Button>
              )}
            </>
          ) : (
            <span className="text-small text-ink-muted">Nothing open</span>
          )}
        </div>
      </div>

      {expanded && c.open > 0 && (
        <div className="mt-3 rounded-md border border-line bg-surface px-4 sm:ml-11">
          {weekTasks.length > 0 && (
            <>
              <p className="pt-3 text-label font-medium text-ink-muted">This week ({weekTasks.length})</p>
              <ul className="divide-y divide-line">
                {weekTasks.map((t) => (
                  <TodoLine key={t.id} task={t} onAssign={onAssign} />
                ))}
              </ul>
            </>
          )}
          {laterTasks.length > 0 && (
            <>
              <p className={cx('pt-3 text-label font-medium text-ink-muted', weekTasks.length && 'border-t border-line')}>Later ({laterTasks.length})</p>
              <ul className="divide-y divide-line">
                {laterTasks.map((t) => (
                  <TodoLine key={t.id} task={t} onAssign={onAssign} />
                ))}
              </ul>
            </>
          )}
          <div className="flex flex-wrap gap-2 border-t border-line py-3">
            <Button href={`/tasks?assignee=${encodeURIComponent(id)}`} size="sm" variant="ghost">
              Open in Tasks
              <Icon name="arrowRight" size={13} />
            </Button>
            {!isMe && id !== UNASSIGNED && (
              <Button href={myTasksHref(id)} size="sm" variant="ghost">
                <Icon name="phone" size={13} />
                Their list on their phone
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

/** Move some or all of one person's to-dos to someone else. */
function HandOffDialog({ from, todos, onClose, onDone }) {
  const { updateTask, toast } = useStore()
  const sorted = [...todos].sort(byDue)
  const [picked, setPicked] = useState(() => new Set(sorted.filter(thisWeek).map((t) => t.id)))
  const [to, setTo] = useState('')
  const [error, setError] = useState(null)
  const fromFirst = personFirst(from)
  const options = assigneeOptions([]).filter((o) => o.value !== from)

  const toggle = (id) =>
    setPicked((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const submit = (e) => {
    e.preventDefault()
    if (!to) return setError('Choose who should take them.')
    const moving = sorted.filter((t) => picked.has(t.id))
    if (!moving.length) return setError('Tick at least one to-do.')
    moving.forEach((t) => updateTask(t, { assigneeId: to }))
    toast(`Handed ${plural(moving.length, 'to-do')} from ${fromFirst} to ${personFirst(to)}.`, 'done', {
      small: `They’re on ${personFirst(to)}’s list now.`,
      actions: [{ label: 'Undo', onClick: () => moving.forEach((t) => updateTask(t, { assigneeId: from })) }]
    })
    onDone()
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      width="sm:w-[520px]"
      labelledBy="handoff-title"
      title={`Hand off ${fromFirst}’s to-dos`}
      subtitle={`For when ${fromFirst} is out. This week’s are ticked; untick any ${fromFirst} will still do.`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="handoff-form" variant="primary">
            <Icon name="handoff" size={14} />
            {to ? `Hand ${plural(picked.size, 'to-do')} to ${personFirst(to)}` : `Hand off ${plural(picked.size, 'to-do')}`}
          </Button>
        </>
      }
    >
      <form id="handoff-form" onSubmit={submit} noValidate className="space-y-5">
        <Select
          id="handoff-to"
          label="Give them to"
          value={to}
          onChange={(e) => {
            setTo(e.target.value)
            setError(null)
          }}
          options={[{ value: '', label: 'Choose a person' }, ...options]}
          error={error && !to ? error : null}
          data-autofocus
        />
        <fieldset>
          <legend className="mb-2 text-small text-ink-muted">
            {fromFirst}’s open to-dos ({todos.length})
          </legend>
          <ul className="divide-y divide-line rounded-md border border-line">
            {sorted.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-surface-sunken/60">
                  <input type="checkbox" checked={picked.has(t.id)} onChange={() => toggle(t.id)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                  <span className="min-w-0">
                    <span className="block text-small font-medium text-ink">{t.title}</span>
                    <span className="block text-label text-ink-muted">
                      {t.due}
                      {t.eventName && ` · ${t.eventName}`}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {error && to && <p className="mt-2 text-small text-status-now" role="alert">{error}</p>}
        </fieldset>
      </form>
    </Modal>
  )
}

export default function TeamTasksPage() {
  const { tasksAssignedTo, openTasks, manualTaskList, updateTask, toast } = useStore()
  const { staff, roles } = useDirectory()
  const me = managerId()
  const [expanded, setExpanded] = useState(null)
  const [handOff, setHandOff] = useState(null)

  const people = staff
    .filter((p) => p.status !== 'inactive')
    .sort((a, b) => (a.id === me ? -1 : b.id === me ? 1 : fullName(a).localeCompare(fullName(b))))

  // Nobody has these yet: open written tasks without an assignee, and raised ones reassigned to nobody.
  const unassignedOpen = [
    ...openTasks.filter((t) => !t.assigneeId),
    ...manualTaskList.filter((t) => !t.done && t.dueTone === 'info' && !t.assigneeId)
  ]

  const assign = (task, staffId) => {
    const before = task.assigneeId ?? null
    updateTask(task, { assigneeId: staffId })
    toast(staffId ? `“${task.title}” is now ${personFirst(staffId)}’s.` : `“${task.title}” is unassigned.`, 'done', {
      actions: [{ label: 'Undo', onClick: () => updateTask(task, { assigneeId: before }) }]
    })
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks', href: '/tasks' }, { label: 'Who’s doing what' }]} />
      <PageHeader
        title="Who’s doing what"
        lead="Everyone’s to-dos. Click See to-dos to change who has one. Someone out sick? Use Hand off."
        actions={
          <Button href="/tasks" variant="secondary" size="md">
            <Icon name="inbox" size={14} />
            All tasks
          </Button>
        }
      />
      <div className="max-w-5xl space-y-4">
        <Card bodyClassName="px-0 py-0">
          <ul className="divide-y divide-line">
            {people.map((p) => {
              const roleNames = p.roleIds.map((id) => roles.find((r) => r.id === id)?.name).filter(Boolean)
              return (
                <PersonRow
                  key={p.id}
                  id={p.id}
                  isMe={p.id === me}
                  avatar={<Avatar initials={initialsOf(p)} size="md" />}
                  name={p.id === me ? `${fullName(p)} (you)` : fullName(p)}
                  sub={roleNames.join(' · ') || 'Staff'}
                  open={tasksAssignedTo(p.id).open}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                  onAssign={assign}
                  onHandOff={() => setHandOff(p.id)}
                />
              )
            })}
            <PersonRow
              id={UNASSIGNED}
              avatar={<span className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-line-strong text-ink-muted"><Icon name="user" size={16} /></span>}
              name="Nobody yet"
              sub={unassignedOpen.length ? 'To-dos without a person: choose someone for each' : 'Every to-do has someone'}
              open={unassignedOpen}
              expanded={expanded === UNASSIGNED}
              onToggle={() => setExpanded(expanded === UNASSIGNED ? null : UNASSIGNED)}
              onAssign={assign}
            />
          </ul>
        </Card>
        <p className="text-small text-ink-muted">
          “This week” is anything overdue, due today, or due by {dateLabel(WEEK.end)}. Counts include to-dos you wrote, planning-template steps, and ones Vue raised that you handed on.
        </p>
      </div>

      {handOff && (
        <HandOffDialog key={handOff} from={handOff} todos={tasksAssignedTo(handOff).open} onClose={() => setHandOff(null)} onDone={() => setHandOff(null)} />
      )}
    </div>
  )
}
