'use client'

// ---------------------------------------------------------------------------
// SearchPicker — choose any number of things from a list that may be long.
//
// Built for lists that grow (18 couples, 200 vendors): nothing is laid out up
// front. The chosen items sit in the field as removable chips; typing narrows
// a dropdown of matches; at most MAX_SHOWN are drawn, with a note to keep
// typing when there are more.
//
// An option can be disabled with a `reason`, shown beneath it, so a choice
// that cannot be combined with what is already picked is visible rather than
// silently missing. `count` shows how many results an option would give.
//
// Follows the ARIA combobox-with-listbox pattern: the input owns focus,
// ArrowUp/ArrowDown move through the options, Enter toggles the highlighted
// one, Escape closes, Backspace on an empty box removes the last chip.
//
//   options: [{ value, label, sub?, group?, count?, disabled?, reason?, hidden? }]
//   value:   array of selected option values
// ---------------------------------------------------------------------------

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './primitives'

const MAX_SHOWN = 50

export function SearchPicker({
  label,
  id: idProp,
  options,
  value,
  onChange,
  placeholder = 'Search',
  noun = 'results',
  hint,
  ariaLabel,
  className = ''
}) {
  const auto = useId()
  const id = idProp || auto
  const listId = `${id}-list`

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options])
  const selected = value.map((v) => byValue.get(v)).filter(Boolean)

  const q = query.trim().toLowerCase()
  const matches = useMemo(
    // A `hidden` option is not offered, but still shows as a chip if chosen.
    () => options.filter((o) => !o.hidden && (!q || `${o.label} ${o.sub || ''}`.toLowerCase().includes(q))),
    [options, q]
  )
  const shown = matches.slice(0, MAX_SHOWN)

  useEffect(() => setActive(0), [q])

  // A sheet closes on Escape through a native listener, which runs before
  // React's. So while the list is open, Escape must be stopped here, natively,
  // to close only the list.
  const openRef = useRef(open)
  openRef.current = open
  useEffect(() => {
    const input = inputRef.current
    const stop = (e) => {
      if (e.key === 'Escape' && openRef.current) e.stopPropagation()
    }
    input?.addEventListener('keydown', stop)
    return () => input?.removeEventListener('keydown', stop)
  }, [])

  // Close on a click anywhere outside.
  useEffect(() => {
    if (!open) return undefined
    const away = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])

  const toggle = (option) => {
    if (option.disabled && !value.includes(option.value)) return
    onChange(value.includes(option.value) ? value.filter((v) => v !== option.value) : [...value, option.value])
    setQuery('')
    inputRef.current?.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      // Never submit the surrounding form from inside the picker.
      e.preventDefault()
      if (open && shown[active]) toggle(shown[active])
      else setOpen(true)
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && !query && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  // Group headings appear only when the options carry groups.
  let lastGroup = null

  return (
    <div className={className} ref={rootRef}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-small font-medium text-ink">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.focus()}
        className={cx(
          'flex min-h-9 flex-wrap items-center gap-1.5 rounded-sm border bg-surface px-2 py-1 transition-colors duration-150',
          'focus-within:border-accent',
          open ? 'border-accent' : 'border-line-strong'
        )}
      >
        {selected.map((o) => (
          <span
            key={o.value}
            className="inline-flex h-6 items-center gap-1 rounded-full border border-line-strong bg-surface-sunken pl-2.5 pr-1 text-label text-ink"
          >
            {o.label}
            <button
              type="button"
              aria-label={`Remove ${o.label}`}
              onClick={(e) => {
                e.stopPropagation()
                onChange(value.filter((v) => v !== o.value))
              }}
              className="grid h-4 w-4 place-items-center rounded-full text-ink-muted hover:bg-line hover:text-ink"
            >
              <Icon name="x" size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-label={label ? undefined : ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[active] ? `${id}-opt-${active}` : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          autoComplete="off"
          value={query}
          placeholder={selected.length ? '' : placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-7 min-w-24 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
        />
        <Icon name="search" size={14} className="mr-1 shrink-0 text-ink-muted" />
      </div>

      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-label text-ink-muted">
          {hint}
        </p>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label || noun}
          aria-multiselectable="true"
          className="relative z-20 mt-1 max-h-64 overflow-auto rounded-sm border border-line-strong bg-surface py-1 shadow-raised"
        >
          {shown.length === 0 && <li className="px-3 py-2 text-small text-ink-muted">No {noun} match “{query.trim()}”.</li>}
          {shown.map((o, i) => {
            const on = value.includes(o.value)
            const blocked = o.disabled && !on
            const heading = o.group && o.group !== lastGroup ? o.group : null
            lastGroup = o.group
            return (
              <li key={o.value} role="presentation">
                {heading && (
                  <p className="px-3 pb-1 pt-2 text-label font-medium uppercase tracking-wide text-ink-muted">{heading}</p>
                )}
                <div
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={on}
                  aria-disabled={blocked || undefined}
                  onMouseEnter={() => setActive(i)}
                  // mousedown, not click: keeps focus in the input.
                  onMouseDown={(e) => {
                    e.preventDefault()
                    toggle(o)
                  }}
                  className={cx(
                    'flex items-start gap-2 px-3 py-1.5 text-body',
                    blocked ? 'cursor-not-allowed text-ink-muted' : 'cursor-pointer text-ink',
                    i === active && !blocked && 'bg-surface-sunken',
                    i === active && blocked && 'bg-surface-sunken/50'
                  )}
                >
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center">
                    {on && <Icon name="check" size={14} className="text-accent" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {(o.reason && blocked ? o.reason : o.sub) && (
                      <span className="block text-label text-ink-muted">{blocked && o.reason ? o.reason : o.sub}</span>
                    )}
                  </span>
                  {o.count != null && <span className="font-mono text-small tabular-nums text-ink-muted">{o.count}</span>}
                </div>
              </li>
            )
          })}
          {matches.length > shown.length && (
            <li className="border-t border-line px-3 py-2 text-label text-ink-muted">
              Showing {shown.length} of {matches.length} {noun}. Keep typing to narrow the list.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
