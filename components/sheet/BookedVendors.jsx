'use client'

// The vendors the venue booked for this event, read from the directory, so
// the sheet lists them without anyone typing them in twice. Also: the
// planner's service style and bar, worded for the sheet.

import { useDirectory } from '@/lib/directory/store'
import { optionName } from '@/lib/directory/model'
import { BAR_TYPES, SERVICE_STYLES } from '@/lib/staffing/rules'

/** "Plated · Full bar, 2 stations", or null when the planner has nothing. */
export function serviceText(ev) {
  if (!ev?.serviceStyle) return null
  const style = SERVICE_STYLES.find((s) => s.id === ev.serviceStyle)?.label
  const bar = BAR_TYPES.find((b) => b.id === ev.bar)
  const barText = !bar || bar.id === 'none' ? 'No bar' : `${bar.label}${ev.barStations > 1 ? `, ${ev.barStations} stations` : ''}`
  return [style, barText].filter(Boolean).join(' · ')
}

export function BookedVendors({ eventId }) {
  const { bookingsOnEvent, vendorById, categories } = useDirectory()
  const list = bookingsOnEvent(eventId)
    .map((b) => vendorById(b.vendorId))
    .filter(Boolean)
  if (!list.length) return null
  return (
    <div className="mb-4">
      <p className="text-small text-ink-muted">Booked by the venue</p>
      <ul className="mt-1 space-y-1">
        {list.map((v) => (
          <li key={v.id} className="text-ink">
            {v.name}
            <span className="text-small text-ink-muted">
              {[optionName(categories, v.categoryId), v.contactName, v.phone].filter(Boolean).length > 0 &&
                ` · ${[optionName(categories, v.categoryId), v.contactName, v.phone].filter(Boolean).join(' · ')}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
