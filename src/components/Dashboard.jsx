// ---------------------------------------------------------------------------
// SCREEN 1 — Venue dashboard.
// Job: in a few seconds, say what is happening at the venue and what needs the
// manager's attention — without making that feel like being shouted at.
//
// REVISION NOTE (second pass — welcome, then disclose):
// The page used to open with five fully-written attention items and five dense
// event rows. Everything was legible but it arrived all at once, which reads as
// pressure rather than control.
//
// Now the page opens on a photographic welcome band that states the one number
// that matters, and both lists below it are single lines that open on click.
// The closed state still carries enough to triage — status, title, which event
// — so opening a row is for acting, not for finding out what it is.
// ---------------------------------------------------------------------------

import { useRef, useState } from 'react'
import { Card, Collapsible, DisclosureRow, Icon, Pill } from './ui.jsx'
import heroImage from '../assets/hero-reception.jpg'
import { events, recentActivity, todaySchedule, venue, venueStats } from '../data.js'

export function Dashboard({ attention, eventAttention, onOpenEvent, onOpenMessage }) {
  const attentionRef = useRef(null)
  const open = attention.filter((item) => !item.resolved)
  const resolved = attention.filter((item) => item.resolved)
  const eventsWithAttention = new Set(open.map((item) => item.eventId)).size

  return (
    <div className="stack-lg">
      {/* ------------------------- WELCOME BAND --------------------------
          The headline states what the product IS, not who is signed in.
          A first-time viewer used to land on "Good morning, Dana" and a queue
          of work items, which tells them nothing about what they are looking
          at. The promise now comes first; the personal status line is demoted
          to a quiet byline underneath it. */}
      <section className="phero">
        <img className="phero__img" src={heroImage} alt="" />
        <div className="phero__scrim" aria-hidden="true" />
        <div className="phero__content">
          <p className="phero__eyebrow">{venue.name} · Venue operations</p>
          <h1 className="phero__title">Know what needs your attention across every event.</h1>
          <p className="phero__lead">
            One place to run every wedding and event you are hosting — timeline, vendors, staff,
            payments, contracts and client email — instead of switching between five separate systems.
          </p>
          <div className="phero__actions">
            <button
              className="btn btn--onDark btn--lg"
              onClick={() => attentionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              See what needs attention
              <Icon name="arrowRight" size={15} />
            </button>
            <Pill tone="onDark" icon="circle">
              Alvarez &amp; Reed on site today
            </Pill>
          </div>
          <p className="phero__byline">
            Signed in as {venue.manager}, {venue.managerRole} · {venue.today}
          </p>
        </div>
      </section>

      {/* --------------------------- HOW IT WORKS -------------------------
          Three cards that double as the product explanation and as the main
          navigation. Someone who reads nothing else still learns the shape of
          the product in about five seconds, and each card is the way into the
          screen it describes. */}
      <section className="steps" aria-label="What this does">
        <Step
          n="1"
          title="See what needs attention"
          text={`${open.length} open ${open.length === 1 ? 'item' : 'items'} across ${eventsWithAttention} events, sorted by what is due first.`}
          cta="Jump to the queue"
          onClick={() => attentionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
        <Step
          n="2"
          title="Open one event, see everything"
          text="Timeline, tasks, vendors, staff, payments, documents and client email on a single event."
          cta="Open the Johnson Wedding"
          onClick={() => onOpenEvent('johnson')}
        />
        <Step
          n="3"
          title="Act without leaving"
          text="Reply to a client with a draft written from the event's own data. You review and send it."
          cta="Open the bride's message"
          onClick={onOpenMessage}
        />
      </section>

      {/* ---------------------- NEEDS ATTENTION -------------------------- */}
      <section className="attention attention--hero" ref={attentionRef}>
        <header className="attention__head">
          <div className="attention__headText">
            <h2 className="attention__title">
              <Icon name="alert" size={20} />
              Needs attention
            </h2>
            <p className="attention__sub">Sorted by what is due first. Open a row to act on it.</p>
          </div>
          <span className="attention__count">
            {open.length} open
            {resolved.length > 0 && <span className="attention__countResolved">{resolved.length} resolved</span>}
          </span>
        </header>

        <ul className="attention__list">
          {open.map((item, i) => (
            <AttentionRow
              key={item.id}
              item={item}
              defaultOpen={i === 0}
              onOpenEvent={onOpenEvent}
              onOpenMessage={onOpenMessage}
            />
          ))}
          {resolved.map((item) => (
            <AttentionRow key={item.id} item={item} resolved onOpenEvent={onOpenEvent} onOpenMessage={onOpenMessage} />
          ))}
        </ul>
      </section>

      <div className="split">
        <div className="stack">
          <Card title="Upcoming events" icon="calendar" subtitle="Next five bookings · open a row for detail">
            <ul className="eventlist">
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  attention={eventAttention[event.id] ?? event.attention}
                  onOpen={onOpenEvent}
                />
              ))}
            </ul>
          </Card>
        </div>

        <div className="stack">
          <Card title="At a glance" icon="circle" subtitle="This month">
            <ul className="glance">
              {venueStats.map((stat) => {
                const isAttention = stat.tone === 'attention'
                return (
                  <li className={`glance__row ${isAttention ? 'glance__row--attention' : ''}`} key={stat.label}>
                    <span className="glance__label">{stat.label}</span>
                    <span className="glance__value">
                      {isAttention ? open.length : stat.value}
                      <span className="glance__note">
                        {isAttention ? `across ${eventsWithAttention} events` : stat.note}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Collapsible title="Today's schedule" icon="clock" badge={`${todaySchedule.length} items`} defaultOpen>
            <ol className="daylist">
              {todaySchedule.map((slot) => (
                <li key={slot.time} className={`daylist__item daylist__item--${slot.state}`}>
                  <span className="daylist__time">{slot.time}</span>
                  <span className="daylist__marker" aria-hidden="true" />
                  <span className="daylist__text">
                    <span className="daylist__title">{slot.title}</span>
                    <span className="daylist__detail">{slot.detail}</span>
                  </span>
                  {slot.state === 'now' && <Pill tone="live">Now</Pill>}
                </li>
              ))}
            </ol>
          </Collapsible>

          <Collapsible title="Recent activity" icon="clock" badge={`${recentActivity.length} updates`}>
            <ul className="activity">
              {recentActivity.map((entry, i) => (
                <li className="activity__item" key={i}>
                  <span className={`activity__icon ${entry.unread ? 'is-unread' : ''}`}>
                    <Icon name={entry.icon} size={14} />
                  </span>
                  <span className="activity__text">
                    <span className="activity__line">{entry.text}</span>
                    <span className="activity__meta">
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
function Step({ n, title, text, cta, onClick }) {
  return (
    <button className="step" onClick={onClick}>
      <span className="step__num" aria-hidden="true">
        {n}
      </span>
      <span className="step__title">{title}</span>
      <span className="step__text">{text}</span>
      <span className="step__cta">
        {cta}
        <Icon name="arrowRight" size={13} />
      </span>
    </button>
  )
}

function AttentionRow({ item, resolved, defaultOpen, onOpenEvent, onOpenMessage }) {
  const isJohnson = item.eventId === 'johnson'
  const openTarget = item.id === 'decor-time' ? onOpenMessage : () => onOpenEvent('johnson')

  const summary = (
    <>
      <span className="aitem__flag" aria-hidden="true" />
      {resolved ? (
        <Pill tone="ok" icon="check">
          Resolved
        </Pill>
      ) : (
        <Pill tone={item.tone === 'urgent' ? 'urgent' : 'warning'}>{item.priority}</Pill>
      )}
      <span className="aitem__title">{item.title}</span>
      <span className="aitem__event">{item.event}</span>
    </>
  )

  return (
    <DisclosureRow
      className={resolved ? 'aitem aitem--resolved' : `aitem aitem--${item.tone}`}
      summary={summary}
      defaultOpen={defaultOpen}
    >
      <p className="aitem__detail">{resolved ? 'Reply sent to Emily Johnson. Timeline updated.' : item.detail}</p>
      <p className="aitem__meta">{item.meta}</p>
      <div className="aitem__actions">
        {resolved ? (
          <button className="btn btn--secondary btn--sm" onClick={openTarget}>
            View sent reply
          </button>
        ) : (
          // NO FALSE AFFORDANCE: only flows that exist in this prototype get an
          // enabled button; the rest are visibly disabled and say why.
          <button
            className={`btn ${item.id === 'decor-time' ? 'btn--primary' : 'btn--secondary'} btn--sm`}
            onClick={openTarget}
            disabled={!isJohnson}
            title={isJohnson ? undefined : 'Only the Johnson Wedding is built out in this prototype'}
          >
            {item.action}
            <Icon name="arrowRight" size={13} />
          </button>
        )}
      </div>
    </DisclosureRow>
  )
}

// Two sibling controls rather than one: the row body expands for detail, and
// the button navigates. Nesting a button inside a button is invalid HTML and
// makes the target ambiguous anyway.
function EventRow({ event, attention, onOpen }) {
  const [open, setOpen] = useState(false)

  return (
    <li className={`erow2 ${open ? 'is-open' : ''} ${event.clickable ? 'erow2--live' : ''}`}>
      <div className="erow2__line">
        <button className="erow2__expand" onClick={() => setOpen(!open)} aria-expanded={open}>
          <Icon name="chevronRight" size={15} className="erow2__chev" />
          <span className="erow2__date">
            <span className="erow2__dateMain">{event.dateLabel}</span>
            <span className="erow2__dateSub">{event.timeLabel}</span>
          </span>
          <span className="erow2__name">
            {event.name}
            <span className="erow2__clients">{event.clients}</span>
          </span>
          {attention > 0 ? (
            <Pill tone="urgent" icon="alert">
              {attention}
            </Pill>
          ) : (
            <Pill tone="ok" icon="check">
              On track
            </Pill>
          )}
        </button>

        {event.clickable && (
          <button className="btn btn--primary btn--sm erow2__cta" onClick={() => onOpen(event.id)}>
            Open workspace
            <Icon name="arrowRight" size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="erow2__detail">
          <dl className="minifacts">
            <div>
              <dt>Guests</dt>
              <dd>{event.guests}</dd>
            </div>
            <div>
              <dt>Spaces</dt>
              <dd>{event.space}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{event.status}</dd>
            </div>
            <div>
              <dt>Open tasks</dt>
              <dd>{event.openTasks}</dd>
            </div>
          </dl>
          {!event.clickable && (
            <p className="erow2__note">Only the Johnson Wedding is built out in this prototype.</p>
          )}
        </div>
      )}
    </li>
  )
}
