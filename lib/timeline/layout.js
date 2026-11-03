// ---------------------------------------------------------------------------
// Run of show: the day-view maths. Pure functions, no React, so the page and
// its components share one definition of where a block sits.
//
// Times are minutes after midnight. A block that ends after midnight runs
// past 1440. Everything snaps to 15 minutes.
// ---------------------------------------------------------------------------

import { parseClock } from '@/lib/format'

export const PX = 56 // pixels per hour
export const SNAP = 15 // minutes
export const DEFAULT_LEN = 60
export const MIN_LEN = 15

// The visible window is the same on every run of show, and is remembered.
export const VIEW_KEY = 'vue-run-view-v1'
export const DEFAULT_VIEW = { start: 360, end: 1380 } // 6:00 AM to 11:00 PM

export const snap = (m) => Math.round(m / SNAP) * SNAP
export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

/** A saved window, or the default if it is missing or makes no sense. */
export function parseView(raw) {
  try {
    const v = JSON.parse(raw || 'null')
    if (v && Number.isFinite(v.start) && Number.isFinite(v.end) && v.start >= 0 && v.end <= 1440 && v.end - v.start >= 120) return v
  } catch {
    /* fall through to the default */
  }
  return DEFAULT_VIEW
}

/** Start and end in minutes for display. A row with no end shows as 30 minutes. */
export function span(row) {
  const s = parseClock(row.time) ?? 0
  let e = parseClock(row.end)
  if (e == null) e = s + 30
  if (e <= s) e += 1440
  return { s, e }
}

/** "12:00 AM" as an end time means midnight, the end of the day. */
export function endMinutes(text) {
  const e = parseClock(text)
  return e === 0 ? 1440 : e
}

/** Rows in start-time order; rows that start together keep their order. */
export const sortRows = (rows) =>
  rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => (parseClock(a.row.time) ?? 0) - (parseClock(b.row.time) ?? 0) || a.i - b.i)
    .map((x) => x.row)

/**
 * The hours the grid shows. 6 AM to 11 PM unless the user asked for more; a
 * block outside the window is never hidden, so the window grows to hold it.
 */
export function visibleWindow(view, rows) {
  const spans = rows.map(span)
  const lo = Math.min(view.start, ...spans.map((x) => Math.floor(x.s / 60) * 60))
  const hi = Math.min(1440, Math.max(view.end, ...spans.map((x) => Math.ceil(Math.min(x.e, 1440) / 60) * 60)))
  return {
    lo,
    hi,
    height: ((hi - lo) / 60) * PX,
    hours: Array.from({ length: (hi - lo) / 60 + 1 }, (_, i) => lo / 60 + i)
  }
}

/** Pixels from the top of the grid for a minute on the clock. */
export const topFor = (m, lo) => ((m - lo) / 60) * PX

/**
 * Side-by-side lanes for blocks that overlap, like a calendar day view.
 * items: [{ id, s, e }] -> { [id]: { lane, lanes } }
 */
export function packLanes(items) {
  const sorted = [...items].sort((a, b) => a.s - b.s || b.e - a.e)
  const out = {}
  let cluster = []
  let clusterEnd = -1
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1))
    for (const c of cluster) out[c.id] = { lane: c.lane, lanes }
    cluster = []
  }
  for (const item of sorted) {
    if (cluster.length && item.s >= clusterEnd) {
      flush()
      clusterEnd = -1
    }
    const used = cluster.filter((c) => c.e > item.s).map((c) => c.lane)
    let lane = 0
    while (used.includes(lane)) lane += 1
    cluster.push({ ...item, lane })
    clusterEnd = Math.max(clusterEnd, item.e)
  }
  flush()
  return out
}

/**
 * Where a dragged block would land for the pointer at minute `m`.
 * drag: { kind: 'move' | 'resize-top' | 'resize-bottom' | 'create', m0, s0, e0, anchor }
 */
export function landing(drag, m, lo, hi) {
  if (drag.kind === 'move') {
    const dur = drag.e0 - drag.s0
    const s = clamp(snap(drag.s0 + (m - drag.m0)), lo, hi - dur)
    return { s, e: s + dur }
  }
  if (drag.kind === 'resize-bottom') return { s: drag.s0, e: clamp(snap(m), drag.s0 + MIN_LEN, hi) }
  if (drag.kind === 'resize-top') return { s: clamp(snap(m), lo, drag.e0 - MIN_LEN), e: drag.e0 }
  const cur = clamp(snap(m), lo, hi)
  return { s: Math.min(drag.anchor, cur), e: Math.min(Math.max(drag.anchor + MIN_LEN, cur), hi) }
}
