'use client'

// ---------------------------------------------------------------------------
// The persistent header + tab bar shared by every event sub-screen.
//
// RECOGNITION OVER RECALL: the event's date, time, guest count, staffing state
// and attention count stay on screen no matter which tab you are on, so nobody
// has to remember them while moving around.
// ---------------------------------------------------------------------------

import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Breadcrumbs, Field, Icon, PageHeader, StatusBadge, Tabs } from './ui/primitives'

export function EventHeader({ event }) {
  const pathname = usePathname()
  const { coverageForEvent, attentionForEvent, taskList, messageList, documentList } = useStore()

  const coverage = coverageForEvent(event.id)
  const attention = attentionForEvent(event.id)
  const openTasks = taskList.filter((t) => t.eventId === event.id && !t.done).length
  const unreplied = messageList.filter((m) => m.eventId === event.id && m.needsReply && !m.replied).length
  const docs = documentList.filter((d) => d.eventId === event.id).length

  const base = `/events/${event.id}`
  const tabs = [
    { id: 'overview', label: 'Overview', href: base },
    { id: 'timeline', label: 'Timeline', href: `${base}/timeline` },
    { id: 'tasks', label: 'Tasks', href: `${base}/tasks`, count: openTasks || null, tone: openTasks ? 'urgent' : null },
    {
      id: 'staffing',
      label: 'Staffing',
      href: `${base}/staffing`,
      count: coverage.short || null,
      tone: coverage.short ? 'urgent' : null
    },
    { id: 'vendors', label: 'Vendors', href: `${base}/vendors` },
    { id: 'payments', label: 'Payments', href: `${base}/payments` },
    {
      id: 'messages',
      label: 'Messages',
      href: `${base}/messages`,
      count: unreplied || null,
      tone: unreplied ? 'urgent' : null
    },
    { id: 'documents', label: 'Documents', href: `${base}/documents`, count: docs },
    { id: 'history', label: 'History', href: `${base}/history` }
  ]

  const active =
    tabs
      .slice(1)
      .find((t) => pathname.startsWith(t.href))?.id || 'overview'

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events', href: '/events' },
          { label: event.name }
        ]}
      />

      <PageHeader
        title={event.name}
        lead={`${event.client} · ${event.type}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {attention.length > 0 ? (
              <StatusBadge tone="urgent">
                {attention.length} need{attention.length === 1 ? 's' : ''} attention
              </StatusBadge>
            ) : (
              <StatusBadge tone="done">Nothing outstanding</StatusBadge>
            )}
            {coverage.complete ? (
              <StatusBadge tone="done">Fully staffed</StatusBadge>
            ) : (
              <StatusBadge tone="urgent">Short {coverage.short} staff</StatusBadge>
            )}
          </div>
        }
      >
        {/* The four facts that are true no matter which tab you are on. */}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line bg-paper px-5 py-4 sm:grid-cols-4">
          <Field label="Date" value={event.date} />
          <Field label="Schedule" value={event.headline} />
          <Field label="Guests" value={`${event.guests} confirmed`} />
          <Field label="Spaces" value={event.spaces} />
        </dl>
      </PageHeader>

      <Tabs tabs={tabs} active={active} />
    </>
  )
}
