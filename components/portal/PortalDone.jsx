'use client'

// The moment after a step: a clear "done", one line on what just happened,
// and the next step as the only filled button. When nothing is left, the
// button goes back to the checklist.

import { Button, Icon, ProgressBar } from '@/components/ui'
import { nextStep, STEP_COPY } from '@/lib/portal'

const TITLES = {
  sign: 'Agreement signed',
  pay: 'Payment received',
  details: 'Details sent',
  meeting: 'Meeting booked'
}

export function DoneScreen({ frame, doneId, result, title, steps, venue, onNext }) {
  const next = nextStep(steps)
  return frame({
    title: title || TITLES[doneId],
    children: (
      <div className="surface-card px-4 py-8 text-center sm:px-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-status-clear-soft text-status-clear motion-safe:animate-[vue-pop_.3s_ease-out]">
          <Icon name="check" size={26} />
        </span>
        {result && <p className="mx-auto mt-4 max-w-prose text-heading text-ink">{result}</p>}
        {next ? (
          <div className="mx-auto mt-5 max-w-xs">
            <p className="mb-1.5 text-small text-ink-muted">
              {steps.filter((s) => s.done).length} of {steps.length} done
            </p>
            <ProgressBar value={steps.filter((s) => s.done).length} max={steps.length} label="Steps done" />
          </div>
        ) : (
          <p className="mx-auto mt-2 max-w-prose text-body text-ink-muted">That&apos;s everything {venue.name} needs from you. See you soon!</p>
        )}
        <div className="mt-6 flex flex-col items-center gap-3">
          {next ? (
            <>
              <Button variant="primary" size="lg" onClick={() => onNext(next.id)}>
                Next: {STEP_COPY[next.id].title}
                <Icon name="arrowRight" size={16} />
              </Button>
              <button type="button" onClick={() => onNext(null)} className="text-small font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline">
                Back to your checklist
              </button>
            </>
          ) : (
            <Button variant="primary" size="lg" onClick={() => onNext(null)}>
              Back to your checklist
            </Button>
          )}
        </div>
      </div>
    )
  })
}
