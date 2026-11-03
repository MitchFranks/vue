'use client'

// SCREEN — Inquiry (?id=). Where an Inquiry task's Action button goes: what
// the client asked for, how to reach them, and the one thing to do about it.
// Inquiries are made in the browser, so this reads ?id= (QueryRecord) rather
// than a pre-built route. There is no inquiry list: Tasks is the way in.

import { useState } from 'react'
import { clientNames, dateLabel, inquiryRows, inquiryStatus, kindOf } from '@/lib/inquiries'
import { useStore } from '@/lib/store'
import { Breadcrumbs, Button, Card, Field, Icon, PageHeader, StatusBadge, useConfirm } from '@/components/ui'
import { ContactInfo, DetailGrid, QueryRecord } from '@/components/records'
import { RecordNotFound } from '@/components/directory/RecordNotFound'
import { ResolveInquiry, resolveLabel } from '@/components/inquiry/ResolveInquiry'
import { SummaryList } from '@/components/inquiry/SummaryList'

function InquiryDetail({ id }) {
  const { hydrated, inquiryById, manualTaskList, closeInquiry, reopenInquiry, toast } = useStore()
  const { confirm, dialog } = useConfirm()
  const [resolving, setResolving] = useState(false)
  const inquiry = inquiryById(id)

  if (!hydrated) return null
  if (!inquiry) return <RecordNotFound noun="inquiry" backHref="/tasks" backLabel="Back to Tasks" />

  const kind = kindOf(inquiry.kind)
  const status = inquiryStatus(inquiry)
  const isNew = inquiry.status === 'new'
  const booked = inquiry.outcome?.taskId ? manualTaskList.find((t) => t.id === inquiry.outcome.taskId) : null

  const close = () =>
    confirm({
      title: `Close ${inquiry.name}'s inquiry?`,
      body: 'Use this for spam, a poor fit or a date that is taken. Its task leaves Tasks. Nothing is sent to the client.',
      confirmLabel: 'Close inquiry',
      danger: true,
      onConfirm: () => {
        closeInquiry(inquiry.id)
        toast(`Closed ${inquiry.name}'s inquiry.`, 'done', {
          actions: [{ label: 'Undo', onClick: () => reopenInquiry(inquiry.id) }]
        })
      }
    })

  const reopen = () => {
    const doIt = () => {
      reopenInquiry(inquiry.id)
      toast(`Reopened ${inquiry.name}'s inquiry. It is back in Tasks.`)
    }
    if (!booked) return doIt()
    confirm({
      title: 'Reopen this inquiry?',
      body: `This also removes "${booked.title}" from Tasks.`,
      confirmLabel: 'Reopen',
      onConfirm: doIt
    })
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Tasks', href: '/tasks' }, { label: 'Inquiry' }]} />
      <PageHeader
        title={clientNames(inquiry)}
        lead={`${kind?.label} · sent ${dateLabel(inquiry.submittedOn)}`}
        actions={<StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      />

      <DetailGrid
        aside={
          <>
            <Card title="Contact" icon="user">
              <ContactInfo
                items={[
                  { label: 'Email', value: inquiry.email, type: 'email' },
                  { label: 'Phone', value: inquiry.phone, type: 'phone' },
                  { label: 'Best way to reach them', value: inquiry.contactPref }
                ]}
              />
            </Card>

            <Card title={isNew ? 'What to do' : 'Outcome'} icon={isNew ? 'inbox' : 'check'}>
              {isNew ? (
                <>
                  <p className="text-ink">Reply within one business day. That is what the client was promised.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => setResolving(true)}>
                      {resolveLabel(inquiry)}
                    </Button>
                    <Button variant="danger" onClick={close}>
                      Close without follow-up
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <dl className="space-y-3">
                    <Field label={inquiry.status === 'closed' ? 'Closed' : 'Done'}>{inquiry.outcome?.label}</Field>
                    {inquiry.outcome?.note && (
                      <Field label="Note">
                        <span className="whitespace-pre-line">{inquiry.outcome.note}</span>
                      </Field>
                    )}
                    {booked && (
                      <Field label="In Tasks">
                        {booked.title} · {booked.due}
                      </Field>
                    )}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booked && (
                      <Button href="/tasks" variant="secondary">
                        Open Tasks
                        <Icon name="arrowRight" size={14} />
                      </Button>
                    )}
                    <Button variant="secondary" onClick={reopen}>
                      <Icon name="refresh" size={14} />
                      Reopen
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </>
        }
      >
        <Card title="What they asked" icon={kind?.icon}>
          <SummaryList rows={inquiryRows(inquiry)} />
        </Card>
      </DetailGrid>

      {resolving && <ResolveInquiry key={inquiry.id} inquiry={inquiry} onClose={() => setResolving(false)} />}
      {dialog}
    </div>
  )
}

export default function InquiryPage() {
  return <QueryRecord render={(id) => <InquiryDetail id={id} />} />
}
