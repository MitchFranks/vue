'use client'

// ---------------------------------------------------------------------------
// Edit needs (spec §B.5): event fields, a stepper per block and role, the
// Suggested column, "+ Add a role", and "How suggestions work". Suggestions
// never change needs on their own; saving is one undoable action.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/domain'
import { Button, TextInput } from '@/components/ui/primitives'
import { ROLES } from '@/lib/mock/staff'
import { WORLD } from '@/lib/staffing/adapter'
import { BAR_TYPES, NO_RULE_TEXT, RATIO_RULES, SERVICE_STYLES } from '@/lib/staffing/rules'
import { coverage, eventOf, needOf, rangeLabel, rolesOf, suggestedFor } from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'

const selectCls =
  'mt-1.5 block w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft'

export function EditNeeds({ eventId, onClose }) {
  const { state, saveNeeds } = useStaffing2()
  const base = WORLD.eventMap[eventId]
  const ev0 = eventOf(state, eventId)
  const [fields, setFields] = useState({
    expectedGuests: String(ev0.expectedGuests ?? ''),
    guaranteedCount: ev0.guaranteedCount ? String(ev0.guaranteedCount) : '',
    serviceStyle: ev0.serviceStyle || 'plated',
    bar: ev0.bar || 'none',
    barStations: String(ev0.barStations ?? 0),
    serversFrom: ev0.suppliedBy?.Server === 'caterer' ? 'caterer' : 'venue'
  })
  const [needs, setNeeds] = useState(() => {
    const out = {}
    for (const b of base.blocks) {
      out[b.id] = {}
      for (const role of rolesOf(b, state)) out[b.id][role] = needOf(b, role, state)
    }
    return out
  })

  const edits = useMemo(
    () => ({
      expectedGuests: Number(fields.expectedGuests) || 0,
      guaranteedCount: fields.guaranteedCount ? Number(fields.guaranteedCount) : null,
      serviceStyle: fields.serviceStyle,
      bar: fields.bar,
      barStations: Number(fields.barStations) || 0,
      suppliedBy: { ...(ev0.suppliedBy || {}), Server: fields.serversFrom }
    }),
    [fields, ev0.suppliedBy]
  )
  // A preview state so the Suggested column follows the form as you type.
  const preview = useMemo(
    () => ({ ...state, needs: { ...state.needs, ...needs }, eventEdits: { ...state.eventEdits, [eventId]: { ...(state.eventEdits[eventId] || {}), ...edits } } }),
    [state, needs, edits, eventId]
  )

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))
  const step = (blockId, role, d) =>
    setNeeds((n) => ({ ...n, [blockId]: { ...n[blockId], [role]: Math.max(0, (n[blockId][role] || 0) + d) } }))
  const setCount = (blockId, role, v) => setNeeds((n) => ({ ...n, [blockId]: { ...n[blockId], [role]: v } }))

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit needs"
      labelledBy="edit-needs-title"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              saveNeeds(eventId, needs, edits)
              onClose()
            }}
          >
            Save needs
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="Guests expected" id="en-guests" type="number" min="0" value={fields.expectedGuests} onChange={set('expectedGuests')} />
          <TextInput label="Guarantee" id="en-guarantee" type="number" min="0" value={fields.guaranteedCount} onChange={set('guaranteedCount')} hint="Final count, usually 48–72 h before" />
          <div>
            <label htmlFor="en-service" className="eyebrow block text-ink-2">
              Service
            </label>
            <select id="en-service" className={selectCls} value={fields.serviceStyle} onChange={set('serviceStyle')}>
              {SERVICE_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="en-bar" className="eyebrow block text-ink-2">
              Bar
            </label>
            <select id="en-bar" className={selectCls} value={fields.bar} onChange={set('bar')}>
              {BAR_TYPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <TextInput label="Bar stations" id="en-stations" type="number" min="0" value={fields.barStations} onChange={set('barStations')} />
          <div>
            <label htmlFor="en-servers" className="eyebrow block text-ink-2">
              Servers come from
            </label>
            <select id="en-servers" className={selectCls} value={fields.serversFrom} onChange={set('serversFrom')}>
              <option value="venue">Venue</option>
              <option value="caterer">Caterer</option>
            </select>
            {fields.serversFrom === 'caterer' && <p className="mt-1 text-[11px] text-muted">Server suggestions are turned off.</p>}
          </div>
        </div>

        {base.blocks.map((b) => {
          const roles = ROLES.filter((r) => r in needs[b.id])
          const missing = ROLES.filter((r) => !(r in needs[b.id]))
          return (
            <section key={b.id}>
              <h3 className="text-[14px] font-bold text-ink">
                {b.name} <span className="font-normal text-muted">{rangeLabel(b.start, b.end)}</span>
              </h3>
              <table className="mt-1.5 w-full table-fixed text-[13px]">
                <colgroup>
                  <col />
                  <col className="w-[120px]" />
                  <col className="w-[84px]" />
                </colgroup>
                <thead>
                  <tr className="text-left text-[11px] text-muted">
                    <th className="py-1 font-semibold">Role</th>
                    <th className="py-1 font-semibold">Needed</th>
                    <th className="py-1 text-right font-semibold">Suggested</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => {
                    const sug = suggestedFor(eventId, b.id, role, preview)
                    const n = needs[b.id][role]
                    const confirmed = coverage(eventId, b, role, state).confirmed
                    return (
                      <tr key={role} className="border-t border-line-soft">
                        <td className="py-1.5 pr-2 text-ink">
                          {role}
                          {n < confirmed && <span className="block text-[11px] text-muted">{confirmed} confirmed; extras stay on</span>}
                        </td>
                        <td className="py-1.5">
                          <span className="inline-flex items-center gap-1">
                            <button type="button" aria-label={`Fewer ${role} on ${b.name}`} onClick={() => step(b.id, role, -1)} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:bg-accent-soft">
                              −
                            </button>
                            <span className="w-6 text-center font-semibold tabular-nums">{n}</span>
                            <button type="button" aria-label={`More ${role} on ${b.name}`} onClick={() => step(b.id, role, 1)} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:bg-accent-soft">
                              +
                            </button>
                          </span>
                        </td>
                        <td className="py-1.5 text-right text-muted">
                          {sug && sug.suggested != null ? (
                            <span title={`${sug.rule.basis} · confidence ${sug.rule.confidence}`}>
                              {sug.suggested}
                              {sug.suggested !== n && (
                                <>
                                  {' · '}
                                  <button type="button" className="font-semibold text-accent hover:underline" onClick={() => setCount(b.id, role, sug.suggested)}>
                                    Use
                                  </button>
                                </>
                              )}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {missing.length > 0 && (
                <select
                  aria-label={`Add a role to ${b.name}`}
                  value=""
                  onChange={(e) => e.target.value && setCount(b.id, e.target.value, 1)}
                  className="mt-1.5 rounded-full border border-dashed border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-accent"
                >
                  <option value="">+ Add a role to {b.name}</option>
                  {missing.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </section>
          )
        })}

        <details className="rounded-2xl bg-wash px-3 py-2.5">
          <summary className="cursor-pointer text-[13px] font-semibold text-ink-2">How suggestions work</summary>
          <p className="mt-2 text-[12px] text-muted">
            Suggestions use the guarantee if there is one, otherwise guests expected. They apply only to guest-facing blocks, skip roles the caterer supplies, and never change your needs unless you choose &quot;Use&quot;. These are venue defaults, not rules you must follow.
          </p>
          <ul className="mt-2 space-y-1.5 text-[12px] text-ink-2">
            {RATIO_RULES.map((r) => (
              <li key={r.id}>
                <span className="font-semibold">{r.role}:</span> {r.basis}. Confidence {r.confidence}. {r.source}
              </li>
            ))}
            <li>
              <span className="font-semibold">Event Staff, Grounds, Venue Manager:</span> {NO_RULE_TEXT}
            </li>
          </ul>
        </details>
      </div>
    </Modal>
  )
}
