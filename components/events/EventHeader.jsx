'use client'

// ---------------------------------------------------------------------------
// The persistent header + tab bar shared by every event sub-screen.
//
// RECOGNITION OVER RECALL: the event's date, time, guest count, staffing state
// and eventTasks count stay on screen no matter which tab you are on, so nobody
// has to remember them while moving around.
//
// The staffing badge and the "Staffing planner" tab both lead to the planner,
// so the way from "this wedding is short" to fixing it is one click.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { taskSummaryLabel, useStore } from '@/lib/store'
import { useStaffing } from '@/lib/staffing/store'
import { useEventSheet } from '@/lib/eventSheetStore'
import { notSeenBy, requestLine } from '@/lib/eventSheet'
import { eventOf } from '@/lib/staffing/derive'
import { openSpots } from '@/lib/format'
import { Breadcrumbs, Button, Field, Icon, PageHeader, StatusBadge, Tabs } from '@/components/ui'

/** Works out the event's counts from the stores and the route, then draws EventHeaderView. */
export function EventHeader({ event }) {
  const pathname = usePathname()
  const { coverageForEvent, tasksForEvent, manualTaskList, messageList, documentList, paymentsForEvent } = useStore()
  const { state: planner } = useStaffing()
  const { entriesFor, requestsFor } = useEventSheet()

  const eventTasks = tasksForEvent(event.id)
  const openTasks = manualTaskList.filter((t) => t.eventId === event.id && !t.done)
  // Guest numbers live in the planner: the Tasks tab and Edit needs both change them there.
  const plannerEvent = eventOf(planner, event.id)

  const summary = {
    coverage: coverageForEvent(event.id),
    taskCount: eventTasks.length,
    taskLabel: taskSummaryLabel(eventTasks),
    anyUrgent: eventTasks.some((a) => a.tone === 'urgent'),
    openTaskCount: openTasks.length,
    urgentTask: openTasks.some((t) => t.dueTone === 'urgent'),
    unreplied: messageList.filter((m) => m.eventId === event.id && m.needsReply && !m.replied).length,
    toSign: documentList.filter((d) => d.eventId === event.id && d.tone === 'urgent').length,
    dueNow: (paymentsForEvent(event.id)?.schedule || []).filter((p) => p.state === 'due').length,
    guests: plannerEvent?.expectedGuests ?? event.guests,
    guarantee: plannerEvent?.guaranteedCount,
    // Sheet changes some of the staff haven't opened yet.
    unseenChanges: entriesFor(event.id).filter((e) => notSeenBy(e).length > 0).length,
    // The couple's run-of-show requests still waiting for an answer.
    waitingRequests: requestsFor(event.id).filter((r) => r.status === 'waiting')
  }

  return <EventHeaderView event={event} summary={summary} pathname={pathname} />
}

/**
 * The header itself, props only.
 *   summary   { coverage: { complete, short }, taskCount, taskLabel, anyUrgent,
 *               openTaskCount, urgentTask, unreplied, toSign, dueNow, guests,
 *               guarantee, unseenChanges }
 *   pathname  picks the active tab
 */
export function EventHeaderView({ event, summary, pathname = '' }) {
  const { coverage, taskCount, taskLabel, anyUrgent, openTaskCount, urgentTask, unreplied, toSign, dueNow, guests, guarantee, unseenChanges, waitingRequests = [] } = summary

  // Counts only where there is something to act on; urgent only when it is.
  const base = `/events/${event.id}`
  const plannerHref = `/staffing/${event.id}`
  const tabs = [
    { id: 'overview', label: 'Overview', href: base, count: taskCount || null, tone: anyUrgent ? 'urgent' : null },
    // The live detail sheet; the count is couple requests waiting for an
    // answer plus changes not every staff member has seen.
    {
      id: 'sheet',
      label: 'Detail sheet',
      href: `${base}/sheet`,
      count: waitingRequests.length + unseenChanges || null,
      tone: waitingRequests.length ? 'urgent' : null
    },
    {
      id: 'staffing',
      label: (
        <>
          Staffing planner
          <Icon name="arrowRight" size={12} className="text-ink-muted" />
        </>
      ),
      href: plannerHref,
      count: coverage.complete ? null : coverage.short,
      tone: coverage.complete ? null : 'urgent'
    },
    { id: 'timeline', label: 'Run of show', href: `${base}/timeline`, guide: 'tab-timeline' },
    { id: 'tasks', label: 'Tasks', href: `${base}/tasks`, count: openTaskCount || null, tone: urgentTask ? 'urgent' : null },
    { id: 'payments', label: 'Payments', href: `${base}/payments`, count: dueNow || null },
    { id: 'documents', label: 'Documents', href: `${base}/documents`, count: toSign || null },
    { id: 'messages', label: 'Messages', href: `${base}/messages`, count: unreplied || null, tone: unreplied ? 'urgent' : null },
    // Used now and then, so they wait behind "More" (fewer choices at once).
    { id: 'vendors', label: 'Vendors', href: `${base}/vendors`, more: true },
    { id: 'activity', label: 'Activity log', href: `${base}/activity`, more: true }
  ]

  const active = tabs.slice(1).find((t) => pathname.startsWith(t.href))?.id || 'overview'

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
        lead={`${event.couple} · ${event.type}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {taskCount > 0 ? (
              <StatusBadge tone={anyUrgent ? 'urgent' : 'warn'}>{taskLabel}</StatusBadge>
            ) : (
              <StatusBadge tone="done">All set</StatusBadge>
            )}
            {/* The staffing badge is a way in: it opens this event in the planner. */}
            <Link
              href={plannerHref}
              title="Open the Staffing Planner for this event"
              className="inline-flex items-center rounded-full underline-offset-4 hover:underline"
            >
              <StatusBadge tone={coverage.complete ? 'done' : 'warn'}>
                {coverage.complete ? 'Fully staffed' : openSpots(coverage.short)}
                <Icon name="chevronRight" size={12} />
              </StatusBadge>
            </Link>
          </div>
        }
      >
        {/* The four facts that are true no matter which tab you are on. */}
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-line py-3 sm:grid-cols-4">
          <Field label="Date" value={event.date} />
          <Field label="Schedule" value={event.headline} />
          <Field
            label="Guests"
            value={`${guests} expected · ${guarantee ? `${guarantee} guaranteed` : 'guarantee not sent'}`}
          />
          <Field label="Spaces" value={event.spaces} />
        </dl>
      </PageHeader>

      {/* A couple waiting on an answer is never hidden behind a tab (user test v4). */}
      {waitingRequests.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-status-soon/40 bg-status-soon-soft px-4 py-3">
          <Icon name="bell" size={16} className="text-status-soon" />
          <p className="min-w-0 flex-1 text-small text-ink">
            <span className="font-medium">
              {waitingRequests.length === 1
                ? `${waitingRequests[0].by.split(' ')[0]} asked: ${requestLine(waitingRequests[0])}.`
                : `${waitingRequests.length} requests from the couple are waiting for your answer.`}
            </span>{' '}
            {waitingRequests.length === 1 && 'Waiting for your answer.'}
          </p>
          <Button href={`${base}/sheet#requests`} size="sm" variant="primary">
            Review {waitingRequests.length === 1 ? 'request' : 'requests'}
            <Icon name="arrowRight" size={13} />
          </Button>
        </div>
      )}

      <Tabs label="Event sections" tabs={tabs} active={active} />
    </>
  )
}
