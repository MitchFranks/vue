'use client'

// Create an account: the venue and the person running it. The new workspace
// starts empty apart from that person, who becomes its first staff member
// and the venue's primary contact (lib/directory/model.js ownWorkspace).

import { useState } from 'react'
import Link from 'next/link'
import { Alert, Select, TextInput } from '@/components/ui/primitives'
import { FormSection, RecordForm, useRecordForm, Wide } from '@/components/ui/records'
import { AuthLayout, LocalAccountsNote } from '@/components/account/AuthLayout'
import { ACCOUNT_TITLES, createAccount, startSession } from '@/lib/account/session'
import { validate } from '@/lib/directory/model'
import { VENUE_TYPES } from '@/lib/mock/directory'
import { GUIDE_KEY } from '@/lib/onboarding'

const MIN_PASSWORD = 8

const BLANK = {
  venueName: '',
  venueType: VENUE_TYPES[0],
  name: '',
  title: ACCOUNT_TITLES[1],
  email: '',
  phone: '',
  password: '',
  confirm: ''
}

function validateSignup(v) {
  const errors = validate(v, {
    required: {
      venueName: "Enter your venue's name.",
      name: 'Enter your name.',
      email: 'Enter your email.',
      password: 'Choose a password.',
      confirm: 'Type the password again.'
    },
    email: ['email']
  })
  if (!errors.password && v.password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`
  if (!errors.confirm && v.confirm !== v.password) errors.confirm = "The passwords don't match."
  return errors
}

export default function SignupPage() {
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const form = useRecordForm(BLANK, { idPrefix: 'signup', validate: validateSignup })
  const { field } = form

  const create = form.submit(async ({ confirm: _confirm, ...details }) => {
    setBusy(true)
    setProblem('')
    try {
      const account = await createAccount(details)
      // The first-visit notice explains the demo, not a brand-new workspace.
      window.localStorage.setItem(GUIDE_KEY, JSON.stringify({ seenIntro: true }))
      startSession(account.id, '/settings/venue?welcome=1')
    } catch (e) {
      setProblem(e.message || 'Something went wrong. Try again.')
      setBusy(false)
    }
  })

  return (
    <AuthLayout
      title="Create your account"
      lead="Set up your venue. You'll start with an empty workspace and add staff, vendors and events from there."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Sign in
          </Link>
          . Just looking?{' '}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Open the demo
          </Link>
          .
        </>
      }
    >
      <RecordForm onSubmit={create} submitLabel={busy ? 'Creating your account…' : 'Create account'}>
        <FormSection title="Your venue" icon="home">
          <Wide>
            <TextInput label="Venue name" autoComplete="organization" {...field('venueName')} />
          </Wide>
          <Select label="Venue type" options={VENUE_TYPES} {...field('venueType')} />
        </FormSection>

        <FormSection title="You" icon="user" subtitle="You'll be the account's administrator and the venue's first staff member.">
          <TextInput label="Full name" autoComplete="name" {...field('name')} />
          <Select label="Your role" options={ACCOUNT_TITLES} {...field('title')} />
          <TextInput label="Email" type="email" autoComplete="email" hint="You'll sign in with this." {...field('email')} />
          <TextInput label="Phone" type="tel" autoComplete="tel" hint="Optional." {...field('phone')} />
        </FormSection>

        <FormSection title="Password">
          <TextInput label="Password" type="password" autoComplete="new-password" hint={`At least ${MIN_PASSWORD} characters.`} {...field('password')} />
          <TextInput label="Confirm password" type="password" autoComplete="new-password" {...field('confirm')} />
          <Wide>
            <LocalAccountsNote />
          </Wide>
        </FormSection>

        {problem && (
          <Alert tone="urgent" title="Couldn't create the account">
            {problem}
          </Alert>
        )}
      </RecordForm>
    </AuthLayout>
  )
}
