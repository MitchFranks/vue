'use client'

// Account: who is signed in, and the account's own controls (sign out, and
// for an account someone created, deleting it). The page ends with links to
// where the work and the other controls are (no dead end).

import { ACTIVE_ACCOUNT, deleteAccount, endSession } from '@/lib/account/session'
import { Alert, Avatar, Breadcrumbs, Button, Card, Field, Icon, ListRow, PageHeader, StatusBadge } from '@/components/ui/primitives'
import { useConfirm } from '@/components/ui/domain'
import { ContactInfo } from '@/components/ui/records'
import { useDirectory } from '@/lib/directory/store'
import { venue } from '@/lib/mock/events'

export default function AccountPage() {
  const account = ACTIVE_ACCOUNT
  const { venue: venueProfile } = useDirectory()
  const { confirm, dialog } = useConfirm()
  if (!account) return null

  const removeAccount = () =>
    confirm({
      title: 'Delete your account?',
      body: `This deletes your sign-in and every staff member, vendor and change saved in the ${account.venueName} workspace in this browser. This cannot be undone.`,
      confirmLabel: 'Delete account',
      danger: true,
      onConfirm: () => {
        deleteAccount(account.id)
        endSession('/signup')
      }
    })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Account' }]} />
      <PageHeader title="Account" lead="Who is signed in on this device." />

      <div className="max-w-2xl space-y-4">
        {account.demo && (
          <Alert tone="info" title="This is the demo account">
            Everyone shares the demo, so its sample data can be reset at any time. Create your own account to start a workspace for your venue.
          </Alert>
        )}

        <Card
          title="Profile"
          icon="user"
          action={
            <StatusBadge tone={account.demo ? 'info' : 'done'} size="sm">
              {account.demo ? 'Demo' : 'Administrator'}
            </StatusBadge>
          }
        >
          <div className="mb-5 flex items-center gap-3">
            <Avatar initials={venue.managerInitials} />
            <div>
              <div className="text-heading font-medium text-ink">{account.name}</div>
              <div className="text-small text-ink-muted">{account.title}</div>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue" value={venueProfile.name} />
            <Field label="Signs in with" value={account.demo ? `${account.username} (username)` : account.email} />
          </dl>
          <div className="mt-4">
            <ContactInfo
              columns={2}
              items={[
                { label: 'Email', value: account.email, type: 'email' },
                { label: 'Phone', value: account.phone || (account.demo ? venue.managerPhone : ''), type: 'phone' }
              ]}
            />
          </div>
        </Card>

        <Card title="Sign out" icon="arrowLeft" subtitle="Ends this session on this device.">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => endSession()}>
              Sign out
            </Button>
            {!account.demo && (
              <Button variant="danger" size="sm" onClick={removeAccount}>
                <Icon name="trash" size={13} />
                Delete account
              </Button>
            )}
          </div>
        </Card>

        <Card title="Where to next" bodyClassName="px-0 py-0">
          <ListRow href="/settings/venue" leading={<Icon name="home" size={16} />} title="Venue profile" sub="Your venue's name, address and main contact" />
          <ListRow href="/settings" leading={<Icon name="settings" size={16} />} title="Settings" sub="Your goal, hidden items and resetting data" />
          <ListRow href="/dashboard" leading={<Icon name="home" size={16} />} title="Dashboard" sub="Back to the overview" />
        </Card>
      </div>

      {dialog}
    </div>
  )
}
