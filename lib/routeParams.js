// ---------------------------------------------------------------------------
// Static params for every dynamic route.
//
// The site is a static export, so Next needs to know every URL ahead of time.
// Coverage gaps and shifts are runtime state, so we pre-generate the full set
// of ids that could ever exist from the seed data — every (segment, role) pair
// and every (segment, staff) pair. Far more pages than the prototype will ever
// show, but it means a tester can deep-link to any of them.
// ---------------------------------------------------------------------------

import { events } from './mock/events.js'
import { staff } from './mock/staff.js'

export function allGapIds() {
  const ids = []
  for (const event of events) {
    for (const segment of event.segments) {
      for (const need of segment.needs) {
        ids.push(`${segment.id}--${need.role.replace(/\s+/g, '-').toLowerCase()}`)
      }
    }
  }
  return ids
}

export function allShiftIds() {
  const ids = []
  for (const event of events) {
    for (const segment of event.segments) {
      for (const person of staff) {
        ids.push(`${segment.id}--${person.id}`)
      }
    }
  }
  return ids
}
