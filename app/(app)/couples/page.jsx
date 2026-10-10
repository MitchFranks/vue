'use client'

// SCREEN 27 — Couples.

import { couples } from '@/lib/mock/records'
import { events } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'
import { Avatar, Breadcrumbs, Card, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'

export default function CouplesPage() {
  const { attentionForEvent } = useStore()
  // The couple added in the first-run guide (if any) leads the list.
  const { couple: firstCouple } = useOnboarding()
  const list = firstCouple ? [firstCouple, ...couples] : couples

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Couples' }]} />
      <PageHeader title="Couples" lead={firstCouple ? `${list.length} couples.` : `${list.length} couples with an event on the books.`} />

      <Card bodyClassName="px-0 py-0">
        {list.map((c) => {
          const theirEvents = events.filter((e) => c.eventIds.includes(e.id))
          const needs = theirEvents.reduce((n, e) => n + attentionForEvent(e.id).length, 0)
          return (
            <ListRow
              key={c.id}
              href={`/couples/${c.id}`}
              leading={<Avatar initials={c.initials} />}
              title={c.name}
              sub={[c.primaryContact, c.email].filter(Boolean).join(' · ')}
              meta={theirEvents.length ? theirEvents.map((e) => e.name).join(', ') : 'No wedding booked yet'}
              trailing={
                c.addedByGuide ? (
                  <StatusBadge tone="info" size="sm">
                    New
                  </StatusBadge>
                ) : needs > 0 ? (
                  <StatusBadge tone="urgent" size="sm">
                    {needs} open
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="done" size="sm">
                    Clear
                  </StatusBadge>
                )
              }
            />
          )
        })}
      </Card>
    </div>
  )
}
