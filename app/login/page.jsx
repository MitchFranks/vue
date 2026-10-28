'use client'

// Sign in. Three ways in: your own account, the demo (sample venue, shared
// credentials shown on the page), or create an account from scratch.

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Alert, Button, Card, Icon, TextInput } from '@/components/ui/primitives'
import { useRecordForm } from '@/components/ui/records'
import { AuthLayout, LocalAccountsNote } from '@/components/account/AuthLayout'
import { checkPassword, currentAccount, DEMO_ACCOUNT, endSession, startSession } from '@/lib/account/session'
import { validate } from '@/lib/directory/model'

/** Only same-site paths, so ?next= can't send anyone elsewhere. */
const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')

function SignIn() {
  const next = safeNext(useSearchParams().get('next'))
  const [signedIn, setSignedIn] = useState(null)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const form = useRecordForm(
    { login: '', password: '' },
    { idPrefix: 'login', validate: (v) => validate(v, { required: { login: 'Enter your email.', password: 'Enter your password.' } }) }
  )

  useEffect(() => setSignedIn(currentAccount()), [])

  const signIn = form.submit(async ({ login, password }) => {
    setBusy(true)
    const account = await checkPassword(login, password)
    setBusy(false)
    if (!account) return setFailed(true)
    startSession(account.id, next)
  })

  return (
    <AuthLayout
      title="Sign in to Vue"
      lead="Run your venue's events, staff and vendors in one place."
      footer={
        <>
          New to Vue?{' '}
          <Link href="/signup" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Create an account
          </Link>
        </>
      }
    >
      {signedIn && (
        <Alert
          tone="info"
          title={`You're signed in as ${signedIn.name}`}
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="primary" href={next}>
                Continue
              </Button>
              <Button size="sm" onClick={() => endSession()}>
                Sign out
              </Button>
            </div>
          }
        >
          {signedIn.venueName}
          {signedIn.demo ? ' (demo)' : ''}
        </Alert>
      )}

      <Card title="Your account" icon="user">
        <form onSubmit={signIn} noValidate className="space-y-4">
          <TextInput label="Email" autoComplete="username" hint="For the demo, type demo." {...form.field('login')} />
          <TextInput label="Password" type="password" autoComplete="current-password" {...form.field('password')} />
          {failed && (
            <Alert tone="urgent" title="That email and password don't match">
              Check them and try again, or create an account if you don&apos;t have one in this browser.
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
          <LocalAccountsNote />
        </form>
      </Card>

      <Card title="Try the demo" icon="info" subtitle="A sample venue with weddings, staff and vendors already set up.">
        <dl className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div>
            <dt className="text-small text-ink-muted">Username</dt>
            <dd className="font-mono text-ink">{DEMO_ACCOUNT.username}</dd>
          </div>
          <div>
            <dt className="text-small text-ink-muted">Password</dt>
            <dd className="font-mono text-ink">{DEMO_ACCOUNT.password}</dd>
          </div>
        </dl>
        <p className="mt-3 text-small text-ink-muted">Anything you change in the demo can be undone with Reset prototype data.</p>
        <div className="mt-4">
          <Button onClick={() => startSession(DEMO_ACCOUNT.id, next)}>
            Open the demo
            <Icon name="arrowRight" size={13} />
          </Button>
        </div>
      </Card>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignIn />
    </Suspense>
  )
}
