'use client'

// ---------------------------------------------------------------------------
// TaskBoard — the Tasks view of Up Next: every task, sortable and filterable.
//
// Unlike the rest of Up Next, this lists tasks that are not due yet too, so
// the manager can plan ahead. Completed tasks are one toggle away.
//
// Sorts and filters live in lib/tasks.js. The event filter is owned by the
// Up Next page, so it is passed in.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { eventById } from '@/lib/mock/events'
import {
  activeFilterCount,
  contactOptions,
  coupleOptions,
  EMPTY_TASK_FILTERS,
  filterTasks,
  shortDate,
  sortTasks,
  TASK_SORTS,
  TASK_TYPES,
  vendorOptions,
  WEEK
} from '@/lib/tasks'
import { Button, Card, EmptyState, FilterChip, Select, TextInput } from '@/components/ui/primitives'
import { TaskCard } from './TaskCard'
import { TaskEditor } from './TaskEditor'

const any = (label) => [{ value: '', label }]

export function TaskBoard({ eventFilter = 'all', onClearEvent }) {
  const { taskList, toggleTask, updateTask, toast } = useStore()
  const [sort, setSort] = useState('due')
  const [filters, setFilters] = useState(EMPTY_TASK_FILTERS)
  const [editing, setEditing] = useState(null)

  const set = (field, value) => setFilters((f) => ({ ...f, [field]: value }))
  const onChange = (field) => (e) => set(field, e.target.value)

  const inEvent = taskList.filter((t) => eventFilter === 'all' || t.eventId === eventFilter)
  const shown = sortTasks(filterTasks(inEvent, filters), sort)
  const narrowing = activeFilterCount(filters) + (eventFilter === 'all' ? 0 : 1)
  const weekCount = filterTasks(inEvent, { ...filters, thisWeek: true }).length
  const doneCount = inEvent.filter((t) => t.done).length

  function handleToggle(task) {
    toggleTask(task.id)
    toast(task.done ? `Reopened "${task.title}".` : `Completed "${task.title}".`, 'done', {
      actions: [{ label: 'Undo', onClick: () => toggleTask(task.id) }]
    })
  }

  function handleSave(patch) {
    updateTask(editing.id, patch)
    setEditing(null)
    toast(`Saved "${patch.title}".`)
  }

  function clearAll() {
    setFilters((f) => ({ ...EMPTY_TASK_FILTERS, showDone: f.showDone }))
    onClearEvent?.()
  }

  const sortLabel = TASK_SORTS.find((s) => s.value === sort)?.label

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-md border border-line bg-surface px-4 py-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Sort by" id="task-sort" options={TASK_SORTS} value={sort} onChange={(e) => setSort(e.target.value)} />
          <TextInput
            label="Task name"
            id="task-query"
            type="search"
            placeholder="Search task names"
            value={filters.query}
            onChange={onChange('query')}
          />
          <Select
            label="Task type"
            id="task-filter-type"
            options={[...any('Any type'), ...TASK_TYPES]}
            value={filters.type}
            onChange={onChange('type')}
          />
          <Select
            label="Couple"
            id="task-filter-couple"
            options={[...any('Any couple'), ...coupleOptions]}
            value={filters.coupleId}
            onChange={onChange('coupleId')}
          />
          <Select
            label="Contact"
            id="task-filter-contact"
            options={[...any('Any contact'), ...contactOptions]}
            value={filters.contactId}
            onChange={onChange('contactId')}
            hint="Includes tasks for their couple."
          />
          <Select
            label="Vendor"
            id="task-filter-vendor"
            options={[...any('Any vendor'), ...vendorOptions]}
            value={filters.vendorId}
            onChange={onChange('vendorId')}
          />
          <TextInput
            label="Due on"
            id="task-filter-date"
            type="date"
            value={filters.dueDate}
            onChange={onChange('dueDate')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <FilterChip pressed={filters.thisWeek} onClick={() => set('thisWeek', !filters.thisWeek)} count={weekCount}>
            Due this week
          </FilterChip>
          <FilterChip pressed={filters.showDone} onClick={() => set('showDone', !filters.showDone)} count={doneCount}>
            Show completed
          </FilterChip>
          <span className="text-label text-ink-muted">
            This week is {shortDate(WEEK.start)} – {shortDate(WEEK.end)}.
          </span>
          {narrowing > 0 && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={clearAll}>
              Clear {narrowing} {narrowing === 1 ? 'filter' : 'filters'}
            </Button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title="No tasks match"
          body={
            narrowing
              ? 'The filters above are hiding every task. Clear them to see the full list.'
              : 'Every task is done. Turn on Show completed to see them.'
          }
          action={
            narrowing > 0 && (
              <Button variant="secondary" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <Card
          title={`Tasks (${shown.length})`}
          subtitle={sort === 'due' ? 'Soonest first. On the same day, tasks with no time come first.' : `Sorted by ${sortLabel}`}
          icon="list"
          bodyClassName="px-0 py-0"
        >
          <div className="divide-y divide-line">
            {shown.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                eventName={eventById(task.eventId)?.name}
                first={i === 0 && !task.done}
                onToggle={handleToggle}
                onEdit={setEditing}
              />
            ))}
          </div>
        </Card>
      )}

      {editing && (
        <TaskEditor key={editing.id} task={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  )
}
