import { formatCount } from '../../formatters/formatCount'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { relatedFor } from '../../selectors/relatedFor'
import type { RelatedListProps } from '../../types/RelatedListProps'
import { PageLink } from './PageLink'

export const RelatedList = ({
  related,
  selectedId,
  search,
}: RelatedListProps) => {
  if (related.pairs.length === 0)
    return <p className="text-muted">{BRAIN_LABELS.relatedNone}</p>
  return (
    <>
      <p className="text-muted">
        {formatCount(related.total)} {BRAIN_LABELS.relatedTotal}
      </p>
      <ul className="space-y-1">
        {relatedFor(related.pairs, selectedId).map((pair) => (
          <li
            key={`${pair.left} ${pair.right}`}
            className="flex flex-wrap items-center gap-x-2"
          >
            <PageLink id={pair.left} search={search} />
            <span aria-hidden="true">↔</span>
            <PageLink id={pair.right} search={search} />
            <span className="text-muted">{pair.score.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
