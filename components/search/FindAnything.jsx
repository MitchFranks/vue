'use client'

// ---------------------------------------------------------------------------
// Search, in the top bar of every page: type a name or a few words and go.
//
// User test v4: "I can't find anything", "hard to get a grip of what is
// there". One box finds people (their profile and their to-dos), events,
// couples, vendors, to-dos, and the everyday jobs from Help ("paid",
// "sick", "change"), so nobody has to know which menu something lives in.
//
// The ARIA combobox pattern: arrows move, Enter opens, Escape clears. Press
// "/" anywhere to jump to it. Under 768px it is an icon that opens a bar.
// ---------------------------------------------------------------------------

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cx } from '@/lib/cx'
import { HELP_JOBS } from '@/lib/help'
import { events } from '@/lib/mock/events'
import { contacts, couples } from '@/lib/mock/records'
import { useDirectory } from '@/lib/directory/store'
import { fullName, staffHref, vendorHref } from '@/lib/directory/model'
import { useStore } from '@/lib/store'
import { personName } from '@/lib/assignees'
import { Icon } from '@/components/ui'
import { NAV } from '@/components/layout/nav'

const MAX = 9

const norm = (s) => (s || '').toLowerCase()

/** How well `text` matches every word of the query: 0 is no match. */
function score(q, text, extra = '') {
  const words = q.split(/\s+/).filter(Boolean)
  const hay = norm(text)
  const more = norm(extra)
  let total = 0
  for (const w of words) {
    if (hay.startsWith(w)) total += 4
    else if (hay.includes(` ${w}`)) total += 3
    else if (hay.includes(w)) total += 2
    else if (more.includes(w)) total += 1
    else return 0
  }
  return total
}

function useSearchIndex() {
  const { staff, roles, vendors } = useDirectory()
  const { openTasks, manualTaskList } = useStore()
  return useMemo(() => {
    const roleName = (p) => p.roleIds.map((id) => roles.find((r) => r.id === id)?.name).filter(Boolean).join(', ')
    const items = []
    for (const p of staff.filter((x) => x.status !== 'inactive')) {
      const name = fullName(p)
      items.push({ id: `staff:${p.id}`, group: 'People', icon: 'user', label: name, sub: roleName(p) || 'Staff', href: staffHref(p.id), extra: roleName(p) })
      items.push({ id: `todos:${p.id}`, group: 'People', icon: 'team', label: `${name}’s to-dos`, sub: 'Everything assigned to them', href: `/tasks?assignee=${encodeURIComponent(p.id)}`, extra: 'tasks todo to-dos assigned open' })
    }
    for (const e of events) {
      items.push({ id: `event:${e.id}`, group: 'Events', icon: 'list', label: e.name, sub: `${e.dateShort} · ${e.couple}`, href: `/events/${e.id}`, extra: `${e.couple} ${e.type}` })
    }
    for (const c of couples) {
      const names = contacts.filter((p) => p.coupleId === c.id).map((p) => `${p.firstName} ${p.lastName}`).join(' ')
      items.push({ id: `couple:${c.id}`, group: 'Couples', icon: 'heart', label: c.name, sub: 'Couple record: details, agreements, payments', href: `/couples/${c.id}`, extra: names })
    }
    for (const v of vendors.filter((x) => x.status !== 'inactive')) {
      items.push({ id: `vendor:${v.id}`, group: 'Vendors', icon: 'truck', label: v.name, sub: 'Vendor', href: vendorHref(v.id), extra: v.contactName || '' })
    }
    const upcoming = manualTaskList.filter((t) => !t.done && t.dueTone === 'info')
    for (const t of [...openTasks, ...upcoming.map((t) => ({ ...t, id: `manual:${t.id}`, what: t.detail }))]) {
      items.push({ id: `task:${t.id}`, group: 'To-dos', icon: 'inbox', label: t.title, sub: [t.due, t.eventName].filter(Boolean).join(' · '), href: `/tasks?q=${encodeURIComponent(t.title)}`, extra: `${t.what || ''} ${t.type || ''} ${t.assigneeId ? personName(t.assigneeId) : ''}` })
    }
    for (const j of HELP_JOBS) {
      items.push({ id: `help:${j.id}`, group: 'How do I', icon: 'help', label: j.question, sub: j.steps[0], href: j.href, extra: j.words })
    }
    for (const n of NAV.flatMap((g) => g.items)) {
      items.push({ id: `page:${n.href}`, group: 'Pages', icon: n.icon, label: n.label, sub: n.hint || 'Page', href: n.href, extra: n.hint || '' })
    }
    return items
  }, [staff, roles, vendors, openTasks, manualTaskList])
}

export function FindAnything() {
  const index = useSearchIndex()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false) // the phone-width bar
  const input = useRef(null)
  const box = useRef(null)
  const listId = useId()

  const results = useMemo(() => {
    const query = norm(q).trim()
    if (!query) return []
    const best = index
      .map((it) => ({ it, s: score(query, it.label, `${it.sub} ${it.extra}`) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX)
      .map((x) => x.it)
    // Keep each group together, groups in the order their best match ranked.
    const order = [...new Set(best.map((it) => it.group))]
    const grouped = order.flatMap((g) => best.filter((it) => it.group === g))
    return grouped.map((it, i) => ({ ...it, heading: i === 0 || grouped[i - 1].group !== it.group ? it.group : null }))
  }, [q, index])

  // "/" focuses the box from anywhere that isn't already a text field.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return
      const t = e.target
      if (t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      e.preventDefault()
      setExpanded(true)
      // On wider screens the box is already showing: focus it now, so nothing
      // typed straight after "/" is lost. On phones it appears on the next frame.
      if (input.current?.offsetParent) input.current.focus()
      else requestAnimationFrame(() => input.current?.focus())
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const go = (it) => {
    setQ('')
    setOpen(false)
    setExpanded(false)
    input.current?.blur()
    router.push(it.href)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    } else if (e.key === 'Escape') {
      if (q) setQ('')
      else {
        setOpen(false)
        setExpanded(false)
        input.current?.blur()
      }
    }
  }

  const showList = open && q.trim().length > 0

  return (
    <div ref={box} className={cx('md:relative', expanded ? 'absolute inset-x-0 top-0 z-40 bg-surface px-3 py-2.5 md:static md:p-0' : '')}>
      {!expanded && (
        <button
          type="button"
          onClick={() => {
            setExpanded(true)
            requestAnimationFrame(() => input.current?.focus())
          }}
          className="grid h-9 w-9 place-items-center rounded-sm border border-line-strong bg-surface text-ink hover:bg-surface-sunken md:hidden"
        >
          <Icon name="search" size={16} />
          <span className="sr-only">Search</span>
        </button>
      )}
      <div className={cx('relative items-center', expanded ? 'flex' : 'hidden md:flex')}>
        <Icon name="search" size={15} className="pointer-events-none absolute left-3 text-ink-muted" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
          aria-label="Search people, events, couples and to-dos"
          placeholder="Search people, events, to-dos…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-sm border border-line-strong bg-surface pr-9 pl-9 text-small text-ink placeholder:text-ink-muted focus:border-accent md:w-72 lg:w-80"
        />
        {expanded ? (
          <button type="button" onClick={() => setExpanded(false)} className="ml-2 text-small font-medium text-ink-muted hover:text-ink md:hidden">
            Cancel
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 hidden rounded-sm border border-line px-1.5 font-mono text-label text-ink-muted lg:block" aria-hidden="true">
            /
          </kbd>
        )}
      </div>

      {showList && (
        <div className="surface-card absolute inset-x-3 top-full z-50 mt-1 overflow-hidden shadow-overlay md:inset-x-auto md:left-0 md:w-[26rem]">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-small text-ink-muted">
              Nothing matches “{q.trim()}”. Try a first name, an event or a word like “paid”. Or open <span className="font-medium text-ink">Help</span> for where things are.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search results" className="max-h-[70vh] overflow-y-auto py-1">
              {results.map((it, i) => {
                return (
                  <li key={it.id} role="presentation">
                    {it.heading && <p className="px-4 pt-2 pb-1 text-label font-medium text-ink-muted" aria-hidden="true">{it.heading}</p>}
                    <div
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(it)}
                      className={cx('mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2', i === active ? 'bg-surface-sunken' : '')}
                    >
                      <Icon name={it.icon} size={15} className="text-ink-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small font-medium text-ink">{it.label}</span>
                        <span className="block truncate text-label text-ink-muted">{it.sub}</span>
                      </span>
                      {i === active && <Icon name="arrowRight" size={13} className="text-ink-muted" />}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
