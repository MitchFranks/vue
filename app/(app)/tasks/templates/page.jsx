'use client'

// ---------------------------------------------------------------------------
// Planning templates — the checklist every event gets, dated from the event.
//
// Opened from the Tasks page ("Planning templates"). One card per template
// (weddings, and every other event type), each a list of steps in time
// order: when ("14 days before"), what, its task type and who usually does
// it. Every event gets these steps as tasks automatically, assigned to
// whoever holds the role, so the manager doesn't have to remember them or
// write them out per event. Rules: lib/templates.js.
//
// An edit applies to every event (except what was changed on a task itself);
// a new step only creates tasks due from today on; deleting a step removes
// its tasks from every event, so it asks first.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useDirectory } from '@/lib/directory/store'
import { events, TODAY_KEY } from '@/lib/mock/events'
import { blankStep, MANAGER_ROLE, roleAssignee, roleLabel, templateFor, whenLabel } from '@/lib/templates'
import { personFirst } from '@/lib/assignees'
import { Breadcrumbs, Button, Card, Icon, PageHeader, Select, Textarea, TextInput, useConfirm } from '@/components/ui'

const WHEN = [
  { value: 'before', label: 'days before the event' },
  { value: 'on', label: 'on the day' },
  { value: 'after', label: 'days after the event' }
]

function StepForm({ step, taskTypes, roles, onCancel, onSave }) {
  const [draft, setDraft] = useState({
    title: step.title,
    days: String(Math.abs(step.offset)),
    when: step.offset < 0 ? 'before' : step.offset > 0 ? 'after' : 'on',
    type: step.type,
    role: step.role,
    detail: step.detail || ''
  })
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    const next = {}
    if (!draft.title.trim()) next.title = 'Say what needs doing.'
    const n = Number(draft.days)
    if (draft.when !== 'on' && (!/^\d+$/.test(draft.days) || n < 1 || n > 730)) next.days = 'Enter a number of days from 1 to 730.'
    setErrors(next)
    if (Object.keys(next).length) return
    const offset = draft.when === 'on' ? 0 : draft.when === 'before' ? -n : n
    onSave({ ...step, title: draft.title.trim(), offset, type: draft.type, role: draft.role, detail: draft.detail.trim() })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 px-4 py-4 sm:px-6">
      <TextInput label="What needs doing" id={`step-title-${step.id || 'new'}`} value={draft.title} onChange={set('title')} error={errors.title} data-autofocus />
      <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
        {draft.when !== 'on' && (
          <TextInput label="Days" id={`step-days-${step.id || 'new'}`} inputMode="numeric" value={draft.days} onChange={set('days')} error={errors.days} />
        )}
        <Select
          label="When"
          id={`step-when-${step.id || 'new'}`}
          options={WHEN}
          value={draft.when}
          onChange={set('when')}
          className={draft.when === 'on' ? 'sm:col-span-2' : ''}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Task type"
          id={`step-type-${step.id || 'new'}`}
          options={taskTypes.includes(draft.type) ? taskTypes : [...taskTypes, draft.type]}
          value={draft.type}
          onChange={set('type')}
        />
        <Select
          label="Who usually does it"
          id={`step-role-${step.id || 'new'}`}
          hint="The task goes to the first active person in this role."
          options={[{ value: MANAGER_ROLE, label: 'The manager' }, ...roles.map((r) => ({ value: r, label: r }))]}
          value={draft.role}
          onChange={set('role')}
        />
      </div>
      <Textarea label="Description (optional)" id={`step-detail-${step.id || 'new'}`} rows={2} value={draft.detail} onChange={set('detail')} />
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">
          Save step
        </Button>
      </div>
    </form>
  )
}

function TemplateCard({ template, all, taskTypes, roles, editing, setEditing, onSave, onDelete }) {
  const usedBy = events.filter((e) => e.dateKey >= TODAY_KEY && templateFor(all, e)?.id === template.id)
  const forWhom = template.appliesTo === 'other' ? 'Every event that isn’t a wedding' : `Every ${template.appliesTo.toLowerCase()}`
  return (
    <Card
      title={template.name}
      icon="list"
      subtitle={`${forWhom} · ${template.steps.length} steps · used by ${usedBy.length} upcoming ${usedBy.length === 1 ? 'event' : 'events'}`}
      action={
        editing?.templateId !== template.id || editing.stepId ? (
          <Button size="sm" onClick={() => setEditing({ templateId: template.id, stepId: null })}>
            <Icon name="plus" size={13} />
            Add step
          </Button>
        ) : null
      }
      bodyClassName="px-0 py-0"
    >
      <ol className="divide-y divide-line">
        {template.steps.map((st) =>
          editing?.templateId === template.id && editing.stepId === st.id ? (
            <li key={st.id}>
              <StepForm step={st} taskTypes={taskTypes} roles={roles} onCancel={() => setEditing(null)} onSave={(s) => onSave(template, s)} />
            </li>
          ) : (
            <li key={st.id} className="flex flex-wrap items-start gap-3 px-4 py-3 sm:px-6">
              <span className="w-28 shrink-0 text-small font-medium text-ink">{whenLabel(st.offset)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-ink">{st.title}</p>
                <p className="text-small text-ink-muted">
                  {st.type} · {roleLabel(st.role)} ({personFirst(roleAssignee(st.role))})
                </p>
                {st.detail && <p className="mt-0.5 text-small text-ink-muted">{st.detail}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing({ templateId: template.id, stepId: st.id })} aria-label={`Edit ${st.title}`}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(template, st)} aria-label={`Delete ${st.title}`}>
                  Delete
                </Button>
              </div>
            </li>
          )
        )}
        {editing?.templateId === template.id && !editing.stepId && (
          <li className="bg-surface-sunken/40">
            <StepForm step={blankStep()} taskTypes={taskTypes} roles={roles} onCancel={() => setEditing(null)} onSave={(s) => onSave(template, s)} />
          </li>
        )}
      </ol>
    </Card>
  )
}

export default function PlanningTemplatesPage() {
  const { templates, taskTypes, saveTemplateStep, deleteTemplateStep, toast } = useStore()
  const { roles } = useDirectory()
  const { confirm, dialog } = useConfirm()
  const [editing, setEditing] = useState(null) // { templateId, stepId | null (adding) }

  const roleNames = roles.map((r) => r.name)

  const save = (template, step) => {
    saveTemplateStep(template.id, step)
    setEditing(null)
    toast(step.id ? `Saved "${step.title}". Every upcoming event follows it.` : `Added "${step.title}" to the ${template.name.toLowerCase()}.`, 'done', {
      small: step.id ? 'Tasks you changed on an event keep your changes.' : 'Events get it as a task from today on.'
    })
  }

  const remove = (template, step) =>
    confirm({
      title: `Delete “${step.title}”?`,
      body: `Its task comes off every event using the ${template.name.toLowerCase()}, including ones already done. This can’t be undone.`,
      confirmLabel: 'Delete step',
      danger: true,
      onConfirm: () => {
        deleteTemplateStep(template.id, step.id)
        toast(`Deleted "${step.title}".`)
      }
    })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks', href: '/tasks' }, { label: 'Planning templates' }]} />
      <PageHeader
        title="Planning templates"
        lead="The checklist every event gets. Each step becomes a task on every event, dated from the event and assigned to whoever usually does it."
        actions={
          <Button href="/tasks" variant="secondary" size="md">
            <Icon name="arrowLeft" size={14} />
            Back to Tasks
          </Button>
        }
      />
      <div className="max-w-3xl space-y-6">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            all={templates}
            taskTypes={taskTypes}
            roles={roleNames}
            editing={editing}
            setEditing={setEditing}
            onSave={save}
            onDelete={remove}
          />
        ))}
        <p className="text-small text-ink-muted">
          Template tasks show on Tasks and on each event’s Tasks tab like any other task: reassign, edit or mark them done there.
        </p>
      </div>
      {dialog}
    </div>
  )
}
