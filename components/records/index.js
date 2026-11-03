// ---------------------------------------------------------------------------
// RECORD PATTERNS
//
// The shared shapes behind every "manage a list of things" screen: Staff,
// Vendors, and whatever comes next (spaces, rentals, couples). Each screen
// composes these from components/ui, so a list page, a detail page and a
// create/edit form look the same whatever record they show.
//
//   List page    ListToolbar + EntityList (rows are ListRow)
//   Detail page  DetailGrid of Cards; ContactInfo; RecordStatusCard
//   Form page    RecordForm > FormSection > TextInput / Select / Textarea /
//                CheckboxGroup, driven by useRecordForm
//   Everywhere   RecordStatusBadge for Active / Inactive
// ---------------------------------------------------------------------------

export { CheckboxGroup, CHECKBOX } from './CheckboxGroup'
export { ContactInfo } from './ContactInfo'
export { DetailGrid } from './DetailGrid'
export { EntityList } from './EntityList'
export { ListToolbar, useListFilters } from './ListToolbar'
export { QueryRecord } from './QueryRecord'
export { FormActions, FormSection, RecordForm, Wide } from './RecordForm'
export { RecordStatusBadge } from './RecordStatusBadge'
export { RecordStatusCard } from './RecordStatusCard'
export { useRecordForm } from './useRecordForm'
