'use client'

// ---------------------------------------------------------------------------
// Staffing Planner 2 · Events (spec §B.1). "Which weddings need me, and for what?"
// One card per event with every chip that applies and exactly one action.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, Button, EmptyState, Icon, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { Staffing2Nav, SkeletonCards } from '@/components/staffing2/Nav'
import { Chip } from '@/components/staffing2/StatusChip'
import { WORLD } from '@/lib/staffing2/adapter'
import { daysOutOf, daysOutText, eventCardModel, eventOf, guestsText, listSentence, summaryLine } from '@/lib/staffing2/derive'
import { useStaffing2 } from '@/lib/staffing2/store'

export default function Staffing2EventsPage() {
  const router = useRouter()
  const { state, hydrated, loadError } = useStaffing2()

  const evs = [...WORLD.events].filter((e) => daysOutOf(e) >= 0 && daysOutOf(e) <= 30).sort((a, b) => (a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0))
  const models = evs.map((e) => ({ ev: eventOf(state, e.id), m: eventCardModel(e.id, state) }))
  const firstActionId = models.find((x) => x.m.needsAction)?.ev.id

  const hrefFor = (ev, action) => {
    if (action.kind === 'send' || action.kind === 'remind') return `/staffing2/${ev.id}?send=1`
    if (action.kind === 'find') return `/staffing2/${ev.id}?ask=1`
    return `/staffing2/${ev.id}`
  }

  return (
    <div>
      <PageHeader title="Staffing Planner 2" lead="Ask your team, see who said yes, and fill gaps. One screen per event." />
      <Staffing2Nav />

      {loadError && (
        <div className="mb-4">
          <Alert tone="info">Your saved Planner 2 changes couldn&apos;t be read, so it started fresh from the sample data.</Alert>
        </div>
      )}

      {!hydrated ? (
        <SkeletonCards />
      ) : !models.length ? (
        <EmptyState title="No events in the next 30 days." body="Events appear here as soon as they are booked." icon="calendar" />
      ) : (
        <>
          <p className="mb-4 text-[15px] font-medium text-ink">{listSentence(state)}</p>
          <div className="space-y-4">
            {models.map(({ ev, m }) => {
              const primary = ev.id === firstActionId
              const href = hrefFor(ev, m.action)
              return (
                <article
                  key={ev.id}
                  onClick={() => router.push(`/staffing2/${ev.id}`)}
                  className="surface-card flex cursor-pointer flex-col gap-3 border border-transparent px-5 py-4 transition-all duration-200 hover:-translate-y-[2px] hover:border-accent-line sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/staffing2/${ev.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-display text-[18px] font-bold text-ink hover:text-accent"
                      >
                        {ev.name}
                      </Link>
                      {primary && daysOutOf(ev) <= 3 && (
                        <StatusBadge tone="pending" size="sm">
                          Do first
                        </StatusBadge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {ev.couple} · {ev.dateShort} · {daysOutText(ev)} · {guestsText(ev)}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-2">{summaryLine(m.summary)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.chips.map((c) =>
                        c.icon ? (
                          <Chip key={c.label} tone={c.tone} icon={c.icon}>
                            {c.label}
                          </Chip>
                        ) : (
                          <StatusBadge key={c.label} tone={c.tone} size="sm">
                            {c.label}
                          </StatusBadge>
                        )
                      )}
                    </div>
                  </div>
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button href={href} variant={primary ? 'primary' : m.action.kind === 'open' ? 'ghost' : 'secondary'} size="sm">
                      {m.action.label}
                      <Icon name="arrowRight" size={13} />
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
