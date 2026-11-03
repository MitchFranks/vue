'use client'

import { cx } from '@/lib/cx'
import { Field } from '@/components/ui'

/* ------------------------------------------------------------ ContactInfo -- */
// Labelled contact values. Phone and email are real links; empty values say
// so instead of disappearing, so the manager can see what is missing.

const LINK = 'text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent'

const HREF = {
  phone: (v) => `tel:${v.replace(/[^\d+]/g, '')}`,
  email: (v) => `mailto:${v}`,
  website: (v) => (/^https?:\/\//.test(v) ? v : `https://${v}`)
}

/** items: [{ label, value, type?: 'phone' | 'email' | 'website' }] */
export function ContactInfo({ items, columns = 1 }) {
  return (
    <dl className={cx('grid gap-3', columns === 2 && 'sm:grid-cols-2')}>
      {items.map(({ label, value, type }) => (
        <Field key={label} label={label}>
          {!value ? (
            <span className="text-ink-muted">Not added</span>
          ) : HREF[type] ? (
            <a href={HREF[type](value)} className={cx(LINK, 'break-all')} {...(type === 'website' && { target: '_blank', rel: 'noreferrer' })}>
              {value}
            </a>
          ) : (
            value
          )}
        </Field>
      ))}
    </dl>
  )
}
