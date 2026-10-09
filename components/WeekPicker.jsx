'use client'

import { Button, Icon } from './ui/primitives'
import { THIS_WEEK, addDays, weekLabel } from '@/lib/weeks'

// Previous / next / "This week" with the week's date range in the middle.
export function WeekPicker({ weekKey, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => onChange(addDays(weekKey, -7))} aria-label="Previous week">
        <Icon name="chevronRight" size={13} className="rotate-180" />
      </Button>
      <span className="min-w-[10rem] text-center text-[14px] font-bold text-ink">{weekLabel(weekKey)}</span>
      <Button variant="secondary" size="sm" onClick={() => onChange(addDays(weekKey, 7))} aria-label="Next week">
        <Icon name="chevronRight" size={13} />
      </Button>
      {weekKey !== THIS_WEEK && (
        <Button variant="ghost" size="sm" onClick={() => onChange(THIS_WEEK)}>
          This week
        </Button>
      )}
    </div>
  )
}
