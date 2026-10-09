'use client'

// ---------------------------------------------------------------------------
// Ask panel (spec §B.3). People who fit sort first, with plain reasons. Ticking
// several people for one spot is allowed: the first yes wins and later yeses
// become Backups. A hard issue needs a reason before asking.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { cx } from '@/lib/cx'
import { Avatar, Button, Icon } from '@/components/ui/primitives'
import { WORLD } from '@/lib/staffing2/adapter'
import { SETTINGS } from '@/lib/staffing2/rules'
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
} from '@/lib/staffing2/derive'
import { useStaffing2 } from '@/lib/staffing2/store'
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
  const { state, saveForLater, promote } = useStaffing2()
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
  const [search, setSearch] = useState('')
  const [allRoles, setAllRoles] = useState(false)
  const [reason, setReason] = useState('')
  const [showCant, setShowCant] = useState(false)

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

  const q = search.trim().toLowerCase()
  const shown = ranked.filter((x) => !q || x.person.name.toLowerCase().includes(q))
  const byGroup = Object.fromEntries(GROUPS.map(([g]) => [g, shown.filter((x) => x.group === g)]))
  const tickedRows = ranked.filter((x) => ticked.includes(x.person.id) && x.group !== 'cant' && x.group !== 'backup')
  const needReason = tickedRows.filter((x) => x.group === 'reason')
  // Spots still open (need minus confirmed), and how many are already being asked for them.
  const selCovs = selBlocks.map((id) => coverage(eventId, WORLD.blockMap[id].block, role, state))
  const openSpots = Math.max(0, ...selCovs.map((c) => c.gap))
  const alreadyAsked = Math.max(0, ...selCovs.map((c) => c.waiting + c.notSent))
  const canAsk = tickedRows.length > 0 && (!needReason.length || reason.trim())
  const startH = blocks.find((b) => selBlocks.includes(b.id))?.start ?? blocks[0]?.start ?? 0
  const gapMap = Object.fromEntries(blocks.map((b) => [b.id, coverage(eventId, b, role, state).toFind]))

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
        <p className="text-[12px] text-muted">
          {openSpots > 0
            ? `${n + alreadyAsked} asked for ${openSpots} spot${openSpots === 1 ? '' : 's'}. The first to say yes gets it; the other${n + alreadyAsked - openSpots === 1 ? '' : 's'} go${n + alreadyAsked - openSpots === 1 ? 'es' : ''} on the backup list.`
            : 'These blocks have no open spot right now, so anyone who says yes goes on the backup list.'}
        </p>
      )}
      {needReason.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-warn-line bg-warn-soft/50 p-3">
          <label htmlFor="ask-reason" className="block text-[12px] font-semibold text-ink">
            Why is this OK for {needReason.map((x) => firstName(x.person.id)).join(' and ')}?
          </label>
          <PickChips options={['Checked with them', 'Times can flex']} value={reason} onChange={setReason} label="Quick reasons" />
          <input
            id="ask-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Or type a reason"
            className="block w-full rounded-2xl border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft"
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
          <p className="rounded-2xl bg-info-soft px-3 py-2 text-[12px] text-info">
            Replacing {firstName(config.dropped.staffId)}. Texts go out marked &quot;Short notice&quot; and ask for a reply within {SETTINGS.shortReplyByHours} hours.
          </p>
        )}
        <div>
          <span className="eyebrow mb-1.5 block text-ink-2">Working</span>
          <BlockToggles blocks={blocks} selected={selBlocks} onChange={setSelBlocks} gaps={gapMap} />
        </div>
        <CallTimeSelect id="ask-call" startH={startH} value={offset} onChange={setOffset} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label htmlFor="ask-search" className="eyebrow block text-ink-2">
              Search
            </label>
            <input
              id="ask-search"
              data-autofocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find by name"
              className="mt-1.5 block w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft"
            />
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-[13px] text-ink-2">
            <input type="checkbox" checked={allRoles} onChange={(e) => setAllRoles(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
            Show other roles
          </label>
        </div>

        {nothingFits && (
          <div className="rounded-2xl border border-dashed border-line px-4 py-4 text-center">
            <p className="text-[13px] font-semibold text-ink">
              No {role} fits {ev.dateShort}.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {!allRoles && (
                <Button size="sm" onClick={() => setAllRoles(true)}>
                  Show other roles
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => document.getElementById('group-reason')?.scrollIntoView({ behavior: 'smooth' })}>
                Show people who need a reason
              </Button>
            </div>
          </div>
        )}

        {GROUPS.map(([g, label]) => {
          const list = byGroup[g]
          if (!list.length) return null
          const body = (
            <ul className="mt-1.5 overflow-hidden rounded-2xl border border-line-soft">
              {list.map((x) => {
                const id = x.person.id
                const on = ticked.includes(id)
                const rowCls = cx('flex min-h-[44px] items-start gap-3 border-b border-line-soft px-3 py-2.5 last:border-b-0', on && 'bg-accent-soft/60')
                const inner = (
                  <>
                    <Avatar initials={x.person.initials} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink">
                        {x.person.name}
                        {!x.person.roles.includes(role) && <span className="ml-1.5 text-[11px] font-normal text-faint">{x.person.roles.join(' · ')}</span>}
                      </span>
                      <span className={cx('mt-0.5 block text-xs', g === 'good' || g === 'backup' ? 'text-muted' : 'text-ink-2')}>{describe(x)}</span>
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
                    <label className={cx(rowCls, 'cursor-pointer hover:bg-accent-soft/40')}>
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
                <summary className="cursor-pointer text-[13px] font-semibold text-muted">
                  {label} ({list.length})
                </summary>
                {body}
              </details>
            )
          }
          return (
            <section key={g} id={`group-${g}`}>
              <h3 className="text-[13px] font-bold text-ink">
                {label} ({list.length})
              </h3>
              {body}
            </section>
          )
        })}
        {!shown.length && <p className="text-[13px] text-muted">Nobody matches &quot;{search}&quot;.</p>}
      </div>
    </Drawer>
  )
}
