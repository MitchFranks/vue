'use client'

// ---------------------------------------------------------------------------
// SCREEN 23 — Replacement Suggestions.
//
// The resolution step of the whole scenario. The system does not just list
// everyone — it works out who is ELIGIBLE by checking:
//   * do they hold the right role?
//   * does their stated availability actually cover this window?
//   * are they already working an overlapping segment that day?
//
// Ineligible people are still shown, with the reason, so the manager can
// override — RECOGNITION OVER RECALL, and never a dead end.
// ---------------------------------------------------------------------------

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  StatusBadge
} from '@/components/ui/primitives'
import { AvailabilityGrid, useConfirm } from '@/components/ui/domain'
import { pluralRole } from '@/lib/mock/staff'

export default function ReplacementPage({ params }) {
  const { gapId } = use(params)
  const router = useRouter()
  const { gapById, replacementsForGap, assignStaff, toast } = useStore()
  const { confirm, dialog } = useConfirm()
  const [preview, setPreview] = useState(null)

  const gap = gapById(gapId)

  // The gap disappears from state the moment it is filled — so this screen
  // doubles as the confirmation that the problem is gone.
  if (!gap) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Coverage Gaps', href: '/schedule/gaps' },
            { label: 'Resolved' }
          ]}
        />
        <PageHeader title="This gap is covered" />
        <Alert tone="done" title="Nothing more to do here">
          <p className="mt-1">
            This segment now has the confirmed staff it needs, so it has dropped off the coverage gap list and out
            of Needs Attention.
          </p>
        </Alert>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/schedule/gaps" variant="primary" size="md">
            Back to coverage gaps
          </Button>
          <Button href="/attention" variant="secondary" size="md">
            Check the attention list
          </Button>
          <Button href="/" variant="secondary" size="md">
            Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const candidates = replacementsForGap(gap)
  const eligible = candidates.filter((c) => c.eligible)
  const ineligible = candidates.filter((c) => !c.eligible)

  function assign(person) {
    assignStaff(gap.segment.id, person.id, gap.role)
    toast(`${person.name} assigned to ${gap.event.name} — ${gap.segment.name}. Gap closed.`)
    router.push(`/events/${gap.event.id}/staffing`)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Coverage Gaps', href: '/schedule/gaps' },
          { label: `${gap.event.name} · ${gap.segment.name}` }
        ]}
      />

      <PageHeader
        title={`Find cover: ${gap.segment.name}`}
        lead={`${gap.event.name} · ${gap.event.date}`}
        actions={
          <StatusBadge tone={gap.urgency === 'urgent' ? 'urgent' : 'warn'}>
            Short {gap.short} {pluralRole(gap.role, gap.short)}
          </StatusBadge>
        }
      />

      {/* What happened / why it matters — the same four questions as the
          attention item that brought you here. */}
      <Card className="mb-4" title="The gap" icon="alert" tone="urgent">
        <dl className="grid gap-3 sm:grid-cols-4">
          <Field label="Segment" value={gap.segment.name} />
          <Field label="Window" value={`${hourLabel(gap.segment.start)} – ${hourLabel(gap.segment.end)}`} />
          <Field label="Role needed" value={gap.role} />
          <Field label="Confirmed" value={`${gap.accepted} of ${gap.required}`} />
        </dl>
        {gap.declinedBy.length > 0 && (
          <p className="mt-3 border-t border-line-soft pt-2 text-xs text-urgent">
            {gap.declinedBy.map((d) => d.name).join(', ')} declined this shift.
          </p>
        )}
        <p className="mt-2 text-xs text-muted">{gap.segment.note}</p>
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-ink">
        Available and able to cover ({eligible.length})
      </h2>

      {eligible.length === 0 ? (
        <EmptyState
          icon="alert"
          title="Nobody is both free and clash-free"
          body="You can still assign someone from the list below, or change the segment's requirement."
        />
      ) : (
        <Card bodyClassName="px-0 py-0" className="mb-4">
          {eligible.map(({ person }) => (
            <div
              key={person.id}
              className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3 last:border-b-0"
            >
              <Avatar initials={person.initials} />
              <div className="min-w-0 flex-1">
                <Link href={`/staff/${person.id}`} className="text-sm font-medium text-ink hover:text-accent">
                  {person.name}
                </Link>
                <div className="text-xs text-muted">
                  {person.role} · {person.preferredHours}
                </div>
                <div className="mt-0.5 text-[11px] text-faint">{person.note}</div>
              </div>
              <StatusBadge tone="done" size="sm">
                Free {hourLabel(gap.segment.start)}–{hourLabel(gap.segment.end)}
              </StatusBadge>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreview(preview === person.id ? null : person.id)}
                  aria-expanded={preview === person.id}
                >
                  {preview === person.id ? 'Hide' : 'Availability'}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    confirm({
                      title: `Assign ${person.name}?`,
                      body: `${person.name} will be added to ${gap.event.name} — ${gap.segment.name} (${hourLabel(gap.segment.start)}–${hourLabel(gap.segment.end)}) and the coverage gap will close.`,
                      confirmLabel: 'Assign',
                      onConfirm: () => assign(person)
                    })
                  }
                >
                  Assign
                </Button>
              </div>

              {preview === person.id && (
                <div className="w-full border-t border-line-soft pt-3">
                  <AvailabilityGrid
                    person={person}
                    highlight={{ day: gap.event.day, start: gap.segment.start, end: gap.segment.end }}
                  />
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {ineligible.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-muted">Not suggested ({ineligible.length})</h2>
          <Card bodyClassName="px-0 py-0">
            {ineligible.map(({ person, available, clash }) => (
              <div
                key={person.id}
                className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
              >
                <Avatar initials={person.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link href={`/staff/${person.id}`} className="text-sm text-ink-2 hover:text-accent">
                    {person.name}
                  </Link>
                  <div className="text-xs text-muted">
                    {clash
                      ? `Already on ${clash.event.name} — ${clash.segment.name}`
                      : !available
                        ? 'Outside their stated availability'
                        : 'Not suggested'}
                  </div>
                </div>
                <StatusBadge tone={clash ? 'warn' : 'empty'} size="sm">
                  {clash ? 'Clash' : 'Unavailable'}
                </StatusBadge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    confirm({
                      title: `Assign ${person.name} anyway?`,
                      body: clash
                        ? `${person.name} is already working ${clash.segment.name} on ${clash.event.name} at an overlapping time. Assigning them creates a double-booking.`
                        : `${person.name} has not said they are available for this window. Assigning them may mean they decline.`,
                      confirmLabel: 'Assign anyway',
                      danger: true,
                      onConfirm: () => assign(person)
                    })
                  }
                >
                  Assign anyway
                </Button>
              </div>
            ))}
          </Card>
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button href={`/events/${gap.event.id}/staffing`} variant="secondary" size="sm">
          <Icon name="arrowLeft" size={13} />
          Back to event staffing
        </Button>
        <Button href={`/schedule/requests/${gap.id}`} variant="secondary" size="sm">
          Send a coverage request instead
        </Button>
      </div>

      {dialog}
    </div>
  )
}
