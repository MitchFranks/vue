// ---------------------------------------------------------------------------
// Updates from couples, and what each couple still owes the venue.
//
// User test v4 (Nov 2026): testers couldn't tell that a couple had asked for
// a change ("there was no alert, it was rather hidden"), couldn't find
// whether a couple had signed or paid ("I made the payment but can't see
// where it says paid"), and nothing was flagged as overdue. This module turns
// what couples do in their portal into one list the venue sees everywhere:
// the bell in the top bar, the dashboard, and the event's own pages.
//
//   coupleUpdates(...)  newest first: requests, signatures, payments, details
//                       and meetings. A request still waiting is `needsYou`.
//   coupleStatus(...)   per event: agreements signed or not (and overdue),
//                       payments paid or due (and overdue), requests waiting.
//
// Pure functions over plain data. The hook that feeds them from the stores is
// components/updates/useCoupleUpdates.js.
// ---------------------------------------------------------------------------

import { requestLine } from './eventSheet.js'
import { TODAY_KEY } from './mock/events.js'
import { money } from './mock/records.js'
import { dateLabel, monthDay, timeOfIso } from './staffing/derive.js'

/** Whole days from today to a date key: negative when it has passed. */
export function daysFromToday(dateKey) {
  return Math.round((Date.parse(`${dateKey}T00:00:00Z`) - Date.parse(`${TODAY_KEY}T00:00:00Z`)) / 86400000)
}

/** "Overdue since Fri, Oct 9", "Due today", "Due tomorrow", "Due Thu, Oct 15". */
export function dueWords(dateKey, verb = 'Due') {
  const n = daysFromToday(dateKey)
  if (n < 0) return `Overdue since ${dateLabel(dateKey)}`
  if (n === 0) return `${verb} today`
  if (n === 1) return `${verb} tomorrow`
  return `${verb} ${dateLabel(dateKey)}`
}

/** "Today, 4:12 PM", "Yesterday, 8:15 PM", "Oct 3, 9:00 AM". */
export function whenLabel(at) {
  if (!at) return ''
  const n = daysFromToday(at.slice(0, 10))
  const day = n === 0 ? 'Today' : n === -1 ? 'Yesterday' : monthDay(at.slice(0, 10))
  return at.length > 10 ? `${day}, ${timeOfIso(at)}` : day
}

const first = (name = '') => name.split(' ')[0]

/**
 * Everything couples did in their portals, newest first.
 *
 *   couples          [{ id, name, eventIds }]
 *   eventById        id -> event
 *   requests         every run-of-show request (lib/eventSheetStore.jsx)
 *   portalFor        coupleId -> portal record (lib/store.jsx)
 *   documentList     documents with portal signatures applied
 *   paymentsForEvent eventId -> plan with online payments applied
 *
 * Each update: { id, at, kind, needsYou, coupleId, eventId, eventName,
 *   who, title, detail, href, cta }
 */
export function coupleUpdates({ couples, eventById, requests, portalFor, documentList, paymentsForEvent }) {
  const out = []
  const coupleOfEvent = (eventId) => couples.find((c) => c.eventIds.includes(eventId))

  for (const r of requests) {
    const event = eventById(r.eventId)
    const couple = coupleOfEvent(r.eventId)
    if (!event) continue
    const waiting = r.status === 'waiting'
    out.push({
      id: `request:${r.id}`, // request ids are new every time
      at: r.at,
      kind: 'request',
      needsYou: waiting,
      coupleId: couple?.id || null,
      eventId: event.id,
      eventName: event.name,
      who: r.by,
      title: waiting ? `${first(r.by)} asked: ${requestLine(r)}` : `${first(r.by)}'s request: ${requestLine(r)}`,
      detail: waiting ? (r.note ? `“${r.note}”` : 'Waiting for your answer.') : r.status === 'accepted' ? 'You accepted it.' : 'You said it isn’t possible.',
      href: `/events/${event.id}/sheet#requests`,
      cta: waiting ? 'Review request' : 'See request'
    })
  }

  for (const couple of couples) {
    const event = eventById(couple.eventIds[0])
    if (!event) continue
    const record = portalFor(couple.id)
    const base = { coupleId: couple.id, eventId: event.id, eventName: event.name }

    for (const [docId, sig] of Object.entries(record.signatures || {})) {
      const doc = documentList.find((d) => d.id === docId)
      if (!doc) continue
      out.push({
        ...base,
        id: `signed:${docId}:${sig.at}`,
        at: sig.at,
        kind: 'signed',
        needsYou: false,
        who: sig.name,
        title: `${first(sig.name)} signed the ${doc.name.charAt(0).toLowerCase()}${doc.name.slice(1)}`,
        detail: 'Signed online in their portal.',
        href: `/events/${event.id}/documents`,
        cta: 'See agreement'
      })
    }

    const plan = paymentsForEvent(event.id)
    for (const p of plan?.schedule || []) {
      if (!p.paidOnline) continue
      out.push({
        ...base,
        id: `paid:${event.id}:${p.id}:${p.paidOnline.at}`,
        at: p.paidOnline.at,
        kind: 'paid',
        needsYou: false,
        who: p.paidOnline.by,
        title: `${first(p.paidOnline.by)} paid the ${p.label.toLowerCase()} of ${money(p.amount)}`,
        detail: `${p.paidOnline.method || 'Paid by card'}. ${plan.total - plan.paid ? `${money(plan.total - plan.paid)} still to pay.` : 'Paid in full.'}`,
        href: `/events/${event.id}/payments`,
        cta: 'See payment'
      })
    }

    ;(record.history || []).forEach((h, i) => {
      const unread = i >= (record.seen || 0)
      out.push({
        ...base,
        id: `details:${couple.id}:${i}:${h.at}`,
        at: h.at,
        kind: 'details',
        needsYou: unread,
        who: h.by,
        title: h.kind === 'sent' ? `${first(h.by)} sent their event details` : `${first(h.by)} changed ${h.changes.length === 1 ? 'a detail' : `${h.changes.length} details`}`,
        detail: unread ? 'Not read yet.' : 'Read.',
        href: `/couples/${couple.id}`,
        cta: unread ? 'Read details' : 'See details'
      })
    })

    if (record.meeting) {
      out.push({
        ...base,
        id: `meeting:${couple.id}:${record.meeting.at}`,
        at: record.meeting.at,
        kind: 'meeting',
        needsYou: false,
        who: record.meeting.by,
        title: `${first(record.meeting.by)} booked a meeting`,
        detail: 'It is on your schedule.',
        href: `/couples/${couple.id}`,
        cta: 'See meeting'
      })
    }
  }

  return out.filter((u) => u.at).sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
}

export const UPDATE_ICON = { request: 'refresh', signed: 'file', paid: 'dollar', details: 'list', meeting: 'calendar' }

/**
 * Where one event's couple stands: what they have signed and paid, what is
 * still owed (and whether it is late), and requests waiting for the venue.
 *
 *   { agreements: [{ id, name, signed, by, on, signBy, overdue, words }],
 *     payment: { total, paid, left, next: { label, amount, dueDate, overdue, words } | null, lastPaid },
 *     requestsWaiting, owed, overdue }
 * `owed` counts what the couple still has to do; `overdue` how much is late.
 */
export function coupleStatus({ eventId, documentList, paymentsForEvent, requests }) {
  const agreements = documentList
    .filter((d) => d.eventId === eventId && d.signer === 'couple')
    .map((d) => {
      const signed = d.tone === 'done'
      const overdue = !signed && !!d.signBy && daysFromToday(d.signBy) < 0
      return {
        id: d.id,
        name: d.name,
        signed,
        by: d.signedBy || null,
        on: d.signedOn || null,
        signBy: d.signBy || null,
        overdue,
        words: signed ? `Signed${d.signedBy ? ` by ${d.signedBy}` : ''}${d.signedOn ? ` · ${d.signedOn}` : ''}` : d.signBy ? dueWords(d.signBy, 'Sign by') : 'Waiting for their signature'
      }
    })

  const plan = paymentsForEvent(eventId)
  let payment = null
  if (plan) {
    const due = plan.schedule.find((p) => p.state === 'due') || plan.schedule.find((p) => p.state === 'scheduled')
    const lastPaid = [...plan.schedule].reverse().find((p) => p.state === 'paid') || null
    payment = {
      total: plan.total,
      paid: plan.paid,
      left: plan.total - plan.paid,
      lastPaid: lastPaid ? { label: lastPaid.label, amount: lastPaid.amount, when: lastPaid.when } : null,
      next: due
        ? {
            label: due.label,
            amount: due.amount,
            dueDate: due.dueDate || null,
            overdue: due.state === 'due' && !!due.dueDate && daysFromToday(due.dueDate) < 0,
            words: due.dueDate ? dueWords(due.dueDate) : due.when
          }
        : null
    }
  }

  const requestsWaiting = requests.filter((r) => r.eventId === eventId && r.status === 'waiting')
  const unsigned = agreements.filter((a) => !a.signed)
  const dueNow = payment?.next && payment.next.dueDate && daysFromToday(payment.next.dueDate) <= 7 ? 1 : 0
  return {
    agreements,
    payment,
    requestsWaiting,
    owed: unsigned.length + dueNow,
    overdue: unsigned.filter((a) => a.overdue).length + (payment?.next?.overdue ? 1 : 0)
  }
}
