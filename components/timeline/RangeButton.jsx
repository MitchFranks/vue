'use client'

// "Display earlier" / "Display later": asks which time to show the run of
// show from, or until. A small pop-over under (or above) a pill button;
// Escape or a click outside closes it.

import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { Button, Icon, Select } from '@/components/ui'

export function RangeButton({ label, prompt, icon, options, initial, onApply, onReset, up = false, disabled = false, disabledNote }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initial)
  const ref = useRef(null)
  const id = `range-${label.toLowerCase().replace(/\s+/g, '-')}`

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        title={disabled ? disabledNote : label}
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        onClick={() => {
          setValue(initial)
          setOpen((v) => !v)
        }}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-label font-medium text-ink-muted transition-colors hover:border-accent hover:bg-surface-sunken hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface disabled:hover:text-ink-muted"
      >
        <Icon name="chevronDown" size={12} className={icon === 'up' ? 'rotate-180' : undefined} />
        {label}
      </button>
      {open && (
        <div
          id={`${id}-panel`}
          role="dialog"
          aria-label={prompt}
          className={cx('absolute left-0 z-30 w-60 rounded-md border border-line bg-surface p-3 shadow-overlay', up ? 'bottom-full mb-1.5' : 'top-full mt-1.5')}
        >
          <Select
            label={prompt}
            id={id}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            options={options}
            hint="Applies to every run of show."
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onReset()
                setOpen(false)
              }}
              className="rounded-sm text-label font-medium text-ink-muted transition-colors hover:text-accent"
            >
              Back to 6 AM – 11 PM
            </button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onApply(value)
                setOpen(false)
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
