import type { usePendingBoard } from '../../hooks/usePendingBoard'
import { PendingSourceIssues } from './PendingSourceIssues'
import { PendingSourceSection } from './PendingSourceSection'

export const PendingSources = ({
  model,
}: {
  model: ReturnType<typeof usePendingBoard>
}) => {
  const data = model.query.data
  if (data === undefined) return null
  return (
    <div className="space-y-6">
      <PendingSourceIssues sources={data.sources} />
      {model.items.length === 0 ? (
        <p className="text-muted">No matching items.</p>
      ) : null}
      {data.sources.map((source) => (
        <PendingSourceSection
          key={source.id}
          source={source}
          items={model.items.filter((item) => item.source === source.id)}
        />
      ))}
    </div>
  )
}
