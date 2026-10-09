'use client'

// ---------------------------------------------------------------------------
// One role at one event (spec §B.2 "Role cards"): per-block coverage, a row per
// person with status and marks, open spots, backups, the quiet "Said no" list
// and the guest-count suggestion line.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { Avatar, Button, Card, Icon, StatusBadge } from '@/components/ui/primitives'
import {
  blockById,
  coverage,
  fmtH,
  dayLine,
  displayStatus,
  firstName,
  okdIssues,
  openIssues,
  rangeLabel,
  rolesOf,
  staffById,
  suggestionText,
  suggestions,
  weekdayOf,
  whyText
} from '@/lib/staffing/derive'
import { CheckMark, OkdMark, OpenSpotChip, RequestStatus } from './StatusChip'

/* -------------------------------------------------------------- row menu -- */

function RowMenu({ label, items }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const wrap = useRef(null)
  const btn = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        btn.current?.focus()
      }
    }
    const onDown = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, true)
    wrap.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  // Cards clip their content, so on wider screens the menu is positioned
  // against the viewport from the button's rect (flipping up near the bottom).
  const toggle = () => {
    if (!open && btn.current && window.innerWidth >= 640) {
      const r = btn.current.getBoundingClientRect()
      const right = window.innerWidth - r.right
      setPos(r.bottom + 320 > window.innerHeight ? { bottom: window.innerHeight - r.top + 4, right } : { top: r.bottom + 4, right })
    } else if (!open) setPos(null)
    setOpen((v) => !v)
  }

  return (
    <div ref={wrap} className="relative">
      <button
        ref={btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-heading leading-none text-ink transition-colors hover:border-line-strong hover:bg-surface-sunken"
      >
        ⋯
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/30 sm:hidden" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            role="menu"
            style={pos || undefined}
            className={cx(
              'fixed z-50 border border-line bg-surface p-2 shadow-[0_12px_35px_rgba(12,21,18,.18)]',
              pos ? 'w-60 rounded-md' : 'inset-x-0 bottom-0 rounded-t-3xl'
            )}
          >
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  it.onClick()
                }}
                className={cx(
                  'block w-full rounded-md px-3 py-2.5 text-left text-small transition-colors hover:bg-surface-sunken focus:bg-surface-sunken',
                  it.quiet ? 'text-ink-muted' : 'text-ink'
                )}
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- person -- */

function PersonRow({ r, st, highlight, act }) {
  const p = staffById(r.staffId)
  const issues = r.status === 'cancelled' ? [] : openIssues(r, st)
  const okd = r.status === 'cancelled' ? [] : okdIssues(r, st)
  const real = issues.filter((i) => i.severity === 'soft' || i.severity === 'hard')
  const hard = real.some((i) => i.severity === 'hard')
  const s = displayStatus(r, st)
  const waitingFor = r.status === 'pending' && r.confirmedBlockIds.length ? r.blockIds.filter((b) => !r.confirmedBlockIds.includes(b)) : []
  const ref = useRef(null)

  useEffect(() => {
    if (highlight) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlight])

  const items = []
  if (r.status === 'pending') items.push({ label: 'Remind', onClick: () => act.remind(r) })
  if (r.status !== 'cancelled') items.push({ label: 'Change times', onClick: () => act.changeTimes(r) })
  if (r.status === 'pending') {
    items.push({ label: 'Record their reply: Yes', onClick: () => act.record(r, true) })
    items.push({ label: 'Record their reply: No', onClick: () => act.record(r, false) })
  }
  if (real.length) items.push({ label: hard ? 'Mark as OK (needs a reason)' : 'Mark as OK', onClick: () => act.markOk(r, hard) })
  items.push({ label: 'Open their phone', onClick: () => act.phone(r) })
  if (r.status !== 'cancelled') items.push({ label: 'Remove from this event', onClick: () => act.remove(r), quiet: true })

  return (
    <div
      ref={ref}
      data-request={r.id}
      className={cx(
        'flex min-h-[44px] items-start gap-3 border-b border-line px-5 py-3 transition-colors last:border-b-0',
        highlight && 'bg-status-soon-soft/60',
        r.status === 'cancelled' && 'opacity-70'
      )}
    >
      <Avatar initials={p.initials} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-ink">
          {p.name}
          {p.roles.length > 1 && <span className="ml-1.5 text-label font-normal text-ink-muted">{p.roles.join(' · ')}</span>}
        </p>
        <p className="mt-0.5 text-label text-ink-muted">{dayLine(r)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <RequestStatus request={r} st={st} />
          {waitingFor.length > 0 && (
            <span className="text-label text-ink-muted">
              for {waitingFor.map((id) => blockById(id)?.name).join(' + ')}; still confirmed for {r.confirmedBlockIds.map((id) => blockById(id)?.name).join(' + ')}
            </span>
          )}
          {s.label === 'Removal not sent' && <span className="text-label text-ink-muted">Send to let {firstName(r.staffId)} know</span>}
          <CheckMark issues={issues} />
          <OkdMark overrides={okd} />
        </div>
      </div>
      {items.length > 0 && <RowMenu label={`More for ${p.name}`} items={items} />}
    </div>
  )
}

/* ------------------------------------------------------------------ card -- */

// One timeline block with the roles that staff it. Blocks are listed in time
// order on the page, so the day reads top to bottom.
export function BlockCard({ eventId, block, st, primaryRole, guideRole, highlightId, act }) {
  const [why, setWhy] = useState(null)
  const roles = rolesOf(block, st)
  const sugg = suggestions(eventId, st).filter((s) => s.blockId === block.id)

  return (
    <section id={`block-${block.id}`} className="scroll-mt-24">
      <Card
        title={block.name}
        subtitle={
          <span>
            {rangeLabel(block.start, block.end)}
            {block.guestStart != null && <span> (guests {fmtH(block.guestStart)})</span>}
          </span>
        }
        bodyClassName="px-0 py-0"
      >
        <div className="-mx-5 -my-4">
          {roles.map((role) => {
            const c = coverage(eventId, block, role, st)
            const rs = Object.values(st.requests).filter((r) => r.eventId === eventId && r.role === role && r.blockIds.includes(block.id))
            const order = { accepted: 0, pending: 1, draft: 2, cancelled: 3 }
            const rows = rs
              .filter((r) => ['accepted', 'pending', 'draft'].includes(r.status) || (r.status === 'cancelled' && r.cancelNotice === 'queued'))
              .sort((a, b) => order[a.status] - order[b.status] || staffById(a.staffId).name.localeCompare(staffById(b.staffId).name))
            const backups = rs.filter((r) => r.status === 'backup')
            const saidNo = rs.filter((r) => r.status === 'declined')
            const covering = [...c.waitingRs, ...c.notSentRs].slice(0, c.gap)
            const done = c.confirmed >= c.need
            return (
              <div key={role} className="border-b border-line last:border-b-0">
                <div className="flex flex-wrap items-center gap-2 bg-surface-sunken/50 px-5 py-2.5">
                  <Icon name={done ? 'check' : 'plus'} size={13} className={done ? 'text-status-clear' : 'text-ink-muted'} />
                  <span className="text-small font-medium text-ink">{role}</span>
                  <span className="flex-1 text-label text-ink-muted">
                    {c.filled} of {c.need}
                    {c.extra > 0 && <span className="text-ink-muted"> · {c.extra} extra</span>}
                  </span>
                  <span className="inline-flex" data-guide={guideRole === role ? 'planner-ask' : undefined}>
                    <Button size="sm" variant={primaryRole === role && c.toFind ? 'primary' : 'secondary'} onClick={() => act.ask(role, [block.id])}>
                      Ask people
                    </Button>
                  </span>
                </div>

                {rows.map((r) => (
                  <PersonRow key={r.id} r={r} st={st} act={act} highlight={highlightId === r.id} />
                ))}

                {covering.map((r) => (
                  <div key={`c-${r.id}`} className="flex min-h-[44px] items-center gap-3 border-b border-dashed border-line px-5 py-2.5 text-label text-ink-muted">
                    <Icon name="clock" size={14} className="text-ink-muted" />
                    <span>
                      {r.status === 'pending' ? 'Waiting on' : 'Not sent yet:'} {firstName(r.staffId)} for this spot
                    </span>
                  </div>
                ))}

                {c.toFind > 0 && (
                  <div className="flex min-h-[44px] flex-wrap items-center gap-3 border-b border-dashed border-line bg-surface-sunken/40 px-5 py-2.5">
                    <OpenSpotChip count={c.toFind} />
                    <span className="flex-1 text-label text-ink-muted">Nobody asked yet</span>
                  </div>
                )}

                {backups.length > 0 && (
                  <div className="border-t border-line px-5 py-3">
                    <p className="mb-1.5 text-label font-medium text-ink">Backups ({backups.length})</p>
                    <ul className="space-y-1.5">
                      {backups.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center gap-2 text-label text-ink-muted">
                          <StatusBadge tone="info" size="sm">
                            Backup
                          </StatusBadge>
                          <span className="flex-1">
                            {staffById(r.staffId).name}, said yes {r.respondedAt ? weekdayOf(r.respondedAt) : ''}
                          </span>
                          <Button size="sm" onClick={() => act.promote(r)}>
                            Use as confirmed
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {saidNo.length > 0 && (
                  <details className="border-t border-line px-5 py-3">
                    <summary className="cursor-pointer text-label font-medium text-ink-muted">Said no ({saidNo.length})</summary>
                    <ul className="mt-2 space-y-1.5">
                      {saidNo.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center gap-2 text-label text-ink-muted">
                          <span className="font-medium text-ink">{staffById(r.staffId).name}</span>
                          <StatusBadge tone="declined" size="sm">
                            {r.droppedOut ? 'Dropped out' : "Can't make it"}
                          </StatusBadge>
                          {r.reason && <span>{r.reason.replace(/ — .*$/, '')}</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {sugg
                  .filter((x) => x.role === role)
                  .map((x) => (
                    <div key={`${x.blockId}-${x.role}`} className="border-t border-line bg-surface-sunken/50 px-5 py-2.5 text-label text-ink-muted">
                      <span className="inline-flex items-start gap-1.5">
                        <Icon name="info" size={12} className="mt-[2px]" />
                        <span>
                          {suggestionText(x)} ·{' '}
                          <button type="button" className="font-medium text-accent hover:underline" onClick={() => act.applySuggestion(x)}>
                            Use {x.suggested}
                          </button>{' '}
                          ·{' '}
                          <button
                            type="button"
                            className="font-medium text-accent hover:underline"
                            aria-expanded={why === role}
                            onClick={() => setWhy(why === role ? null : role)}
                          >
                            Why?
                          </button>
                        </span>
                      </span>
                      {why === role && <p className="mt-1.5 pl-5 leading-relaxed">{whyText(role, x.rule)}</p>}
                    </div>
                  ))}
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
