// One way to make an id for something created in the browser: a task, a
// staff member, a toast. `newId('t')` -> "t-3f9c2a1b7d4e".
//
// crypto.randomUUID needs a secure context (https or localhost). Opening a
// dev build over plain http on a LAN falls back to Math.random.

export function newId(prefix) {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
  const id = raw.slice(0, 12)
  return prefix ? `${prefix}-${id}` : id
}
