// Joins class names, dropping anything falsy. Small enough not to need a dependency.
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}
