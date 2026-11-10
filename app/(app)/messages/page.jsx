'use client'

// SCREEN 25 — Message Inbox, plus writing a new message ("New message", or
// arriving with ?to=staff:<id> from a staff profile) and the ones sent.

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Avatar, Breadcrumbs, Button, Card, EmptyState, FilterChip, FilterGroup, Icon, ListRow, PageHeader, StatusBadge } from '@/components/ui'
import { ComposeMessage } from '@/components/messages/ComposeMessage'

const FILTERS = [
  { id: 'needs-reply', label: 'Needs reply' },
  { id: 'all', label: 'All' },
  { id: 'replied', label: 'Replied' },
  { id: 'sent', label: 'Sent' }
]

const TO_LABEL = { staff: 'Staff', vendor: 'Vendor', couple: 'Couple' }
const initials = (name) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
const firstLine = (text) => text.trim().split(/\r?\n/)[0]

/** Opens the compose sheet when the page is reached with ?to= (a staff profile's "Message" button). */
function ComposeFromLink() {
  const router = useRouter()
  const to = useSearchParams().get('to')
  if (!to) return null
  return <ComposeMessage to={to} onClose={() => router.replace('/messages')} />
}

export default function InboxPage() {
  const { messageList, sentMessageList } = useStore()
  const [filter, setFilter] = useState('needs-reply')
  const [composing, setComposing] = useState(false)

  const counts = {
    'needs-reply': messageList.filter((m) => m.needsReply && !m.replied).length,
    all: messageList.length,
    replied: messageList.filter((m) => m.replied).length,
    sent: sentMessageList.length
  }

  const filtered = messageList.filter((m) => {
    if (filter === 'needs-reply') return m.needsReply && !m.replied
    if (filter === 'replied') return m.replied
    return true
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Messages' }]} />
      <PageHeader
        title="Messages"
        lead="Couples, vendors and staff."
        actions={
          <Button variant="primary" onClick={() => setComposing(true)}>
            <Icon name="plus" size={14} />
            New message
          </Button>
        }
      />

      <div className="mb-4">
        <FilterGroup label="Show">
          {FILTERS.map((f) => (
            <FilterChip key={f.id} pressed={filter === f.id} onClick={() => setFilter(f.id)} count={counts[f.id]}>
              {f.label}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      {filter === 'sent' ? (
        sentMessageList.length === 0 ? (
          <EmptyState
            icon="send"
            title="No sent messages yet"
            body="Messages you write with New message show here."
            action={
              <Button variant="secondary" size="sm" onClick={() => setComposing(true)}>
                New message
              </Button>
            }
          />
        ) : (
          <Card bodyClassName="px-0 py-0">
            {sentMessageList.map((m) => (
              <ListRow
                key={m.id}
                leading={<Avatar initials={initials(m.to.name)} />}
                title={m.subject || firstLine(m.body)}
                sub={`To ${m.to.name} · ${TO_LABEL[m.to.type]}`}
                meta={m.subject ? firstLine(m.body) : undefined}
                trailing={
                  <StatusBadge tone="done" size="sm">
                    Sent
                  </StatusBadge>
                }
              />
            ))}
          </Card>
        )
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="check"
          title={filter === 'needs-reply' ? 'Nothing waiting on a reply' : 'Nothing here'}
          body={
            filter === 'needs-reply'
              ? 'Every couple and vendor message has been answered.'
              : 'Try a different filter.'
          }
          action={
            <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
              Show all messages
            </Button>
          }
        />
      ) : (
        <Card bodyClassName="px-0 py-0">
          {filtered.map((m) => (
            <ListRow
              key={m.id}
              href={`/messages/${m.id}`}
              leading={<Avatar initials={m.initials} />}
              title={m.subject}
              sub={`${m.from} · ${m.fromRole}`}
              meta={m.received}
              trailing={
                m.replied ? (
                  <StatusBadge tone="done" size="sm">
                    Replied
                  </StatusBadge>
                ) : m.needsReply ? (
                  <StatusBadge tone={m.priority === 'urgent' ? 'urgent' : 'warn'} size="sm">
                    Needs reply
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="info" size="sm">
                    No reply needed
                  </StatusBadge>
                )
              }
            />
          ))}
        </Card>
      )}
      {composing && <ComposeMessage onClose={() => setComposing(false)} />}
      <Suspense fallback={null}>
        <ComposeFromLink />
      </Suspense>
    </div>
  )
}
