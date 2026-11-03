// ---------------------------------------------------------------------------
// DESIGN LIBRARY — the generic building blocks
//
// Every screen in the prototype is assembled from these. Nothing re-implements
// a border, a status colour or a button style locally.
//
// SIMILARITY  One component per job, so anything with the same function looks
//             identical everywhere in the product.
// SIGNIFIERS  Buttons are filled or bordered at rest, not only on hover.
// NEVER COLOUR ALONE  StatusBadge always pairs a colour with a glyph and a word.
// QUIET BY DEFAULT  Ink on surface. Colour only for status, selection and focus.
//
// One component per file. Nothing in components/ui knows about tasks, events
// or staff: product components live in components/<area>/. Import from
// '@/components/ui'; inside this folder, import siblings by file.
//
// The rules behind every class here are in docs/STYLE-GUIDE.md.
// ---------------------------------------------------------------------------

export { Alert } from './Alert'
export { Avatar } from './Avatar'
export { Breadcrumbs } from './Breadcrumbs'
export { Button } from './Button'
export { Card } from './Card'
export { ClampedText } from './ClampedText'
export { Count } from './Count'
export { EmptyState } from './EmptyState'
export { Field } from './Field'
export { FilterChip, FilterGroup } from './FilterChip'
export { Icon } from './Icon'
export { ListRow } from './ListRow'
export { MetricTile } from './MetricTile'
export { Modal } from './Modal'
export { PageHeader } from './PageHeader'
export { SearchPicker } from './SearchPicker'
export { Select } from './Select'
export { StatusBadge } from './StatusBadge'
export { Tabs } from './Tabs'
export { Textarea } from './Textarea'
export { TextInput } from './TextInput'
export { ToastHost } from './ToastHost'
export { useConfirm } from './useConfirm'
