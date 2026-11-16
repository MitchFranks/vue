'use client'

// ---------------------------------------------------------------------------
// The sheet's change log, as the manager reads it: what changed (from → to),
// why, who changed it and when, and whether the staff it was sent to have
// seen it. The reach line is the point: "Seen by 2 of 5 · Not yet: Caleb,
// Priya, Nina" with a way to remind them, so a change can't quietly fail to
// reach the people serving the cake.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { BY_KIND, notSeenBy, seenCount } from '@/lib/eventSheet'
import { staffById, stampLabel } from '@/lib/staffing/derive'
import { Button, Icon, StatusBadge } from '@/components/ui'
import { dayOfHref } from './links'

const first = (id) => (staffById(id)?.name || 'Someone').split(' ')[0]

/** "Caleb, Priya and Nina" */
export function nameList(ids) {
  const names = ids.map(first)
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** One change: what it is, what it was, what it is now. Long text stacks. */
export function ChangeRow({ change }) {
  const long = change.from.length + change.to.length > 60
  return (
    <div className="text-small">
      <span className="font-medium text-ink">{change.label}</span>
      {long ? (
        <dl className="mt-1 space-y-1">
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-ink-muted">Was</dt>
            <dd className="text-ink-muted line-through decoration-1">{change.from}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-ink-muted">Now</dt>
            <dd className="text-ink">{change.to}</dd>
          </div>
        </dl>
      ) : (
        <span className="text-ink">
          {': '}
          <span className="text-ink-muted line-through decoration-1">{change.from}</span>
          <Icon name="arrowRight" size={12} className="mx-1 inline text-ink-muted" />
          {change.to}
        </span>
      )}
    </div>
  )
}

/** Who has seen an entry, and the way to reach the rest. */
function Reach({ entry, onRemind }) {
  if (!entry.notify) {
    return (
      <StatusBadge tone="info" size="sm">
        Logged only, not sent to staff
      </StatusBadge>
    )
  }
  if (!entry.team.length) {
    return (
      <StatusBadge tone="info" size="sm">
        No staff confirmed yet
      </StatusBadge>
    )
  }
  const missing = notSeenBy(entry)
  if (!missing.length) {
    return (
      <StatusBadge tone="done" size="sm">
        Seen by all {entry.team.length} staff
      </StatusBadge>
    )
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="warn" size="sm">
          Seen by {seenCount(entry)} of {entry.team.length}
        </StatusBadge>
        <span className="text-small text-ink-muted">Not yet: {nameList(missing)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRemind && (
          <Button size="sm" onClick={() => onRemind(entry, missing)}>
            <Icon name="send" size={13} />
            Remind {missing.length === 1 ? first(missing[0]) : `all ${missing.length}`}
          </Button>
        )}
        {entry.remindedAt && <span className="text-label text-ink-muted">Reminded {stampLabel(entry.remindedAt)}</span>}
      </div>
      {/* Prototype: there are no real phones, so open their day-of page to read it as them. */}
      <p className="text-label text-ink-muted">
        Prototype: open the change as{' '}
        {missing.map((id, i) => (
          <span key={id}>
            {i > 0 && ', '}
            <Link href={dayOfHref(entry.eventId, id)} className="underline underline-offset-2 hover:text-ink">
              {first(id)}
            </Link>
          </span>
        ))}
        .
      </p>
    </div>
  )
}

export function ChangeEntry({ entry, onRemind }) {
  return (
    <article className="space-y-2 px-4 py-4 sm:px-6">
      <div className="space-y-1.5">
        {entry.changes.map((c) => (
          <ChangeRow key={c.key} change={c} />
        ))}
      </div>
      {entry.reason && <p className="text-small text-ink">Why: {entry.reason}</p>}
      <p className="text-label text-ink-muted">
        {entry.area} · {entry.by.name} ({BY_KIND[entry.by.kind] || 'Venue'}) · {stampLabel(entry.at)}
      </p>
      <Reach entry={entry} onRemind={onRemind} />
    </article>
  )
}

export function ChangeLog({ entries, onRemind, empty = 'No changes yet. Every edit to this sheet will be logged here.' }) {
  if (!entries.length) return <p className="px-4 py-4 text-small text-ink-muted sm:px-6">{empty}</p>
  return (
    <div className="divide-y divide-line">
      {entries.map((e) => (
        <ChangeEntry key={e.id} entry={e} onRemind={onRemind} />
      ))}
    </div>
  )
}
