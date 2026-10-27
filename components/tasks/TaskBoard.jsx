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
// Sorts and filters live in lib/tasks.js.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import {
  activeFilterCount,
  DUE_MODES,
  EMPTY_TASK_FILTERS,
  filterTasks,
  taskFromRecord,
  sortTasks,
    vendorOptions,
  STATUS_MODES,
  whoOptions
} from '@/lib/tasks'
import { Button, Card, EmptyState } from '@/components/ui/primitives'
import { useHideWithUndo } from '@/components/ui/domain'
import { TaskCard } from './TaskCard'
import { TaskEditor } from './TaskEditor'
import { TaskToolbar } from './TaskToolbar'


export function TaskBoard() {
  const store = useStore()
  const { openTasks, completedTasks, manualTaskList, taskTypes, hiddenCount, unhideAllTasks, toggleManualTask, updateManualTask, toast } =
    store
  const hide = useHideWithUndo(store)

  const [sort, setSort] = useState('due')
  const [direction, setDirection] = useState('asc')
  const [filters, setFilters] = useState(EMPTY_TASK_FILTERS)
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)

  const set = (field, value) => setFilters((f) => ({ ...f, [field]: value }))

  // What needs the manager now, plus tasks that are not due yet (nothing to hide there).
  const items = useMemo(() => {
    const upcoming = manualTaskList
      .filter((t) => !t.done && t.dueTone === 'info')
      .map((t) => taskFromRecord(t, { hideable: false }))
    return [...openTasks, ...upcoming]
  }, [openTasks, manualTaskList])

  // Completed tasks are in the pool; the Status filter decides whether they show.
  const pool = useMemo(() => [...items, ...completedTasks], [items, completedTasks])

  const matching = filterTasks(pool, filters)
  const shown = sortTasks(matching.filter((t) => !t.done), sort, direction)
  const shownDone = sortTasks(matching.filter((t) => t.done), sort, direction)
  const narrowing = activeFilterCount(filters)

  // How many tasks each choice would show, given every OTHER filter. A choice
  // with none is disabled (unless already picked) so it cannot dead-end.
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
      vendors: vendorOptions.map((o) => mark(o, 'vendorIds', filters.vendorIds)),
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
  }, [pool, filters, taskTypes])

  // Ticking a manual task completes it; unticking a completed one reopens it.
  function handleToggle(task) {
    toggleManualTask(task.recordId)
    toast(task.done ? `Reopened "${task.title}".` : `Completed "${task.title}".`, 'done', {
      actions: [{ label: 'Undo', onClick: () => toggleManualTask(task.recordId) }]
    })
  }

  function handleSave(patch) {
    updateManualTask(editing.id, patch)
    setEditing(null)
    toast(`Saved "${patch.title}".`)
  }

  function showHidden() {
    unhideAllTasks()
    toast(`${hiddenCount} hidden ${hiddenCount === 1 ? 'task is' : 'tasks are'} back in Tasks.`)
  }

  const clearAll = () => {
    setFilters(EMPTY_TASK_FILTERS)
    setRows([])
  }

  return (
    <div className="space-y-4">
      {/* ---- Toolbar: count on the left; filter, sort and search on the right ---- */}
      <TaskToolbar
        filters={filters}
        setFilters={setFilters}
        rows={rows}
        setRows={setRows}
        facets={facets}
        sort={sort}
        direction={direction}
        onSort={(s, d) => {
          setSort(s)
          setDirection(d)
        }}
        summary={
          <>
            <span className="font-medium text-ink">
              {shown.length} {shown.length === 1 ? 'task' : 'tasks'}
            </span>
            {narrowing > 0 && filters.status === 'open' && ` of ${pool.filter((t) => !t.done).length}`}
            {filters.status !== 'open' && ` · ${shownDone.length} completed`}
            {hiddenCount > 0 && (
              <>
                {' '}
                · {hiddenCount} hidden ·{' '}
                <button type="button" onClick={showHidden} className="underline underline-offset-2 hover:text-ink">
                  Show them
                </button>
              </>
            )}
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
        <Card bodyClassName="px-0 py-0">
          <div className="divide-y divide-line">
            {shown.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                first={i === 0}
                onToggle={handleToggle}
                onEdit={(t) => setEditing(manualTaskList.find((r) => r.id === t.recordId))}
                onHide={hide}
              />
            ))}
          </div>
        </Card>
      )}

      {shownDone.length > 0 && (
        <Card title={`Completed (${shownDone.length})`} icon="check" bodyClassName="px-0 py-0">
          <div className="divide-y divide-line">
            {shownDone.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} onEdit={() => {}} />
            ))}
          </div>
        </Card>
      )}

      {editing && <TaskEditor key={editing.id} task={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  )
}
