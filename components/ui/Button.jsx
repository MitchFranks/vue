'use client'

import Link from 'next/link'
import { cx } from '@/lib/cx'

/* ---------------------------------------------------------------- Button -- */
// Every action is one of these. `primary` (ink fill) is the one action a
// region exists for: one per region. Buttons never take a status colour,
// except `danger`, whose text says the action destroys something.

const BUTTON_VARIANTS = {
  primary: 'border-transparent bg-ink text-on-ink hover:bg-ink/85',
  secondary: 'border-line-strong bg-surface text-ink hover:bg-surface-sunken',
  danger: 'border-line-strong bg-surface text-status-now hover:bg-status-now-soft',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-surface-sunken',
  // Outline for use on top of the landing hero's dark photo (or its placeholder).
  onDark: 'border-white/70 bg-transparent text-white hover:bg-white/10'
}

const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-small gap-1.5',
  md: 'h-9 px-4 text-small gap-2',
  lg: 'h-11 px-5 text-body gap-2'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  href,
  type = 'button',
  className = '',
  disabled,
  children,
  ...rest
}) {
  const cls = cx(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm border font-medium',
    'transition-[background-color,border-color,transform] duration-150 ease-calm active:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  )
  if (href && !disabled) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
