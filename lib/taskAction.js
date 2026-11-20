// ---------------------------------------------------------------------------
// What a task's main button says: the action itself, never just "Action".
//
// User test v4 and the earlier usability pass: "I didn't know what Action
// would do." Every task already knows where its button goes (`href`), so the
// label names that place or that job in a few plain words.
// ---------------------------------------------------------------------------

export function actionLabel(task) {
  switch (task.source) {
    case 'request':
      return 'Answer request'
    case 'sheet':
      return 'See who hasn’t seen it'
    case 'staffing':
      if (task.href?.includes('send=1')) return 'Review and send'
      return task.href?.includes('ask=1') ? 'Ask staff' : 'See replies'
    case 'message':
      return 'Reply'
    case 'document':
      return 'Open document'
    case 'couple-sign':
      return 'See agreement'
    case 'payment':
      return 'See payment'
    case 'inquiry':
      return 'Open inquiry'
    case 'portal':
      return 'Open couple'
    case 'manual':
      return task.inquiryId ? 'Open inquiry' : 'Open to-do'
    default:
      return 'Open'
  }
}
