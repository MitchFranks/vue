'use client'

// ---------------------------------------------------------------------------
// Staff phone simulator (spec §B.8). Proves the loop: the manager sees the text
// a person received, answers it as that person, and watches the reply land on
// the event screen. Also exported as PhoneDrawer, fixed to one person.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { venue } from '@/lib/mock/events'
import { cx } from '@/lib/cx'
import { Button, Icon, StatusBadge } from '@/components/ui/primitives'
import { WORLD } from '@/lib/staffing/adapter'
import {
  MANAGER,
  awayDateText,
  blocksOfRequest,
  callTimeH,
  dayStartMin,
  displayStatus,
  doneH,
  firstName,
  fmtH,
  spaceLabel,
  stampLabel,
  staffById
} from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'
import { TODAY_KEY } from '@/lib/mock/events'
import { AwayDateForm } from './AwayDateForm'
import { PickChips } from './controls'
import { Drawer } from './Drawer'

const REASONS = ['Another job', 'Sick', 'Family', 'Class or school', 'Other']
const ASKS = ['ask', 'change', 'remind']

function PillTabs({ value, onChange }) {
  return (
    <div className="flex gap-1.5 rounded-full bg-wash p-1" role="tablist">
      {[
        ['texts', 'Texts'],
        ['dates', 'My dates']
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={cx(
            'flex-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
            value === id ? 'bg-accent text-on-accent shadow-pop' : 'text-muted hover:text-accent'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ReplyPage({ requestId, onDone }) {
  const { state, answer, markSeen } = useStaffing2()
  const r = state.requests[requestId]
  const [mode, setMode] = useState('ask') // ask | no | result
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    markSeen(requestId)
    // Only on open: opening the reply page records "seen".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  if (!r) return null
  const ev = WORLD.eventMap[r.eventId]
  const bs = blocksOfRequest(r, ev)
  const call = fmtH(callTimeH(r, ev))

  if (mode === 'result') {
    return (
      <div className="space-y-4 py-4 text-center">
        <Icon name={result === 'declined' || result === 'reverted' ? 'info' : 'check'} size={22} className="mx-auto text-accent" />
        <p className="text-[15px] font-semibold text-ink">
          {result === 'accepted'
            ? `You're confirmed. See you at ${call}.`
            : result === 'backup'
              ? "Thanks. All spots were already filled, so you're on the backup list. We'll text you if a spot opens."
              : 'Thanks for letting us know.'}
        </p>
        <Button size="sm" onClick={onDone}>
          Back to texts
        </Button>
      </div>
    )
  }

  const pending = r.status === 'pending'

  return (
    <div className="space-y-3">
      <button type="button" onClick={onDone} className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent">
        <Icon name="arrowLeft" size={12} /> Texts
      </button>
      <div>
        <p className="font-display text-[18px] font-bold text-ink">{ev.name}</p>
        <p className="text-xs text-muted">
          {ev.couple} · {ev.dateShort}
        </p>
      </div>
      <dl className="space-y-1.5 rounded-2xl bg-wash px-3 py-3 text-[13px]">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted">Role</dt>
          <dd className="font-semibold text-ink">{r.role}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted">Call time</dt>
          <dd className="font-semibold text-ink">
            {call} at {spaceLabel(bs[0]?.spaceId)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted">Done about</dt>
          <dd className="text-ink">{fmtH(doneH(r, ev))}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted">Working</dt>
          <dd className="text-ink">{bs.map((b) => b.name).join(' + ')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted">What to know</dt>
          <dd className="text-ink">{bs.map((b) => b.note).join(' ')}</dd>
        </div>
      </dl>
      <p className="text-[12px] text-muted">
        Questions? {MANAGER.first} · {MANAGER.phone}
      </p>

      {!pending ? (
        <p className="rounded-2xl border border-line-soft px-3 py-2 text-[12px] text-muted">
          Already answered: {displayStatus(r, state).label}.
        </p>
      ) : mode === 'ask' ? (
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setResult(answer(r.id, true))
              setMode('result')
            }}
          >
            Yes, I&apos;ll be there
          </Button>
          <Button onClick={() => setMode('no')}>Can&apos;t make it</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-ink-2">Want to say why? (optional)</p>
          <PickChips options={REASONS} value={reason} onChange={setReason} label="Reason" />
          <textarea
            aria-label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="block w-full rounded-2xl border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft"
            rows={2}
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => {
              const why = [reason, note.trim()].filter(Boolean).join(': ')
              setResult(answer(r.id, false, why))
              setMode('result')
            }}>
              Send answer
            </Button>
            <Button variant="ghost" onClick={() => setMode('ask')}>
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function MyDates({ staffId }) {
  const { state, dropOut, removeAway } = useStaffing2()
  const [confirming, setConfirming] = useState(null)
  const [reason, setReason] = useState('')
  const today = dayStartMin(TODAY_KEY)
  const mine = Object.values(state.requests)
    .filter((r) => r.staffId === staffId && ['accepted', 'backup'].includes(r.status) && dayStartMin(WORLD.eventMap[r.eventId].dateKey) >= today)
    .sort((a, b) => (WORLD.eventMap[a.eventId].dateKey < WORLD.eventMap[b.eventId].dateKey ? -1 : 1))
  const away = state.away.filter((a) => a.staffId === staffId)

  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 text-[13px] font-bold text-ink">Coming up</h3>
        {!mine.length && <p className="text-[12px] text-muted">Nothing confirmed yet.</p>}
        <ul className="space-y-2">
          {mine.map((r) => {
            const ev = WORLD.eventMap[r.eventId]
            const s = displayStatus(r, state)
            return (
              <li key={r.id} className="rounded-2xl border border-line-soft px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{ev.name}</p>
                    <p className="text-[12px] text-muted">
                      {ev.dateShort} · {r.role} · call {fmtH(callTimeH(r, ev))}, done about {fmtH(doneH(r, ev))}
                    </p>
                  </div>
                  <StatusBadge tone={s.tone} size="sm">
                    {s.label}
                  </StatusBadge>
                </div>
                {r.status === 'accepted' &&
                  (confirming === r.id ? (
                    <div className="mt-2 space-y-2 rounded-2xl bg-wash px-3 py-2.5">
                      <p className="text-[12px] font-semibold text-ink">
                        Tell {MANAGER.first} you can&apos;t make the {ev.name}?
                      </p>
                      <PickChips options={REASONS} value={reason} onChange={setReason} label="Reason" />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            dropOut(r.id, reason || null)
                            setConfirming(null)
                            setReason('')
                          }}
                        >
                          Yes, tell {MANAGER.first}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                          Keep it
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(r.id)}
                      className="mt-1.5 text-[12px] font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      Can&apos;t make it anymore?
                    </button>
                  ))}
              </li>
            )
          })}
        </ul>
      </section>
      <section>
        <h3 className="mb-2 text-[13px] font-bold text-ink">Dates I can&apos;t work</h3>
        <ul className="mb-2 space-y-1.5">
          {away.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 text-[12px] text-ink-2">
              <span>{awayDateText(a)}</span>
              <button type="button" onClick={() => removeAway(a.id)} className="font-semibold text-accent hover:underline">
                Remove
              </button>
            </li>
          ))}
          {!away.length && <li className="text-[12px] text-muted">None yet.</li>}
        </ul>
        <AwayDateForm staffId={staffId} addedBy="staff" idPrefix={`phone-away-${staffId}`} />
      </section>
    </div>
  )
}

export function StaffPhone({ staffId }) {
  const { state } = useStaffing2()
  const [tab, setTab] = useState('texts')
  const [replyTo, setReplyTo] = useState(null)
  const person = staffById(staffId)

  useEffect(() => {
    setReplyTo(null)
    setTab('texts')
  }, [staffId])

  if (!person) return null
  const texts = state.messages.filter((m) => m.staffId === staffId)

  return (
    <div className="surface-card mx-auto flex w-full max-w-[360px] flex-col border border-line sm:min-h-[640px]">
      <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-blush text-[11px] font-bold text-ink">{person.initials}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">{person.name}</p>
          <p className="text-[11px] text-muted">{person.phone}</p>
        </div>
      </div>
      <div className="px-4 pt-3">
        <PillTabs value={tab} onChange={(t) => { setTab(t); setReplyTo(null) }} />
      </div>
      <div className="flex-1 px-4 py-3">
        {tab === 'texts' ? (
          replyTo ? (
            <ReplyPage requestId={replyTo} onDone={() => setReplyTo(null)} />
          ) : !texts.length ? (
            <p className="py-10 text-center text-[13px] text-muted">
              No texts yet. When {MANAGER.first} asks {firstName(staffId)} to work, the text shows up here.
            </p>
          ) : (
            <ul className="space-y-3">
              {texts.map((m) => {
                const r = state.requests[m.requestId]
                const canAnswer = ASKS.includes(m.kind) && r?.status === 'pending' && texts.find((x) => x.requestId === m.requestId && ASKS.includes(x.kind))?.id === m.id
                return (
                  <li key={m.id}>
                    <p className="mb-1 text-[11px] text-faint">
                      {venue.name} · {stampLabel(m.at)}
                    </p>
                    <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-wash-deep px-3 py-2.5 text-[13px] leading-relaxed text-ink">
                      {m.text}
                      {canAnswer && (
                        <button
                          type="button"
                          onClick={() => setReplyTo(m.requestId)}
                          className="mt-1.5 block font-semibold text-accent underline underline-offset-2"
                        >
                          Tap to answer
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )
        ) : (
          <MyDates staffId={staffId} />
        )}
      </div>
    </div>
  )
}

/** The same phone in a right-hand drawer, fixed to one person. */
export function PhoneDrawer() {
  const { phoneFor, closePhone } = useStaffing2()
  const person = phoneFor ? staffById(phoneFor) : null
  return (
    <Drawer
      open={!!person}
      onClose={closePhone}
      modal={false}
      title={person ? `${person.name.split(' ')[0]}'s phone` : ''}
      subtitle="Simulated. Answer as them and watch the event screen update."
      labelId="phone-drawer-title"
      width="sm:w-[420px]"
    >
      {person && <StaffPhone staffId={person.id} />}
    </Drawer>
  )
}
