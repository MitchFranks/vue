'use client'

// SCREEN — Event Detail sheet (the manager's side).
//
// One live record of the event: essentials, run of show, day-of contact,
// guests' needs, food and bar, layout, outside vendors and notes. It replaces
// the paper detail sheet staff look things up on again and again.
//
// Every edit is logged as a change ("Cake cutting: 8:30 PM → 7:30 PM") and
// sent to the staff working the event. The Changes panel shows who has seen
// each one, with a way to remind the rest; until everyone has, it is a task.
// Key details still missing are listed at the top, so the sheet doubles as
// the checklist of what to chase. Rules: lib/eventSheet.js.

import { use, useState } from 'react'
import Link from 'next/link'
import { events } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import { useEventSheet } from '@/lib/eventSheetStore'
import { changeSummary, diffRun, freshChanges, importantCount, missingFields, SHEET_SECTIONS, shiftEnd } from '@/lib/eventSheet'
import { useTimelineEdits } from '@/lib/timelineEdits'
import { sortRows } from '@/lib/timeline/layout'
import { useStaffing } from '@/lib/staffing/store'
import { eventOf, staffById } from '@/lib/staffing/derive'
import { Alert, Button, Card, Icon, Select } from '@/components/ui'
import { ChangeLog, nameList } from '@/components/sheet/ChangeLog'
import { RunEditor, SectionEditor } from '@/components/sheet/SheetEditors'
import { SheetEssentials, SheetRunOfShow, SheetSections } from '@/components/sheet/SheetView'
import { BookedVendors, serviceText } from '@/components/sheet/BookedVendors'
import { dayOfHref } from '@/components/sheet/links'
import { CoupleRequests } from '@/components/sheet/CoupleRequests'
import { requestLine } from '@/lib/eventSheet'
import { useUndoable } from '@/lib/undo'

const SHOWN = 5

export default function EventSheetPage({ params }) {
  const { id } = use(params)
  const event = events.find((e) => e.id === id)
  const { toast } = useStore()
  const undoable = useUndoable()
  const sheet = useEventSheet()
  const { rowsFor, setRows } = useTimelineEdits()
  const { state: planner } = useStaffing()
  const [editing, setEditing] = useState(null) // a section id, or 'run'
  const [showAll, setShowAll] = useState(false)
  const [viewAs, setViewAs] = useState('')

  if (!event) return null
  const values = sheet.valuesFor(id)
  const rows = rowsFor(id)
  const entries = sheet.entriesFor(id)
  const team = sheet.teamOf(id)
  const fresh = freshChanges(entries)
  const missing = missingFields(values)
  const ev = eventOf(planner, id)
  const asWho = viewAs || team[0] || ''

  /** "Saved. Texted 5 staff: Cake cutting: 8:30 PM → 7:30 PM", with Undo. */
  const announce = (changes, notify, onUndo) => {
    const more = changes.length > 1 ? ` and ${changes.length - 1} more` : ''
    const msg =
      notify && team.length
        ? `Saved. Texted ${team.length} staff: ${changeSummary(changes[0])}${more}.`
        : `Saved and logged: ${changeSummary(changes[0])}${more}. Nobody was texted.`
    toast(msg, 'done', { actions: [{ label: 'Undo', onClick: onUndo }] })
  }

  const saveSection = (section, draft, options) => {
    const { changes, undo } = sheet.saveFields(id, section.title, draft, options)
    setEditing(null)
    if (!changes.length) return toast('Nothing changed.')
    announce(changes, options.notify, undo)
  }

  const saveRun = (edits, options) => {
    const before = rows
    // In the editor's order, so items dragged to the same time keep that order.
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]))
    const next = sortRows(
      edits.map((e) => {
        const r = byId[e.id]
        const end = r.end && e.time !== r.time ? shiftEnd(r, e.time) : r.end
        return { ...r, title: e.title, time: e.time, end }
      })
    )
    const changes = diffRun(before, next)
    setEditing(null)
    if (!changes.length) return toast('Nothing changed.')
    setRows(id, next)
    const handle = sheet.logRun(id, before, next, options)
    announce(changes, options.notify, () => {
      setRows(id, before)
      sheet.undo(handle)
    })
  }

  // The couple's requests from the client portal (CoupleRequests). Each
  // answer can be undone: the request goes back to waiting, and an accepted
  // change comes off the run of show and the staff's list again.
  const acceptRequest = (r) =>
    undoable(
      () => sheet.acceptRequest(r.id),
      ({ applied }) => (applied ? `Accepted: ${requestLine(r)}.` : `Accepted: ${requestLine(r)}. Make the change on the run of show yourself.`),
      {
        eventId: id,
        small: `It's on the run of show and was sent to the ${team.length} staff working this event.`,
        undone: 'Undone. The request is waiting for your answer again.'
      }
    )
  const declineRequest = (r, reply) =>
    undoable(() => sheet.declineRequest(r.id, reply), `Declined: ${requestLine(r)}. The couple sees your reply in their portal.`, {
      undone: 'Undone. The request is waiting for your answer again.'
    })

  const remind = (entry, missingIds) =>
    undoable(() => sheet.remind(entry.id), `Texted ${nameList(missingIds)} the change again.`, {
      small: 'In this prototype nobody is texted. Open their day-of page to read it as them.',
      undone: 'Undone. The reminder wasn’t sent.'
    })

  const editButton = (key, label = 'Edit') =>
    editing === key ? null : (
      <Button size="sm" onClick={() => setEditing(key)}>
        {label}
      </Button>
    )

  const unseenEntries = entries.filter((e) => e.notify && e.team.some((sid) => !e.seenBy?.[sid]))

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      {/* ---- the sheet ---- */}
      <div className="min-w-0 space-y-4">
        {missing.length > 0 ? (
          <Alert tone="warn" title={`${missing.length} of ${importantCount} key details still missing`}>
            <ul className="mt-1 flex flex-wrap gap-2">
              {missing.map((f) => {
                const section = sectionOf(f.id)
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setEditing(section.id)}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-line-strong bg-surface px-3 text-small text-ink hover:bg-surface-sunken"
                    >
                      <Icon name="plus" size={12} />
                      {section.title}: {f.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Alert>
        ) : (
          <Alert tone="done" title="Every key detail is filled in" />
        )}

        <SheetEssentials event={event} guests={ev?.expectedGuests ?? event.guests} guarantee={ev?.guaranteedCount} service={serviceText(ev)} />

        <SheetRunOfShow
          rows={rows}
          fresh={fresh}
          action={editButton('run', 'Edit times')}
          editor={
            editing === 'run' && (
              <RunEditor
                rows={rows}
                teamSize={team.length}
                timelineHref={`/events/${id}/timeline`}
                onCancel={() => setEditing(null)}
                onSave={saveRun}
              />
            )
          }
        />

        <SheetSections
          values={values}
          fresh={fresh}
          sectionAction={(s) => editButton(s.id)}
          extraFor={(sid) => (sid === 'vendors' ? <BookedVendors eventId={id} /> : null)}
          editorFor={(s) =>
            editing === s.id && (
              <SectionEditor
                section={s}
                values={values}
                teamSize={team.length}
                onCancel={() => setEditing(null)}
                onSave={(draft, options) => saveSection(s, draft, options)}
              />
            )
          }
        />
      </div>

      {/* ---- who knows: the change log and the staff view ---- */}
      <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-4">
        <CoupleRequests requests={sheet.requestsFor(id)} onAccept={acceptRequest} onDecline={declineRequest} />

        <Card
          title="Changes"
          icon="refresh"
          subtitle={
            unseenEntries.length
              ? `${unseenEntries.length} not seen by everyone yet`
              : team.length
                ? `Sent to the ${team.length} staff working this event`
                : 'Logged as they happen'
          }
          bodyClassName="px-0 py-0"
        >
          <ChangeLog entries={showAll ? entries : entries.slice(0, SHOWN)} onRemind={remind} />
          {entries.length > SHOWN && (
            <div className="border-t border-line px-4 py-3 sm:px-6">
              <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show fewer' : `Show all ${entries.length} changes`}
              </Button>
            </div>
          )}
        </Card>

        <Card title="What staff see" icon="phone">
          <p className="text-small text-ink">
            Everyone working this event gets a link to this sheet for their phone. It opens on what changed since they last looked,
            and they tap <span className="font-medium">Got it</span> so you know it reached them.
          </p>
          {team.length ? (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <Select
                id="sheet-view-as"
                label="Open it as"
                className="min-w-0 flex-1"
                options={team.map((sid) => ({ value: sid, label: `${staffById(sid)?.name} · ${staffById(sid)?.role}` }))}
                value={asWho}
                onChange={(e) => setViewAs(e.target.value)}
              />
              <Button href={dayOfHref(id, asWho)}>
                Open
                <Icon name="arrowRight" size={14} />
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-small text-ink-muted">
              No staff are confirmed yet.{' '}
              <Link href={`/staffing/${id}`} className="underline underline-offset-2 hover:text-ink">
                Open the Staffing Planner
              </Link>
            </p>
          )}
        </Card>
      </aside>
    </div>
  )
}

const sectionOf = (fieldId) => SHEET_SECTIONS.find((s) => s.fields.some((f) => f.id === fieldId))
