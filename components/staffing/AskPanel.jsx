'use client'

// ---------------------------------------------------------------------------
// Ask panel (spec §B.3). A dropdown lists the people in the role's pool who can
// be asked, best fit first, so the user recognises a name instead of recalling
// one. Picking several people for one spot is allowed: the first yes wins and later yeses
// become Backups. A hard issue needs a reason before asking.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { cx } from '@/lib/cx'
import { Avatar, Button, Icon } from '@/components/ui/primitives'
import { WORLD } from '@/lib/staffing/adapter'
import { SETTINGS } from '@/lib/staffing/rules'
import {
  blocksOfRequest,
  callTimeH,
  coverage,
  eventOf,
  firstName,
  fmtH,
  goodReasons,
  rank,
  roleBlocks
} from '@/lib/staffing/derive'
import { useStaffing2 } from '@/lib/staffing/store'
import { BlockToggles, CallTimeSelect, PickChips } from './controls'
import { Drawer } from './Drawer'

const GROUPS = [
  ['backup', "Said they're free"],
  ['good', 'Good fit'],
  ['check', 'Check first'],
  ['reason', 'Needs a reason'],
  ['cant', "Can't be asked"]
]

/**
 * config = { eventId, role, blockIds?: string[], mode: 'ask' | 'backups', dropped?: request }
 * onAsk(spec, opts) opens Send review; the panel closes itself.
 */
export function AskPanel({ config, onClose, onAsk, hidden = false }) {
  const { state, saveForLater, promote, addPerson } = useStaffing2()
  const { eventId, role, mode } = config
  const ev = eventOf(state, eventId)
  const blocks = roleBlocks(eventId, role, state)
  const backupsMode = mode === 'backups'

  const [selBlocks, setSelBlocks] = useState(() => {
    if (config.blockIds?.length) return config.blockIds
    const gaps = blocks.filter((b) => coverage(eventId, b, role, state).toFind > 0).map((b) => b.id)
    return gaps.length ? gaps : blocks.slice(0, 1).map((b) => b.id)
  })
  const [offset, setOffset] = useState(SETTINGS.callOffsetByRole[role] ?? 0)
  const [allRoles, setAllRoles] = useState(false)
  const [reason, setReason] = useState('')
  const [showCant, setShowCant] = useState(false)
  const [typedName, setTypedName] = useState('')

  const ranked = useMemo(
    () => rank(eventId, role, selBlocks, state, { allRoles, callOffsetMin: offset }),
    [eventId, role, selBlocks, state, allRoles, offset]
  )

  const [ticked, setTicked] = useState(() => {
    if (!backupsMode) return []
    const onEvent = new Set(Object.values(state.requests).filter((r) => r.eventId === eventId && ['draft', 'pending', 'accepted', 'backup'].includes(r.status)).map((r) => r.staffId))
    return rank(eventId, role, config.blockIds || [], state, { callOffsetMin: offset })
      .filter((x) => x.group === 'good' && !x.existing && !onEvent.has(x.person.id))
      .slice(0, 3)
      .map((x) => x.person.id)
  })

  const byGroup = Object.fromEntries(GROUPS.map(([g]) => [g, ranked.filter((x) => x.group === g)]))
  // The dropdown offers everyone who can be asked and has not been picked yet.
  const PICKABLE = [
    ['good', 'Good fit'],
    ['check', 'Check first'],
    ['reason', 'Needs a reason']
  ]
  const pickable = PICKABLE.map(([g, label]) => [g, label, byGroup[g].filter((x) => !ticked.includes(x.person.id))]).filter(([, , list]) => list.length)
  const tickedRows = ranked.filter((x) => ticked.includes(x.person.id) && x.group !== 'cant' && x.group !== 'backup')
  const needReason = tickedRows.filter((x) => x.group === 'reason')
  // Spots still open (need minus confirmed), and how many are already being asked for them.
  const selCovs = selBlocks.map((id) => coverage(eventId, WORLD.blockMap[id].block, role, state))
  const openSpots = Math.max(0, ...selCovs.map((c) => c.gap))
  const alreadyAsked = Math.max(0, ...selCovs.map((c) => c.waiting + c.notSent))
  const canAsk = tickedRows.length > 0 && (!needReason.length || reason.trim())
  const startH = blocks.find((b) => selBlocks.includes(b.id))?.start ?? blocks[0]?.start ?? 0
  const gapMap = Object.fromEntries(blocks.map((b) => [b.id, coverage(eventId, b, role, state).toFind]))

  // Nobody left in the pool: let the user type a name instead.
  const addTyped = () => {
    const name = typedName.trim()
    if (!name) return
    const id = addPerson(name, role)
    if (id) setTicked((t) => [...t, id])
    setTypedName('')
  }
  const toggle = (id) => setTicked((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))
  const spec = () => ({
    eventId,
    role,
    blockIds: selBlocks,
    callOffsetMin: offset,
    staffIds: tickedRows.map((x) => x.person.id),
    reason: needReason.length ? reason.trim() : null,
    source: backupsMode ? 'backup' : 'ask'
  })
  const n = tickedRows.length
  const nothingFits = !byGroup.backup.length && !byGroup.good.length && !byGroup.check.length

  const describe = (x) => {
    if (x.existing && x.existing.status !== 'backup' && x.group !== 'cant') {
      const newNames = selBlocks.filter((b) => !x.existing.blockIds.includes(b)).map((b) => WORLD.blockMap[b].block.name).join(' + ')
      return `Add ${newNames} to ${firstName(x.person.id)}'s day (on ${blocksOfRequest(x.existing).map((b) => b.name).join(' + ')} from ${fmtH(callTimeH(x.existing))})`
    }
    const real = x.issues.filter((i) => i.severity !== 'info')
    if (real.length) return real.map((i) => i.message).join(' · ')
    return goodReasons(x.person, ev, x.issues)
  }

  const footer = (
    <div className="space-y-2.5">
      {n > 0 && n + alreadyAsked > openSpots && (
        <p className="text-label text-ink-muted">
          {openSpots > 0
            ? `${n + alreadyAsked} asked for ${openSpots} spot${openSpots === 1 ? '' : 's'}. The first to say yes gets it; the other${n + alreadyAsked - openSpots === 1 ? '' : 's'} go${n + alreadyAsked - openSpots === 1 ? 'es' : ''} on the backup list.`
            : 'These blocks have no open spot right now, so anyone who says yes goes on the backup list.'}
        </p>
      )}
      {needReason.length > 0 && (
        <div className="space-y-2 rounded-md border border-status-soon-soft bg-status-soon-soft/50 p-3">
          <label htmlFor="ask-reason" className="block text-label font-medium text-ink">
            Why is this OK for {needReason.map((x) => firstName(x.person.id)).join(' and ')}?
          </label>
          <PickChips options={['Checked with them', 'Times can flex']} value={reason} onChange={setReason} label="Quick reasons" />
          <input
            id="ask-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Or type a reason"
            className="block w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink focus:border-accent"
          />
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        {!backupsMode && (
          <Button
            disabled={!canAsk}
            onClick={() => {
              saveForLater(spec())
              onClose()
            }}
          >
            Save for later
          </Button>
        )}
        <Button variant="primary" disabled={!canAsk} onClick={() => onAsk(spec(), { urgentAll: backupsMode })}>
          <Icon name="send" size={13} />
          Ask {n || ''} {n === 1 ? 'person' : 'people'}
          {backupsMode ? ' now' : ''}
        </Button>
      </div>
    </div>
  )

  return (
    <Drawer
      open={!hidden}
      onClose={onClose}
      title={backupsMode ? `Ask backups for ${role}` : `Ask for ${role}`}
      subtitle={`${ev.name} · ${ev.dateShort}`}
      footer={footer}
      labelId="ask-panel-title"
    >
      <div className="space-y-4">
        {backupsMode && config.dropped && (
          <p className="rounded-md bg-surface-sunken px-3 py-2 text-label text-ink-muted">
            Replacing {firstName(config.dropped.staffId)}. Texts go out marked &quot;Short notice&quot; and ask for a reply within {SETTINGS.shortReplyByHours} hours.
          </p>
        )}
        <div>
          <span className="eyebrow mb-1.5 block text-ink">Working</span>
          <BlockToggles blocks={blocks} selected={selBlocks} onChange={setSelBlocks} gaps={gapMap} />
        </div>
        <CallTimeSelect id="ask-call" startH={startH} value={offset} onChange={setOffset} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label htmlFor="ask-pick" className="eyebrow block text-ink">
              Who should we ask?
            </label>
            <select
              id="ask-pick"
              data-autofocus
              value=""
              onChange={(e) => {
                if (e.target.value) setTicked((t) => (t.includes(e.target.value) ? t : [...t, e.target.value]))
              }}
              className="mt-1.5 block w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink focus:border-accent"
            >
              <option value="">{pickable.length ? `Choose a ${allRoles ? 'person' : role}…` : 'Nobody left to pick'}</option>
              {pickable.map(([g, label, list]) => (
                <optgroup key={g} label={label}>
                  {list.map((x) => (
                    <option key={x.person.id} value={x.person.id}>
                      {x.person.name}
                      {!x.person.roles.includes(role) ? ` (${x.person.roles.join(' · ')})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-small text-ink">
            <input type="checkbox" checked={allRoles} onChange={(e) => setAllRoles(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
            Show other roles
          </label>
        </div>

        {!pickable.length && (
          <div>
            <label htmlFor="ask-typed" className="eyebrow block text-ink">
              Add a name
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="ask-typed"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTyped()
                  }
                }}
                placeholder={`Type the ${role}'s name`}
                className="block min-w-0 flex-1 rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink placeholder:text-ink-muted focus:border-accent"
              />
              <Button variant="secondary" disabled={!typedName.trim()} onClick={addTyped}>
                Add
              </Button>
            </div>
            <p className="mt-1.5 text-label text-ink-muted">Nobody else in the pool is free for this. Their availability is not known, so check with them.</p>
          </div>
        )}

        {tickedRows.length > 0 && (
          <section>
            <h3 className="text-small font-medium text-ink">To ask ({tickedRows.length})</h3>
            <ul className="mt-1.5 overflow-hidden rounded-md border border-line">
              {tickedRows.map((x) => (
                <li key={x.person.id} className="flex min-h-[44px] items-start gap-3 border-b border-line bg-surface-sunken/40 px-3 py-2.5 last:border-b-0">
                  <Avatar initials={x.person.initials} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-medium text-ink">{x.person.name}</span>
                    <span className={cx('mt-0.5 block text-label', x.group === 'good' ? 'text-ink-muted' : 'text-ink')}>{describe(x)}</span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => toggle(x.person.id)} aria-label={`Don't ask ${x.person.name}`}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nothingFits && (
          <div className="rounded-md border border-dashed border-line px-4 py-4 text-center">
            <p className="text-small font-medium text-ink">
              No {role} fits {ev.dateShort}.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {!allRoles && (
                <Button size="sm" onClick={() => setAllRoles(true)}>
                  Show other roles
                </Button>
              )}
            </div>
          </div>
        )}

        {GROUPS.filter(([g]) => g === 'backup' || g === 'cant').map(([g, label]) => {
          const list = byGroup[g]
          if (!list.length) return null
          const body = (
            <ul className="mt-1.5 overflow-hidden rounded-md border border-line">
              {list.map((x) => {
                const id = x.person.id
                const on = ticked.includes(id)
                const rowCls = cx('flex min-h-[44px] items-start gap-3 border-b border-line px-3 py-2.5 last:border-b-0', on && 'bg-surface-sunken/60')
                const inner = (
                  <>
                    <Avatar initials={x.person.initials} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-medium text-ink">
                        {x.person.name}
                        {!x.person.roles.includes(role) && <span className="ml-1.5 text-label font-normal text-ink-muted">{x.person.roles.join(' · ')}</span>}
                      </span>
                      <span className={cx('mt-0.5 block text-label', g === 'good' || g === 'backup' ? 'text-ink-muted' : 'text-ink')}>{describe(x)}</span>
                    </span>
                  </>
                )
                if (g === 'cant') return <li key={id} className={rowCls}>{inner}</li>
                if (g === 'backup') {
                  return (
                    <li key={id} className={rowCls}>
                      {inner}
                      <Button size="sm" onClick={() => { promote(x.existing.id); onClose() }}>
                        Confirm
                      </Button>
                    </li>
                  )
                }
                return (
                  <li key={id}>
                    <label className={cx(rowCls, 'cursor-pointer hover:bg-surface-sunken/40')}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(id)}
                        className="mt-2 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                        aria-label={`Ask ${x.person.name}`}
                      />
                      {inner}
                    </label>
                  </li>
                )
              })}
            </ul>
          )
          if (g === 'cant') {
            return (
              <details key={g} open={showCant} onToggle={(e) => setShowCant(e.currentTarget.open)}>
                <summary className="cursor-pointer text-small font-medium text-ink-muted">
                  {label} ({list.length})
                </summary>
                {body}
              </details>
            )
          }
          return (
            <section key={g} id={`group-${g}`}>
              <h3 className="text-small font-medium text-ink">
                {label} ({list.length})
              </h3>
              {body}
            </section>
          )
        })}
      </div>
    </Drawer>
  )
}
