'use client'

// ---------------------------------------------------------------------------
// SCREEN 3 — Message thread + AI assisted reply.
// Job: resolve the thing that needs attention without leaving the system.
//
// The assistant DRAFTS; the manager decides. The draft sits in an editable
// field and nothing leaves the building until "Send reply" is pressed — the
// human is always the one who sends.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Avatar, BackLink, Button, Card, CardFootnote, Icon, Pill, Row } from './ui'
import { Contact } from './EventWorkspace'
import { cx } from '@/lib/cx'
import { usePrototype } from '@/lib/prototype'
import { aiBasis, aiDraft, johnson, thread, threadContext, venue } from '@/lib/data'

const EVENT_HREF = '/events/johnson'

export function Communication() {
  const { replySent, resolve } = usePrototype()
  const [draft, setDraft] = useState(aiDraft)
  const [sending, setSending] = useState(false)

  function handleSend() {
    if (sending || replySent) return
    setSending(true)
    // Simulated network latency so the button visibly responds.
    setTimeout(() => {
      setSending(false)
      resolve('decor-time')
    }, 650)
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <BackLink href={EVENT_HREF}>Johnson Wedding workspace</BackLink>
          <h1 className="mt-1.5 font-display text-[32px] font-medium leading-[1.1] tracking-[-0.005em]">{thread.subject}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-muted">
            <Icon name="link" size={13} /> Filed automatically to {thread.linkedEvent}
          </p>
        </div>
        <div>
          {replySent ? (
            <Pill tone="ok" icon="check">
              Replied
            </Pill>
          ) : (
            <Pill tone="urgent" icon="alert">
              Awaiting your reply
            </Pill>
          )}
        </div>
      </div>

      {replySent && (
        <div
          className="flex animate-rise flex-wrap items-start gap-[13px] rounded-xl border border-ok-line bg-ok-soft px-[18px] py-4 shadow-card"
          role="status"
        >
          <span className="grid place-items-center pt-px text-ok">
            <Icon name="checkCircle" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ok">Reply sent to {thread.fromEmail}</p>
            <p className="mt-[3px] text-[12.5px] text-ink-2">
              “Decorating time change requested by the bride” is now resolved. The Johnson Wedding timeline shows 9:00
              AM decorating access, and the event has 2 open items remaining.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" href={EVENT_HREF}>
              Back to event
              <Icon name="arrowRight" size={14} />
            </Button>
            <Button variant="quiet" href="/dashboard">
              Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* ------------------------- THE CONVERSATION ------------------------ */}
        <div className="flex flex-col gap-4">
          <Card title="Message" icon="mail">
            <Email
              initials={thread.initials}
              tone="brand"
              from={thread.from}
              address={thread.fromEmail}
              when={<span className="text-[11.5px] text-faint">{thread.when}</span>}
            >
              {thread.body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </Email>

            {replySent && (
              <Email
                sent
                initials={venue.managerInitials}
                from={venue.manager}
                address={venue.managerRole}
                when={
                  <Pill tone="ok" icon="check">
                    Sent just now
                  </Pill>
                }
              >
                {draft.split('\n\n').map((para, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {para}
                  </p>
                ))}
              </Email>
            )}
          </Card>

          {/* --------------------------- AI DRAFT --------------------------- */}
          {!replySent && (
            <section className="overflow-hidden rounded-xl border border-parchment-line bg-surface shadow-lift">
              <header className="flex items-start justify-between gap-3.5 border-b border-parchment-line bg-parchment px-4 py-[15px]">
                <div>
                  <h2 className="flex items-center gap-2 text-[14.5px] font-semibold tracking-[-0.01em] text-night">
                    <Icon name="sparkle" size={16} />
                    Suggested reply
                  </h2>
                  <p className="mt-[3px] max-w-[62ch] text-[12.5px] text-ink-2">
                    Drafted from this event’s data. Review and edit before sending — nothing is sent automatically.
                  </p>
                </div>
                <Pill tone="brand" className="bg-cream">
                  Draft · not sent
                </Pill>
              </header>

              <div className="flex flex-wrap items-center gap-2.5 border-b border-line-soft bg-surface-2 px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">Based on</span>
                <ul className="flex flex-wrap gap-1.5">
                  {aiBasis.map((b) => (
                    <li className="rounded-full border border-line bg-surface px-[9px] py-[3px] text-[11.5px] text-muted" key={b}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-4 pt-3.5">
                <label className="mb-[7px] block text-[11.5px] font-medium text-faint" htmlFor="reply">
                  To {thread.fromEmail} · Re: {thread.subject}
                </label>
                {/* Looks like a field you can type in — because you can. */}
                <textarea
                  id="reply"
                  className="w-full resize-y rounded-lg border border-line bg-surface-2 px-[15px] py-3.5 text-[13.5px] leading-[1.62] text-ink-2 transition-[border-color,box-shadow,background-color] hover:border-parchment-line focus:border-bark focus:bg-surface focus:shadow-[0_0_0_3px_rgba(42,36,33,0.2)] focus:outline-none"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={22}
                  spellCheck="false"
                />
                <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted">
                  <Icon name="check" size={13} className="text-ok" />
                  You are editing the draft. It sends only when you press Send reply.
                </p>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                <Button variant="quiet" onClick={() => setDraft(aiDraft)} disabled={draft === aiDraft}>
                  Restore original draft
                </Button>
                <div className="ml-auto flex items-center gap-[9px]">
                  <Button variant="secondary" href={EVENT_HREF}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleSend} disabled={sending} busy={sending}>
                    <Icon name="send" size={15} />
                    {sending ? 'Sending…' : 'Send reply'}
                  </Button>
                </div>
              </footer>
            </section>
          )}
        </div>

        {/* --------------------------- THE CONTEXT -------------------------- */}
        <div className="flex flex-col gap-4">
          <Card
            title="Event context"
            icon="calendar"
            subtitle="Everything needed to answer, in place"
            action={
              <Button variant="quiet" size="sm" href={EVENT_HREF}>
                Open workspace
                <Icon name="arrowRight" size={13} />
              </Button>
            }
          >
            <dl className="flex flex-col pt-1">
              {threadContext.map((item) => (
                <div
                  className="grid grid-cols-[40%_minmax(0,1fr)] gap-3 border-t border-line-soft py-[9px] first:border-t-0"
                  key={item.label}
                >
                  <dt className="text-[11.5px] text-faint">{item.label}</dt>
                  <dd className="text-right text-[12.5px] font-medium text-ink-2">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-center gap-2 rounded-lg border border-ok-line bg-ok-soft px-3 py-2.5 text-[12.5px] font-semibold text-ok">
              <Icon name="checkCircle" size={15} />
              No conflict found — a 9:00 AM start is available.
            </p>
          </Card>

          <Card title="Other open items" icon="alert" subtitle="Johnson Wedding">
            <ul className="flex flex-col">
              <Row tight title="Final catering guest count" sub="Harvest Table · due Mon, Sep 14">
                <Pill tone="urgent">Open</Pill>
              </Row>
              <Row tight title="Remaining balance $4,250" sub="Due Thu, Sep 17">
                <Pill tone="warning">Open</Pill>
              </Row>
            </ul>
            <CardFootnote>The draft asks for the guest count too, so one reply clears two items.</CardFootnote>
          </Card>

          <Card title="Client" icon="users">
            <ul className="flex flex-col">
              {johnson.contacts.slice(0, 2).map((c) => (
                <Contact key={c.email} contact={c} size="sm" />
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Email({ sent = false, initials, tone = 'neutral', from, address, when, children }) {
  return (
    <article className={cx('pt-3.5 pb-1.5', sent && 'mt-1.5 border-t border-line-soft pt-4')}>
      <header className="flex items-center gap-[11px]">
        <Avatar initials={initials} tone={tone} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
          <span className="flex flex-col gap-px text-[13.5px] font-semibold">
            {from}
            <span className="text-[11.5px] font-normal text-faint">{address}</span>
          </span>
          {when}
        </div>
      </header>
      <div
        className={cx(
          'flex flex-col gap-[11px] pt-3.5 pb-1 pl-[43px]',
          sent ? 'text-[13px] text-muted' : 'text-sm leading-[1.62] text-ink-2'
        )}
      >
        {children}
      </div>
    </article>
  )
}
