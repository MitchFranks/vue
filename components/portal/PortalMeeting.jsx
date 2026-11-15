'use client'

// Book a meeting: a final walkthrough, planning meeting or call, at one of the
// venue's open times. Booking it puts it in the venue's Tasks on that date,
// so nobody has to trade emails to set it up.

import { useState } from 'react'
import { Alert, Button, Card, EmptyState, Modal, Select, TextInput } from '@/components/ui'
import { addDaysKey, MEETING_KINDS, MEETING_TIMES, meetingKind, meetingWhen, validateMeeting } from '@/lib/portal'
import { TODAY_KEY } from '@/lib/mock/events'
import { useStore } from '@/lib/store'

export function PortalMeeting({ couple, record, by }) {
  const { portalCancelMeeting, toast } = useStore()
  const [booking, setBooking] = useState(false)
  const m = record.meeting

  return (
    <section id="portal-meeting" className="scroll-mt-6">
      <Card
        title="Meet with the venue"
        icon="calendar"
        subtitle={m ? 'Booked. See you then.' : 'A final walkthrough, a planning meeting or a quick call.'}
        action={
          m && (
            <Button size="sm" onClick={() => setBooking(true)}>
              Change
            </Button>
          )
        }
      >
        {m ? (
          <div className="space-y-3">
            <Alert tone="done" title={meetingKind(m.kind)?.label}>
              {meetingWhen(m)}, about {meetingKind(m.kind)?.minutes} minutes. Booked by {m.by}.
            </Alert>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                portalCancelMeeting(couple.id)
                toast('Meeting cancelled. The venue has been told.')
              }}
            >
              Cancel this meeting
            </Button>
          </div>
        ) : (
          <EmptyState
            icon="calendar"
            title="Nothing booked yet"
            body="Pick a time that suits you. It goes straight onto the venue's schedule."
            action={
              <Button variant="primary" onClick={() => setBooking(true)}>
                Book a meeting
              </Button>
            }
          />
        )}
      </Card>
      {booking && <MeetingDialog couple={couple} current={m} by={by} onClose={() => setBooking(false)} />}
    </section>
  )
}

function MeetingDialog({ couple, current, by, onClose }) {
  const { portalBookMeeting, toast } = useStore()
  const [v, setV] = useState({ kind: current?.kind || 'walkthrough', dateKey: current?.dateKey || '', time: current?.time || '' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const kind = meetingKind(v.kind)

  const book = (e) => {
    e.preventDefault()
    const found = validateMeeting(v)
    setErrors(found)
    if (Object.keys(found).length) return
    portalBookMeeting(couple.id, v, by)
    toast(`${kind.label} booked for ${meetingWhen(v)}.`)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={current ? 'Change your meeting' : 'Book a meeting'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="meeting-form" variant="primary">
            {current ? 'Save' : 'Book'}
          </Button>
        </>
      }
    >
      <form id="meeting-form" onSubmit={book} noValidate className="space-y-4">
        <Select
          id="meeting-kind"
          label="What kind of meeting?"
          hint={kind?.blurb}
          options={MEETING_KINDS.map((k) => ({ value: k.value, label: `${k.label} (${k.minutes} min)` }))}
          value={v.kind}
          onChange={set('kind')}
          error={errors.kind}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextInput id="meeting-date" type="date" label="Date" min={addDaysKey(TODAY_KEY, 1)} value={v.dateKey} onChange={set('dateKey')} error={errors.dateKey} />
          <Select
            id="meeting-time"
            label="Time"
            options={[{ value: '', label: 'Choose a time' }, ...MEETING_TIMES]}
            value={v.time}
            onChange={set('time')}
            error={errors.time}
          />
        </div>
      </form>
    </Modal>
  )
}
