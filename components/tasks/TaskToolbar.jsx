'use client'

// ---------------------------------------------------------------------------
// TaskToolbar — filter, sort and search for the Tasks list, set out the way
// Notion does it: three small icon buttons on the right of the results line.
// Nothing is laid out until it is wanted, so the controls take one line of
// the page and the list stays the focus.
//
//   Filter  opens a panel of rows: "Where  [property] [is any of] [value]".
//           "+ Add filter" adds a row; each row has its own remove button.
//           The button reads "2 filters" and is highlighted while any filter
//           narrows the list. Completed tasks are one of the properties
//           (Status), not a button of their own.
//   Sort    opens a panel with the sort row: [property] [direction] and a
//           remove button. With the row removed the list is unsorted ("+ Add
//           sort" brings it back). Like Filter, the button reads "1 sort" and is
//           highlighted while a sort is set, and is just the icon when not.
//   Search  opens an inline box for task names; stays open while it has text.
//   New     (the filled button, last) adds a task, as in Notion.
//
// One panel is open at a time. Escape or a click elsewhere closes it, and
// focus returns to its button. Filters follow the rules in lib/tasks.js:
// choices inside one filter are OR, filters together are AND, and choices
// that cannot be combined (or would leave nothing) are disabled with a reason.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { Button, Icon, Select, TextInput } from '@/components/ui/primitives'
import { SearchPicker } from '@/components/ui/SearchPicker'
import { directoryVendorById as vendorById } from '@/lib/directory/registry'
import { DUE_MODES, shortDate, STATUS_MODES, TASK_SORTS, WEEK, whoLabel, whoSplit } from '@/lib/tasks'
import { WhoPicker } from './WhoPicker'

// What clears each filter property back to "not filtering".
const CLEARED = {
  type: { types: [] },
  due: { due: 'any', dueDate: '' },
  who: { who: [] },
  vendor: { vendorIds: [] },
  status: { status: 'open' }
}

const PROPERTIES = [
  { key: 'type', label: 'Task type', operator: 'is any of' },
  { key: 'due', label: 'Due', operator: 'is' },
  { key: 'who', label: 'Couple', operator: 'is any of' },
  { key: 'vendor', label: 'Vendor', operator: 'is any of' },
  { key: 'status', label: 'Status', operator: 'is' }
]

/** Which properties a set of filters is already using, in a steady order. */
export function rowsFor(f) {
  return [
    f.types.length && 'type',
    f.due !== 'any' && 'due',
    f.who.length && 'who',
    f.vendorIds.length && 'vendor',
    f.status !== 'open' && 'status'
  ].filter(Boolean)
}

function ToolbarButton({ icon, label, active, open, controls, onClick, children, buttonRef }) {
  return (
    <button
      type="button"
      ref={buttonRef}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-small transition-colors duration-150',
        active ? 'bg-surface-sunken font-medium text-accent' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
        open && 'bg-surface-sunken'
      )}
    >
      <Icon name={icon} size={16} />
      {children}
    </button>
  )
}

/** One filter or sort in force: the label opens its panel, the x removes it. */
function Indicator({ children, onOpen, onRemove, removeLabel }) {
  return (
    <span className="inline-flex h-7 max-w-full items-center rounded-full border border-line-strong bg-surface-sunken text-small text-ink">
      <button type="button" onClick={onOpen} className="min-w-0 truncate rounded-l-full pl-3 pr-1.5 hover:underline">
        {children}
      </button>
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="grid h-7 w-6 shrink-0 place-items-center rounded-r-full text-ink-muted hover:text-ink"
      >
        <Icon name="x" size={12} />
      </button>
    </span>
  )
}

function Panel({ id, label, children }) {
  return (
    <div
      id={id}
      role="dialog"
      aria-label={label}
      className="absolute right-0 top-full z-30 mt-2 max-h-[70vh] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-line-strong bg-surface p-3 shadow-raised"
    >
      {children}
    </div>
  )
}

export function TaskToolbar({
  filters,
  setFilters,
  rows,
  setRows,
  facets,
  sort,
  direction,
  onSort,
  onNew,
  summary
}) {
  const [openPanel, setOpenPanel] = useState(null)
  const [searching, setSearching] = useState(false)
  const rootRef = useRef(null)
  const buttons = useRef({})

  const searchOpen = searching || !!filters.query
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  // Click outside closes the panel; Escape closes it and returns focus.
  useEffect(() => {
    if (!openPanel) return undefined
    const away = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpenPanel(null)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [openPanel])

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && openPanel) {
      e.stopPropagation()
      buttons.current[openPanel]?.focus()
      setOpenPanel(null)
    }
  }

  const toggle = (panel) => setOpenPanel(openPanel === panel ? null : panel)

  // ---- filter rows ----
  const free = PROPERTIES.filter((p) => !rows.includes(p.key))
  const filterCount = rows.filter((k) => {
    if (k === 'type') return filters.types.length
    if (k === 'due') return filters.due !== 'any' && (filters.due !== 'date' || filters.dueDate)
    if (k === 'who') return filters.who.length
    if (k === 'vendor') return filters.vendorIds.length
    return filters.status !== 'open'
  }).length

  function addRow() {
    if (free.length) setRows([...rows, free[0].key])
  }
  function removeRow(key) {
    set(CLEARED[key])
    setRows(rows.filter((k) => k !== key))
  }
  function changeProperty(oldKey, newKey) {
    set(CLEARED[oldKey])
    setRows(rows.map((k) => (k === oldKey ? newKey : k)))
  }
  function clearFilters() {
    setFilters((f) => ({ ...f, ...Object.assign({}, ...Object.values(CLEARED)) }))
    setRows([])
  }

  function valueEditor(key) {
    switch (key) {
      case 'type':
        return (
          <SearchPicker
            id="filter-types"
            ariaLabel="Task types"
            options={facets.types}
            value={filters.types}
            onChange={(types) => set({ types })}
            placeholder="Choose task types"
            noun="task types"
          />
        )
      case 'due':
        return (
          <div className="space-y-2">
            <Select
              id="filter-due"
              aria-label="Due"
              options={facets.due.map((m) => ({ value: m.value, label: m.label, disabled: m.disabled }))}
              value={filters.due}
              onChange={(e) => set({ due: e.target.value, dueDate: '' })}
            />
            {filters.due === 'date' && (
              <TextInput
                id="filter-date"
                aria-label="Due date"
                type="date"
                value={filters.dueDate}
                onChange={(e) => set({ dueDate: e.target.value })}
              />
            )}
            {filters.due === 'week' && (
              <p className="text-label text-ink-muted">
                {shortDate(WEEK.start)} – {shortDate(WEEK.end)}
              </p>
            )}
          </div>
        )
      case 'who':
        return (
          <WhoPicker
            id="filter-who"
            ariaLabel="Couples"
            options={facets.who}
            value={filters.who}
            onChange={(who) => set({ who })}
          />
        )
      case 'vendor':
        return (
          <SearchPicker
            id="filter-vendors"
            ariaLabel="Vendors"
            options={facets.vendors}
            value={filters.vendorIds}
            onChange={(vendorIds) => set({ vendorIds })}
            placeholder="Choose vendors"
            noun="vendors"
          />
        )
      default:
        return (
          <Select
            id="filter-status"
            aria-label="Status"
            options={facets.status.map((m) => ({ value: m.value, label: m.label }))}
            value={filters.status}
            onChange={(e) => set({ status: e.target.value })}
          />
        )
    }
  }

  const sortInfo = TASK_SORTS.find((s) => s.value === sort)

  // What is narrowing or ordering the list, shown beside the count.
  const list = (names) => names.join(', ')
  const whoKinds = new Set(filters.who.map((w) => whoSplit(w).kind))
  const indicators = [
    filters.query.trim() && {
      key: 'query',
      label: `Name contains “${filters.query.trim()}”`,
      panel: 'search',
      remove: () => set({ query: '' }),
      what: 'name search'
    },
    filters.types.length > 0 && {
      key: 'type',
      label: `Task type: ${list(filters.types)}`,
      panel: 'filter',
      remove: () => removeRow('type'),
      what: 'task type filter'
    },
    filters.due !== 'any' &&
      (filters.due !== 'date' || filters.dueDate) && {
        key: 'due',
        label: `Due: ${
          filters.due === 'date' ? shortDate(filters.dueDate) : DUE_MODES.find((m) => m.value === filters.due)?.label.toLowerCase()
        }`,
        panel: 'filter',
        remove: () => removeRow('due'),
        what: 'due filter'
      },
    filters.who.length > 0 && {
      key: 'who',
      label: `${whoKinds.size === 1 && whoKinds.has('contact') ? 'Contact' : whoKinds.size === 1 ? 'Couple' : 'Couple or contact'}: ${list(filters.who.map(whoLabel))}`,
      panel: 'filter',
      remove: () => removeRow('who'),
      what: 'couple filter'
    },
    filters.vendorIds.length > 0 && {
      key: 'vendor',
      label: `Vendor: ${list(filters.vendorIds.map((id) => vendorById(id)?.name))}`,
      panel: 'filter',
      remove: () => removeRow('vendor'),
      what: 'vendor filter'
    },
    filters.status !== 'open' && {
      key: 'status',
      label: `Status: ${STATUS_MODES.find((m) => m.value === filters.status)?.label}`,
      panel: 'filter',
      remove: () => removeRow('status'),
      what: 'status filter'
    },
    sortInfo && {
      key: 'sort',
      label: `Sorted by ${sortInfo.label.toLowerCase()}, ${(direction === 'desc' ? sortInfo.descending : sortInfo.ascending).toLowerCase()}`,
      panel: 'sort',
      remove: () => onSort(null, 'asc'),
      what: 'sort'
    }
  ].filter(Boolean)

  return (
    <div ref={rootRef} onKeyDown={onKeyDown} className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0 flex-1 space-y-2">
        <p role="status" className="pt-1.5 text-small text-ink-muted">
          {summary}
        </p>
        {indicators.length > 0 && (
          <ul aria-label="Filters and sort in use" className="flex flex-wrap gap-1.5">
            {indicators.map((i) => (
              <li key={i.key} className="max-w-full">
                <Indicator
                  onOpen={() => {
                    if (i.panel === 'search') setSearching(true)
                    else setOpenPanel(i.panel)
                  }}
                  onRemove={i.remove}
                  removeLabel={`Remove ${i.what}`}
                >
                  {i.label}
                </Indicator>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-1">
        {searchOpen && (
          <div className="flex items-center">
            <input
              type="search"
              autoFocus={!filters.query}
              aria-label="Search tasks by name"
              placeholder="Search tasks"
              value={filters.query}
              onChange={(e) => set({ query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  set({ query: '' })
                  setSearching(false)
                  buttons.current.search?.focus()
                }
              }}
              className="mr-1 h-8 w-40 rounded-sm border border-line-strong bg-surface px-2 text-small text-ink outline-none placeholder:text-ink-muted focus:border-accent sm:w-52"
            />
          </div>
        )}

        <ToolbarButton
          buttonRef={(el) => (buttons.current.filter = el)}
          icon="filter"
          label="Filter"
          controls="task-filter-panel"
          open={openPanel === 'filter'}
          active={filterCount > 0}
          onClick={() => {
            toggle('filter')
            if (!rows.length && openPanel !== 'filter') addRow()
          }}
        >
          {filterCount > 0 && `${filterCount} ${filterCount === 1 ? 'filter' : 'filters'}`}
        </ToolbarButton>

        <ToolbarButton
          buttonRef={(el) => (buttons.current.sort = el)}
          icon="sort"
          label="Sort"
          controls="task-sort-panel"
          open={openPanel === 'sort'}
          active={!!sortInfo}
          onClick={() => toggle('sort')}
        >
          {sortInfo && '1 sort'}
        </ToolbarButton>

        <ToolbarButton
          buttonRef={(el) => (buttons.current.search = el)}
          icon="search"
          label="Search"
          active={!!filters.query}
          open={searchOpen}
          onClick={() => setSearching(!(searchOpen && !filters.query))}
        />

        <Button variant="primary" size="sm" className="ml-1" onClick={onNew}>
          <Icon name="plus" size={14} />
          New
        </Button>

        {openPanel === 'filter' && (
          <Panel id="task-filter-panel" label="Filter tasks">
            {rows.length === 0 && <p className="px-1 py-2 text-small text-ink-muted">No filters. Every task is showing.</p>}
            <ul className="space-y-3">
              {rows.map((key, i) => {
                const prop = PROPERTIES.find((p) => p.key === key)
                return (
                  <li key={key} className="grid grid-cols-[3rem_1fr_auto] items-start gap-x-2 gap-y-2 sm:grid-cols-[3rem_9rem_5.5rem_1fr_auto]">
                    <span className="pt-2 text-small text-ink-muted">{i === 0 ? 'Where' : 'And'}</span>
                    <Select
                      aria-label={`Filter ${i + 1} property`}
                      options={PROPERTIES.filter((p) => p.key === key || !rows.includes(p.key)).map((p) => ({ value: p.key, label: p.label }))}
                      value={key}
                      onChange={(e) => changeProperty(key, e.target.value)}
                    />
                    <span className="hidden pt-2 text-small text-ink-muted sm:block">{prop.operator}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${prop.label} filter`}
                      onClick={() => removeRow(key)}
                      className="grid h-9 w-9 place-items-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink sm:order-last"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                    <div className="col-span-3 sm:col-span-1">{valueEditor(key)}</div>
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <Button variant="ghost" size="sm" onClick={addRow} disabled={!free.length}>
                <Icon name="plus" size={14} />
                Add filter
              </Button>
              {rows.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Delete all filters
                </Button>
              )}
            </div>
          </Panel>
        )}

        {openPanel === 'sort' && (
          <Panel id="task-sort-panel" label="Sort tasks">
            {!sortInfo && <p className="px-1 py-2 text-small text-ink-muted">No sort. Tasks are in their original order.</p>}
            {sortInfo && (
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Select
                aria-label="Sort by"
                options={TASK_SORTS.map((s) => ({ value: s.value, label: s.label }))}
                value={sort}
                onChange={(e) => onSort(e.target.value, 'asc')}
                className="col-span-2 sm:col-span-1"
              />
              <Select
                aria-label="Sort order"
                options={[
                  { value: 'asc', label: sortInfo.ascending },
                  { value: 'desc', label: sortInfo.descending }
                ]}
                value={direction}
                onChange={(e) => onSort(sort, e.target.value)}
              />
              <button
                type="button"
                aria-label="Remove sort"
                onClick={() => onSort(null, 'asc')}
                className="grid h-9 w-9 place-items-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              {sortInfo ? (
                <p className="text-label text-ink-muted">Tasks with nothing to sort on, such as no vendor, come last.</p>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => onSort('due', 'asc')}>
                  <Icon name="plus" size={14} />
                  Add sort
                </Button>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}
