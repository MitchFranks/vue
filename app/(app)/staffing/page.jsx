'use client'

// ---------------------------------------------------------------------------
// Staffing Planner · Events (spec §B.1). "Which weddings need me, and for what?"
// One card per event: the staffing state, what is left, and exactly one
// destination. The whole card is the link; the words on its right say what
// opening it will do.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { Alert, EmptyState, Icon, PageHeader, StatusBadge } from '@/components/ui'
import { StaffingNav, SkeletonCards } from '@/components/staffing/Nav'
import { WORLD } from '@/lib/staffing/adapter'
import { daysOutOf, daysOutText, eventCardModel, eventOf, guestsText, summaryLine } from '@/lib/staffing/derive'
import { useStaffing } from '@/lib/staffing/store'

// "Fill spots" opens the event's board, not the Ask panel: in user tests,
// landing straight in Ask made people send texts when that wasn't their task.
// Each open spot on the board has its own Ask button.
const hrefFor = (ev, action) => {
  if (action.kind === 'send' || action.kind === 'remind') return `/staffing/${ev.id}?send=1`
  return `/staffing/${ev.id}`
}

export default function StaffingEventsPage() {
  const { state, hydrated, loadError } = useStaffing()

  const evs = [...WORLD.events].filter((e) => daysOutOf(e) >= 0 && daysOutOf(e) <= 30).sort((a, b) => (a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0))
  const models = evs.map((e) => ({ ev: eventOf(state, e.id), m: eventCardModel(e.id, state) }))
  const firstActionId = models.find((x) => x.m.needsAction)?.ev.id

  return (
    <div>
      <PageHeader title="Staffing Planner" lead="Which events still have open spots, and who you're waiting on." />
      <StaffingNav />

      {loadError && (
        <div className="mb-4">
          <Alert tone="info">Your saved planner changes couldn&apos;t be read, so it started fresh from the sample data.</Alert>
        </div>
      )}

      {!hydrated ? (
        <SkeletonCards />
      ) : !models.length ? (
        <EmptyState title="No events in the next 30 days." body="Events appear here as soon as they are booked." icon="calendar" />
      ) : (
        <ul className="space-y-4">
          {models.map(({ ev, m }) => {
            const primary = ev.id === firstActionId
            return (
              <li key={ev.id}>
                <Link
                  href={hrefFor(ev, m.action)}
                  data-guide={primary ? 'planner-event' : undefined}
                  className={`${primary ? 'ring-2 ring-accent ' : ''}surface-card flex flex-col gap-3 px-4 py-4 transition-colors duration-150 hover:border-line-strong sm:flex-row sm:items-center sm:px-6`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-heading font-medium text-ink">{ev.name}</h2>
                      {primary && daysOutOf(ev) <= 3 && (
                        <StatusBadge tone="urgent" size="sm">
                          Do first
                        </StatusBadge>
                      )}
                    </div>
                    <p className="mt-0.5 text-small text-ink-muted">
                      {ev.couple} · {ev.dateShort} · {daysOutText(ev)} · {guestsText(ev)}
                    </p>
                    <p className="mt-1 text-small text-ink">{summaryLine(m.summary)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <StatusBadge key={c.label} tone={c.tone} size="sm">
                          {c.label}
                        </StatusBadge>
                      ))}
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-small font-medium text-ink">
                    {m.action.label}
                    <Icon name="arrowRight" size={14} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
