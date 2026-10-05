import { formatCount } from '../../formatters/formatCount'
import { CONTEXT_LABELS } from '../../labels/contextLabels'
import { emptyContextMessage } from '../../selectors/emptyContextMessage'
import type { ContextResultProps } from '../../types/ContextResultProps'
import { ContextBlockCard } from './ContextBlockCard'

export const ContextResult = ({ result }: ContextResultProps) => (
  <div className="space-y-3">
    <p className="text-sm tabular-nums">
      {result.blocks.length} {CONTEXT_LABELS.blocks.toLowerCase()},{' '}
      {formatCount(result.textChars)} {CONTEXT_LABELS.of}{' '}
      {formatCount(result.maxChars)} {CONTEXT_LABELS.chars} (
      {CONTEXT_LABELS.limit} {result.limit})
      {result.freshnessStatus === null
        ? null
        : ` · ${CONTEXT_LABELS.freshness} ${result.freshnessStatus}`}
    </p>
    {result.warnings.length === 0 ? null : (
      <p className="text-warn font-mono text-xs wrap-anywhere">
        {CONTEXT_LABELS.warnings}: {result.warnings.join(', ')}
      </p>
    )}
    {result.blocks.length === 0 ? (
      <p className="text-muted text-sm">
        {emptyContextMessage(result.warnings)}
      </p>
    ) : (
      <ol aria-label={CONTEXT_LABELS.blocks} className="space-y-3">
        {result.blocks.map((block) => (
          <ContextBlockCard key={block.rank} block={block} />
        ))}
      </ol>
    )}
  </div>
)
