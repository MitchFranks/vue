'use client'

// ---------------------------------------------------------------------------
// DESIGN LIBRARY — domain components
//
// These encode the product's own concepts: an attention item, an event, a
// shift, a staff member, an availability grid. Built on the primitives so the
// borders, status colours and button hierarchy stay consistent.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/cx'
import { hourLabel } from '@/lib/store'
import { Avatar, Button, Card, Icon, ListRow, StatusBadge } from './primitives'

/* ---------------------------------------------------------- AttentionItem --
 *
 * The single most important component in the product. It answers, in order:
 *   what happened  ->  which event  ->  why it matters  ->  what you can do.
 *
 * GUIDE ATTENTION: urgent items get a thick left rule, a tinted ground and the
 * only filled button in the list. Lower-priority items are visually quieter.
 */

export function AttentionItem({ item, compact = false }) {
  const urgent = item.tone === 'urgent'
  return (
    <article
      className={cx(
        'border-l-4 bg-paper',
        urgent ? 'border-l-urgent' : item.tone === 'warn' ? 'border-l-warn' : 'border-l-line',
        'border-y border-r border-line-soft'
      )}
    >
      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge tone={item.tone} size="sm">
              {urgent ? 'Needs action' : 'Due soon'}
            </StatusBadge>
            <Link
              href={`/events/${item.eventId}`}
              className="rounded border border-line bg-sunken px-1.5 py-0.5 text-[11px] text-ink-2 hover:bg-line-soft"
            >
              {item.eventName}
            </Link>
            <span className="text-[11px] text-faint">{item.meta}</span>
          </div>

          <h3 className={cx('text-sm font-semibold text-ink', urgent && 'sm:text-[15px]')}>{item.title}</h3>

          {!compact && (
            <dl className="mt-1.5 space-y-1">
              <div className="flex gap-2 text-xs">
                <dt className="w-24 shrink-0 font-semibold uppercase tracking-wide text-faint">What</dt>
                <dd className="text-ink-2">{item.what}</dd>
              </div>
              <div className="flex gap-2 text-xs">
                <dt className="w-24 shrink-0 font-semibold uppercase tracking-wide text-faint">Why it matters</dt>
                <dd className="text-ink-2">{item.why}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="shrink-0">
          <Button href={item.href} variant={urgent ? 'primary' : 'secondary'} size="sm">
            {item.actionLabel}
            <Icon name="arrowRight" size={13} />
          </Button>
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------- EventCard -- */

export function EventCard({ event, coverage, attentionCount = 0 }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-box border border-line bg-paper px-3 py-3 hover:bg-sunken"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{event.name}</h3>
            <span className="rounded border border-line bg-sunken px-1.5 py-0.5 text-[11px] text-muted">
              {event.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {event.dateShort} · {event.headline} · {event.guests} guests
          </p>
          <p className="mt-0.5 text-[11px] text-faint">{event.spaces}</p>
        </div>
        <Icon name="chevronRight" size={16} className="mt-1 text-faint" />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-line-soft pt-2.5">
        {attentionCount > 0 ? (
          <StatusBadge tone="urgent" size="sm">
            {attentionCount} need{attentionCount === 1 ? 's' : ''} attention
          </StatusBadge>
        ) : (
          <StatusBadge tone="done" size="sm">
            Nothing outstanding
          </StatusBadge>
        )}
        {coverage &&
          (coverage.complete ? (
            <StatusBadge tone="done" size="sm">
              Fully staffed
            </StatusBadge>
          ) : (
            <StatusBadge tone="urgent" size="sm">
              Short {coverage.short} staff
            </StatusBadge>
          ))}
        <span className="ml-auto text-[11px] text-faint">{event.status}</span>
      </div>
    </Link>
  )
}

/* --------------------------------------------------------------- EventRow -- */

export function EventRow({ event, coverage, attentionCount = 0 }) {
  return (
    <ListRow
      href={`/events/${event.id}`}
      title={event.name}
      sub={`${event.dateShort} · ${event.type} · ${event.guests} guests`}
      meta={event.spaces}
      trailing={
        <div className="hidden items-center gap-2 sm:flex">
          {attentionCount > 0 && (
            <StatusBadge tone="urgent" size="sm">
              {attentionCount}
            </StatusBadge>
          )}
          {coverage && !coverage.complete && (
            <StatusBadge tone="urgent" size="sm">
              Short {coverage.short}
            </StatusBadge>
          )}
          {coverage && coverage.complete && (
            <StatusBadge tone="done" size="sm">
              Staffed
            </StatusBadge>
          )}
        </div>
      }
    />
  )
}

/* -------------------------------------------------------------- StaffCard -- */

export function StaffCard({ person, shiftCount, trailing }) {
  return (
    <ListRow
      href={`/staff/${person.id}`}
      leading={<Avatar initials={person.initials} />}
      title={person.name}
      sub={`${person.role} · ${person.preferredHours}`}
      meta={shiftCount != null ? `${shiftCount} shift${shiftCount === 1 ? '' : 's'} this week` : undefined}
      trailing={trailing}
    />
  )
}

/* -------------------------------------------------------------- ShiftCard -- */
// Used in staff detail and shift lists. Shows status with a badge, and the
// accept/decline controls when the viewer can act on them.

export function ShiftCard({ assignment, event, segment, onAccept, onDecline, showActions }) {
  const tone =
    assignment.status === 'accepted' ? 'done' : assignment.status === 'declined' ? 'declined' : 'pending'
  return (
    <div className="border-b border-line-soft px-3 py-2.5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/events/${event.id}/staffing`} className="text-sm font-medium text-ink hover:text-accent">
            {event.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted">
            {segment.name} · {event.dateShort} · {hourLabel(segment.start)}–{hourLabel(segment.end)}
          </p>
          <p className="mt-0.5 text-[11px] text-faint">Role: {assignment.role}</p>
          {assignment.status === 'declined' && assignment.declineReason && (
            <p className="mt-1 text-[11px] text-urgent">Reason: {assignment.declineReason}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge tone={tone} size="sm">
            {assignment.status === 'accepted'
              ? 'Accepted'
              : assignment.status === 'declined'
                ? 'Declined'
                : 'Pending'}
          </StatusBadge>
          {showActions && assignment.status !== 'declined' && (
            <div className="flex gap-1.5">
              {assignment.status !== 'accepted' && (
                <Button size="sm" variant="secondary" onClick={onAccept}>
                  Accept
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={onDecline}>
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Link
          href={`/schedule/shifts/${assignment.id}`}
          className="text-[11px] text-accent underline-offset-2 hover:underline"
        >
          Open shift detail
        </Link>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- EventSegment -- */
// One block of an event (Setup / Ceremony / Reception / Cleanup) with its
// staffing requirement and who is currently on it.

export function EventSegment({ event, segment, assignments, gaps, children }) {
  const segGaps = gaps.filter((g) => g.segment.id === segment.id)
  return (
    <Card
      title={segment.name}
      subtitle={`${hourLabel(segment.start)} – ${hourLabel(segment.end)}`}
      tone={segGaps.length ? 'urgent' : undefined}
      action={
        segGaps.length ? (
          <StatusBadge tone="urgent" size="sm">
            Short {segGaps.reduce((n, g) => n + g.short, 0)}
          </StatusBadge>
        ) : (
          <StatusBadge tone="done" size="sm">
            Covered
          </StatusBadge>
        )
      }
      bodyClassName="px-0 py-0"
    >
      <p className="border-b border-line-soft px-4 py-2 text-xs text-muted">{segment.note}</p>

      <div className="border-b border-line-soft px-4 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">Requires</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {segment.needs.map((need) => {
            const filled = assignments.filter((a) => a.role === need.role && a.status === 'accepted').length
            const ok = filled >= need.count
            return (
              <span
                key={need.role}
                className={cx(
                  'rounded border px-1.5 py-0.5 text-[11px]',
                  ok ? 'border-done-line bg-done-soft text-done' : 'border-urgent-line bg-urgent-soft text-urgent'
                )}
              >
                {need.role}: {filled}/{need.count}
              </span>
            )
          })}
        </div>
      </div>

      {children}
    </Card>
  )
}

/* -------------------------------------------------------- AvailabilityGrid -- */
// A simple 7-day x hour grid. Filled cells = stated availability. Deliberately
// blocky and unstyled-looking; this is a wireframe of a scheduling grid.

const GRID_START = 7
const GRID_END = 24

export function AvailabilityGrid({ person, highlight }) {
  const days = Object.keys(person.availability)
  const hours = []
  for (let h = GRID_START; h < GRID_END; h += 1) hours.push(h)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-[11px]">
        <caption className="sr-only">{person.name} weekly availability</caption>
        <thead>
          <tr>
            <th scope="col" className="w-10 border border-line bg-sunken p-1 text-left font-semibold text-muted">
              Day
            </th>
            {hours.map((h) => (
              <th key={h} scope="col" className="border border-line bg-sunken p-1 font-normal text-faint">
                {h % 12 === 0 ? 12 : h % 12}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <th scope="row" className="border border-line bg-sunken p-1 text-left font-semibold text-ink-2">
                {day}
              </th>
              {hours.map((h) => {
                const free = (person.availability[day] || []).some((w) => w.start <= h && w.end >= h + 1)
                const isHighlight =
                  highlight && highlight.day === day && h >= Math.floor(highlight.start) && h < highlight.end
                return (
                  <td
                    key={h}
                    className={cx(
                      'border border-line p-0',
                      free ? 'bg-done-soft' : 'bg-paper',
                      isHighlight && 'outline-2 outline-offset-[-2px] outline-accent'
                    )}
                  >
                    <span className="sr-only">
                      {day} {hourLabel(h)} {free ? 'available' : 'unavailable'}
                    </span>
                    <span className="block h-4 w-full" />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 border border-line bg-done-soft" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 border border-line bg-paper" /> Not available
        </span>
        {highlight && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 border-2 border-accent" /> Shift being filled
          </span>
        )}
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- TaskRow --- */

export function TaskRow({ task, onToggle }) {
  return (
    <div className="flex items-start gap-3 border-b border-line-soft px-3 py-2.5 last:border-b-0">
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.done}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cx('block cursor-pointer text-sm', task.done ? 'text-muted line-through' : 'text-ink')}
        >
          {task.title}
        </label>
        <p className="mt-0.5 text-xs text-muted">{task.detail}</p>
        <p className="mt-0.5 text-[11px] text-faint">Owner: {task.owner}</p>
      </div>
      <div className="shrink-0">
        {task.done ? (
          <StatusBadge tone="done" size="sm">
            Done
          </StatusBadge>
        ) : (
          <StatusBadge tone={task.dueTone === 'urgent' ? 'urgent' : task.dueTone === 'warn' ? 'warn' : 'info'} size="sm">
            {task.due}
          </StatusBadge>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- Modal --- */
// Focus is moved into the dialog on open and Escape closes it. Backdrop click
// closes too — USER CONTROL: never trap the tester.

export function Modal({ open, onClose, title, children, footer, labelledBy = 'modal-title' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-box border border-line bg-paper sm:rounded-box"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <h2 id={labelledBy} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-box border border-line px-1.5 py-1 text-muted hover:bg-sunken"
          >
            <Icon name="x" size={14} />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="px-4 py-3">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-4 py-3">{footer}</footer>}
      </div>
    </div>
  )
}

/* ----------------------------------------------------- ConfirmationToast --- */
// FEEDBACK: every meaningful action drops one of these. role="status" so it is
// announced to screen readers without stealing focus.

export function ToastHost({ toasts, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-3"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            'pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-box border px-3 py-2 text-sm shadow-sm',
            t.tone === 'urgent'
              ? 'border-urgent-line bg-urgent-soft text-urgent'
              : 'border-done-line bg-done-soft text-done'
          )}
        >
          <Icon name={t.tone === 'urgent' ? 'alert' : 'check'} size={15} className="mt-0.5" />
          <span className="flex-1">{t.message}</span>
          <button type="button" onClick={() => onDismiss(t.id)} className="text-current opacity-60 hover:opacity-100">
            <Icon name="x" size={13} />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------- ConfirmDialog ----- */
// ERROR PREVENTION: wraps a destructive/confusing action in an explicit step.

export function useConfirm() {
  const [pending, setPending] = useState(null)
  const confirm = (config) => setPending(config)
  const close = () => setPending(null)
  const dialog = (
    <Modal
      open={!!pending}
      onClose={close}
      title={pending?.title || ''}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={pending?.danger ? 'danger' : 'primary'}
            onClick={() => {
              pending?.onConfirm?.()
              close()
            }}
          >
            {pending?.confirmLabel || 'Confirm'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-2">{pending?.body}</p>
    </Modal>
  )
  return { confirm, dialog }
}
