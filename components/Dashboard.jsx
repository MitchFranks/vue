'use client'

// ---------------------------------------------------------------------------
// SCREEN 1 — Venue dashboard.
// Job: in a few seconds, say what is happening at the venue and what needs the
// manager's attention — without making that feel like being shouted at.
//
// The page opens on a photographic welcome band that states the one number
// that matters, and both lists below it are single lines that open on click.
// The closed state still carries enough to triage — status, title, which event
// — so opening a row is for acting, not for finding out what it is.
// ---------------------------------------------------------------------------

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Collapsible, DisclosureRow, Icon, Pill } from './ui'
import { cx } from '@/lib/cx'
import { asset } from '@/lib/asset'
import { usePrototype } from '@/lib/prototype'
import { events, recentActivity, todaySchedule, venue, venueStats } from '@/lib/data'

const EVENT_HREF = '/events/johnson'
const MESSAGE_HREF = '/events/johnson/messages/decor-time'

export function Dashboard() {
  const { attention, eventAttention } = usePrototype()
  const attentionRef = useRef(null)
  const open = attention.filter((item) => !item.resolved)
  const resolved = attention.filter((item) => item.resolved)
  const eventsWithAttention = new Set(open.map((item) => item.eventId)).size

  function jumpToQueue() {
    attentionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {/* ------------------------- WELCOME BAND --------------------------
          Same treatment as the landing screen — flat dusk overlay, centred
          light-serif headline — so the two heroes read as siblings. The
          headline states what the product IS; the personal status line is a
          quiet byline underneath it. */}
      <section className="on-photo relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl bg-night text-center text-cream shadow-lift">
        <img className="absolute inset-0 h-full w-full object-cover" src={asset('/images/hero-reception.jpg')} alt="" />
        {/* A touch heavier than the landing's overlay — this photograph is busier. */}
        <div className="absolute inset-0 bg-night/60" aria-hidden="true" />
        <div className="relative max-w-[760px] px-5 py-7 md:px-8 md:pt-11 md:pb-[34px]">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-parchment">
            {venue.name} · Venue operations
          </p>
          <h1 className="mx-auto mt-3.5 max-w-[16ch] font-display text-[34px] font-light leading-[1.08] md:text-[42px] lg:text-[50px]">
            Know what needs your attention across every event.
          </h1>
          <p className="mx-auto mt-4 max-w-[54ch] text-sm leading-relaxed text-cream/82 md:text-[15.5px]">
            One place to run every wedding and event you are hosting — timeline, vendors, staff, payments, contracts
            and client email — instead of switching between five separate systems.
          </p>
          <div className="mt-[26px] flex flex-wrap items-center justify-center gap-3">
            <Button variant="cream" size="lg" onClick={jumpToQueue}>
              See what needs attention
              <Icon name="arrowRight" size={15} />
            </Button>
            <Pill tone="onDark" icon="circle">
              Alvarez &amp; Reed on site today
            </Pill>
          </div>
          <p className="mx-auto mt-[22px] max-w-[54ch] border-t border-parchment/22 pt-3.5 text-[11px] uppercase tracking-[0.12em] text-parchment">
            Signed in as {venue.manager}, {venue.managerRole} · {venue.today}
          </p>
        </div>
      </section>

      {/* --------------------------- HOW IT WORKS -------------------------
          Three cards that double as the product explanation and as the main
          navigation. Someone who reads nothing else still learns the shape of
          the product in about five seconds, and each card is the way into the
          screen it describes. */}
      <section className="grid gap-3.5 lg:grid-cols-3" aria-label="What this does">
        <Step
          n="1"
          title="See what needs attention"
          text={`${open.length} open ${open.length === 1 ? 'item' : 'items'} across ${eventsWithAttention} events, sorted by what is due first.`}
          cta="Jump to the queue"
          onClick={jumpToQueue}
        />
        <Step
          n="2"
          title="Open one event, see everything"
          text="Timeline, tasks, vendors, staff, payments, documents and client email on a single event."
          cta="Open the Johnson Wedding"
          href={EVENT_HREF}
        />
        <Step
          n="3"
          title="Act without leaving"
          text="Reply to a client with a draft written from the event's own data. You review and send it."
          cta="Open the bride's message"
          href={MESSAGE_HREF}
        />
      </section>

      {/* ---------------------- NEEDS ATTENTION --------------------------
          The loudest region in the product. */}
      <section
        className="scroll-mt-20 rounded-xl border border-urgent-line bg-linear-to-b from-[#fdf6f3] to-surface to-[58%] px-[22px] pt-[22px] pb-2.5 shadow-attention"
        ref={attentionRef}
      >
        <header className="flex items-start justify-between gap-4 pb-3.5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.01em] text-urgent">
              <Icon name="alert" size={20} />
              Needs attention
            </h2>
            <p className="mt-[3px] text-[13px] text-muted">Sorted by what is due first. Open a row to act on it.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-urgent-line bg-surface px-2.5 py-[5px] text-xs font-semibold whitespace-nowrap text-urgent">
            {open.length} open
            {resolved.length > 0 && <span className="border-l border-line pl-2 text-ok">{resolved.length} resolved</span>}
          </span>
        </header>

        <ul className="flex flex-col">
          {open.map((item, i) => (
            <AttentionRow key={item.id} item={item} defaultOpen={i === 0} />
          ))}
          {resolved.map((item) => (
            <AttentionRow key={item.id} item={item} resolved />
          ))}
        </ul>
      </section>

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="flex flex-col gap-4">
          <Card title="Upcoming events" icon="calendar" subtitle="Next five bookings · open a row for detail">
            <ul className="flex flex-col">
              {events.map((event) => (
                <EventRow key={event.id} event={event} attention={eventAttention[event.id] ?? event.attention} />
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="At a glance" icon="circle" subtitle="This month">
            <ul className="flex flex-col pt-1">
              {venueStats.map((stat) => {
                const isAttention = stat.tone === 'attention'
                return (
                  <li
                    className="flex items-baseline justify-between gap-3 border-t border-line-soft py-[9px] first:border-t-0"
                    key={stat.label}
                  >
                    <span className={cx('text-[12.5px]', isAttention ? 'font-medium text-urgent' : 'text-muted')}>
                      {stat.label}
                    </span>
                    <span
                      className={cx(
                        'flex items-baseline gap-2 text-[15px] font-semibold whitespace-nowrap',
                        isAttention && 'text-urgent'
                      )}
                    >
                      {isAttention ? open.length : stat.value}
                      <span className="text-[11px] font-normal text-faint">
                        {isAttention ? `across ${eventsWithAttention} events` : stat.note}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Collapsible title="Today's schedule" icon="clock" badge={`${todaySchedule.length} items`} defaultOpen>
            <ol className="flex flex-col">
              {todaySchedule.map((slot) => (
                <li
                  key={slot.time}
                  className="grid grid-cols-[60px_12px_minmax(0,1fr)_auto] items-start gap-2.5 border-t border-line-soft py-[11px] first:border-t-0"
                >
                  <span className="pt-px text-xs font-semibold text-ink-2">{slot.time}</span>
                  <span
                    className={cx(
                      'mt-[5px] h-2 w-2 justify-self-center rounded-full',
                      slot.state === 'done' && 'bg-ok-line',
                      slot.state === 'now' && 'bg-bark ring-[3px] ring-parchment',
                      slot.state === 'upcoming' && 'bg-line'
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex min-w-0 flex-col gap-px">
                    <span className={cx('text-[13px]', slot.state === 'done' ? 'text-muted' : 'font-medium')}>
                      {slot.title}
                    </span>
                    <span className="text-[11.5px] text-faint">{slot.detail}</span>
                  </span>
                  {slot.state === 'now' && <Pill tone="live">Now</Pill>}
                </li>
              ))}
            </ol>
          </Collapsible>

          <Collapsible title="Recent activity" icon="clock" badge={`${recentActivity.length} updates`}>
            <ul className="flex flex-col">
              {recentActivity.map((entry, i) => (
                <li className="flex gap-[11px] border-t border-line-soft py-[11px] first:border-t-0" key={i}>
                  <span
                    className={cx(
                      'grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border',
                      entry.unread ? 'border-urgent-line bg-urgent-soft text-urgent' : 'border-line bg-surface-2 text-muted'
                    )}
                  >
                    <Icon name={entry.icon} size={14} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-px">
                    <span className="text-[12.5px]">{entry.text}</span>
                    <span className="text-[11.5px] text-faint">
                      {entry.event} · {entry.when}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

// One of the three "how it works" cards. The whole card is the control, and it
// carries an explicit labelled action so the affordance is visible at rest.
function Step({ n, title, text, cta, href, onClick }) {
  const className =
    'group flex flex-col items-start gap-1.5 rounded-xl border border-line bg-surface p-4 text-left shadow-card ' +
    'transition-[border-color,box-shadow,transform] hover:border-parchment-line hover:shadow-lift active:translate-y-px md:px-[18px] md:pt-[18px]'
  const inner = (
    <>
      <span
        className="mb-1 grid h-[25px] w-[25px] place-items-center rounded-full border border-parchment-line bg-parchment text-xs font-bold text-night"
        aria-hidden="true"
      >
        {n}
      </span>
      <span className="text-[14.5px] font-semibold tracking-[-0.01em]">{title}</span>
      <span className="flex-1 text-[12.5px] leading-relaxed text-muted">{text}</span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-bark">
        {cta}
        <Icon name="arrowRight" size={13} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </>
  )
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  )
}

const FLAG_TONE = {
  urgent: 'bg-urgent',
  warning: 'bg-warn',
  resolved: 'bg-ok-line'
}

function AttentionRow({ item, resolved, defaultOpen }) {
  const isJohnson = item.eventId === 'johnson'
  const href = item.id === 'decor-time' ? MESSAGE_HREF : EVENT_HREF

  const summary = (
    <>
      <span className={cx('h-7 w-[3px] shrink-0 rounded-sm', FLAG_TONE[resolved ? 'resolved' : item.tone])} aria-hidden="true" />
      {resolved ? (
        <Pill tone="ok" icon="check">
          Resolved
        </Pill>
      ) : (
        <Pill tone={item.tone === 'urgent' ? 'urgent' : 'warning'}>{item.priority}</Pill>
      )}
      <span
        className={cx(
          'min-w-0 flex-1 basis-full text-sm tracking-[-0.01em] md:basis-auto',
          resolved ? 'font-medium text-muted' : 'font-semibold'
        )}
      >
        {item.title}
      </span>
      <span className="shrink-0 rounded-[5px] border border-line-soft bg-surface px-2 py-0.5 text-[11.5px] whitespace-nowrap text-muted">
        {item.event}
      </span>
    </>
  )

  return (
    <DisclosureRow summary={summary} defaultOpen={defaultOpen}>
      <p className="text-[13px] leading-[1.55] text-ink-2">
        {resolved ? 'Reply sent to Emily Johnson. Timeline updated.' : item.detail}
      </p>
      <p className="mt-1 text-[11.5px] text-faint">{item.meta}</p>
      <div className="mt-[13px]">
        {resolved ? (
          <Button variant="secondary" size="sm" href={href}>
            View sent reply
          </Button>
        ) : isJohnson ? (
          <Button variant={item.id === 'decor-time' ? 'primary' : 'secondary'} size="sm" href={href}>
            {item.action}
            <Icon name="arrowRight" size={13} />
          </Button>
        ) : (
          // NO FALSE AFFORDANCE: only flows that exist in this prototype get an
          // enabled button; the rest are visibly disabled and say why.
          <Button variant="secondary" size="sm" disabled title="Only the Johnson Wedding is built out in this prototype">
            {item.action}
            <Icon name="arrowRight" size={13} />
          </Button>
        )}
      </div>
    </DisclosureRow>
  )
}

// Two sibling controls rather than one: the row body expands for detail, and
// the link navigates. Nesting a control inside a control is invalid HTML and
// makes the target ambiguous anyway.
function EventRow({ event, attention }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="border-t border-line-soft first:border-t-0">
      <div className="flex flex-wrap items-center gap-2.5 py-[5px]">
        <button
          type="button"
          className="grid min-w-0 flex-1 grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-[3px] rounded-lg px-2 py-[11px] text-left transition-colors hover:bg-surface-2 md:flex md:gap-3.5"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <Icon
            name="chevronRight"
            size={15}
            className={cx('row-span-2 transition-transform duration-200', open ? 'rotate-90 text-ink-2' : 'text-faint')}
          />
          <span className="col-start-2 row-start-2 flex gap-1.5 md:w-[170px] md:shrink-0 md:flex-col md:gap-0">
            <span className="text-[12.5px] font-semibold text-ink-2">{event.dateLabel}</span>
            <span className="text-[11.5px] text-faint">{event.timeLabel}</span>
          </span>
          <span className="col-start-2 row-start-1 flex min-w-0 flex-1 flex-col text-sm font-semibold tracking-[-0.01em]">
            {event.name}
            <span className="text-xs font-normal text-muted">{event.clients}</span>
          </span>
          <span className="col-start-3 row-span-2">
            {attention > 0 ? (
              <Pill tone="urgent" icon="alert">
                {attention}
              </Pill>
            ) : (
              <Pill tone="ok" icon="check">
                On track
              </Pill>
            )}
          </span>
        </button>

        {event.clickable && (
          <Button variant="primary" size="sm" href={EVENT_HREF} className="mx-2 mb-2.5 w-full md:m-0 md:w-auto">
            Open workspace
            <Icon name="arrowRight" size={13} />
          </Button>
        )}
      </div>

      {open && (
        <div className="animate-panel-in px-2 pb-4 md:pl-[37px]">
          <dl className="grid grid-cols-2 gap-3.5 rounded-lg border border-line-soft bg-surface-2 px-4 py-3.5 md:grid-cols-4">
            <MiniFact label="Guests" value={event.guests} />
            <MiniFact label="Spaces" value={event.space} />
            <MiniFact label="Status" value={event.status} />
            <MiniFact label="Open tasks" value={event.openTasks} />
          </dl>
          {!event.clickable && (
            <p className="mt-[9px] text-[11.5px] text-faint">Only the Johnson Wedding is built out in this prototype.</p>
          )}
        </div>
      )}
    </li>
  )
}

function MiniFact({ label, value }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-faint">{label}</dt>
      <dd className="mt-[3px] text-[13px] font-medium">{value}</dd>
    </div>
  )
}
