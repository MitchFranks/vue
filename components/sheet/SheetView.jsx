'use client'

// ---------------------------------------------------------------------------
// The event detail sheet, read-only: the essentials, the run of show and each
// section, in the order staff need them on the day. Shared by the manager's
// Detail sheet tab and a staff member's day-of page, so both read the same
// record the same way.
//
// `fresh` (lib/eventSheet.js freshChanges) marks what changed and hasn't been
// seen yet: the item is tinted and says what it was, so a moved cake cutting
// can't be read past. The manager passes `sectionAction` to put an Edit
// button on each section and `editing` to swap a section for its editor.
// ---------------------------------------------------------------------------

import { cx } from '@/lib/cx'
import { fieldKey, runKey, SHEET_SECTIONS, sheetText } from '@/lib/eventSheet'
import { Card, Field, Icon, StatusBadge } from '@/components/ui'

/** "was 8:30 PM", tinted, under anything that changed. */
function WasNote({ change, children }) {
  return (
    <p className="mt-1 flex items-start gap-1.5 text-small text-status-soon">
      <Icon name="clock" size={13} className="mt-0.5 shrink-0" />
      <span className="min-w-0">
        {children || (
          <>
            Changed · was <span className="line-through decoration-1">{change.from}</span>
          </>
        )}
      </span>
    </p>
  )
}

function FreshFrame({ fresh, children }) {
  return <div className={cx('-mx-2 rounded-sm px-2 py-1', fresh && 'bg-status-soon-soft')}>{children}</div>
}

/** The facts that frame everything else. */
export function SheetEssentials({ event, guests, guarantee, service }) {
  return (
    <Card title="Essentials" icon="calendar">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Field label="Date" value={event.date} />
        <Field label="Couple" value={event.couple} />
        <Field label="Guests" value={guarantee ? `${guarantee} guaranteed` : `${guests} expected`} />
        <Field label="Spaces" value={event.spaces} />
        {service && <Field label="Service" value={service} className="col-span-2" />}
      </dl>
    </Card>
  )
}

/** The run of show, with moved, renamed and new items called out. */
export function SheetRunOfShow({ rows, fresh = {}, action, editor }) {
  return (
    <Card title="Run of show" icon="clock" subtitle="Times everyone works to." action={action} bodyClassName={editor ? undefined : 'px-0 py-0'}>
      {editor ||
        (rows.length === 0 ? (
          <p className="px-4 py-4 text-small text-ink-muted sm:px-6">Nothing on the run of show yet.</p>
        ) : (
          <ol className="divide-y divide-line">
            {rows.map((r) => {
              const moved = fresh[runKey(r.id, 'time')]
              const ends = fresh[runKey(r.id, 'end')]
              const renamed = fresh[runKey(r.id, 'title')]
              const added = fresh[runKey(r.id, 'row')]
              const noted = fresh[runKey(r.id, 'note')]
              const any = moved || ends || renamed || added || noted
              return (
                <li key={r.id} className={cx('flex gap-4 px-4 py-3 sm:px-6', any && 'bg-status-soon-soft')}>
                  <span className="w-20 shrink-0 font-mono text-small tabular-nums text-ink">
                    {r.time}
                    {r.end && r.needsStaff && <span className="block text-ink-muted">to {r.end}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                      {r.title || 'Untitled'}
                      {added && (
                        <StatusBadge tone="warn" size="sm">
                          New
                        </StatusBadge>
                      )}
                    </p>
                    {r.note && <p className="mt-0.5 text-small text-ink-muted">{r.note}</p>}
                    {moved && (
                      <WasNote>
                        Moved from <span className="line-through decoration-1">{moved.from}</span> to {moved.to}
                      </WasNote>
                    )}
                    {ends && <WasNote change={ends} />}
                    {renamed && <WasNote change={renamed} />}
                    {noted && <WasNote>Note changed</WasNote>}
                  </div>
                </li>
              )
            })}
          </ol>
        ))}
    </Card>
  )
}

/** One section of fields, read-only. */
export function SheetSection({ section, values, fresh = {}, action, editor, extra }) {
  return (
    <Card title={section.title} subtitle={section.subtitle} icon={section.icon} action={action}>
      {editor || (
        <>
          {extra}
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {section.fields.map((f) => {
              const text = sheetText(values[f.id])
              const change = fresh[fieldKey(f.id)]
              return (
                <div key={f.id} className={f.kind === 'long' || section.fields.length === 1 ? 'sm:col-span-2' : ''}>
                  <FreshFrame fresh={!!change}>
                    <Field label={f.label}>
                      <span className={text === 'Not given' ? 'text-ink-muted' : 'whitespace-pre-line'}>
                        {text === 'Not given' && f.important ? 'Missing' : text}
                      </span>
                    </Field>
                    {change && <WasNote change={change} />}
                  </FreshFrame>
                </div>
              )
            })}
          </dl>
        </>
      )}
    </Card>
  )
}

/**
 * Every section in sheet order. `sectionAction(section)` and
 * `editorFor(section)` let the manager's page edit in place; `extraFor(id)`
 * adds content above a section's fields (the venue's booked vendors).
 */
export function SheetSections({ values, fresh, sectionAction, editorFor, extraFor }) {
  return SHEET_SECTIONS.map((s) => (
    <SheetSection
      key={s.id}
      section={s}
      values={values}
      fresh={fresh}
      action={sectionAction?.(s)}
      editor={editorFor?.(s)}
      extra={extraFor?.(s.id)}
    />
  ))
}
