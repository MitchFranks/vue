'use client'

// ---------------------------------------------------------------------------
// TaskBoard — the Tasks page: every task, sortable and filterable.
//
// Everything that needs the manager is a task, so messages, open spots and
// documents sit in the same list as tasks someone wrote, and one set of sorts
// and filters works across all of them. The list includes tasks that are not
// due yet so the manager can plan ahead.
//
// Layout, top to bottom:
//   Toolbar   the count on the left; Filter, Sort and Search icon buttons on
//             the right (TaskToolbar), each opening a panel only when wanted.
//             Completed tasks are the "Status" filter, not a button.
//   The list  open tasks, then (when Status includes them) a Completed card.
//
// "Assigned to" is one of the filters, and /tasks?assignee=<staffId> opens the
// page filtered to one person (a staff profile links here). Any task, written
// or raised by the product, is edited in the same editor and reassigned
// straight from its card.
//
// Sorts and filters live in lib/tasks.js.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { assigneeOptions, personFirst, UNASSIGNED } from '@/lib/assignees'
import { useStore } from '@/lib/store'
import { useUndoable } from '@/lib/undo'
import { useDirectoryVendors } from '@/lib/directory/store'
import {
  activeFilterCount,
  DUE_MODES,
  EMPTY_TASK_FILTERS,
  filterTasks,
  taskFromRecord,
  sortTasks,
  vendorOptions,
  STATUS_MODES,
  WEEK,
  whoOptions
} from '@/lib/tasks'
import { Button, Card, EmptyState, Icon, Select } from '@/components/ui'
import { events, TODAY_KEY } from '@/lib/mock/events'
import { addDaysKey } from '@/lib/portal'
import { TaskCard } from './TaskCard'
import { TaskEditor } from './TaskEditor'
import { TaskToolbar } from './TaskToolbar'

/** The Tasks page, wired to the store. */
export function TaskBoard() {
  return <TaskBoardView {...useTaskBoard()} />
}

/**
 * Everything the Tasks page knows and does: the task pool from the store, the
 * sort/filter/row state, facet counts, and the handlers. TaskBoardView draws it.
 */
export function useTaskBoard() {
  const directoryVendors = useDirectoryVendors()
  const { openTasks, completedTasks, manualTaskList, taskTypes, toggleManualTask, addManualTask, updateManualTask, updateTask, toast } =
    useStore()
  const undoable = useUndoable()

  const [sort, setSort] = useState('due')
  const [direction, setDirection] = useState('asc')
  // ?assignee=<staffId> opens the list filtered to one person, ?event=<id>
  // to one event, and ?q= with a search (the top bar's search box links here).
  const params = useSearchParams()
  const linked = params.get('assignee')
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_TASK_FILTERS,
    assigneeIds: linked ? [linked] : [],
    eventIds: params.get('event') ? [params.get('event')] : [],
    query: params.get('q') || ''
  }))
  const [rows, setRows] = useState(() => (linked ? ['assignee'] : []))
  const [editing, setEditing] = useState(null)

  // What needs the manager now, plus tasks that are not due yet.
  const items = useMemo(() => {
    const upcoming = manualTaskList
      .filter((t) => !t.done && t.dueTone === 'info')
      .map((t) => taskFromRecord(t))
    return [...openTasks, ...upcoming]
  }, [openTasks, manualTaskList])

  // Completed tasks are in the pool; the Status filter decides whether they show.
  const pool = useMemo(() => [...items, ...completedTasks], [items, completedTasks])

  const matching = filterTasks(pool, filters)

  // How many tasks each choice would show, given every OTHER filter. A choice
  // with none is disabled (unless already picked) so it cannot dead-end.
  // whoOptions/vendorOptions read the directory registry, so the facets are
  // worked out again whenever the directory's vendors change.
  const facets = useMemo(() => {
    // `field` is replaced by just this one value; the other filters stay as set.
    const count = (field, value, withOthers = true) =>
      filterTasks(pool, { ...(withOthers ? filters : EMPTY_TASK_FILTERS), [field]: value }).length
    const mark = (o, field, picked) => {
      const n = count(field, [o.value])
      if (o.disabled || picked.includes(o.value) || n > 0) return { ...o, count: n }
      const ever = count(field, [o.value], false)
      return { ...o, count: 0, disabled: true, reason: ever ? 'No tasks match your other filters' : 'No tasks yet' }
    }
    return {
      types: taskTypes.map((t) => mark({ value: t, label: t }, 'types', filters.types)),
      who: whoOptions(filters.who).map((o) => mark(o, 'who', filters.who)),
      vendors: vendorOptions(filters.vendorIds).map((o) => mark(o, 'vendorIds', filters.vendorIds)),
      assignees: [...assigneeOptions(filters.assigneeIds), { value: UNASSIGNED, label: 'Unassigned' }].map((o) =>
        mark(o, 'assigneeIds', filters.assigneeIds)
      ),
      status: STATUS_MODES.map((m) => ({
        ...m,
        label: `${m.label} (${filterTasks(pool, { ...filters, status: m.value }).length})`
      })),
      due: DUE_MODES.map((m) => {
        if (m.value === 'any' || m.value === 'date') return m
        const n = filterTasks(pool, { ...filters, due: m.value, dueDate: '' }).length
        return { ...m, label: `${m.label} (${n})`, disabled: n === 0 && filters.due !== m.value }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see the comment above: directoryVendors is read through the registry
  }, [pool, filters, taskTypes, directoryVendors])

  // The two pickers above the list: whose to-dos, and which event.
  const pickPerson = (id) => {
    setFilters((f) => ({ ...f, assigneeIds: id ? [id] : [] }))
    setRows((r) => (id ? (r.includes('assignee') ? r : [...r, 'assignee']) : r.filter((k) => k !== 'assignee')))
  }
  const pickEvent = (id) => setFilters((f) => ({ ...f, eventIds: id ? [id] : [] }))

  return {
    pickPerson,
    pickEvent,
    shown: sortTasks(matching.filter((t) => !t.done), sort, direction),
    shownDone: sortTasks(matching.filter((t) => t.done), sort, direction),
    openTotal: pool.filter((t) => !t.done).length,
    facets,
    filters,
    setFilters,
    rows,
    setRows,
    sort,
    direction,
    onSort: (s, d) => {
      setSort(s)
      setDirection(d)
    },
    editing,
    // A written task edits its record; a raised one edits a copy of its fields
    // in the editor's shape, kept with the task it came from (`raised`).
    onEdit: (task) =>
      setEditing(
        task.source === 'manual'
          ? manualTaskList.find((r) => r.id === task.recordId)
          : {
              id: task.id,
              raised: task,
              title: task.title,
              dueDate: task.dueDate,
              dueTime: task.dueTime || '',
              type: task.type,
              detail: task.what || '',
              eventId: task.eventId,
              inquiryId: task.inquiryId,
              assigneeId: task.assigneeId,
              coupleIds: task.coupleIds,
              contactIds: task.contactIds,
              vendorIds: task.vendorIds
            }
      ),
    onNew: () => setEditing('new'),
    onCloseEditor: () => setEditing(null),
    // Ticking a manual task completes it; unticking a completed one reopens it.
    onToggle: (task) => {
      toggleManualTask(task.recordId)
      toast(task.done ? `Reopened "${task.title}".` : `Completed "${task.title}".`, 'done', {
        actions: [{ label: 'Undo', onClick: () => toggleManualTask(task.recordId) }]
      })
    },
    // Hand any task to someone, from its card. Undo gives it back.
    onAssign: (task, staffId) => {
      const before = task.assigneeId ?? null
      updateTask(task, { assigneeId: staffId })
      toast(staffId ? `Assigned "${task.title}" to ${personFirst(staffId)}.` : `"${task.title}" is unassigned.`, 'done', {
        small: staffId ? `It's on ${personFirst(staffId)}'s task list.` : undefined,
        actions: [{ label: 'Undo', onClick: () => updateTask(task, { assigneeId: before }) }]
      })
    },
    // `editing` is a task record being edited, or 'new' while adding one.
    onSave: (patch) => {
      if (editing === 'new') {
        undoable(() => addManualTask(patch), `Added "${patch.title}".`, { undone: `Undone. "${patch.title}" is gone.` })
      } else if (editing.raised) {
        undoable(() => updateTask(editing.raised, patch), `Saved "${patch.title}".`, { undone: 'Undone. Your edits are taken back.' })
      } else {
        undoable(() => updateManualTask(editing.id, patch), `Saved "${patch.title}".`, { undone: 'Undone. Your edits are taken back.' })
      }
      setEditing(null)
    }
  }
}

/**
 * The Tasks page, props only (see useTaskBoard for what each prop is).
 *   shown / shownDone  sorted, filtered open and completed tasks
 *   openTotal          every open task, before filters, for "3 of 12"
 *   editing            null, 'new', or the manual task record being edited
 */
export function TaskBoardView({
  pickPerson,
  pickEvent,
  shown,
  shownDone,
  openTotal,
  facets,
  filters,
  setFilters,
  rows,
  setRows,
  sort,
  direction,
  onSort,
  editing = null,
  onEdit,
  onNew,
  onCloseEditor,
  onToggle,
  onAssign,
  onSave
}) {
  const narrowing = activeFilterCount(filters)

  const clearAll = () => {
    setFilters(EMPTY_TASK_FILTERS)
    setRows([])
  }

  return (
    <div className="space-y-4">
      {/* ---- The two questions people ask first: whose, and for which event ---- */}
      {pickPerson && <QuickPicks filters={filters} onPerson={pickPerson} onEvent={pickEvent} />}

      {/* ---- Toolbar: count on the left; filter, sort and search on the right ---- */}
      <TaskToolbar
        filters={filters}
        setFilters={setFilters}
        rows={rows}
        setRows={setRows}
        facets={facets}
        sort={sort}
        direction={direction}
        onNew={onNew}
        onSort={onSort}
        summary={
          <>
            <span className="font-medium text-ink">
              {shown.length} {shown.length === 1 ? 'task' : 'tasks'}
            </span>
            {narrowing > 0 && filters.status === 'open' && ` of ${openTotal}`}
            {filters.status !== 'open' && ` · ${shownDone.length} completed`}
          </>
        }
      />

      {shown.length === 0 && shownDone.length === 0 ? (
        <EmptyState
          title="No tasks match"
          body={
            narrowing
              ? 'Your filters are hiding every task. Clear them to see the full list.'
              : 'Nothing needs you right now. Add a Status filter to see what you have done.'
          }
          action={
            narrowing > 0 && (
              <Button variant="secondary" size="sm" onClick={clearAll}>
                Clear all filters
              </Button>
            )
          }
        />
      ) : shown.length === 0 ? null : (
        <div className="space-y-5">
          {/* Sorted by due date, the list is split by when: Overdue, Today, Tomorrow, This week, Later. */}
          {(sort === 'due' ? dueGroups(shown, direction) : [{ id: 'all', label: null, tasks: shown }]).map((g, gi) => (
            <section key={g.id} aria-label={g.label || 'Tasks'}>
              {g.label && (
                <h2 className="mb-2 flex items-center gap-2 text-body font-medium text-ink">
                  {g.icon && <Icon name={g.icon} size={15} className={g.iconClass} />}
                  {g.label}
                  <span className="font-normal text-ink-muted">({g.tasks.length})</span>
                </h2>
              )}
              <Card bodyClassName="px-0 py-0">
                <div className="divide-y divide-line">
                  {g.tasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} first={gi === 0 && i === 0} onToggle={onToggle} onEdit={onEdit} onAssign={onAssign} />
                  ))}
                </div>
              </Card>
            </section>
          ))}
        </div>
      )}

      {shownDone.length > 0 && (
        <Card title={`Completed (${shownDone.length})`} icon="check" bodyClassName="px-0 py-0">
          <div className="divide-y divide-line">
            {shownDone.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={() => {}} />
            ))}
          </div>
        </Card>
      )}

      {editing && (
        <TaskEditor
          key={editing === 'new' ? 'new' : editing.id}
          task={editing === 'new' ? null : editing}
          onClose={onCloseEditor}
          onSave={onSave}
        />
      )}
    </div>
  )
}

/** Split due-sorted tasks by when they are due. Empty groups are left out. */
function dueGroups(tasks, direction) {
  const tomorrow = addDaysKey(TODAY_KEY, 1)
  const groups = [
    { id: 'overdue', label: 'Overdue', icon: 'alert', iconClass: 'text-status-now', test: (d) => d < TODAY_KEY },
    { id: 'today', label: 'Today', icon: 'alert', iconClass: 'text-status-now', test: (d) => d === TODAY_KEY },
    { id: 'tomorrow', label: 'Tomorrow', icon: 'clock', iconClass: 'text-status-soon', test: (d) => d === tomorrow },
    { id: 'week', label: 'Later this week', icon: 'clock', iconClass: 'text-status-soon', test: (d) => d > tomorrow && d <= WEEK.end },
    { id: 'later', label: 'Later', icon: 'calendar', iconClass: 'text-ink-muted', test: (d) => d > WEEK.end }
  ]
  const out = groups.map((g) => ({ ...g, tasks: tasks.filter((t) => g.test(t.dueDate || TODAY_KEY)) })).filter((g) => g.tasks.length)
  return direction === 'desc' ? out.reverse() : out
}

/** "Show to-dos for [person]" and "Event [event]": the two filters everyone needs, always in view. */
function QuickPicks({ filters, onPerson, onEvent }) {
  const person = filters.assigneeIds.length === 1 ? filters.assigneeIds[0] : filters.assigneeIds.length ? 'several' : ''
  const event = filters.eventIds?.length === 1 ? filters.eventIds[0] : ''
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-line bg-surface px-4 py-3 sm:px-5">
      <Select
        id="tasks-person"
        label="Show to-dos for"
        className="w-full sm:w-64"
        value={person}
        onChange={(e) => onPerson(e.target.value === 'several' ? filters.assigneeIds[0] : e.target.value)}
        options={[
          { value: '', label: 'Everyone' },
          ...(person === 'several' ? [{ value: 'several', label: 'Several people (see filters)' }] : []),
          ...assigneeOptions(filters.assigneeIds),
          { value: UNASSIGNED, label: 'Nobody yet (unassigned)' }
        ]}
      />
      <Select
        id="tasks-event"
        label="Event"
        className="w-full sm:w-72"
        value={event}
        onChange={(e) => onEvent(e.target.value)}
        options={[{ value: '', label: 'All events' }, ...events.map((ev) => ({ value: ev.id, label: `${ev.name} · ${ev.dateShort}` }))]}
      />
      {(person || event) && (
        <Button
          variant="ghost"
          size="md"
          onClick={() => {
            onPerson('')
            onEvent('')
          }}
        >
          Show everything
        </Button>
      )}
    </div>
  )
}
