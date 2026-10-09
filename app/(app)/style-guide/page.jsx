// Live style guide. Renders the real tokens and components so it can never
// drift from the product. The written rules are in docs/STYLE-GUIDE.md.

import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  Count,
  EmptyState,
  Icon,
  ListRow,
  MetricTile,
  PageHeader,
  StatusBadge,
  TextInput
} from '@/components/ui/primitives'

// Swatch classes are spelled out in full so Tailwind generates them.
const MEANING = [
  { name: 'accent', role: 'Laurel. Focus, selection, links. Never a button', swatch: 'bg-accent', text: 'text-on-accent' },
  { name: 'status-now', role: 'Act today: open positions, overdue, declined', swatch: 'bg-status-now-soft', text: 'text-status-now' },
  { name: 'status-soon', role: 'Coming up this week, needs a look', swatch: 'bg-status-soon-soft', text: 'text-status-soon' },
  { name: 'status-clear', role: 'Handled: confirmed, staffed, paid', swatch: 'bg-status-clear-soft', text: 'text-status-clear' }
]

const NEUTRALS = [
  { name: 'ink', swatch: 'bg-ink', text: 'text-on-ink' },
  { name: 'ink-muted', swatch: 'bg-ink-muted', text: 'text-on-ink' },
  { name: 'line-strong', swatch: 'bg-line-strong', text: 'text-on-ink' },
  { name: 'line', swatch: 'bg-line', text: 'text-ink' },
  { name: 'surface-sunken', swatch: 'bg-surface-sunken', text: 'text-ink' },
  { name: 'canvas', swatch: 'bg-canvas border border-line', text: 'text-ink' },
  { name: 'surface', swatch: 'bg-surface border border-line', text: 'text-ink' }
]

const TYPE = [
  { label: 'Display · 40/44 · 300', cls: 'text-display font-light', sample: 'Johnson Wedding' },
  { label: 'Title · 24/30 · 300', cls: 'text-title font-light', sample: 'Fill the ceremony shift' },
  { label: 'Heading · 16/22 · 500', cls: 'text-heading font-medium', sample: 'Staffable blocks' },
  {
    label: 'Body · 14/20 · 400',
    cls: 'text-body max-w-prose',
    sample: "Jake declined the ceremony assignment. Find a replacement before Saturday so the couple's guests are greeted on time."
  },
  { label: 'Small · 13/18 · 400', cls: 'text-small text-ink-muted', sample: 'Updated 12 minutes ago' },
  { label: 'Numbers · Geist Mono', cls: 'font-mono text-small tabular-nums', sample: '4:30 PM · $12,480.00 · 150 guests' }
]

export const metadata = { title: 'Style guide — Vue' }

export default function StyleGuidePage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Style guide' }]} />
      <PageHeader
        title="Style guide"
        lead="Quiet by default, loud on purpose. Everything below is rendered with the real components and tokens, in whichever theme your system is using. The written rules are in docs/STYLE-GUIDE.md."
      />

      <div className="space-y-6">
        <Card title="Colour that means something" icon="info">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MEANING.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-md border border-line">
                <div className={`${c.swatch} ${c.text} px-4 py-6 font-medium`}>{c.name}</div>
                <p className="px-4 py-3 text-small text-ink-muted">{c.role}</p>
              </div>
            ))}
          </div>
          <p className="mb-2 mt-6 text-small text-ink-muted">Neutrals: almost everything is ink on surface</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {NEUTRALS.map((n) => (
              <div key={n.name} className={`${n.swatch} ${n.text} rounded-sm px-3 py-4 text-label font-medium`}>
                {n.name}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Typography: Geist, never bold" icon="list">
          <dl className="divide-y divide-line">
            {TYPE.map((t) => (
              <div key={t.label} className="grid gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="text-small text-ink-muted">{t.label}</dt>
                <dd className={`${t.cls} text-ink`}>{t.sample}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Buttons" icon="send">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              Send reply
              <Icon name="arrowRight" size={16} />
            </Button>
            <Button variant="primary">
              <Icon name="plus" size={14} />
              New event
            </Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Restore draft</Button>
            <Button variant="danger">Decline</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
          <p className="mt-4 text-small text-ink-muted">
            One ink button per region. Buttons are never coloured: colour means state, not action.
          </p>
        </Card>

        <Card title="Status: icon and word, never colour alone" icon="check">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="urgent">Do first</StatusBadge>
            <StatusBadge tone="declined">Declined</StatusBadge>
            <StatusBadge tone="warn">Needs 1 more</StatusBadge>
            <StatusBadge tone="done">Fully staffed</StatusBadge>
            <StatusBadge tone="pending">Pending</StatusBadge>
            <StatusBadge tone="info">Draft</StatusBadge>
            <StatusBadge tone="empty">Unassigned</StatusBadge>
            <span className="ml-2 inline-flex items-center gap-2 text-small text-ink-muted">
              Counts stay neutral <Count>7</Count>
            </span>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Cards and lists" icon="calendar" bodyClassName="px-0 py-0">
            <ListRow
              leading={<Avatar initials="EJ" />}
              title="Emily & Marcus Johnson"
              sub="Johnson Wedding · Sat, Sep 19"
              trailing={
                <StatusBadge tone="warn" size="sm">
                  Needs 1 more
                </StatusBadge>
              }
              href="/couples/cpl-2001"
            />
            <ListRow
              leading={<Avatar initials="PS" />}
              title="Priya Shah & Dev Patel"
              sub="Shah–Patel Rehearsal Dinner · Thu, Sep 24"
              trailing={
                <StatusBadge tone="done" size="sm">
                  Staffed
                </StatusBadge>
              }
              href="/couples/cpl-2002"
            />
          </Card>

          <Card title="Form fields" icon="user">
            <div className="space-y-4">
              <TextInput label="Couple" id="sg-couple" placeholder="Emily & Marcus Johnson" />
              <TextInput label="Expected guests" id="sg-guests" placeholder="150" hint="You can change this until the guarantee is due." />
            </div>
          </Card>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <MetricTile label="Open positions" value="2" tone="urgent" sub="Need someone this week" />
          <MetricTile label="Confirmed" value="18" tone="done" sub="Across 5 events" />
          <MetricTile label="Weddings" value="3" sub="This season" />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Alert tone="warn" title="Guarantee due Friday">
            Harvest Table needs the final count 48 hours before service.
          </Alert>
          <EmptyState title="Nothing waiting on a reply" body="Every couple and vendor message has been answered." />
        </div>
      </div>
    </div>
  )
}
