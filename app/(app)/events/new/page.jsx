'use client'

// ---------------------------------------------------------------------------
// SCREEN 14 — Create Event.
//
// Demonstrates that the platform is not wedding-only: the Event Type selector
// changes which optional fields appear. The form validates and gives feedback,
// but (being a prototype) does not actually persist a new event — it says so
// plainly rather than pretending.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EVENT_TYPES } from '@/lib/mock/events'
import { useStore } from '@/lib/store'
import {
  Alert,
  Breadcrumbs,
  Button,
  Card,
  PageHeader,
  Select,
  TextInput,
  Textarea
} from '@/components/ui/primitives'

// Different event types expose slightly different optional fields — but they
// all share the same underlying structure.
const EXTRA_FIELDS = {
  Wedding: [
    { id: 'ceremony-time', label: 'Ceremony time', placeholder: '4:00 PM' },
    { id: 'rehearsal', label: 'Rehearsal date', placeholder: 'Friday before' }
  ],
  Ceremony: [{ id: 'ceremony-time', label: 'Ceremony time', placeholder: '2:00 PM' }],
  Reception: [{ id: 'bar', label: 'Bar arrangement', placeholder: 'Open bar / cash bar' }],
  Birthday: [{ id: 'milestone', label: 'Milestone', placeholder: '40th' }],
  'Corporate Event': [
    { id: 'av', label: 'AV requirements', placeholder: 'Projector, handheld mic' },
    { id: 'invoice-po', label: 'Purchase order number', placeholder: 'PO-00000' }
  ],
  Anniversary: [{ id: 'years', label: 'Years celebrated', placeholder: '40' }],
  Graduation: [{ id: 'school', label: 'School or programme', placeholder: '' }],
  Other: [{ id: 'describe', label: 'Describe the event', placeholder: '' }]
}

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useStore()
  const [type, setType] = useState('Wedding')
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('')
  const [errors, setErrors] = useState({})

  const extras = EXTRA_FIELDS[type] || []

  function submit(e) {
    e.preventDefault()
    const next = {}
    if (!name.trim()) next.name = 'Give the event a name.'
    if (!client.trim()) next.client = 'Add who the event is for.'
    if (!date.trim()) next.date = 'Pick a date.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    toast(`"${name}" would be created as a ${type}. Nothing is saved in this prototype.`)
    router.push('/events')
  }

  return (
    <div>
      <Breadcrumbs
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Events', href: '/events' }, { label: 'New event' }]}
      />
      <PageHeader
        title="Create an event"
        lead="The same structure covers every event type — only a few optional fields change."
      />

      <form onSubmit={submit} noValidate>
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <Card title="Basics" icon="list">
              <div className="space-y-3">
                <Select
                  label="Event type"
                  id="type"
                  options={EVENT_TYPES}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  hint="Changing this changes the optional fields below."
                />
                <TextInput
                  label="Event name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Okafor Wedding"
                  aria-invalid={!!errors.name}
                  hint={errors.name}
                />
                <TextInput
                  label="Client"
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Who is the event for?"
                  aria-invalid={!!errors.client}
                  hint={errors.client}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Date"
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-invalid={!!errors.date}
                    hint={errors.date}
                  />
                  <TextInput
                    label="Expected guests"
                    id="guests"
                    type="number"
                    min="0"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder="150"
                  />
                </div>
              </div>
            </Card>

            <Card title={`Optional — ${type}`} icon="info" subtitle="These fields change with the event type">
              <div className="space-y-3">
                {extras.map((f) => (
                  <TextInput key={f.id} label={f.label} id={f.id} placeholder={f.placeholder} />
                ))}
                <Textarea label="Notes" id="notes" rows={3} placeholder="Anything the team should know." />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="What happens next" icon="info">
              <ol className="list-decimal space-y-1.5 pl-4 text-xs text-muted">
                <li>The event appears in Upcoming Events and on the calendar.</li>
                <li>You add segments (setup, ceremony, reception, cleanup) and what each needs.</li>
                <li>The planner suggests staff from their stated availability.</li>
                <li>You publish, and staff accept or decline.</li>
                <li>Anything left uncovered shows up in Needs Attention.</li>
              </ol>
            </Card>

            <Alert tone="warn" title="Prototype limitation">
              Creating an event here does not persist a new record. The five seeded events are fixed so the
              scenario stays consistent for every tester.
            </Alert>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md">
                Create event
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={() => router.push('/events')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
