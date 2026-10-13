import { sortSourcesByBlocked } from '../../selectors/sortSourcesByBlocked'
import type { PendingSourcesProps } from '../../types/PendingSourcesProps'
import { PendingGroupToggle } from './PendingGroupToggle'
import { PendingSourceIssues } from './PendingSourceIssues'
import { PendingSourceSection } from './PendingSourceSection'

export const PendingSources = ({ model }: PendingSourcesProps) => {
  const data = model.query.data
  if (data === undefined) return null
  return (
    <div className="space-y-4">
      <PendingSourceIssues sources={data.sources} />
      {model.items.length === 0 ? (
        <p className="text-muted">No matching items.</p>
      ) : (
        <PendingGroupToggle model={model} />
      )}
      {sortSourcesByBlocked(data.sources, model.items).map((source) => (
        <PendingSourceSection
          key={source.id}
          source={source}
          items={model.items.filter((item) => item.source === source.id)}
          open={model.groups.isOpen(source.id)}
          onOpenChange={(open) => {
            model.groups.setOpen(source.id, open)
          }}
        />
      ))}
    </div>
  )
}
