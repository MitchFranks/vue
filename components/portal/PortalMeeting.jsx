'use client'

// Step: meeting. What kind (three cards), which day, which time (pills), and
// one button that names what it books ("Book final walkthrough"). Once
// booked, the screen shows the booking with "Change time" and "Cancel
// meeting". The booking appears in the venue's Tasks on that date.

import { useState } from 'react'
import { Button, ChoiceCards, ChoicePills, Icon, TextInput, useConfirm } from '@/components/ui'
import { addDaysKey, MEETING_KINDS, MEETING_TIMES, meetingKind, meetingWhen, STEP_COPY, validateMeeting } from '@/lib/portal'
import { TODAY_KEY } from '@/lib/mock/events'
import { useStore } from '@/lib/store'

const KIND_ICON = { walkthrough: 'home', planning: 'list', call: 'phone' }

export function MeetingStep({ couple, record, by, venue, screen, complete, back }) {
  const { portalBookMeeting, portalCancelMeeting, toast } = useStore()
  const { confirm, dialog } = useConfirm()
  const booked = record.meeting
  const [changing, setChanging] = useState(false)
  const [v, setV] = useState({ kind: booked?.kind || 'walkthrough', dateKey: booked?.dateKey || '', time: booked?.time || '' })
  const [errors, setErrors] = useState({})
  const set = (k, value) => {
    setV((x) => ({ ...x, [k]: value }))
    setErrors(({ [k]: _gone, ...rest }) => rest)
  }
  const kind = meetingKind(v.kind)

  if (booked && !changing) {
    const bk = meetingKind(booked.kind)
    return screen('meeting', {
      title: 'Your meeting',
      lead: "You're booked. See you then.",
      children: (
        <>
          <div className="surface-card flex items-start gap-4 px-4 py-5 sm:px-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-status-clear-soft text-status-clear">
              <Icon name={KIND_ICON[booked.kind]} size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-heading font-medium text-ink">{bk?.label}</p>
              <p className="mt-0.5 text-body text-ink">{meetingWhen(booked)}</p>
              <p className="mt-0.5 text-small text-ink-muted">
                About {bk?.minutes} minutes · at {venue.name} · booked by {booked.by}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setChanging(true)}>
              Change time
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                confirm({
                  title: 'Cancel this meeting?',
                  body: `${venue.name} will see that it is cancelled. You can book a new one any time.`,
                  confirmLabel: 'Cancel meeting',
                  danger: true,
                  onConfirm: () => {
                    portalCancelMeeting(couple.id)
                    toast('Meeting cancelled.')
                    back()
                  }
                })
              }
            >
              Cancel meeting
            </Button>
          </div>
          {dialog}
        </>
      )
    })
  }

  const book = (e) => {
    e.preventDefault()
    const found = validateMeeting(v)
    setErrors(found)
    if (Object.keys(found).length) return
    portalBookMeeting(couple.id, v, by)
    setChanging(false)
    complete('meeting', `${kind.label}, ${meetingWhen(v)}. It is on ${venue.name}'s schedule.`)
  }

  return screen('meeting', {
    title: booked ? 'Change your meeting' : STEP_COPY.meeting.title,
    lead: STEP_COPY.meeting.lead,
    children: (
      <form onSubmit={book} noValidate className="space-y-6">
        <ChoiceCards
          name="meeting-kind"
          legend="What would you like?"
          options={MEETING_KINDS.map((k) => ({ value: k.value, label: k.label, blurb: k.blurb, meta: `About ${k.minutes} minutes`, icon: KIND_ICON[k.value] }))}
          value={v.kind}
          onChange={(value) => set('kind', value)}
          error={errors.kind}
        />
        <div className="max-w-xs">
          <TextInput
            id="meeting-date"
            type="date"
            label="Which day?"
            min={addDaysKey(TODAY_KEY, 1)}
            value={v.dateKey}
            onChange={(e) => set('dateKey', e.target.value)}
            error={errors.dateKey}
          />
        </div>
        <ChoicePills name="meeting-time" legend="What time?" options={MEETING_TIMES} value={v.time} onChange={(value) => set('time', value)} error={errors.time} />
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
            Book {kind ? kind.label.toLowerCase() : 'meeting'}
          </Button>
          {booked && (
            <Button variant="ghost" onClick={() => setChanging(false)}>
              Keep my current time
            </Button>
          )}
        </div>
      </form>
    )
  })
}
