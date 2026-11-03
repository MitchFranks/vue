'use client'

import { Button, Card } from '@/components/ui'

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
