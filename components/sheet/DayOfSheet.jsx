'use client'

// ---------------------------------------------------------------------------
// A staff member's day-of sheet (public, phone first, no sign-in).
//
// The page a staff member opens from the text they get when the event is
// changed. It opens on what changed since they last looked, each change with
// what it was and why, and one button: "Got it". That tap is what tells the
// manager the change reached them (lib/eventSheetStore.jsx acknowledge).
// Below that is the whole sheet, with the changes they just read still
// highlighted, and their own shift at the top so they don't have to ask.
//
// ?e=<eventId>&s=<staffId>. Without a staff id (or with someone not working
// the event) it asks who you are.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { events, venue } from '@/lib/mock/events'
import { useEventSheet } from '@/lib/eventSheetStore'
import { BY_KIND, freshChanges } from '@/lib/eventSheet'
import { useTimelineEdits } from '@/lib/timelineEdits'
import { useStaffing } from '@/lib/staffing/store'
import { dayLine, eventOf, requestsOf, staffById, stampLabel } from '@/lib/staffing/derive'
import { Alert, Avatar, Button, Card, Icon } from '@/components/ui'
import { ChangeRow } from './ChangeLog'
import { SheetEssentials, SheetRunOfShow, SheetSections } from './SheetView'
import { BookedVendors, serviceText } from './BookedVendors'
import { dayOfHref, sheetHref } from './links'

function Frame({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-(--header-height) w-full max-w-form items-center justify-between gap-4 px-4">
          <p className="text-title font-light text-ink">{venue.name}</p>
          <p className="text-small text-ink-muted">Day-of sheet</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-form flex-1 space-y-4 px-4 pt-6 pb-12">{children}</main>
    </div>
  )
}

function PrototypeNote({ eventId }) {
  return (
    <p className="text-label text-ink-muted">
      Prototype: in a real build each person gets a private link by text. Everything here is saved in this browser only.{' '}
      <Link href={sheetHref(eventId)} className="underline underline-offset-2 hover:text-ink">
        Back to the venue&apos;s sheet
      </Link>
    </p>
  )
}

export function DayOfSheet() {
  const params = useSearchParams()
  const eventId = params.get('e')
  const staffId = params.get('s')
  const event = events.find((e) => e.id === eventId)

  if (!event) {
    return (
      <Frame>
        <h1 className="text-title font-light">This link doesn&apos;t match an event</h1>
        <p className="text-ink-muted">Ask the venue manager to send it again.</p>
      </Frame>
    )
  }
  return <ForEvent key={`${eventId}:${staffId}`} event={event} staffId={staffId} />
}

function ForEvent({ event, staffId }) {
  const sheet = useEventSheet()
  const { rowsFor } = useTimelineEdits()
  const { state: planner } = useStaffing()
  // What they read when they tapped "Got it", kept highlighted for this visit.
  const [justRead, setJustRead] = useState([])

  const team = sheet.teamOf(event.id)
  const person = team.includes(staffId) ? staffById(staffId) : null

  if (!person) {
    return (
      <Frame>
        <h1 className="text-title font-light">{event.name}</h1>
        <p className="text-ink-muted">Who are you? Pick your name to open your sheet.</p>
        <Card bodyClassName="px-0 py-0">
          {team.length === 0 ? (
            <p className="px-4 py-4 text-small text-ink-muted">Nobody is confirmed for this event yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {team.map((sid) => {
                const p = staffById(sid)
                return (
                  <li key={sid}>
                    <Link href={dayOfHref(event.id, sid)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken">
                      <Avatar initials={p.initials} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{p.name}</span>
                        <span className="block text-small text-ink-muted">{p.role}</span>
                      </span>
                      <Icon name="chevronRight" size={14} className="text-ink-muted" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <PrototypeNote eventId={event.id} />
      </Frame>
    )
  }

  const entries = sheet.entriesFor(event.id)
  const unseen = sheet.unseenFor(event.id, staffId)
  const fresh = freshChanges([...justRead, ...unseen].map((e) => ({ ...e, seenBy: {} })), staffId)
  const shift = requestsOf(planner, event.id).find((r) => r.staffId === staffId && r.status === 'accepted')
  const ev = eventOf(planner, event.id)

  const gotIt = () => {
    setJustRead(unseen)
    sheet.acknowledge(event.id, staffId)
  }

  return (
    <Frame>
      <div>
        <p className="text-small text-ink-muted">Hi {person.name.split(' ')[0]}</p>
        <h1 className="text-title font-light text-balance">{event.name}</h1>
        <p className="mt-1 text-ink-muted">
          {event.date} · {event.spaces}
        </p>
        {shift && (
          <p className="mt-2 text-ink">
            <span className="font-medium">You: {shift.role}</span> · {dayLine(shift)}
          </p>
        )}
      </div>

      {unseen.length > 0 ? (
        <section aria-labelledby="dayof-changes" className="space-y-3 rounded-md border border-line-strong bg-status-soon-soft px-4 py-4">
          <h2 id="dayof-changes" className="flex items-center gap-2 text-heading font-medium text-ink">
            <Icon name="alert" size={16} className="text-status-soon" />
            {unseen.length === 1 ? '1 change' : `${unseen.length} changes`} since you last looked
          </h2>
          <ul className="space-y-3">
            {unseen.map((e) => (
              <li key={e.id} className="space-y-1 rounded-sm bg-surface px-3 py-3">
                {e.changes.map((c) => (
                  <ChangeRow key={c.key} change={c} />
                ))}
                {e.reason && <p className="text-small text-ink">Why: {e.reason}</p>}
                <p className="text-label text-ink-muted">
                  {e.by.name} ({BY_KIND[e.by.kind] || 'Venue'}) · {stampLabel(e.at)}
                </p>
              </li>
            ))}
          </ul>
          <Button variant="primary" size="lg" className="w-full" onClick={gotIt}>
            <Icon name="check" size={16} />
            Got it
          </Button>
          <p className="text-label text-ink-muted">Tapping Got it lets {venue.manager.split(' ')[0]} know you have read these.</p>
        </section>
      ) : justRead.length > 0 ? (
        <Alert tone="done" title="Thanks, you're up to date">
          {venue.manager.split(' ')[0]} can see you have read the changes. They stay highlighted below.
        </Alert>
      ) : (
        <Alert tone="done" title="No changes since you last looked">
          {entries.length ? `Last change ${stampLabel(entries[0].at)}.` : 'The sheet is as it was sent.'}
        </Alert>
      )}

      <SheetEssentials event={event} guests={ev?.expectedGuests ?? event.guests} guarantee={ev?.guaranteedCount} service={serviceText(ev)} />
      <SheetRunOfShow rows={rowsFor(event.id)} fresh={fresh} />
      <SheetSections values={sheet.valuesFor(event.id)} fresh={fresh} extraFor={(sid) => (sid === 'vendors' ? <BookedVendors eventId={event.id} /> : null)} />

      <Card title="Questions on the day" icon="phone">
        <p className="text-ink">
          {venue.manager}, {venue.managerRole}
          {venue.managerPhone && (
            <>
              {' · '}
              <a href={`tel:${venue.managerPhone}`} className="underline underline-offset-2">
                {venue.managerPhone}
              </a>
            </>
          )}
        </p>
      </Card>

      <PrototypeNote eventId={event.id} />
    </Frame>
  )
}
