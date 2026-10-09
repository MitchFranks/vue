// Live style guide. Renders the real tokens and components so it can never
// drift from the product. The written rules are in docs/STYLE-GUIDE.md.

import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Icon,
  ListRow,
  MetricTile,
  PageHeader,
  StatusBadge,
  TextInput
} from '@/components/ui/primitives'

const COLOURS = [
  { name: 'accent', role: 'Action — buttons, links, active nav', swatch: 'bg-accent', text: 'text-on-accent', hex: '#6B4BF0' },
  { name: 'blush', role: 'Warmth — decoration only', swatch: 'bg-blush', text: 'text-ink-2', hex: '#FFD9E6' },
  { name: 'done', role: 'Settled — confirmed, staffed, paid', swatch: 'bg-done-soft', text: 'text-done', hex: '#0C7358' },
  { name: 'warn', role: 'Soon — due soon, needs a look', swatch: 'bg-warn-soft', text: 'text-warn', hex: '#86560A' },
  { name: 'urgent', role: 'Now — act now', swatch: 'bg-urgent-soft', text: 'text-urgent', hex: '#C8372F' }
]

const NEUTRALS = [
  { name: 'ink', swatch: 'bg-ink', text: 'text-white' },
  { name: 'ink-2', swatch: 'bg-ink-2', text: 'text-white' },
  { name: 'muted', swatch: 'bg-muted', text: 'text-white' },
  { name: 'faint', swatch: 'bg-faint', text: 'text-white' },
  { name: 'line', swatch: 'bg-line', text: 'text-ink' },
  { name: 'wash', swatch: 'bg-wash', text: 'text-ink' },
  { name: 'canvas', swatch: 'bg-canvas border border-line', text: 'text-ink' },
  { name: 'surface', swatch: 'bg-surface border border-line', text: 'text-ink' }
]

export const metadata = { title: 'Style guide — Vue' }

export default function StyleGuidePage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Style guide' }]} />
      <PageHeader
        title="Style guide"
        lead="Five colours, one typeface, round shapes. Everything below is rendered with the real components, so it always matches the product. The written rules are in docs/STYLE-GUIDE.md."
      />

      <div className="space-y-5">
        <Card title="Colour — five hues" icon="info">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {COLOURS.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-2xl border border-line">
                <div className={`${c.swatch} ${c.text} px-4 py-6 text-[15px] font-bold`}>{c.name}</div>
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-ink">{c.hex}</p>
                  <p className="mt-1 text-xs text-muted">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold text-muted">Supporting neutrals</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {NEUTRALS.map((n) => (
              <div key={n.name} className={`${n.swatch} ${n.text} rounded-2xl px-3 py-4 text-xs font-semibold`}>
                {n.name}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Typography — Plus Jakarta Sans" icon="list">
          <div className="space-y-4">
            <div>
              <p className="eyebrow text-muted">Page title · 800 · 28/36px</p>
              <p className="display text-[34px] text-ink">Johnson Wedding</p>
            </div>
            <div>
              <p className="eyebrow text-muted">Card title · 700 · 14px</p>
              <p className="text-[14px] font-bold text-ink">Timeline blocks</p>
            </div>
            <div>
              <p className="eyebrow text-muted">Body · 400 · 14–15px</p>
              <p className="max-w-[60ch] text-[15px] text-ink-2">
                Jake declined the ceremony assignment. Find a replacement before Saturday so the couple&apos;s
                guests are greeted on time.
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted">Label · 600 · 12px, sentence case</p>
              <p className="text-xs text-muted">Caption · 500 · 11–12px</p>
            </div>
          </div>
        </Card>

        <Card title="Buttons — pills" icon="send">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              Primary
            </Button>
            <Button variant="primary" size="md">
              <Icon name="plus" size={14} />
              New event
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Decline</Button>
            <Button variant="primary" size="sm" disabled>
              Disabled
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">One filled violet button per region. Everything else is a soft outline.</p>
        </Card>

        <Card title="Status badges — icon + word, never colour alone" icon="check">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge tone="warn">Needs 1 more</StatusBadge>
            <StatusBadge tone="warn">Due Friday</StatusBadge>
            <StatusBadge tone="pending">Pending</StatusBadge>
            <StatusBadge tone="done">Fully staffed</StatusBadge>
            <StatusBadge tone="info">Draft</StatusBadge>
            <StatusBadge tone="declined">Declined</StatusBadge>
            <StatusBadge tone="empty">Unassigned</StatusBadge>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Cards and lists" icon="calendar" bodyClassName="px-0 py-0">
            <ListRow
              leading={<Avatar initials="EJ" />}
              title="Emily & Marcus Johnson"
              sub="Johnson Wedding · Sat, Sep 19"
              trailing={<StatusBadge tone="warn" size="sm">Needs 1 more</StatusBadge>}
              href="/couples/johnson-emily"
            />
            <ListRow
              leading={<Avatar initials="AM" />}
              title="Ana & Diego Martinez"
              sub="Martinez Wedding Reception · Sat, Oct 3"
              trailing={<StatusBadge tone="done" size="sm">Staffed</StatusBadge>}
              href="/couples/martinez-ana"
            />
          </Card>

          <Card title="Form fields" icon="user">
            <div className="space-y-4">
              <TextInput label="Couple" id="sg-couple" placeholder="Emily & Marcus Johnson" readOnly />
              <TextInput label="Expected guests" id="sg-guests" placeholder="150" readOnly />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricTile label="Open positions" value="2" tone="urgent" sub="Need someone this week" />
          <MetricTile label="Confirmed" value="18" tone="done" sub="Across 5 events" />
          <MetricTile label="Weddings" value="3" sub="This season" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Alert tone="warn" title="Guarantee due Friday">
            Harvest Table needs the final count 48 hours before service.
          </Alert>
          <EmptyState title="Nothing waiting on a reply" body="Every couple and vendor message has been answered." />
        </div>
      </div>
    </div>
  )
}
