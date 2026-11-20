'use client'

// ---------------------------------------------------------------------------
// The couple's client portal (/portal?c=<coupleId>).
//
// Built to need no explaining:
//   Home     how far along you are, ONE "up next" card with one button, and
//            the four steps as a checklist.
//   Step     one job per screen (?step=sign|pay|details|meeting): a back
//            link, one sentence on what happens, and one button that says
//            exactly what it does ("Pay $4,600").
//   Done     what just happened, and the next step as the only button
//            (?done=<step>).
//   Your day the run of show, where the couple asks for changes and says
//            what they expect (?view=day, PortalRunOfShow.jsx). Not a
//            checklist step: there is nothing to finish, only to ask.
// Real URLs, so the browser's Back button does what people expect.
// Everything they do lands in the couple record (PortalRecord.jsx).
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, EmptyState, Icon, ProgressBar } from '@/components/ui'
import { INQUIRY_TITLE_ID, InquiryFrame } from '@/components/inquiry/InquiryFrame'
import { AppToasts } from '@/components/layout/AppToasts'
import { reloadOnWorkspaceChange } from '@/lib/account/session'
import { useDirectory } from '@/lib/directory/store'
import { contactName, contacts, coupleById } from '@/lib/mock/records'
import { daysOut, eventById } from '@/lib/mock/events'
import { nextStep, portalSteps, STEP_COPY, STEP_ORDER } from '@/lib/portal'
import { useStore } from '@/lib/store'
import { cx } from '@/lib/cx'
import { PHOTOS } from '@/lib/asset'
import { SignStep } from './PortalAgreements'
import { PayStep } from './PortalPayments'
import { DetailsStep } from './PortalDetails'
import { MeetingStep } from './PortalMeeting'
import { DoneScreen } from './PortalDone'
import { RunOfShowCard, RunOfShowScreen } from './PortalRunOfShow'

/** How a couple would say it: "Your event is in 7 days". */
const whenText = (n) => (n === 0 ? 'Your event is today' : n === 1 ? 'Your event is tomorrow' : `Your event is in ${n} days`)

const NOTE = 'Prototype: what you do here is saved in this browser only, where the venue can see it. No real payment is taken and nothing is emailed.'

export function ClientPortal() {
  const params = useSearchParams()
  const router = useRouter()
  const coupleId = params.get('c')
  const step = STEP_ORDER.includes(params.get('step')) ? params.get('step') : null
  const done = STEP_ORDER.includes(params.get('done')) ? params.get('done') : null
  const view = params.get('view') === 'day' ? 'day' : null
  const { venue } = useDirectory()
  const { hydrated, documentList, paymentsForEvent, portalFor } = useStore()
  const couple = coupleById(coupleId)
  const partners = couple ? contacts.filter((c) => c.coupleId === couple.id) : []
  const [whoId, setWhoId] = useState(null)
  const [lastDone, setLastDone] = useState(null)

  // This page sits outside RequireAccount, so it watches for a sign-in itself.
  useEffect(() => reloadOnWorkspaceChange(), [])

  // A new screen: start at the top and move focus to its heading (which also announces it).
  const screenKey = `${step}|${done}|${view}`
  const shown = useRef(screenKey)
  useEffect(() => {
    if (shown.current === screenKey) return
    shown.current = screenKey
    window.scrollTo({ top: 0 })
    document.getElementById(INQUIRY_TITLE_ID)?.focus()
  }, [screenKey])

  const go = (q = {}) => {
    const qs = new URLSearchParams({ c: coupleId, ...q }).toString()
    router.push(`/portal?${qs}`)
  }

  const frame = (props) => <InquiryFrame venueName={venue.name} section="Your event" note={NOTE} after={<AppToasts />} {...props} />

  if (!couple) {
    return frame({
      title: 'This link has expired',
      children: <EmptyState icon="search" title="We couldn't find your event" body={`Ask ${venue.name} to send your portal link again.`} />
    })
  }
  // Saved progress loads after the first render; wait so nothing flips from "to do" to "done".
  if (!hydrated) return <div className="min-h-dvh bg-canvas" aria-busy="true" />

  const event = eventById(couple.eventIds[0])
  const me = partners.find((p) => p.id === whoId) || partners.find((p) => p.id === couple.primaryContactId) || partners[0]
  const other = partners.find((p) => p.id !== me.id)
  const by = contactName(me)
  const record = portalFor(couple.id)
  const docs = documentList.filter((d) => d.eventId === event?.id && d.signer === 'couple')
  const plan = event ? paymentsForEvent(event.id) : null
  const steps = portalSteps({ docs, plan, record })
  const upNext = nextStep(steps)

  /** A step screen: back link and "Step n of 4" above the title. */
  const screen = (id, props) =>
    frame({
      above: (
        <div className="mb-6 flex items-center justify-between gap-3">
          <button type="button" onClick={() => go()} className="inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-ink-muted transition-colors hover:text-ink">
            <Icon name="arrowLeft" size={14} />
            Your checklist
          </button>
          <span className="text-small text-ink-muted">
            Step {STEP_ORDER.indexOf(id) + 1} of {STEP_ORDER.length}
          </span>
        </div>
      ),
      ...props
    })

  /** After a step: say it worked, then offer the next one. `result` is that step's own summary line. */
  const complete = (id, result, title) => {
    setLastDone({ id, result, title })
    go({ done: id })
  }

  const ctx = { couple, event, partners, me, by, record, docs, plan, venue, screen, complete, back: () => go() }

  if (done) {
    return <DoneScreen {...ctx} frame={frame} doneId={done} result={lastDone?.id === done ? lastDone.result : null} title={lastDone?.id === done ? lastDone.title : null} steps={steps} onNext={(id) => go(id ? { step: id } : {})} />
  }
  if (view === 'day' && event) return <RunOfShowScreen {...ctx} frame={frame} />
  if (step === 'sign') return <SignStep {...ctx} />
  if (step === 'pay') return <PayStep {...ctx} />
  if (step === 'details') return <DetailsStep {...ctx} />
  if (step === 'meeting') return <MeetingStep {...ctx} />

  const doneCount = steps.filter((s) => s.done).length
  return frame({
    cover: PHOTOS.candles,
    title: `Hi, ${me.firstName}`,
    lead: event ? `${event.name} · ${event.date} · ${event.spaces}` : 'Your event details will appear here once it is booked.',
    above: other && (
      <p className="mb-4 text-small text-ink-muted">
        Not {me.firstName}?{' '}
        <button type="button" onClick={() => setWhoId(other.id)} className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:text-accent">
          Continue as {other.firstName}
        </button>
      </p>
    ),
    children: (
      <>
        {/* How far along, in words first. Once everything is done, the card below says so instead. */}
        {upNext && (
          <div className="surface-card px-4 py-4 sm:px-6">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="font-medium text-ink">
                {doneCount} of {steps.length} done
              </p>
              {event && daysOut(event) >= 0 && <p className="text-small text-ink-muted">{whenText(daysOut(event))}</p>}
            </div>
            <ProgressBar value={doneCount} max={steps.length} label="Steps done" />
          </div>
        )}

        {/* The one thing to do next. The only filled button on the page. */}
        {upNext ? (
          <div className="surface-card border-ink! px-4 py-5 sm:px-6">
            <p className="text-label font-medium text-accent">Up next</p>
            <h2 className="mt-1 font-display text-[1.85rem] leading-[1.1] text-ink">{STEP_COPY[upNext.id].title}</h2>
            <p className="mt-1 text-body text-ink-muted">{upNext.status}. {STEP_COPY[upNext.id].lead}</p>
            <Button variant="primary" size="lg" className="mt-4 w-full sm:w-auto" onClick={() => go({ step: upNext.id })}>
              {STEP_COPY[upNext.id].start}
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        ) : (
          <div className="surface-card px-4 py-5 text-center sm:px-6">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-status-clear-soft text-status-clear">
              <Icon name="check" size={22} />
            </span>
            <h2 className="mt-3 font-display text-[1.85rem] leading-[1.1] text-ink">You&apos;re all set</h2>
            <p className="mt-1 text-body text-ink-muted">
              {venue.name} has everything it needs from you. You can still view or change anything below.
            </p>
          </div>
        )}

        {/* Changing something on the day is the other thing couples come here for,
            so it sits right under "Up next", not below the checklist. */}
        <RunOfShowCard event={event} venue={venue} onOpen={() => go({ view: 'day' })} />

        {/* The four steps. Each row opens its screen; done ones open to view or change. */}
        <nav aria-label="Your checklist" className="surface-card overflow-hidden">
          <ol>
            {steps.map((s, i) => (
              <li key={s.id} className="border-b border-line last:border-b-0">
                <button type="button" onClick={() => go({ step: s.id })} className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-sunken/60 sm:px-6">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-full text-small font-medium',
                      s.done ? 'bg-status-clear-soft text-status-clear' : 'border border-line-strong text-ink'
                    )}
                  >
                    {s.done ? <Icon name="check" size={15} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{STEP_COPY[s.id].title}</span>
                    <span className="block text-small text-ink-muted">{s.status}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-small font-medium text-ink-muted">
                    {s.done ? 'View' : 'Start'}
                    <Icon name="chevronRight" size={15} />
                  </span>
                  <span className="sr-only">{s.done ? '(done)' : '(to do)'}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <p className="text-small text-ink-muted">
          Questions? Call {venue.name}
          {venue.phone ? ` at ${venue.phone}` : ''}
          {venue.email ? (
            <>
              {' '}or email{' '}
              <a href={`mailto:${venue.email}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:text-accent">
                {venue.email}
              </a>
            </>
          ) : null}
          .
        </p>
      </>
    )
  })
}

