'use client'

// "New here?" — Vue in three steps, at the top of the dashboard until it is
// dismissed. Written so anyone can follow it the first time: where news
// arrives, where the work is, and what to do when lost. "Got it" hides it in
// this browser; Help can bring it back (showFirstSteps).

import { useSyncExternalStore } from 'react'
import { scopedKey } from '@/lib/account/session'
import { Button, Icon } from '@/components/ui'

const KEY = () => scopedKey('vue-first-steps-hidden-v1')
const CHANGED = 'vue-first-steps'

const read = () => {
  try {
    return localStorage.getItem(KEY()) === '1'
  } catch {
    return false
  }
}
const subscribe = (cb) => {
  window.addEventListener(CHANGED, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(CHANGED, cb)
    window.removeEventListener('storage', cb)
  }
}
const setHidden = (hidden) => {
  try {
    if (hidden) localStorage.setItem(KEY(), '1')
    else localStorage.removeItem(KEY())
  } catch {
    /* blocked storage: it just shows again next time */
  }
  window.dispatchEvent(new Event(CHANGED))
}

/** Bring the three steps back (from Help). */
export const showFirstSteps = () => setHidden(false)

const STEPS = [
  { icon: 'bell', title: 'Check Updates', body: 'The bell at the top right shows anything a client asked for, signed or paid.' },
  { icon: 'inbox', title: 'Do the to-dos', body: 'Start with “Do these first” below. Every button says exactly what it does.' },
  { icon: 'search', title: 'Lost? Search or ask Help', body: 'Type any name in Search at the top, or open Help for where things are.' }
]

export function FirstSteps() {
  // Hidden until the browser says otherwise, so it never flashes on and off.
  const hidden = useSyncExternalStore(subscribe, read, () => true)
  if (hidden) return null
  return (
    <section aria-label="New here? Vue in three steps" className="mb-8 rounded-md border border-line bg-accent-soft px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.75rem] leading-tight text-ink">New here? Vue in three steps</h2>
          <p className="mt-1 text-small text-ink-muted">Don&apos;t worry about mistakes: almost every change shows an Undo button.</p>
        </div>
        <Button size="sm" onClick={() => setHidden(true)}>
          <Icon name="check" size={13} />
          Got it
        </Button>
      </div>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-accent">
              <Icon name={s.icon} size={16} />
            </span>
            <span>
              <span className="block font-medium text-ink">
                {i + 1}. {s.title}
              </span>
              <span className="mt-0.5 block text-small text-ink-muted">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
