'use client'

// ---------------------------------------------------------------------------
// Undo for everything: one way to do an action and offer to take it back.
//
// "Whenever someone does something they should have the option to undo it
// simply." So every action that changes something goes through `undoable`:
// it notes how things were, does the action, and shows the confirmation toast
// with an Undo button. Undo puts things back exactly as they were and says so.
//
//   const undoable = useUndoable()
//   undoable(() => deleteStaff(id), `Deleted ${name}.`)
//   undoable(() => acceptRequest(r.id), 'Accepted.', { eventId, small, onUndo })
//
// It snapshots the stores an everyday action touches: tasks, messages,
// documents, payments and the portal (lib/store.jsx), staff, vendors and the
// venue (lib/directory/store.jsx), and detail sheets and couple requests
// (lib/eventSheetStore.jsx). Pass `eventId` when the action can move the run
// of show, and that event's run of show is put back too. The Staffing
// Planner keeps its own undo (lib/staffing/store.jsx).
//
// Undo is offered for as long as the toast is up (10 seconds), like the
// "Undo send" people know from email. What can't be taken back in real life
// (a couple's signature or card payment) is not done through this.
// ---------------------------------------------------------------------------

import { useCallback } from 'react'
import { useStore } from '@/lib/store'
import { useDirectory } from '@/lib/directory/store'
import { useEventSheet } from '@/lib/eventSheetStore'
import { useTimelineEdits } from '@/lib/timelineEdits'
import { useToast } from '@/lib/toasts'

export function useUndoable() {
  const { snapshot: snapStore, restore: restoreStore } = useStore()
  const { snapshot: snapDirectory, restore: restoreDirectory } = useDirectory()
  const { snapshot: snapSheet, restore: restoreSheet } = useEventSheet()
  const { rowsFor, setRows } = useTimelineEdits()
  const { toast } = useToast()

  return useCallback(
    /**
     * run      the action; whatever it returns is returned
     * message  what happened, in words ("Deleted Caleb Ross.")
     * opts     { small, tone, eventId, onUndo, undone, onlyIf }
     *          onlyIf(result) false means the action didn't happen (say, a
     *          name was refused), so there is nothing to confirm or undo.
     */
    (run, message, opts = {}) => {
      const before = {
        store: snapStore(),
        directory: snapDirectory(),
        sheet: snapSheet(),
        rows: opts.eventId ? rowsFor(opts.eventId) : null
      }
      const result = run()
      if (opts.onlyIf && !opts.onlyIf(result)) return result
      toast(typeof message === 'function' ? message(result) : message, opts.tone || 'done', {
        small: opts.small,
        actions: [
          {
            label: 'Undo',
            onClick: () => {
              restoreStore(before.store)
              restoreDirectory(before.directory)
              restoreSheet(before.sheet)
              if (before.rows) setRows(opts.eventId, before.rows)
              opts.onUndo?.()
              toast(opts.undone || 'Undone. Everything is back the way it was.')
            }
          }
        ]
      })
      return result
    },
    [snapStore, restoreStore, snapDirectory, restoreDirectory, snapSheet, restoreSheet, rowsFor, setRows, toast]
  )
}
