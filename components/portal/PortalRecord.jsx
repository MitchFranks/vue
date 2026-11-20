'use client'

// The couple record's client-portal half, for the venue manager.
//
//   1. New from the couple (only when there is something unread): what
//      changed, from -> to, and one "Mark as read" button.
//   2. Client portal: how far along they are, each step in a sentence, and
//      the link to send them.
//   3. Their event details, with the change history folded underneath.
//
// So a moved cake cutting is the first thing on the page until someone has
// read it, then it steps aside.

import { useState } from 'react'
import { Button, Card, Icon, ProgressBar } from '@/components/ui'
import { money } from '@/lib/mock/records'
import { atLabel, changeLine, portalHref, portalSteps, stamp, STEP_COPY } from '@/lib/portal'
import { useStore } from '@/lib/store'
import { useUndoable } from '@/lib/undo'
import { cx } from '@/lib/cx'
import { DetailsSummary } from './PortalDetails'

/** Each step in one sentence, from the venue's side. */
function stepLine(step, { docs, plan, record }) {
  if (step.id === 'sign') {
    if (!docs.length) return 'Nothing for them to sign.'
    return docs.map((d) => (d.tone === 'done' ? `${d.name}: signed by ${d.signedBy || 'the couple'}, ${d.signedOn || d.updated}.` : `${d.name}: not signed yet.`)).join(' ')
  }
  if (step.id === 'pay') {
    if (!plan) return 'No payment schedule.'
    const online = plan.schedule.filter((p) => p.paidOnline)
    const due = plan.schedule.filter((p) => p.state === 'due')
    return [
      `${money(plan.paid)} of ${money(plan.total)} paid.`,
      ...online.map((p) => `${p.label} paid online by ${p.paidOnline.by} (${p.paidOnline.method.toLowerCase()}).`),
      due.length ? `${money(due.reduce((n, p) => n + p.amount, 0))} due now.` : ''
    ].join(' ')
  }
  if (step.id === 'details') return record.details ? `Sent ${stamp(record.history[0]?.at)}, last changed ${stamp(record.detailsAt)}.` : 'Not sent yet.'
  return record.meeting ? `${step.status}. Booked by ${record.meeting.by}.` : 'Not booked yet.'
}

export function PortalRecord({ couple, event }) {
  const { documentList, paymentsForEvent, portalFor, markPortalSeen, toast } = useStore()
  const undoable = useUndoable()
  const [copied, setCopied] = useState(false)
  const record = portalFor(couple.id)
  const docs = documentList.filter((d) => d.eventId === event?.id && d.signer === 'couple')
  const plan = event ? paymentsForEvent(event.id) : null
  const steps = portalSteps({ docs, plan, record })
  const done = steps.filter((s) => s.done).length
  const unseen = record.history.slice(record.seen)
  // Until the manager has read the first version, it is all new: no "from -> to" to show.
  const firstUnread = unseen.some((h) => h.kind === 'sent')
  const unseenChanges = firstUnread ? [] : unseen.flatMap((h) => h.changes)
  const lastBy = unseen[unseen.length - 1]?.by

  const copy = async () => {
    const url = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}${portalHref(couple.id)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('Link copied. Paste it into an email or text to the couple.')
    } catch {
      toast(url, 'info', { small: 'Copy this link and send it to the couple.' })
    }
  }

  return (
    <div className="space-y-4">
      {unseen.length > 0 && (
        <section className="rounded-md border border-status-now/40 bg-status-now-soft px-4 py-4 sm:px-6" aria-labelledby="portal-new-title">
          <h2 id="portal-new-title" className="flex items-center gap-2 text-heading font-medium text-ink">
            <Icon name="alert" size={16} className="text-status-now" />
            {firstUnread ? `${lastBy} sent their event details` : `${lastBy} changed ${unseenChanges.length} ${unseenChanges.length === 1 ? 'detail' : 'details'}`}
          </h2>
          {unseenChanges.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {unseenChanges.map((c, i) => (
                <li key={`${c.field}-${i}`} className="text-body text-ink">
                  <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{c.label}:</span>
                    <span className="text-ink-muted line-through decoration-ink-muted/60">{c.from}</span>
                    <Icon name="arrowRight" size={13} className="self-center text-ink-muted" />
                    <span className="font-medium">{c.to}</span>
                  </span>
                  <span className="sr-only">{changeLine(c)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-body text-ink">Their guest count, key times and day-of contact are below.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                undoable(() => markPortalSeen(couple.id), 'Marked as read.', { undone: 'Undone. It’s marked as new again.' })
              }}
            >
              <Icon name="check" size={13} />
              Mark as read
            </Button>
            <p className="text-small text-ink-muted">Pass anything important to the staff and vendors first.</p>
          </div>
        </section>
      )}

      <Card
        title="Client portal"
        icon="user"
        subtitle={done === steps.length ? 'The couple has done everything.' : `${done} of ${steps.length} done by the couple`}
        bodyClassName="px-0 py-0"
      >
        <div className="border-b border-line px-4 py-4 sm:px-6">
          <ProgressBar value={done} max={steps.length} label="Portal steps done by the couple" />
        </div>
        <ul>
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:px-6">
              <span
                aria-hidden="true"
                className={cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', s.done ? 'bg-status-clear-soft text-status-clear' : 'border border-line-strong text-ink-muted')}
              >
                {s.done ? <Icon name="check" size={13} /> : <Icon name="clock" size={12} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">
                  {STEP_COPY[s.id].title.replace('your', 'their')}
                  <span className="sr-only">{s.done ? ' (done)' : ' (waiting on them)'}</span>
                </p>
                <p className="text-small text-ink-muted">{stepLine(s, { docs, plan, record })}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-sunken/40 px-4 py-3 sm:px-6">
          <p className="mr-auto text-small text-ink-muted">Send the couple their link. No sign-in needed.</p>
          <Button size="sm" variant="secondary" onClick={copy}>
            <Icon name={copied ? 'check' : 'mail'} size={13} />
            {copied ? 'Link copied' : 'Copy link to send'}
          </Button>
          <Button size="sm" variant="ghost" href={portalHref(couple.id)} target="_blank" rel="noreferrer">
            Preview portal
          </Button>
        </div>
      </Card>

      <Card title="Event details" icon="list" subtitle={record.details ? `From the couple, last changed ${stamp(record.detailsAt)}` : 'The couple fills these in from their portal.'}>
        {record.details ? (
          <>
            <DetailsSummary details={record.details} />
            {record.history.length > 0 && (
              <details className="group mt-5 border-t border-line pt-4">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-small font-medium text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                  <Icon name="chevronDown" size={14} className="transition-transform group-open:rotate-180" />
                  Change history ({record.history.length})
                </summary>
                <ol className="mt-3 space-y-3">
                  {[...record.history].reverse().map((h, i) => (
                    <li key={`${h.at}-${i}`} className="text-small">
                      <p className="text-ink">
                        <span className="font-medium">{h.kind === 'sent' ? `${h.by} sent their details` : `${h.by} changed ${h.changes.length} ${h.changes.length === 1 ? 'detail' : 'details'}`}</span>
                        <span className="text-ink-muted"> · {atLabel(h.at)}</span>
                      </p>
                      {h.changes.length > 0 && <p className="mt-0.5 text-ink-muted">{h.changes.map(changeLine).join(' · ')}</p>}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </>
        ) : (
          <p className="text-body text-ink-muted">Nothing yet. Once they send them, their guest count, key times and day-of contact appear here.</p>
        )}
      </Card>
    </div>
  )
}
