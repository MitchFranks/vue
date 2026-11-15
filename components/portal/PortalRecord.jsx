'use client'

// The couple record's client-portal half, for the venue manager: where each
// of the four portal steps stands (who signed, who paid and how, whether the
// details are in, the booked meeting), the details themselves, and every
// change the couple has made. Changes the manager hasn't read are called out
// first, so a moved cake cutting is passed on before the day.

import { useState } from 'react'
import { Alert, Button, Card, Icon, ListRow, StatusBadge } from '@/components/ui'
import { money } from '@/lib/mock/records'
import { atLabel, changeLine, portalHref, portalSteps, stamp } from '@/lib/portal'
import { useStore } from '@/lib/store'
import { DetailsSummary } from './PortalDetails'

/** The step rows' one-line detail for the manager (more specific than the couple's checklist). */
function stepDetail(step, { docs, plan }) {
  if (step.id === 'sign') {
    const lines = docs.map((d) => (d.tone === 'done' ? `${d.name}: signed by ${d.signedBy || 'the couple'}, ${d.signedOn || d.updated}` : `${d.name}: waiting for them`))
    return lines.join(' · ') || step.status
  }
  if (step.id === 'pay' && plan) {
    const online = plan.schedule.filter((p) => p.paidOnline)
    const paid = `${money(plan.paid)} of ${money(plan.total)} paid`
    return online.length ? `${paid} · ${online.map((p) => `${p.label} paid online by ${p.paidOnline.by} (${p.paidOnline.method})`).join(' · ')}` : `${paid} · ${step.status}`
  }
  return step.status
}

export function PortalRecord({ couple, event }) {
  const { documentList, paymentsForEvent, portalFor, markPortalSeen, toast } = useStore()
  const [copied, setCopied] = useState(false)
  const record = portalFor(couple.id)
  const docs = documentList.filter((d) => d.eventId === event?.id && d.signer === 'couple')
  const plan = event ? paymentsForEvent(event.id) : null
  const steps = portalSteps({ docs, plan, record })
  const done = steps.filter((s) => s.done).length
  const unseen = record.history.slice(record.seen)
  // Until the manager has read the first version, it is all new: no "from → to" to show.
  const firstUnread = unseen.some((h) => h.kind === 'sent')
  const unseenChanges = firstUnread ? [] : unseen.flatMap((h) => h.changes)

  const copy = async () => {
    const url = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}${portalHref(couple.id)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('Portal link copied. Send it to the couple.')
    } catch {
      toast(url, 'info', { small: 'Copy this link to send to the couple.' })
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="Client portal"
        icon="user"
        subtitle={`${done} of ${steps.length} done by the couple`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button size="sm" variant="primary" href={portalHref(couple.id)} target="_blank" rel="noreferrer">
              Open their portal
              <Icon name="arrowRight" size={13} />
            </Button>
          </div>
        }
        bodyClassName="px-0 py-0"
      >
        {steps.map((s) => (
          <ListRow
            key={s.id}
            title={s.label.replace('your', 'their')}
            meta={stepDetail(s, { docs, plan })}
            trailing={
              <StatusBadge tone={s.done ? 'done' : s.tone} size="sm">
                {s.done ? 'Done' : 'Waiting on them'}
              </StatusBadge>
            }
          />
        ))}
      </Card>

      <Card
        title="Event details from the couple"
        icon="list"
        subtitle={record.details ? `Last updated ${stamp(record.detailsAt)} in the client portal` : 'Not sent yet. They fill these in from their portal.'}
      >
        {unseen.length > 0 && (
          <div className="mb-4">
            <Alert
              tone="urgent"
              title={unseenChanges.length ? `${unseenChanges.length} new ${unseenChanges.length === 1 ? 'change' : 'changes'} since you last looked` : 'New details from the couple'}
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    markPortalSeen(couple.id)
                    toast('Marked as read. Pass the changes on to the staff and vendors.')
                  }}
                >
                  Mark as read
                </Button>
              }
            >
              {unseenChanges.length ? (
                <ul className="mt-1 space-y-0.5">
                  {unseenChanges.map((c, i) => (
                    <li key={`${c.field}-${i}`}>{changeLine(c)}</li>
                  ))}
                </ul>
              ) : (
                'They sent their details for the first time. Read them below.'
              )}
            </Alert>
          </div>
        )}
        {record.details ? <DetailsSummary details={record.details} /> : <p className="text-body text-ink-muted">Send them their portal link to collect these without chasing.</p>}
      </Card>

      {record.history.length > 0 && (
        <Card title="Change log" icon="clock" subtitle="Everything the couple sent or changed, newest first." bodyClassName="px-0 py-0">
          {[...record.history].reverse().map((h, i) => (
            <ListRow
              key={`${h.at}-${i}`}
              title={h.kind === 'sent' ? `${h.by} sent their details` : `${h.by} changed ${h.changes.length} ${h.changes.length === 1 ? 'detail' : 'details'}`}
              meta={`${h.changes.length ? h.changes.map(changeLine).join(' · ') : 'First version.'} · ${atLabel(h.at)}`}
            />
          ))}
        </Card>
      )}
    </div>
  )
}
