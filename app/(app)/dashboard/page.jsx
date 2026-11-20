'use client'

// ---------------------------------------------------------------------------
// SCREEN 1 — Dashboard (entry screen).
//
// A warm hello, then where to start. User test v4 asked for exactly this:
// "there was no alert", "I can't see where it says paid", "I'd expect it on
// my dashboard", "pointers where to find what to find". So, top to bottom:
//
//   Where to start  four tiles, each a count of real work and the one place
//                   that work lives (couples, staffing, messages, the team).
//   From your couples  what couples did in their portals, newest first, with
//                   anything that needs an answer at the top; and what each
//                   couple still owes, with anything late marked Overdue.
//   Tasks           the first five things to do, each button saying what it does.
//   Your team       who has what this week, one click from handing it on.
//   Upcoming events and staffing.
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { useDirectory } from '@/lib/directory/store'
import { fullName, initialsOf } from '@/lib/directory/model'
import { managerId } from '@/lib/assignees'
import { events, venue as sampleVenue } from '@/lib/mock/events'
import { couples, money } from '@/lib/mock/records'
import { sortTasks, WEEK } from '@/lib/tasks'
import { openSpots } from '@/lib/format'
import { cx } from '@/lib/cx'
import { Avatar, Card, EmptyState, Icon, ListRow, PageHeader, StatusBadge } from '@/components/ui'
import { TaskRow } from '@/components/tasks/TaskRow'
import { EventCard } from '@/components/events/EventCard'
import { UpdateRow } from '@/components/updates/Updates'
import { useCoupleUpdates } from '@/components/updates/useCoupleUpdates'
import { coupleStatus } from '@/lib/updates'
import { useEventSheet } from '@/lib/eventSheetStore'
import { FirstSteps } from '@/components/help/FirstSteps'

const LINK = 'text-small font-medium text-accent underline-offset-4 hover:underline'

/** A tile that is a count and a way in: "1 couple request waiting · Review it". */
function StartTile({ href, icon, count, label, sub, urgent }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-md border border-line bg-surface px-5 py-4 shadow-raised transition-colors duration-150 hover:border-line-strong"
    >
      <span className="flex items-center gap-2 text-small text-ink-muted">
        <span className={cx('grid h-7 w-7 place-items-center rounded-full', urgent ? 'bg-status-now-soft text-status-now' : 'bg-accent-soft text-accent')}>
          <Icon name={icon} size={14} />
        </span>
        {label}
      </span>
      <span className={cx('mt-2 font-mono text-title font-light tabular-nums', urgent ? 'text-status-now' : 'text-ink')}>{count}</span>
      <span className="mt-1 flex items-center gap-1 text-small font-medium text-ink group-hover:underline group-hover:underline-offset-4">
        {sub}
        <Icon name="arrowRight" size={13} />
      </span>
    </Link>
  )
}

/** What each upcoming couple still owes: unsigned agreements and the next payment. */
function WaitingOnCouples() {
  const { documentList, paymentsForEvent } = useStore()
  const { requests } = useEventSheet()
  const rows = []
  for (const event of events) {
    const s = coupleStatus({ eventId: event.id, documentList, paymentsForEvent, requests })
    const couple = couples.find((c) => c.id === event.coupleId)
    const who = couple?.firstNames || event.couple
    for (const a of s.agreements.filter((x) => !x.signed)) {
      rows.push({ id: `a:${a.id}`, overdue: a.overdue, title: `${who}: sign the ${a.name.charAt(0).toLowerCase()}${a.name.slice(1)}`, words: a.words, href: `/events/${event.id}/documents`, event: event.name })
    }
    if (s.payment?.next?.dueDate) {
      const n = s.payment.next
      const soon = n.overdue || n.dueDate <= WEEK.end
      if (soon) rows.push({ id: `p:${event.id}`, overdue: n.overdue, title: `${who}: ${n.label.toLowerCase()} of ${money(n.amount)}`, words: n.words, href: `/events/${event.id}/payments`, event: event.name })
    }
  }
  rows.sort((a, b) => Number(b.overdue) - Number(a.overdue))
  if (!rows.length) return null
  return (
    <div className="border-t border-line">
      <p className="px-4 pt-3 pb-1 text-label font-medium text-ink-muted sm:px-5">Still waiting on couples</p>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={r.href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken/50 sm:px-5">
              <span className="min-w-0 flex-1">
                <span className="block text-small font-medium text-ink">{r.title}</span>
                <span className="block text-label text-ink-muted">{r.event}</span>
              </span>
              <StatusBadge tone={r.overdue ? 'urgent' : 'warn'} size="sm">
                {r.words}
              </StatusBadge>
              <Icon name="chevronRight" size={14} className="text-ink-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FromCouples() {
  const { ready, updates, needsYou, isNew } = useCoupleUpdates()
  const recent = updates.filter((u) => !u.needsYou).slice(0, Math.max(0, 4 - needsYou.length))
  const shown = [...needsYou, ...recent]
  return (
    <Card
      title="From your couples"
      icon="heart"
      subtitle={!ready ? 'Loading…' : needsYou.length ? `${needsYou.length} waiting for your answer` : 'Requests, signatures, payments and details from their portals'}
      bodyClassName="px-0 py-0"
    >
      <div id="from-couples" className="scroll-mt-24">
        {shown.length === 0 ? (
          <p className="px-4 py-4 text-small text-ink-muted sm:px-5">Nothing from couples yet. When one asks for a change, signs, pays or sends details, it shows up here and under Updates.</p>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((u) => (
              <UpdateRow key={u.id} u={u} isNew={isNew(u)} />
            ))}
          </ul>
        )}
        <WaitingOnCouples />
      </div>
    </Card>
  )
}

function TeamThisWeek() {
  const { tasksAssignedTo } = useStore()
  const { staff } = useDirectory()
  const me = managerId()
  const people = staff
    .filter((p) => p.status !== 'inactive')
    .map((p) => {
      const open = tasksAssignedTo(p.id).open
      return { p, week: open.filter((t) => t.dueDate <= WEEK.end).length, overdue: open.filter((t) => t.due?.startsWith('Overdue')).length }
    })
    .filter((x) => x.week > 0)
    .sort((a, b) => (a.p.id === me ? -1 : b.p.id === me ? 1 : b.week - a.week))
  return (
    <Card
      title="Your team this week"
      icon="team"
      subtitle="Open to-dos per person"
      action={
        <Link href="/tasks/team" className={LINK}>
          Who’s doing what
        </Link>
      }
      bodyClassName="px-0 py-0"
    >
      {people.length === 0 ? (
        <p className="px-4 py-4 text-small text-ink-muted sm:px-6">Nobody has anything open this week.</p>
      ) : (
        <ul className="divide-y divide-line">
          {people.map(({ p, week }) => (
            <li key={p.id}>
              <Link href={`/tasks?assignee=${encodeURIComponent(p.id)}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-sunken/50 sm:px-6">
                <Avatar initials={initialsOf(p)} size="sm" />
                <span className="min-w-0 flex-1 truncate text-small font-medium text-ink">
                  {fullName(p)}
                  {p.id === me && <span className="font-normal text-ink-muted"> (you)</span>}
                </span>
                <span className="font-mono text-small tabular-nums text-ink">{week}</span>
                <span className="text-label text-ink-muted">open</span>
                <Icon name="chevronRight" size={14} className="text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const { openTasks, openPositions, coverageForEvent, tasksForEvent, messageList } = useStore()
  const { venue } = useDirectory()
  const { needsYou } = useCoupleUpdates()

  // Overdue first, then by due date and time, so the oldest problem leads.
  const sorted = sortTasks(openTasks, 'due', 'asc')
  const urgent = sorted.filter((a) => a.tone === 'urgent')
  const soon = sorted.filter((a) => a.tone !== 'urgent')
  const spots = openPositions.reduce((n, p) => n + p.short, 0)
  const unreplied = messageList.filter((m) => m.needsReply && !m.replied).length
  const upcoming = events.slice(0, 3)
  const firstName = (venue.manager || sampleVenue.manager || '').split(' ')[0]

  return (
    <div>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        lead={`Here’s what needs you at ${venue.name} today, ${sampleVenue.today}.`}
      />

      {/* ---- First visit: Vue in three steps, until "Got it" ---- */}
      <FirstSteps />

      {/* ---- Where to start: counts of real work, each the way in ---- */}
      <section aria-label="Where to start" className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StartTile
          href="#from-couples"
          icon="heart"
          count={needsYou.length}
          label="Couples waiting on you"
          sub={needsYou.length ? 'Review their requests' : 'See updates'}
          urgent={needsYou.length > 0}
        />
        <StartTile href="/staffing" icon="users" count={spots} label="Open staff spots" sub="Fill them" urgent={spots > 0} />
        <StartTile href="/messages" icon="mail" count={unreplied} label="Messages to answer" sub={unreplied ? 'Reply' : 'Open Messages'} />
        <StartTile href="/tasks/team" icon="team" count={openTasks.length} label="Open to-dos" sub="See who has what" />
      </section>

      <div className="grid grid-cols-1 gap-6 *:min-w-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <FromCouples />

          {/* ---- Tasks: the first five, each button saying what it does ---- */}
          {openTasks.length === 0 ? (
            <EmptyState title="All caught up" body="Nothing needs you right now. Every event is fully staffed." />
          ) : (
            <Card
              title="Do these first"
              icon="inbox"
              subtitle={urgent.length ? `${urgent.length} due today or overdue` : `${openTasks.length} coming up`}
              action={
                <Link href="/tasks" className={LINK}>
                  All {openTasks.length} tasks
                </Link>
              }
              bodyClassName="px-0 py-0"
            >
              <div className="divide-y divide-line">
                {urgent.slice(0, 3).map((item, i) => (
                  <TaskRow key={item.id} task={item} badge compact first={i === 0} />
                ))}
                {soon.slice(0, Math.max(0, 5 - Math.min(3, urgent.length))).map((item, i) => (
                  <TaskRow key={item.id} task={item} badge compact first={urgent.length === 0 && i === 0} />
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <TeamThisWeek />

          <section>
            <div className="mb-3 flex items-end justify-between gap-2">
              <h2 className="text-heading font-medium text-ink">Upcoming events</h2>
              <Link href="/events" className={LINK}>
                All events
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} coverage={coverageForEvent(event.id)} taskCount={tasksForEvent(event.id).length} />
              ))}
            </div>
          </section>

          <Card
            title="Staffing"
            icon="users"
            action={
              <Link href="/staffing" className={LINK}>
                Staffing Planner
              </Link>
            }
            bodyClassName="px-0 py-0"
          >
            {events.map((event) => {
              const cov = coverageForEvent(event.id)
              return (
                <ListRow
                  key={event.id}
                  href={`/staffing/${event.id}`}
                  title={event.name}
                  sub={`${cov.filled} of ${cov.required} spots confirmed${cov.pending > 0 ? ` · ${cov.pending} waiting` : ''}`}
                  trailing={
                    cov.complete ? (
                      <StatusBadge tone="done" size="sm">
                        Fully staffed
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="urgent" size="sm">
                        {openSpots(cov.short)}
                      </StatusBadge>
                    )
                  }
                />
              )
            })}
          </Card>
        </div>
      </div>
    </div>
  )
}
