'use client'

// ---------------------------------------------------------------------------
// Steps 1/3 (welcome) and 2/3 (choose your colour) of the first-run guide.
//
// One dialog shell for both steps, so focus moves smoothly from step 1 to
// step 2 instead of bouncing out and back in. Modal: focus is moved in, Tab
// stays inside, Esc / the close button / Skip all leave the guide, and focus
// goes back to wherever it was before.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react'
import { cx } from '@/lib/cx'
import { Button, Icon } from '@/components/ui/primitives'
import { ThemePicker } from './ThemePicker'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** "1/3" pill plus three dots. Tells the user the guide is short and where they are. */
export function StepPill({ n, total = 3 }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[12px] font-bold text-accent">
      <span aria-hidden="true">
        {n}/{total}
      </span>
      <span className="sr-only">
        Step {n} of {total}
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cx('h-1.5 rounded-full', i < n ? 'w-3 bg-accent' : 'w-1.5 bg-accent-line')} />
        ))}
      </span>
    </span>
  )
}

export function GuideDialog({ step, accent, onAccent, onNext, onSkip }) {
  const ref = useRef(null)
  const skipRef = useRef(onSkip)
  skipRef.current = onSkip

  // Mount: remember where focus was, trap Tab, Esc leaves the guide.
  useEffect(() => {
    const previous = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        skipRef.current()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous && previous !== document.body && document.contains(previous)) previous.focus?.()
    }
  }, [])

  // Each step: move focus to its title so the new content is announced.
  useEffect(() => {
    ref.current?.querySelector('[data-autofocus]')?.focus()
  }, [step])

  const n = step === 'welcome' ? 1 : 2
  const titleId = `guide-title-${n}`
  const bodyId = `guide-body-${n}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface shadow-pop motion-safe:animate-[vue-rise_.28s_ease-out] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 px-6 pt-6">
          <StepPill n={n} />
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-line p-2 text-muted transition-colors hover:border-accent-line hover:bg-accent-soft hover:text-accent"
          >
            <Icon name="x" size={14} />
            <span className="sr-only">Close the guide</span>
          </button>
        </header>

        {step === 'welcome' ? (
          <div className="px-6 pb-2 pt-4">
            <h2 id={titleId} tabIndex={-1} data-autofocus className="display text-[28px] text-ink outline-none">
              Welcome to Vue
            </h2>
            <div id={bodyId} className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-2">
              <p>
                Three quick steps and your first couple will be in. Make Vue your own, see where your next jobs wait,
                then add the couple you are working with.
              </p>
              <p className="text-[13px] text-muted">You can leave the guide at any time.</p>
            </div>
            <p className="mt-4 rounded-2xl bg-wash px-4 py-3 text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-ink-2">This is a prototype.</span> Everything in it is simulated.
              Nothing is saved to a real system and no real messages are sent.
            </p>
          </div>
        ) : (
          <ThemeStep titleId={titleId} bodyId={bodyId} accent={accent} onAccent={onAccent} />
        )}

        <footer className="flex flex-wrap items-center justify-end gap-2 px-6 pb-6 pt-4">
          <Button variant="secondary" onClick={onSkip}>
            Skip guide
          </Button>
          <Button variant="primary" onClick={onNext}>
            {step === 'welcome' ? 'Let’s start' : 'Use this colour'}
            <Icon name="arrowRight" size={14} />
          </Button>
        </footer>
      </div>
    </div>
  )
}

function ThemeStep({ titleId, bodyId, accent, onAccent }) {
  return (
    <div className="px-6 pb-2 pt-4">
      <h2 id={titleId} tabIndex={-1} data-autofocus className="display text-[28px] text-ink outline-none">
        Choose your theme
      </h2>
      <p id={bodyId} className="mt-3 text-[15px] leading-relaxed text-ink-2">
        Vue uses it for the things that need you, so they stand out. Everything switches as you pick.
      </p>

      <ThemePicker accent={accent} onChange={onAccent} />

      {/* Live preview of the two places the colour matters most. */}
      <div className="mt-4 rounded-2xl bg-wash px-4 py-3" aria-hidden="true">
        <div className="eyebrow mb-2 text-faint">Preview</div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-on-accent shadow-pop">
            <Icon name="check" size={14} />
            Up Next
          </span>
          <span className="text-[13px] font-semibold text-accent">View couple</span>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-bold text-accent">2 to do first</span>
        </div>
      </div>
    </div>
  )
}
