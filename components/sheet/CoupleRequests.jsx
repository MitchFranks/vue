'use client'

// ---------------------------------------------------------------------------
// The couple's run-of-show requests, as the venue answers them (Detail sheet).
//
// Each request says what the couple asked for and, in their words, what they
// expect. Accept applies a move, removal or addition to the run of show and
// logs it as a change by the couple, so it reaches the staff with the
// couple's reason. Decline asks for a short reply the couple sees in their
// portal. A request for "something else" is accepted as a promise: the venue
// makes that change by hand. Rules: lib/eventSheet.js.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { REQUEST_STATUS, requestLine } from '@/lib/eventSheet'
import { stampLabel } from '@/lib/staffing/derive'
import { Button, Card, Icon, StatusBadge, Textarea } from '@/components/ui'

function RequestItem({ r, onAccept, onDecline }) {
  const [declining, setDeclining] = useState(false)
  const [reply, setReply] = useState('')
  const [error, setError] = useState(null)
  const status = REQUEST_STATUS[r.status]

  return (
    <article className="space-y-2 px-4 py-4 sm:px-6">
      <p className="font-medium text-ink">{requestLine(r)}</p>
      {r.note && <p className="text-small text-ink">“{r.note}”</p>}
      <p className="text-label text-ink-muted">
        {r.by} (Couple) · {stampLabel(r.at)}
      </p>

      {r.status === 'waiting' ? (
        declining ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!reply.trim()) return setError('Tell the couple why, so they know what to expect instead.')
              onDecline(r, reply.trim())
            }}
          >
            <Textarea
              id={`decline-${r.id}`}
              label="Your reply to the couple"
              rows={2}
              value={reply}
              onChange={(e) => {
                setReply(e.target.value)
                setError(null)
              }}
              error={error}
              data-autofocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="danger">
                Decline
              </Button>
              <Button size="sm" onClick={() => setDeclining(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => onAccept(r)}>
              <Icon name="check" size={13} />
              Accept
            </Button>
            <Button size="sm" onClick={() => setDeclining(true)}>
              Decline
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-1">
          <StatusBadge tone={status.tone} size="sm">
            {status.label}
          </StatusBadge>
          {r.reply && <p className="text-small text-ink-muted">Your reply: {r.reply}</p>}
        </div>
      )}
    </article>
  )
}

export function CoupleRequests({ requests, onAccept, onDecline }) {
  const waiting = requests.filter((r) => r.status === 'waiting')
  const answered = requests.filter((r) => r.status !== 'waiting').slice(0, 3)
  if (!requests.length) return null
  return (
    <Card
      title="Requests from the couple"
      icon="heart"
      subtitle={waiting.length ? `${waiting.length} waiting for your answer` : 'All answered'}
      bodyClassName="px-0 py-0"
    >
      <div className="divide-y divide-line">
        {[...waiting, ...answered].map((r) => (
          <RequestItem key={r.id} r={r} onAccept={onAccept} onDecline={onDecline} />
        ))}
      </div>
    </Card>
  )
}
