// ---------------------------------------------------------------------------
// Staffing Planner · adapter over the read-only v1 seed (spec §D.3).
// ---------------------------------------------------------------------------

import { events, seedAssignments } from '@/lib/mock/events'
import { staff } from '@/lib/mock/staff'
import { BLOCK_EXTRAS, EVENT_EXTRAS, POOL_STAFF, SEED_AWAY, SEED_RESPONDED_AT, SEED_SENT_AT, STAFF_EXTRAS } from './seed'
import { SETTINGS } from './rules'
import { KEEP, keep } from '@/lib/mock/scope'

function parseMaxHours(text) {
  const nums = String(text || '').match(/\d+/g)
  return nums ? Number(nums[nums.length - 1]) : null
}

export function buildWorld() {
  const evs = events.map((event) => ({
    ...event,
    expectedGuests: event.guests,
    guaranteedCount: null,
    suppliedBy: {},
    ...EVENT_EXTRAS[event.id],
    blocks: event.blocks.map((b) => ({ ...b, ...BLOCK_EXTRAS[b.id] }))
  }))
  const people = [
    ...staff.map((p) => ({ roles: [p.role], credentials: [], pool: false, ...p, ...STAFF_EXTRAS[p.id] })),
    ...keep(POOL_STAFF, KEEP.pool).map((p) => ({ credentials: [], ...p }))
  ].map((p) => ({ ...p, targetMaxHours: parseMaxHours(p.preferredHours) }))

  const eventMap = Object.fromEntries(evs.map((e) => [e.id, e]))
  const staffMap = Object.fromEntries(people.map((p) => [p.id, p]))
  const blockMap = {}
  for (const e of evs) for (const b of e.blocks) blockMap[b.id] = { block: b, event: e }
  return { events: evs, staff: people, eventMap, staffMap, blockMap }
}

export const WORLD = buildWorld()

/** A person typed into the Ask panel when the pool had nobody left. */
export function makeGuest(id, name, role) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  const open = { start: 0, end: 24 }
  return {
    id,
    name,
    initials,
    role,
    roles: [role],
    pool: true,
    added: true,
    phone: '',
    preferredHours: '',
    targetMaxHours: null,
    credentials: [],
    // Availability is unknown for someone added by hand, so they are treated as open.
    availability: { Mon: [open], Tue: [open], Wed: [open], Thu: [open], Fri: [open], Sat: [open], Sun: [open] }
  }
}

/** Make a person known to the planner. Safe to call twice. */
export function registerPerson(person) {
  if (WORLD.staffMap[person.id]) return
  WORLD.staff.push(person)
  WORLD.staffMap[person.id] = person
}

/** Make the planner know exactly the hand-added people in `people` (for reset and undo). */
export function syncPeople(people = []) {
  const keep = new Set(people.map((p) => p.id))
  WORLD.staff = WORLD.staff.filter((p) => !p.added || keep.has(p.id))
  for (const id of Object.keys(WORLD.staffMap)) if (WORLD.staffMap[id].added && !keep.has(id)) delete WORLD.staffMap[id]
  for (const p of people) registerPerson(p)
}

const STATUS_RANK = { declined: 0, draft: 1, pending: 2, accepted: 3 }

export function seedRequests() {
  const groups = new Map()
  for (const a of seedAssignments) {
    const { event } = WORLD.blockMap[a.blockId]
    const key = `${event.id}|${a.staffId}|${a.role}`
    if (!groups.has(key)) groups.set(key, { eventId: event.id, staffId: a.staffId, role: a.role, items: [] })
    groups.get(key).items.push(a)
  }
  const out = {}
  for (const g of groups.values()) {
    const ev = WORLD.eventMap[g.eventId]
    const order = ev.blocks.map((b) => b.id)
    const blockIds = g.items.map((a) => a.blockId).sort((x, y) => order.indexOf(x) - order.indexOf(y))
    const status = g.items.reduce((s, a) => (STATUS_RANK[a.status] < STATUS_RANK[s] ? a.status : s), 'accepted')
    const callOffsetMin = SETTINGS.callOffsetByRole[g.role] ?? 0
    const sentAt = status === 'draft' ? null : SEED_SENT_AT
    const id = `${g.eventId}--${g.staffId}`
    out[id] = {
      id,
      eventId: g.eventId,
      staffId: g.staffId,
      role: g.role,
      blockIds,
      confirmedBlockIds: status === 'accepted' ? blockIds : [],
      callOffsetMin,
      status,
      sentAt,
      sent: sentAt ? { blockIds, callOffsetMin } : null,
      replyBy: null,
      respondedAt: status === 'accepted' || status === 'declined' ? SEED_RESPONDED_AT : null,
      reason: g.items[0].declineReason ?? null,
      overrides: [],
      createdAt: SEED_SENT_AT,
      source: 'seed'
    }
  }
  return out
}

export function seedState() {
  return {
    version: 1,
    tick: 0,
    counter: 0,
    requests: seedRequests(),
    needs: {},
    eventEdits: {},
    away: SEED_AWAY.filter((a) => KEEP.staff.includes(a.staffId)).map((a) => ({ ...a })),
    messages: [],
    activity: []
  }
}
