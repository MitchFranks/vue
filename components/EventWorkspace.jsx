'use client'

// ---------------------------------------------------------------------------
// SCREEN 2 — Johnson Wedding workspace.
// Job: the entire status of one event, without opening anything else.
//
// The page pins only what is true of the event no matter what you came to do
// — who/when/where, and what needs attention — and files the rest behind
// tabs. Nothing is hidden for good: each tab carries a count so the content
// behind it still announces itself.
//
// GROUPING: three fixed bands, then one tabbed region.
//   1. Identity        (banner, name, the four constant facts)
//   2. Needs attention (tinted, above the fold, same language as the dashboard)
//   3. Detail          (tabbed: timeline / tasks / vendors & staff / payments /
//                       client / documents / messages)
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Avatar, BackLink, Button, Field, Icon, PanelHead, Pill, Row, TabPanel, Tabs } from './ui'
import { cx } from '@/lib/cx'
import { asset } from '@/lib/asset'
import { usePrototype } from '@/lib/prototype'
import { johnson } from '@/lib/data'

const MESSAGE_HREF = '/events/johnson/messages/decor-time'

export function EventWorkspace() {
  const { johnsonAttention: attention, replySent } = usePrototype()
  const [tab, setTab] = useState('timeline')
  const open = attention.filter((item) => !item.resolved)
  const resolved = attention.filter((item) => item.resolved)
  const e = johnson

  const openTasks = e.tasks.filter((t) => t.open && !(replySent && t.id === 'decor-time')).length
  const unread = e.messages.filter((m) => m.needsReply && !replySent).length

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: 'clock' },
    { id: 'tasks', label: 'Tasks', icon: 'check', count: openTasks, tone: openTasks > 0 ? 'urgent' : 'ok' },
    { id: 'team', label: 'Vendors & staff', icon: 'link', count: e.vendors.length },
    { id: 'payments', label: 'Payments', icon: 'dollar' },
    { id: 'client', label: 'Client', icon: 'users', count: e.contacts.length },
    { id: 'documents', label: 'Documents', icon: 'file', count: e.documents.length },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'mail',
      count: unread > 0 ? unread : e.messages.length,
      tone: unread > 0 ? 'urgent' : undefined
    }
  ]

  return (
    <div className="flex flex-col gap-[22px]">
      {/* ------------------------- IDENTITY BAND ------------------------- */}
      <section className="on-photo relative flex min-h-[226px] items-end overflow-hidden rounded-2xl md:min-h-[262px]">
        <img className="absolute inset-0 h-full w-full object-cover" src={asset('/images/event-estate.jpg')} alt="" />
        {/* Angled scrim: dense where the words are, clear where the picture is.
            On narrow screens it becomes vertical so the crop never eats the text. */}
        <div
          className="absolute inset-0 bg-linear-to-b from-night/55 to-night/92 to-[68%] md:bg-linear-100 md:from-night/92 md:via-night/78 md:via-40% md:to-night/14"
          aria-hidden="true"
        />
        <div className="relative max-w-full p-[18px] text-cream md:max-w-[62%] md:px-[30px] md:py-7">
          <BackLink href="/dashboard" onDark>
            All events
          </BackLink>
          <h1 className="mt-2.5 font-display text-[30px] font-medium leading-[1.08] md:text-[40px]">{e.name}</h1>
          <p className="mt-1 text-[13.5px] text-cream/84">
            {e.clients ?? 'Emily & Marcus Johnson'} · {e.package}
          </p>
          <div className="mt-[13px]">
            {open.length > 0 ? (
              <Pill tone="urgent" icon="alert">
                {open.length} need{open.length === 1 ? 's' : ''} attention
              </Pill>
            ) : (
              <Pill tone="ok" icon="check">
                All clear
              </Pill>
            )}
          </div>
        </div>
      </section>

      {/* Hairline dividers are the grid gap showing through, so they fall in
          the right place at every column count. */}
      <section className="grid gap-px overflow-hidden rounded-xl border border-line bg-line-soft shadow-card sm:grid-cols-2 xl:grid-cols-4">
        <Fact icon="calendar" label="Date" value={e.date} note={e.countdown} />
        <Fact icon="clock" label="Ceremony" value={e.ceremony} note="Guest arrival 3:30 PM" />
        <Fact icon="users" label="Guest count" value={`${e.guests} confirmed`} note="Final count due Sep 14" />
        <Fact icon="pin" label="Spaces" value="Garden Terrace" note="Reception in Stone Hall" />
      </section>

      {/* ------------------------ ATTENTION BAND ------------------------- */}
      <section className="rounded-xl border border-urgent-line bg-linear-to-b from-[#fdf6f3] to-surface to-[58%] px-[18px] pt-[18px] pb-[18px] shadow-lift">
        <header className="flex items-start justify-between gap-4 pb-3.5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.01em] text-urgent">
              <Icon name="alert" size={20} />
              Needs your attention
            </h2>
            <p className="mt-[3px] text-[12.5px] text-muted">
              {open.length > 0
                ? `${open.length} ${open.length === 1 ? 'thing stands' : 'things stand'} between this event and ready.`
                : 'Nothing outstanding — this event is ready.'}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-urgent-line bg-surface px-2.5 py-[5px] text-xs font-semibold whitespace-nowrap text-urgent">
            {open.length} open
            {resolved.length > 0 && <span className="border-l border-line pl-2 text-ok">{resolved.length} resolved</span>}
          </span>
        </header>

        <div className="grid gap-3 xl:grid-cols-3">
          {attention.map((item) => (
            <article
              key={item.id}
              className={cx(
                'flex flex-col gap-[7px] rounded-lg border border-line border-t-[3px] p-3.5',
                item.resolved ? 'border-t-ok-line bg-surface-2' : 'bg-surface',
                !item.resolved && item.tone === 'urgent' && 'border-t-urgent',
                !item.resolved && item.tone === 'warning' && 'border-t-warn'
              )}
            >
              <header>
                {item.resolved ? (
                  <Pill tone="ok" icon="check">
                    Resolved
                  </Pill>
                ) : (
                  <Pill tone={item.tone === 'urgent' ? 'urgent' : 'warning'}>{item.priority}</Pill>
                )}
              </header>
              <h3 className={cx('text-sm font-semibold leading-[1.35] tracking-[-0.01em]', item.resolved && 'text-muted')}>
                {item.title}
              </h3>
              <p className="flex-1 text-[12.5px] text-muted">
                {item.resolved ? 'Reply sent to Emily Johnson and the timeline has been updated.' : item.detail}
              </p>
              <footer className="mt-1">
                {item.id === 'decor-time' ? (
                  <Button variant={item.resolved ? 'quiet' : 'primary'} href={MESSAGE_HREF}>
                    <Icon name="mail" size={14} />
                    {item.resolved ? 'View sent reply' : 'Open message & reply'}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setTab(item.id === 'balance' ? 'payments' : 'team')}>
                    {item.id === 'balance' ? 'View payments' : 'View vendor'}
                    <Icon name="arrowRight" size={13} />
                  </Button>
                )}
              </footer>
            </article>
          ))}
        </div>
      </section>

      {/* -------------------------- DETAIL BAND -------------------------- */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <Tabs tabs={tabs} active={tab} onChange={setTab} label="Event details" />

        <div className="px-[18px] pt-0.5 pb-[18px]">
          <TabPanel id="timeline" active={tab}>
            <PanelHead title="Day-of timeline" meta={replySent ? 'Updated just now' : 'Draft v2 · awaiting client sign-off'} />
            <ol className="flex flex-col pt-1.5">
              {e.timeline.map((slot, i) => {
                const flagged = slot.flagged && !replySent
                const first = i === 0
                const last = i === e.timeline.length - 1
                return (
                  <li
                    key={slot.time}
                    className={cx(
                      'relative grid grid-cols-[68px_14px_minmax(0,1fr)] gap-3 rounded-lg px-2.5 py-[9px]',
                      flagged && 'bg-urgent-soft'
                    )}
                  >
                    <span className="pt-px text-xs font-semibold text-ink-2">{slot.time}</span>
                    <span className="relative flex justify-center" aria-hidden="true">
                      <span
                        className={cx(
                          'absolute w-px bg-line',
                          first ? 'top-2' : '-top-3',
                          last ? 'bottom-[calc(100%-8px)]' : '-bottom-3'
                        )}
                      />
                      <span
                        className={cx(
                          'relative mt-[5px] h-[7px] w-[7px] rounded-full border-2',
                          flagged ? 'border-urgent bg-urgent' : 'border-line bg-surface'
                        )}
                      />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                        {slot.title}
                        {flagged && <Pill tone="urgent">Change requested</Pill>}
                        {slot.flagged && replySent && (
                          <Pill tone="ok" icon="check">
                            Confirmed 9:00 AM
                          </Pill>
                        )}
                      </span>
                      <span className={cx('text-[11.5px]', flagged ? 'text-urgent' : 'text-faint')}>
                        {slot.flagged && replySent
                          ? 'Moved from 10:00 AM at the client’s request. Vendors notified.'
                          : slot.detail}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </TabPanel>

          <TabPanel id="tasks" active={tab}>
            <PanelHead
              title="Tasks"
              meta={`${openTasks} open · ${e.tasks.filter((t) => !t.open).length + (replySent ? 1 : 0)} complete`}
            />
            <ul className="flex flex-col pt-1">
              {e.tasks.map((task) => {
                const done = !task.open || (replySent && task.id === 'decor-time')
                const flagged = task.flagged && !done
                return (
                  <li
                    key={task.id}
                    className={cx(
                      'grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-[11px] rounded-lg border-t border-line-soft px-2.5 py-2.5 first:border-t-0',
                      flagged && 'bg-urgent-soft'
                    )}
                  >
                    <span
                      className={cx(
                        'grid h-[17px] w-[17px] place-items-center rounded-[5px] border-[1.5px]',
                        done ? 'border-ok bg-ok text-cream' : flagged ? 'border-urgent text-transparent' : 'border-line text-transparent'
                      )}
                      aria-hidden="true"
                    >
                      {done && <Icon name="check" size={12} />}
                    </span>
                    <span
                      className={cx(
                        'text-[13px]',
                        done && 'text-muted line-through decoration-line',
                        flagged && 'font-medium'
                      )}
                    >
                      {task.label}
                    </span>
                    <span className={cx('text-[11.5px]', flagged ? 'font-medium text-urgent' : 'text-faint')}>
                      {done && task.open ? 'Completed just now' : task.due}
                    </span>
                  </li>
                )
              })}
            </ul>
          </TabPanel>

          <TabPanel id="team" active={tab}>
            <div className="grid items-start gap-4 lg:grid-cols-2">
              <div>
                <PanelHead title="Vendors" meta={`${e.vendors.length} booked`} />
                <ul className="flex flex-col">
                  {e.vendors.map((v) => (
                    <Row key={v.name} title={v.name} sub={`${v.role} · ${v.contact}`} note={v.note}>
                      <Pill tone={v.tone === 'attention' ? 'warning' : 'ok'} icon={v.tone === 'attention' ? 'alert' : 'check'}>
                        {v.state}
                      </Pill>
                    </Row>
                  ))}
                </ul>
              </div>

              <div>
                <PanelHead title="Staff" meta="8 scheduled · published Sep 8" />
                <ul className="flex flex-col">
                  {e.staff.map((s) => (
                    <Row key={s.name} tight leading={<Avatar initials={s.initials} size="sm" />} title={s.name} sub={s.role}>
                      <span className="text-xs font-medium text-ink-2">{s.time}</span>
                    </Row>
                  ))}
                </ul>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="payments" active={tab}>
            <PanelHead title="Payments" meta={`${e.payments.percent}% of contract collected`} />
            <div className="pt-2">
              <dl className="mb-3 grid grid-cols-3 gap-2.5">
                <Field label="Contract total" value={e.payments.total} />
                <Field label="Paid to date" value={e.payments.paid} />
                <Field label="Remaining">
                  <span className="text-warn">{e.payments.remaining}</span>
                </Field>
              </dl>
              <div className="h-[7px] overflow-hidden rounded-full bg-line-soft" role="img" aria-label={`${e.payments.percent}% collected`}>
                <span className="block h-full rounded-full bg-bark" style={{ width: `${e.payments.percent}%` }} />
              </div>
              <p className="mt-[9px] flex items-center gap-1.5 text-xs font-medium text-warn">
                <Icon name="alert" size={13} />
                {e.payments.dueLabel}
              </p>
              <ul className="mt-2.5 flex flex-col border-t border-line-soft">
                {e.payments.schedule.map((p) => {
                  const due = p.state === 'due'
                  return (
                    <li
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-line-soft py-[9px] last:border-b-0"
                      key={p.label}
                    >
                      <span className="text-[12.5px] font-medium">{p.label}</span>
                      <span className={cx('col-start-1 text-[11.5px]', due ? 'font-semibold text-warn' : 'text-faint')}>{p.when}</span>
                      <span
                        className={cx(
                          'col-start-2 row-span-2 row-start-1 self-center text-[13px] font-semibold',
                          due ? 'text-warn' : 'text-ink-2'
                        )}
                      >
                        {p.amount}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </TabPanel>

          <TabPanel id="client" active={tab}>
            <PanelHead title="Client & contacts" meta={`${e.contacts.length} people`} />
            <ul className="flex flex-col">
              {e.contacts.map((c) => (
                <Contact key={c.email} contact={c} showEmail />
              ))}
            </ul>
          </TabPanel>

          <TabPanel id="documents" active={tab}>
            <PanelHead title="Documents & contracts" meta={`${e.documents.length} files`} />
            <ul className="flex flex-col">
              {e.documents.map((d) => (
                <Row
                  key={d.name}
                  tight
                  leading={
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[7px] border border-line bg-surface-2 text-muted">
                      <Icon name="file" size={15} />
                    </span>
                  }
                  title={d.name}
                  sub={d.meta}
                >
                  <Pill tone={d.tone === 'attention' ? 'warning' : 'ok'}>{d.state}</Pill>
                </Row>
              ))}
            </ul>
          </TabPanel>

          <TabPanel id="messages" active={tab}>
            <PanelHead title="Recent communication" meta="Automatically filed to this event" />
            <ul className="flex flex-col">
              {e.messages.map((m, i) => {
                const needsReply = m.needsReply && !replySent
                const isThread = m.id === 'decor-time'
                return (
                  <li
                    key={i}
                    className={cx(
                      'flex gap-[11px] border-t border-line-soft py-3 first:border-t-0',
                      needsReply && 'my-1 rounded-lg border-t-transparent bg-urgent-soft p-3'
                    )}
                  >
                    <Avatar initials={m.initials} size="sm" tone={needsReply ? 'attention' : 'neutral'} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-baseline justify-between gap-2.5">
                        <span className="text-[12.5px] font-semibold">{m.from}</span>
                        <span className="text-[11px] whitespace-nowrap text-faint">{m.when}</span>
                      </span>
                      <span className="text-[12.5px] font-medium text-ink-2">{m.subject}</span>
                      <span className="line-clamp-2 text-[11.5px] text-muted">{m.preview}</span>
                      {isThread && (
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          {needsReply ? (
                            <>
                              <Pill tone="urgent">Awaiting your reply</Pill>
                              <Button variant="primary" size="sm" href={MESSAGE_HREF}>
                                Open &amp; reply
                                <Icon name="arrowRight" size={13} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Pill tone="ok" icon="check">
                                Replied
                              </Pill>
                              <Button variant="quiet" size="sm" href={MESSAGE_HREF}>
                                View thread
                              </Button>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </TabPanel>
        </div>
      </section>
    </div>
  )
}

function Fact({ icon, label, value, note }) {
  return (
    <div className="flex gap-[11px] bg-surface px-[18px] py-4">
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-parchment text-bark">
        <Icon name={icon} size={16} />
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">{label}</span>
        <span className="text-sm font-semibold tracking-[-0.01em]">{value}</span>
        <span className="text-[11.5px] text-muted">{note}</span>
      </span>
    </div>
  )
}

// One person: avatar, name, role, and the lines you would use to reach them.
export function Contact({ contact: c, showEmail = false, size = 'md' }) {
  return (
    <li className="flex gap-[11px] border-t border-line-soft py-3 first:border-t-0">
      <Avatar initials={c.initials} tone={c.primary ? 'brand' : 'neutral'} size={size} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-[13.5px] font-semibold">
          {c.name}
          {showEmail && c.primary && <Pill tone="brand">Primary</Pill>}
        </span>
        <span className="text-[11.5px] text-muted">{c.role}</span>
        <span className="mt-[5px] flex flex-col gap-0.5 text-xs text-ink-2 [&_svg]:text-faint">
          {showEmail && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mail" size={12} /> {c.email}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Icon name="phone" size={12} /> {c.phone}
          </span>
        </span>
      </div>
    </li>
  )
}
