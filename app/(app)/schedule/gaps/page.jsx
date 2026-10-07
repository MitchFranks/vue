'use client'

// SCREEN 22 — Coverage Gaps (across every event).
// A fourth independent route to the same staffing problem.

import { useStore, hourLabel } from '@/lib/store'
import { Breadcrumbs, Button, Card, EmptyState, Icon, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { pluralRole } from '@/lib/mock/staff'

export default function CoverageGapsPage() {
  const { gaps } = useStore()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Coverage Gaps' }]} />
      <PageHeader
        title="Coverage gaps"
        lead="Every segment across every event where confirmed staff are fewer than the segment requires. A shift that is still pending does not count as covered."
      />

      {gaps.length === 0 ? (
        <EmptyState
          icon="check"
          title="No coverage gaps"
          body="Every segment on every event has the confirmed staff it needs."
          action={
            <Button href="/schedule" variant="secondary" size="sm">
              Back to the weekly schedule
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {gaps.map((gap) => (
            <Card key={gap.id} tone={gap.urgency === 'urgent' ? 'urgent' : undefined} bodyClassName="px-0 py-0">
              <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={gap.urgency === 'urgent' ? 'urgent' : 'warn'} size="sm">
                      Short {gap.short}
                    </StatusBadge>
                    <span className="text-xs text-muted">{gap.event.name}</span>
                    <span className="text-[11px] text-faint">{gap.event.dateShort}</span>
                  </div>
                  <h2 className="text-sm font-semibold text-ink">
                    {gap.segment.name} needs {gap.required} {pluralRole(gap.role, gap.required)} — {gap.accepted} confirmed
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {hourLabel(gap.segment.start)}–{hourLabel(gap.segment.end)}
                    {gap.pending > 0 && ` · ${gap.pending} awaiting reply`}
                    {gap.declinedBy.length > 0 && ` · ${gap.declinedBy.map((d) => d.name).join(', ')} declined`}
                  </p>
                </div>
                <div className="shrink-0">
                  <Button href={`/schedule/gaps/${gap.id}`} variant="primary" size="sm">
                    Find replacement
                    <Icon name="arrowRight" size={13} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-5" title="Where else you can reach these" icon="info">
        <ul className="space-y-1 text-xs text-muted">
          <li>• The dashboard counter and attention block</li>
          <li>• The Needs Attention list, filtered to Staffing</li>
          <li>• The event's own Staffing tab</li>
          <li>• The weekly schedule grid</li>
        </ul>
      </Card>
    </div>
  )
}
