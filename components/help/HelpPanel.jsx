'use client'

// The Help button in the top bar and its panel: "Where do I…?" Every
// everyday job, in plain steps, with one button that goes there
// (lib/help.js). One job open at a time, so the list stays short to scan.

import { useState } from 'react'
import { HELP_JOBS } from '@/lib/help'
import { cx } from '@/lib/cx'
import { Button, Icon, Modal } from '@/components/ui'
import { showFirstSteps } from './FirstSteps'

export function HelpButton() {
  const [open, setOpen] = useState(false)
  const [openJob, setOpenJob] = useState(HELP_JOBS[0].id)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-strong bg-surface px-2.5 text-small font-medium text-ink transition-colors hover:bg-surface-sunken sm:px-3"
        aria-haspopup="dialog"
      >
        <Icon name="help" size={16} />
        <span className="hidden md:inline">Help</span>
        <span className="sr-only md:hidden">Help: where do I find things?</span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        variant="sheet"
        title="Where do I…?"
        subtitle="Pick what you want to do. Each one says where to go, step by step."
        labelledBy="help-title"
      >
        <ul className="space-y-2">
          {HELP_JOBS.map((job) => {
            const expanded = openJob === job.id
            return (
              <li key={job.id} className={cx('rounded-md border', expanded ? 'border-line-strong bg-surface' : 'border-line')}>
                <button
                  type="button"
                  onClick={() => setOpenJob(expanded ? null : job.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  data-autofocus={job.id === HELP_JOBS[0].id ? true : undefined}
                >
                  <span className="min-w-0 flex-1 font-medium text-ink">{job.question}</span>
                  <Icon name="chevronDown" size={15} className={cx('text-ink-muted transition-transform', expanded && 'rotate-180')} />
                </button>
                {expanded && (
                  <div className="border-t border-line px-4 pt-3 pb-4">
                    <ol className="space-y-2">
                      {job.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-small text-ink">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-label text-accent">{i + 1}</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                    <Button href={job.href} variant="primary" size="sm" className="mt-4" onClick={() => setOpen(false)}>
                      {job.cta}
                      <Icon name="arrowRight" size={13} />
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-small text-ink-muted">
          Looking for a person, event or couple? Type their name in <span className="font-medium text-ink">Search</span> at the top of every page.
        </p>
        <Button
          href="/dashboard"
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => {
            showFirstSteps()
            setOpen(false)
          }}
        >
          <Icon name="refresh" size={13} />
          Show the 3-step guide on the dashboard again
        </Button>
      </Modal>
    </>
  )
}
