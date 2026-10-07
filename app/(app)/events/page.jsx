'use client'

// SCREEN 4 — Upcoming Events (list).

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { EVENT_TYPES, events } from '@/lib/mock/events'
import { Breadcrumbs, Button, Card, EmptyState, Icon, PageHeader } from '@/components/ui/primitives'
import { EventCard } from '@/components/ui/domain'

export default function EventsPage() {
  const { coverageForEvent, attentionForEvent } = useStore()
  const [type, setType] = useState('All types')
  const [query, setQuery] = useState('')

  const filtered = events.filter(
    (e) =>
      (type === 'All types' || e.type === type) &&
      (query.trim() === '' ||
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.client.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Upcoming Events' }]} />
      <PageHeader
        title="Upcoming events"
        lead="Every event on the books. The platform is not wedding-only — birthdays, corporate dinners, receptions and anniversaries all use the same structure."
        actions={
          <Button href="/events/new" variant="primary" size="md">
            <Icon name="plus" size={14} />
            New event
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <label htmlFor="event-search" className="mb-1 block text-xs font-semibold text-ink-2">
            Search
          </label>
          <input
            id="event-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Event or client name"
            className="w-full rounded-box border border-line bg-paper px-2.5 py-1.5 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="event-type" className="mb-1 block text-xs font-semibold text-ink-2">
            Event type
          </label>
          <select
            id="event-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-box border border-line bg-paper px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none"
          >
            {['All types', ...EVENT_TYPES].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No events match"
          body="Try a different event type or clear the search box."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setType('All types')
                setQuery('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              coverage={coverageForEvent(event.id)}
              attentionCount={attentionForEvent(event.id).length}
            />
          ))}
        </div>
      )}

      <Card className="mt-5" title="Event types in this prototype" icon="info">
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPES.map((t) => {
            const n = events.filter((e) => e.type === t).length
            return (
              <span
                key={t}
                className={
                  n
                    ? 'rounded border border-line bg-sunken px-2 py-0.5 text-xs text-ink-2'
                    : 'rounded border border-dashed border-line px-2 py-0.5 text-xs text-faint'
                }
              >
                {t} {n > 0 && `(${n})`}
              </span>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          Types shown in grey have no events booked yet, but are selectable when creating one.
        </p>
      </Card>
    </div>
  )
}
