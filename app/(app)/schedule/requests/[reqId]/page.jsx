'use client'

// ---------------------------------------------------------------------------
// SCREEN 24 — Coverage Request Detail.
//
// The alternative to assigning someone directly: broadcast the open shift to
// everyone who holds the role and let them volunteer. Shows who it went to and
// where each person stands.
// ---------------------------------------------------------------------------

import { use, useState } from 'react'
import Link from 'next/link'
import { useStore, hourLabel } from '@/lib/store'
import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Field,
  Icon,
  PageHeader,
  StatusBadge,
  Textarea
} from '@/components/ui/primitives'
import { useConfirm } from '@/components/ui/domain'

export default function CoverageRequestPage({ params }) {
  const { reqId } = use(params)
  const { gapById, replacementsForGap, assignStaff, toast } = useStore()
  const { confirm, dialog } = useConfirm()
  const [sent, setSent] = useState(false)
  const [note, setNote] = useState('')

  const gap = gapById(reqId)

  if (!gap) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Coverage Gaps', href: '/schedule/gaps' },
            { label: 'Coverage request' }
          ]}
        />
        <PageHeader title="No open request" />
        <EmptyState
          icon="check"
          title="This shift is already covered"
          body="There is no longer an open coverage request for this segment."
          action={
            <Button href="/schedule/gaps" variant="primary" size="sm">
              Back to coverage gaps
            </Button>
          }
        />
      </div>
    )
  }

  const candidates = replacementsForGap(gap)
  const eligible = candidates.filter((c) => c.eligible)

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Coverage Gaps', href: '/schedule/gaps' },
          { label: 'Coverage request' }
        ]}
      />

      <PageHeader
        title="Coverage request"
        lead={`${gap.event.name} · ${gap.segment.name}`}
        actions={
          sent ? (
            <StatusBadge tone="pending">Sent to {eligible.length}</StatusBadge>
          ) : (
            <StatusBadge tone="warn">Not sent</StatusBadge>
          )
        }
      />

      <Card className="mb-4" title="The shift" icon="clock">
        <dl className="grid gap-3 sm:grid-cols-4">
          <Field label="Role" value={gap.role} />
          <Field label="Segment" value={gap.segment.name} />
          <Field label="Date" value={gap.event.dateShort} />
          <Field label="Window" value={`${hourLabel(gap.segment.start)} – ${hourLabel(gap.segment.end)}`} />
        </dl>
      </Card>

      {!sent ? (
        <Card title="Send to available staff" icon="send" subtitle={`${eligible.length} people match this shift`}>
          <Textarea
            label="Message (optional)"
            id="request-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything they should know before they take it."
            hint="Nothing is actually sent — this is a prototype."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="md"
              disabled={eligible.length === 0}
              onClick={() => {
                setSent(true)
                toast(`Coverage request sent to ${eligible.length} available staff.`)
              }}
            >
              <Icon name="send" size={14} />
              Send request to {eligible.length}
            </Button>
            <Button href={`/schedule/gaps/${gap.id}`} variant="secondary" size="md">
              Assign someone directly instead
            </Button>
          </div>
        </Card>
      ) : (
        <Alert tone="pending" title={`Request sent to ${eligible.length} people`}>
          <p className="mt-1">
            They will see it on their phone and can claim the shift. You can still assign someone directly below
            rather than waiting.
          </p>
        </Alert>
      )}

      <h2 className="mb-2 mt-4 text-sm font-semibold text-ink">Who it went to</h2>
      <Card bodyClassName="px-0 py-0">
        {candidates.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted">Nobody holds the {gap.role} role.</p>
        ) : (
          candidates.map(({ person, eligible: ok, clash }) => (
            <div
              key={person.id}
              className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
            >
              <Avatar initials={person.initials} size="sm" />
              <div className="min-w-0 flex-1">
                <Link href={`/staff/${person.id}`} className="text-sm font-medium text-ink hover:text-accent">
                  {person.name}
                </Link>
                <div className="text-xs text-muted">
                  {ok ? 'Available for this window' : clash ? `Booked on ${clash.event.name}` : 'Not available'}
                </div>
              </div>
              <StatusBadge tone={ok ? (sent ? 'pending' : 'done') : 'empty'} size="sm">
                {ok ? (sent ? 'Asked' : 'Eligible') : 'Skipped'}
              </StatusBadge>
              {ok && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    confirm({
                      title: `Assign ${person.name} now?`,
                      body: 'This skips waiting for them to volunteer and confirms them immediately.',
                      confirmLabel: 'Assign',
                      onConfirm: () => {
                        assignStaff(gap.segment.id, person.id, gap.role)
                        toast(`${person.name} assigned to ${gap.segment.name}.`)
                      }
                    })
                  }
                >
                  Assign now
                </Button>
              )}
            </div>
          ))
        )}
      </Card>

      {dialog}
    </div>
  )
}
