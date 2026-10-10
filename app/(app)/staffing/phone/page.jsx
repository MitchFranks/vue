'use client'

// ---------------------------------------------------------------------------
// Staffing Planner · Staff phone (spec §B.8). A simulator: pick a person,
// read the texts they got, and answer as them.
// ---------------------------------------------------------------------------

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/primitives'
import { Staffing2Nav, SkeletonCards } from '@/components/staffing/Nav'
import { StaffPhone } from '@/components/staffing/StaffPhone'
import { WORLD } from '@/lib/staffing/adapter'
import { useStaffing2 } from '@/lib/staffing/store'

function PhoneScreen() {
  const params = useSearchParams()
  const { state, hydrated } = useStaffing2()
  const [who, setWho] = useState(null)

  useEffect(() => {
    if (!hydrated || who) return
    const wanted = params.get('who')
    setWho(WORLD.staffMap[wanted] ? wanted : state.messages[0]?.staffId || 'stf-4003')
  }, [hydrated, who, params, state.messages])

  const counts = Object.fromEntries(WORLD.staff.map((p) => [p.id, state.messages.filter((m) => m.staffId === p.id).length]))

  return (
    <div>
      <PageHeader title="Staff phone" lead="See the texts each person got and answer as them. Replies land on the event screen." />
      <Staffing2Nav />
      {!hydrated || !who ? (
        <SkeletonCards count={1} />
      ) : (
        <div className="space-y-4">
          <div className="mx-auto max-w-[360px]">
            <label htmlFor="viewing-as" className="eyebrow block text-ink">
              Viewing as
            </label>
            <select
              id="viewing-as"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              className="mt-1.5 block w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink focus:border-accent"
            >
              {WORLD.staff.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {counts[p.id] ? ` (${counts[p.id]} text${counts[p.id] === 1 ? '' : 's'})` : ''}
                </option>
              ))}
            </select>
          </div>
          <StaffPhone staffId={who} />
        </div>
      )}
    </div>
  )
}

export default function Staffing2PhonePage() {
  return (
    <Suspense fallback={null}>
      <PhoneScreen />
    </Suspense>
  )
}
