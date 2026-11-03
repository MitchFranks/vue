'use client'

import { cx } from '@/lib/cx'
import { Button } from './Button'
import { Icon } from './Icon'

/* ----------------------------------------------------------------- Toasts --- */
// FEEDBACK: every meaningful action drops one of these. role="status" so it is
// announced to screen readers without stealing focus.
//
// A toast is { id, message, tone?, small?, actions? }. `actions` is a list of
// { label, onClick } shown as small buttons (e.g. Undo, Open Jo's phone); the
// toast closes after an action runs. Hosts own their timing.

export function ToastHost({ toasts, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-3"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-md border border-line bg-surface px-4 py-3 text-ink shadow-overlay motion-safe:animate-[vue-rise_.2s_ease-out]"
        >
          <Icon
            name={t.tone === 'urgent' ? 'alert' : 'check'}
            size={16}
            className={cx('mt-0.5', t.tone === 'urgent' ? 'text-status-now' : 'text-status-clear')}
          />
          <div className="min-w-0 flex-1">
            <p>{t.message}</p>
            {t.small && <p className="mt-1 text-label text-ink-muted">{t.small}</p>}
            {t.actions?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {t.actions.map((a) => (
                  <Button
                    key={a.label}
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      a.onClick()
                      onDismiss(t.id)
                    }}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => onDismiss(t.id)} className="rounded-sm text-ink-muted transition-colors hover:text-ink">
            <Icon name="x" size={13} />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      ))}
    </div>
  )
}
