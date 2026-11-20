'use client'

// ---------------------------------------------------------------------------
// "Where the couple stands": the top of every event's Overview.
//
// User test v4: "I made the payment but can't see where it says paid", "it
// took me a moment to find where to view the completed payment and
// signature", "nothing flagged that it was overdue". One card answers all
// three: each agreement signed (by whom, when) or not (and whether it is
// late), the payments (paid, still owed, next due date, late or not), and any
// request still waiting for an answer. Every line links to where it lives.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { cx } from '@/lib/cx'
import { coupleById, money } from '@/lib/mock/records'
import { requestLine } from '@/lib/eventSheet'
import { useStore } from '@/lib/store'
import { Card, Icon, ProgressBar, StatusBadge } from '@/components/ui'
import { useCoupleStatus } from '@/components/updates/useCoupleUpdates'

function Line({ href, icon, title, sub, badge, tone }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken/50 sm:px-6">
        <span
          className={cx(
            'grid h-8 w-8 shrink-0 place-items-center rounded-full',
            tone === 'done' ? 'bg-status-clear-soft text-status-clear' : tone === 'urgent' ? 'bg-status-now-soft text-status-now' : 'bg-status-soon-soft text-status-soon'
          )}
        >
          <Icon name={icon} size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-ink">{title}</span>
          {sub && <span className="block text-small text-ink-muted">{sub}</span>}
        </span>
        <StatusBadge tone={tone} size="sm">
          {badge}
        </StatusBadge>
        <Icon name="chevronRight" size={14} className="text-ink-muted" />
      </Link>
    </li>
  )
}

export function CoupleStanding({ event }) {
  const s = useCoupleStatus(event.id)
  const { portalFor } = useStore()
  const couple = coupleById(event.coupleId)
  const record = couple ? portalFor(couple.id) : null
  if (!s.agreements.length && !s.payment && !s.requestsWaiting.length) return null

  const p = s.payment
  const headline = s.overdue
    ? `${s.overdue} overdue`
    : s.requestsWaiting.length
      ? `${s.requestsWaiting.length} waiting for your answer`
      : s.owed
        ? `${s.owed} still to do`
        : 'All signed and up to date'

  return (
    <Card
      title="Where the couple stands"
      icon="heart"
      subtitle={`${event.couple} · ${headline}`}
      action={
        couple && (
          <Link href={`/couples/${couple.id}`} className="text-small font-medium text-accent underline-offset-4 hover:underline">
            Couple record
          </Link>
        )
      }
      bodyClassName="px-0 py-0"
    >
      <ul className="divide-y divide-line">
        {s.requestsWaiting.map((r) => (
          <Line
            key={r.id}
            href={`/events/${event.id}/sheet#requests`}
            icon="bell"
            title={`${r.by.split(' ')[0]} asked: ${requestLine(r)}`}
            sub={r.note ? `“${r.note}”` : 'From their client portal'}
            badge="Needs your answer"
            tone="warn"
          />
        ))}

        {s.agreements.map((a) => (
          <Line
            key={a.id}
            href={`/events/${event.id}/documents`}
            icon="file"
            title={a.name}
            sub={a.signed ? a.words : `Not signed yet. ${a.words}.`}
            badge={a.signed ? 'Signed' : a.overdue ? 'Overdue' : 'Waiting'}
            tone={a.signed ? 'done' : a.overdue ? 'urgent' : 'warn'}
          />
        ))}

        {p && (
          <li>
            <Link href={`/events/${event.id}/payments`} className="block px-4 py-3 hover:bg-surface-sunken/50 sm:px-6">
              <span className="flex items-center gap-3">
                <span
                  className={cx(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full',
                    !p.left ? 'bg-status-clear-soft text-status-clear' : p.next?.overdue ? 'bg-status-now-soft text-status-now' : 'bg-status-soon-soft text-status-soon'
                  )}
                >
                  <Icon name="dollar" size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">
                    {money(p.paid)} of {money(p.total)} paid
                  </span>
                  <span className="block text-small text-ink-muted">
                    {!p.left
                      ? `Paid in full.${p.lastPaid ? ` Last: ${p.lastPaid.label.toLowerCase()}, ${p.lastPaid.when.replace(/^Paid /, 'paid ')}.` : ''}`
                      : p.next
                        ? `Next: ${p.next.label.toLowerCase()} of ${money(p.next.amount)}, ${p.next.words.charAt(0).toLowerCase()}${p.next.words.slice(1)}.${p.lastPaid ? ` Last: ${p.lastPaid.label.toLowerCase()}, ${p.lastPaid.when.replace(/^Paid /, 'paid ')}.` : ''}`
                        : `${money(p.left)} still to pay.`}
                  </span>
                </span>
                <StatusBadge tone={!p.left ? 'done' : p.next?.overdue ? 'urgent' : 'warn'} size="sm">
                  {!p.left ? 'Paid in full' : p.next?.overdue ? 'Overdue' : `${money(p.left)} to pay`}
                </StatusBadge>
                <Icon name="chevronRight" size={14} className="text-ink-muted" />
              </span>
              <ProgressBar value={p.paid} max={p.total} label="Share of the total paid" className="mt-3 sm:ml-11 sm:w-[calc(100%-2.75rem)]" />
            </Link>
          </li>
        )}

        {record && (
          <Line
            href={couple ? `/couples/${couple.id}` : `/events/${event.id}`}
            icon="list"
            title="Event details from the couple"
            sub={record.details ? (record.history.length > (record.seen || 0) ? 'They changed something you haven’t read yet.' : 'Sent and read.') : 'Not sent yet. They fill these in on their portal.'}
            badge={record.details ? (record.history.length > (record.seen || 0) ? 'Not read' : 'Sent') : 'Not sent'}
            tone={record.details ? (record.history.length > (record.seen || 0) ? 'warn' : 'done') : 'warn'}
          />
        )}
      </ul>
    </Card>
  )
}
