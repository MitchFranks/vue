'use client'

// SCREEN 5 — Event Overview. The summary that points at every other tab.

import { use } from 'react'
import Link from 'next/link'
import { useStore, hourLabel } from '@/lib/store'
import { eventById } from '@/lib/mock/events'
import { money, payments, timelines } from '@/lib/mock/records'
import { Button, Card, Icon, StatusBadge } from '@/components/ui/primitives'
import { UpNextItem } from '@/components/ui/domain'

export default function EventOverviewPage({ params }) {
  const { id } = use(params)
  const event = eventById(id)
  const { attentionForEvent, coverageForEvent, taskList, messageList, documentList } = useStore()

  const attention = attentionForEvent(id)
  const coverage = coverageForEvent(id)
  const tasks = taskList.filter((t) => t.eventId === id)
  const openTasks = tasks.filter((t) => !t.done)
  const pay = payments[id]
  const timeline = timelines[id] || []
  const docs = documentList.filter((d) => d.eventId === id)
  const msgs = messageList.filter((m) => m.eventId === id)

  return (
    <div className="space-y-4">
      {attention.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-urgent">
            <Icon name="alert" size={15} />
            Up next on this event ({attention.length})
          </h2>
          <div className="overflow-hidden rounded-box border border-line">
            {attention.map((item) => (
              <UpNextItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Staffing"
          icon="users"
          subtitle={`${coverage.filled} of ${coverage.required} roles confirmed`}
          tone={coverage.complete ? undefined : 'urgent'}
          action={<Button href={`/events/${id}/staffing`} size="sm" variant="secondary">Open</Button>}
        >
          <div className="space-y-2">
            {event.blocks.map((block) => {
              const need = block.requirements.reduce((n, x) => n + x.count, 0)
              return (
                <div key={block.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink-2">
                    {block.name}{' '}
                    <span className="text-xs text-faint">
                      {hourLabel(block.start)}–{hourLabel(block.end)}
                    </span>
                  </span>
                  <span className="text-xs text-muted">{need} needed</span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 border-t border-line-soft pt-2">
            {coverage.complete ? (
              <StatusBadge tone="done">Every timeline block is staffed</StatusBadge>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="warn">Needs {coverage.short} more</StatusBadge>
                <Link href={`/staffing/${id}`} className="text-xs text-accent underline-offset-2 hover:underline">
                  View open positions
                </Link>
              </div>
            )}
          </div>
        </Card>

        <Card
          title="Tasks"
          icon="check"
          subtitle={`${openTasks.length} open · ${tasks.length - openTasks.length} complete`}
          action={<Button href={`/events/${id}/tasks`} size="sm" variant="secondary">Open</Button>}
        >
          {tasks.length === 0 ? (
            <p className="text-sm text-muted">No tasks on this event yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {tasks.slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-start gap-2 text-sm">
                  <Icon
                    name={t.done ? 'check' : 'dash'}
                    size={14}
                    className={t.done ? 'mt-1 text-done' : 'mt-1 text-faint'}
                  />
                  <span className={t.done ? 'text-muted line-through' : 'text-ink-2'}>{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {pay && (
          <Card
            title="Payments"
            icon="dollar"
            subtitle={`${money(pay.paid)} of ${money(pay.total)} collected`}
            action={<Button href={`/events/${id}/payments`} size="sm" variant="secondary">Open</Button>}
          >
            <div className="h-2 w-full overflow-hidden rounded-pill border border-line bg-wash-deep">
              <div className="h-full bg-done" style={{ width: `${(pay.paid / pay.total) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink-2">
              Outstanding: <strong>{money(pay.total - pay.paid)}</strong>
            </p>
          </Card>
        )}

        <Card
          title="Run of show"
          icon="clock"
          subtitle={`${timeline.length} entries`}
          action={<Button href={`/events/${id}/timeline`} size="sm" variant="secondary">Open</Button>}
        >
          <ul className="space-y-1.5">
            {timeline.slice(0, 4).map((t) => (
              <li key={t.id} className="flex gap-2 text-sm">
                <span className="w-20 shrink-0 text-xs font-medium text-ink-2">{t.time}</span>
                <span className="text-ink-2">{t.title}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Messages"
          icon="mail"
          subtitle={`${msgs.length} filed to this event`}
          action={<Button href={`/events/${id}/messages`} size="sm" variant="secondary">Open</Button>}
        >
          {msgs.length === 0 ? (
            <p className="text-sm text-muted">Nothing filed yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {msgs.slice(0, 3).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <Link href={`/messages/${m.id}`} className="truncate text-ink-2 hover:text-accent">
                    {m.from}: {m.subject}
                  </Link>
                  {m.needsReply && !m.replied && <StatusBadge tone="urgent" size="sm">Reply</StatusBadge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Documents"
          icon="file"
          subtitle={`${docs.length} files`}
          action={<Button href={`/events/${id}/documents`} size="sm" variant="secondary">Open</Button>}
        >
          <ul className="space-y-1.5 text-sm">
            {docs.slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-ink-2">{d.name}</span>
                <StatusBadge tone={d.tone} size="sm">
                  {d.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
