import { Button, EmptyState } from '@/components/ui/primitives'

/** A missing ?id= record: say so and offer the way back (no dead ends). */
export function RecordNotFound({ noun, backHref, backLabel }) {
  return (
    <EmptyState
      icon="search"
      title={`No such ${noun}`}
      body={`It may have been deleted, or the link is out of date.`}
      action={
        <Button href={backHref} variant="secondary" size="sm">
          {backLabel}
        </Button>
      }
    />
  )
}
