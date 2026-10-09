'use client'

// ---------------------------------------------------------------------------
// The assign panel (a right-hand drawer, a bottom sheet on phones).
//
// Pick who fills one slot. Everyone gets soft warnings — outside availability,
// double-booked, declined before, usually another role — and warnings never
// block: "Assign anyway" saves the override so it stays visible on the board.
// Pattern: Planning Center's person picker with conflict badges, plus When I
// Work / Deputy's "schedule anyway".
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { hourLabel, positionIdFor, useStore } from '@/lib/store'
import { Avatar, Button, Icon, StatusBadge } from './ui/primitives'

export function AssignPanel({ open, onClose, event, block, role, replaceId }) {
  const { candidatesForSlot, assignStaff, removeAssignment, offerPosition, assignmentsForBlock, toast } = useStore()
  const [allRoles, setAllRoles] = useState(false)

  if (!open || !event || !block || !role) return null

  const requirement = block.requirements.find((r) => r.role === role)
  const accepted = assignmentsForBlock(block.id).filter((a) => a.role === role && a.status === 'accepted').length
  const candidates = candidatesForSlot(block, role, { allRoles })
  const eligible = candidates.filter((c) => c.eligible && !c.alreadyOnBlock)

  function assign(candidate) {
    const warning = candidate.warnings.map((w) => w.text).join('; ')
    assignStaff(block.id, candidate.person.id, role, {
      overridden: candidate.warnings.length > 0,
      warning
    })
    if (replaceId) removeAssignment(replaceId)
    toast(
      candidate.warnings.length
        ? `${candidate.person.name} assigned despite a warning. Saved as not sent.`
        : `${candidate.person.name} assigned to ${block.name}. Saved as not sent.`
    )
    onClose()
  }

  function offer() {
    offerPosition(
      positionIdFor(block.id, role),
      eligible.map((c) => c.person.id)
    )
    toast(`Offered to ${eligible.length} eligible ${eligible.length === 1 ? 'person' : 'people'}.`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-title"
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface shadow-pop sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id="assign-title" className="font-display text-[20px] font-bold text-ink">
              {block.name}: {role}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {event.name} · {hourLabel(block.start)} – {hourLabel(block.end)}
              {requirement ? ` · ${accepted} of ${requirement.count} accepted` : ''}
            </p>
            {replaceId && <p className="mt-1 text-xs font-semibold text-accent">Choosing a replacement</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line p-2 text-muted transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Icon name="x" size={14} />
            <span className="sr-only">Close</span>
          </button>
        </header>

        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
          <label className="flex items-center gap-2 text-[13px] text-ink-2">
            <input
              type="checkbox"
              checked={allRoles}
              onChange={(e) => setAllRoles(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Show other roles
          </label>
          <Button variant="secondary" size="sm" disabled={eligible.length === 0} onClick={offer}>
            Offer to everyone eligible ({eligible.length})
          </Button>
        </div>

        <ul className="flex-1">
          {candidates.map((c) => (
            <li key={c.person.id} className="border-b border-line-soft px-5 py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <Avatar initials={c.person.initials} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{c.person.name}</p>
                  <p className="text-xs text-muted">
                    {c.person.role} · {c.person.preferredHours}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.alreadyOnBlock ? (
                      <StatusBadge tone="info" size="sm">
                        Already on this block
                      </StatusBadge>
                    ) : c.warnings.length === 0 ? (
                      <StatusBadge tone="done" size="sm">
                        Available
                      </StatusBadge>
                    ) : (
                      c.warnings.map((w) => (
                        <StatusBadge key={w.kind} tone={w.kind === 'declinedBefore' ? 'urgent' : 'warn'} size="sm">
                          {w.text}
                        </StatusBadge>
                      ))
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {c.alreadyOnBlock ? null : c.warnings.length === 0 ? (
                    <Button variant="primary" size="sm" onClick={() => assign(c)}>
                      Assign
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => assign(c)}>
                      Assign anyway
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
          {candidates.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted">Nobody holds this role.</li>
          )}
        </ul>

        <footer className="border-t border-line px-5 py-3 text-xs text-muted">
          Warnings never block. New assignments are saved as <strong>not sent</strong> until you publish.
        </footer>
      </aside>
    </div>
  )
}
