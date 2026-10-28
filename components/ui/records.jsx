'use client'

// ---------------------------------------------------------------------------
// DESIGN LIBRARY — record patterns
//
// The shared shapes behind every "manage a list of things" screen: Staff,
// Vendors, and whatever comes next (spaces, rentals, couples). Each screen
// composes these from the primitives, so a list page, a detail page and a
// create/edit form look the same whatever record they show.
//
//   List page    ListToolbar + EntityList (rows are ListRow)
//   Detail page  DetailGrid of Cards; ContactInfo; RecordStatusCard
//   Form page    RecordForm > FormSection > TextInput / Select / Textarea /
//                CheckboxGroup, driven by useRecordForm
//   Everywhere   RecordStatusBadge for Active / Inactive
// ---------------------------------------------------------------------------

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cx } from '@/lib/cx'
import { RECORD_STATUS } from '@/lib/directory/model'
import { Button, Card, EmptyState, Field, Icon, Select, StatusBadge, TextInput } from './primitives'
import { useConfirm } from './domain'

/* ------------------------------------------------------ RecordStatusBadge -- */

export function RecordStatusBadge({ status, size = 'md' }) {
  const s = RECORD_STATUS[status] || RECORD_STATUS.active
  return (
    <StatusBadge tone={s.tone} size={size}>
      {s.label}
    </StatusBadge>
  )
}

/* ------------------------------------------------------------ ListToolbar -- */
// Search plus any number of select filters, in one wrapping row.

export function useListFilters(defaults) {
  const [values, setValues] = useState(defaults)
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))
  const clear = () => setValues(defaults)
  return { values, set, clear }
}

/**
 * search  { id, label, placeholder, value, onChange }
 * filters [{ id, label, options, value, onChange }]
 */
export function ListToolbar({ search, filters = [] }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-2">
      {search && <TextInput type="search" label="Search" className="min-w-[180px] flex-1" {...search} />}
      {filters.map((f) => (
        <Select key={f.id} {...f} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- EntityList -- */
// The rows inside one card, or an empty state that offers to clear filters.

export function EntityList({ items, renderRow, emptyTitle = 'Nothing matches', emptyBody = 'Try a different filter or clear the search.', onClear }) {
  if (!items.length) {
    return (
      <EmptyState
        icon="search"
        title={emptyTitle}
        body={emptyBody}
        action={
          onClear && (
            <Button variant="secondary" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          )
        }
      />
    )
  }
  return <Card bodyClassName="px-0 py-0">{items.map(renderRow)}</Card>
}

/* ------------------------------------------------------------ DetailGrid -- */
// Two columns on wide screens (who they are | what they do), one on phones.

export function DetailGrid({ aside, children }) {
  return (
    // grid-cols-1 (minmax 0) and min-w-0 let long rows truncate instead of widening the page on phones.
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="min-w-0 space-y-4">{aside}</div>
      <div className="min-w-0 space-y-4">{children}</div>
    </div>
  )
}

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

/* ------------------------------------------------------- RecordStatusCard -- */
// Deactivate keeps the record (and its history) but stops offering it for new
// work. Delete is only offered when nothing points at the record yet.

export function RecordStatusCard({ noun, name, status, onToggleStatus, onDelete, deleteBlockedReason, inactiveNote }) {
  const { confirm, dialog } = useConfirm()
  const active = status !== 'inactive'
  return (
    <Card title="Status" icon="settings" action={<RecordStatusBadge status={status} size="sm" />}>
      <p className="text-small text-ink-muted">
        {active ? `Active ${noun}s can be assigned to events.` : inactiveNote || `Inactive ${noun}s stay on file but are not offered for new work.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onToggleStatus}>
          {active ? 'Mark inactive' : 'Mark active'}
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            disabled={!!deleteBlockedReason}
            title={deleteBlockedReason || undefined}
            onClick={() =>
              confirm({
                title: `Delete ${name}?`,
                body: `This removes the ${noun} from the venue for good. To keep their details, mark them inactive instead.`,
                confirmLabel: `Delete ${noun}`,
                danger: true,
                onConfirm: onDelete
              })
            }
          >
            <Icon name="trash" size={13} />
            Delete
          </Button>
        )}
      </div>
      {deleteBlockedReason && <p className="mt-2 text-small text-ink-muted">{deleteBlockedReason}</p>}
      {dialog}
    </Card>
  )
}

/* ----------------------------------------------------------- useRecordForm -- */
// Values, per-field errors and submit for any record form. `field(name)` gives
// the props a TextInput / Select / Textarea needs, so forms stay declarative.

export function useRecordForm(initial, { idPrefix, validate = () => ({}) }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    setDirty(true)
    if (errors[name]) setErrors(({ [name]: _gone, ...rest }) => rest)
  }

  const field = (name) => ({
    id: `${idPrefix}-${name}`,
    value: values[name] ?? '',
    onChange: (e) => setValue(name, e.target.value),
    error: errors[name]
  })

  /** Validate, focus the first problem, or call onValid(values). */
  const submit = (onValid) => (e) => {
    e?.preventDefault()
    const found = validate(values)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`${idPrefix}-${first}`)?.focus()
      return
    }
    setDirty(false)
    onValid(values)
  }

  return { values, errors, dirty, field, setValue, submit, reset: () => (setValues(initial), setErrors({}), setDirty(false)) }
}

/* ------------------------------------------------------------- RecordForm -- */

export function RecordForm({ onSubmit, submitLabel = 'Save', cancelHref, onCancel, children }) {
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-form space-y-4">
      {children}
      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} onCancel={onCancel} />
    </form>
  )
}

export function FormActions({ submitLabel = 'Save', cancelHref, onCancel }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button type="submit" variant="primary">
        {submitLabel}
      </Button>
      {(cancelHref || onCancel) && (
        <Button href={cancelHref} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      )}
    </div>
  )
}

/** One card of related fields, laid out in a responsive grid. Use `wide` for full-width children. */
export function FormSection({ title, subtitle, icon, action, children }) {
  return (
    <Card title={title} subtitle={subtitle} icon={icon} action={action}>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

/** Spans both columns of a FormSection. */
export function Wide({ children }) {
  return <div className="sm:col-span-2">{children}</div>
}

/* ---------------------------------------------------------- CheckboxGroup -- */

export const CHECKBOX = 'mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]'

/** options: [{ value, label, disabled? }]; value: string[] */
export function CheckboxGroup({ legend, hint, idPrefix, options, value, onChange }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <fieldset>
      <legend className="mb-1.5 block text-small text-ink-muted">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.value} className={cx('flex items-start gap-2 text-body text-ink', o.disabled ? 'opacity-50' : 'cursor-pointer')}>
            <input
              type="checkbox"
              id={`${idPrefix}-${o.value}`}
              className={CHECKBOX}
              checked={value.includes(o.value)}
              disabled={o.disabled}
              onChange={() => toggle(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-small text-ink-muted">{hint}</p>}
    </fieldset>
  )
}

/* ---------------------------------------------------------- QueryRecord -- */
// Detail and edit screens read ?id= so records made in the browser have a
// page too (the static export can only pre-build known ids). The Suspense
// boundary is what lets the rest of the page pre-render.

function WithId({ render }) {
  return render(useSearchParams().get('id'))
}

export function QueryRecord({ render }) {
  return (
    <Suspense fallback={null}>
      <WithId render={render} />
    </Suspense>
  )
}
