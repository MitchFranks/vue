'use client'

// ---------------------------------------------------------------------------
// Updates from couples, drawn three ways:
//
//   UpdateRow        one update: what happened, when, which event, and one
//                    button that says where it goes ("Review request").
//   UpdatesBell      the bell in the top bar. Its count is what still needs
//                    you plus anything new today; opening it lists them.
//   UpdatesWatcher   pops a toast the moment a couple does something in
//                    their portal (another tab, or later another device), so
//                    a change is never "rather hidden".
//
// The data comes from useCoupleUpdates (lib/updates.js).
// ---------------------------------------------------------------------------

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cx } from '@/lib/cx'
import { UPDATE_ICON, whenLabel } from '@/lib/updates'
import { useStore } from '@/lib/store'
import { Button, Icon, StatusBadge } from '@/components/ui'
import { useCoupleUpdates } from './useCoupleUpdates'

const KIND_TONE = {
  request: 'bg-status-soon-soft text-status-soon',
  signed: 'bg-status-clear-soft text-status-clear',
  paid: 'bg-status-clear-soft text-status-clear',
  details: 'bg-accent-soft text-accent',
  meeting: 'bg-accent-soft text-accent'
}

/** One update. `isNew` adds a "New" badge; `onGo` runs before the link (closes the bell). */
export function UpdateRow({ u, isNew = false, onGo, showEvent = true }) {
  return (
    <li className="flex flex-wrap gap-x-3 gap-y-2 px-4 py-3.5 sm:flex-nowrap sm:px-5">
      <span className={cx('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', u.needsYou ? KIND_TONE.request : KIND_TONE[u.kind])}>
        <Icon name={UPDATE_ICON[u.kind]} size={15} />
      </span>
      <div className="min-w-0 flex-1 basis-[calc(100%-2.75rem)] sm:basis-auto">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {u.needsYou && (
            <StatusBadge tone="warn" size="sm">
              Needs your answer
            </StatusBadge>
          )}
          {!u.needsYou && isNew && (
            <StatusBadge tone="done" size="sm">
              New
            </StatusBadge>
          )}
          <span className="text-label text-ink-muted">
            {whenLabel(u.at)}
            {showEvent && ` · ${u.eventName}`}
          </span>
        </div>
        <p className="mt-1 font-medium text-ink">{u.title}</p>
        {u.detail && <p className="mt-0.5 line-clamp-2 text-small text-ink-muted">{u.detail}</p>}
      </div>
      <div className="ml-11 shrink-0 self-center sm:ml-0">
        <Button href={u.href} size="sm" variant={u.needsYou ? 'primary' : 'secondary'} onClick={onGo}>
          {u.cta}
          <Icon name="arrowRight" size={13} />
        </Button>
      </div>
    </li>
  )
}

/** The bell in the top bar, with its list of updates. */
export function UpdatesBell() {
  const { ready, updates, needsYou, count, isNew, markAllSeen } = useCoupleUpdates()
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const button = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    // Opening the list counts as reading what's new; requests still need an answer.
    if (open) markAllSeen()
    setOpen(!open)
  }
  const close = () => {
    markAllSeen()
    setOpen(false)
  }

  const shown = [...needsYou, ...updates.filter((u) => !u.needsYou)].slice(0, 8)
  const label = !ready ? 'Updates from couples' : count ? `Updates from couples: ${count} new or waiting for you` : 'Updates from couples: nothing new'

  return (
    <div ref={box} className="relative">
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        title="Updates from couples"
        className={cx(
          'relative inline-flex h-9 items-center gap-1.5 rounded-sm border px-2.5 text-small font-medium transition-colors sm:gap-2 sm:px-3',
          open ? 'border-ink bg-surface-sunken text-ink' : 'border-line-strong bg-surface text-ink hover:bg-surface-sunken'
        )}
      >
        <Icon name="bell" size={16} />
        <span className="hidden md:inline">Updates</span>
        {ready && count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-status-now px-1 font-mono text-label text-on-ink tabular-nums" aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Updates from couples"
          className="surface-card fixed inset-x-3 top-[calc(var(--header-height)+0.5rem)] z-50 overflow-hidden shadow-overlay sm:absolute sm:inset-x-auto sm:top-11 sm:right-0 sm:w-[30rem]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <div>
              <p className="font-medium text-ink">Updates from couples</p>
              <p className="text-small text-ink-muted">
                {needsYou.length ? `${needsYou.length} waiting for your answer` : 'Requests, signatures, payments and details from client portals'}
              </p>
            </div>
            <button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink" aria-label="Close updates">
              <Icon name="x" size={15} />
            </button>
          </div>
          {shown.length === 0 ? (
            <p className="px-5 py-6 text-small text-ink-muted">Nothing yet. When a couple asks for a change, signs, pays or sends details in their portal, it shows up here.</p>
          ) : (
            <ul className="max-h-[min(32rem,70vh)] divide-y divide-line overflow-y-auto">
              {shown.map((u) => (
                <UpdateRow key={u.id} u={u} isNew={isNew(u)} onGo={close} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Toasts each update the moment it arrives, with a button that goes to it.
 * One that arrives while this tab is in the background (the couple acting
 * in another tab) waits until the tab is looked at again, so it isn't gone
 * before anyone sees it.
 */
export function UpdatesWatcher() {
  const { ready, updates } = useCoupleUpdates()
  const { toast } = useStore()
  const router = useRouter()
  const known = useRef(null)
  const waiting = useRef([])

  useEffect(() => {
    const show = (u) =>
      toast(`${u.eventName}: ${u.title}`, u.needsYou ? 'warn' : 'done', {
        small: u.needsYou ? 'From their client portal. It needs your answer.' : 'From their client portal.',
        actions: [{ label: u.cta, onClick: () => router.push(u.href) }]
      })
    const flush = () => {
      if (document.hidden) return
      const due = waiting.current
      waiting.current = []
      due.forEach(show)
    }
    if (ready) {
      if (known.current === null) known.current = new Set(updates.map((u) => u.id))
      for (const u of updates) {
        if (known.current.has(u.id)) continue
        known.current.add(u.id)
        waiting.current.push(u)
      }
      flush()
    }
    document.addEventListener('visibilitychange', flush)
    window.addEventListener('focus', flush)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      window.removeEventListener('focus', flush)
    }
  }, [ready, updates, toast, router])

  return null
}
