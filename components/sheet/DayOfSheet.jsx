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
import { dayOfHref, myTasksHref, sheetHref } from './links'
import { StaffFrame, StaffPrototypeNote } from './StaffFrame'
import { useStore } from '@/lib/store'

const Frame = ({ children }) => <StaffFrame section="Day-of sheet">{children}</StaffFrame>

const PrototypeNote = ({ eventId }) => <StaffPrototypeNote backHref={sheetHref(eventId)} backLabel="Back to the venue's sheet" />

export function DayOfSheet() {
  const params = useSearchParams()
  const eventId = params.get('e')
  const staffId = params.get('s')
  const event = events.find((e) => e.id === eventId)

  if (!event) {
    return (
      <Frame>
        <h1 className="font-display text-[1.85rem] leading-[1.1]">This link doesn&apos;t match an event</h1>
        <p className="text-ink-muted">Ask the venue manager to send it again.</p>
      </Frame>
    )
  }
  return <ForEvent key={`${eventId}:${staffId}`} event={event} staffId={staffId} />
}

function ForEvent({ event, staffId }) {
  const sheet = useEventSheet()
  const { tasksAssignedTo } = useStore()
  const { rowsFor } = useTimelineEdits()
  const { state: planner } = useStaffing()
  // What they read when they tapped "Got it", kept highlighted for this visit.
  const [justRead, setJustRead] = useState([])
  // Got it can be taken back (a mis-tap): the changes go back to unread.
  const [beforeGotIt, setBeforeGotIt] = useState(null)

  const team = sheet.teamOf(event.id)
  const person = team.includes(staffId) ? staffById(staffId) : null

  if (!person) {
    return (
      <Frame>
        <h1 className="font-display text-[1.85rem] leading-[1.1]">{event.name}</h1>
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
    setBeforeGotIt(sheet.snapshot())
    setJustRead(unseen)
    sheet.acknowledge(event.id, staffId)
  }
  const undoGotIt = () => {
    sheet.restore(beforeGotIt)
    setBeforeGotIt(null)
    setJustRead([])
  }

  return (
    <Frame>
      <div>
        <p className="text-small text-ink-muted">Hi {person.name.split(' ')[0]}</p>
        <h1 className="font-display text-[1.85rem] leading-[1.1] text-balance">{event.name}</h1>
        <p className="mt-1 text-ink-muted">
          {event.date} · {event.spaces}
        </p>
        {shift && (
          <p className="mt-2 text-ink">
            <span className="font-medium">You: {shift.role}</span> · {dayLine(shift)}
          </p>
        )}
        {(() => {
          const mine = tasksAssignedTo(staffId).open
          const here = mine.filter((t) => t.eventId === event.id).length
          return (
            mine.length > 0 && (
              <Link href={myTasksHref(staffId)} className="mt-2 inline-flex items-center gap-1 text-small text-ink underline underline-offset-2">
                <Icon name="list" size={14} />
                {here ? `${here} task${here === 1 ? '' : 's'} for this event` : `${mine.length} open task${mine.length === 1 ? '' : 's'}`} · See your tasks
              </Link>
            )
          )
        })()}
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
        <Alert
          tone="done"
          title="Thanks, you're up to date"
          action={
            beforeGotIt && (
              <Button size="sm" onClick={undoGotIt}>
                Undo
              </Button>
            )
          }
        >
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
