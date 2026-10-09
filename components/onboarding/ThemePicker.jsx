'use client'

// ---------------------------------------------------------------------------
// The accent-colour choices: six curated swatches plus a custom picker, with a
// plain-words note when a custom colour had to be adjusted for contrast.
//
// Shared by step 2 of the first-run guide and the Theme card in Settings, so
// both always offer the same choices. Controlled: pass the current hex and an
// onChange that applies it (OnboardingProvider.setAccent recolours the app
// live and saves it).
// ---------------------------------------------------------------------------

import { useId } from 'react'
import { cx } from '@/lib/cx'
import { SWATCHES, deriveAccent } from '@/lib/onboarding'
import { Icon } from '@/components/ui/primitives'

export function ThemePicker({ accent, onChange, legend = 'Pick a colour' }) {
  const group = useId()
  const derived = deriveAccent(accent)
  const custom = !SWATCHES.some((s) => s.hex === accent)
  const deepened = derived['--color-accent'] !== accent
  const darkText = derived['--color-on-accent'] !== '#ffffff'

  return (
    <>
      <fieldset className="mt-5">
        <legend className="eyebrow mb-3 text-ink-2">{legend}</legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SWATCHES.map((s) => {
            const checked = s.hex === accent
            return (
              <label key={s.hex} className="flex cursor-pointer flex-col items-center gap-1.5">
                <input
                  type="radio"
                  name={`vue-accent-${group}`}
                  value={s.hex}
                  checked={checked}
                  onChange={() => onChange(s.hex)}
                  className="peer sr-only"
                />
                <span
                  style={{ backgroundColor: s.hex }}
                  className={cx(
                    'grid h-12 w-12 place-items-center rounded-full text-white ring-offset-2 ring-offset-surface transition-transform',
                    'peer-focus-visible:ring-4 peer-focus-visible:ring-ink/40 motion-safe:hover:-translate-y-0.5',
                    checked && 'ring-[3px] ring-ink'
                  )}
                >
                  {checked && <Icon name="check" size={18} />}
                </span>
                <span className={cx('text-[12px]', checked ? 'font-bold text-ink' : 'font-medium text-muted')}>
                  {s.name}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-2">
        <input
          type="color"
          value={accent}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
        <span className="flex-1">
          Or pick your own
          {custom && <span className="ml-2 font-medium text-muted">{accent.toUpperCase()}</span>}
        </span>
      </label>
      {custom && (deepened || darkText) && (
        <p className="mt-2 text-[12px] text-muted">
          {deepened
            ? 'We deepened it a little so white text on it stays easy to read.'
            : 'Text on this colour switches to dark so it stays easy to read.'}
        </p>
      )}
    </>
  )
}
