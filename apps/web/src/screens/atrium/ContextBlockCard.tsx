import { formatBlockSource } from '../../formatters/formatBlockSource'
import { formatCount } from '../../formatters/formatCount'
import { CONTEXT_LABELS } from '../../labels/contextLabels'
import type { ContextBlockCardProps } from '../../types/ContextBlockCardProps'

// One block as a session would receive it: trust, source, size, then text.
export const ContextBlockCard = ({ block }: ContextBlockCardProps) => (
  <li className="border-line space-y-2 rounded-lg border p-3">
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`rounded-full px-2 py-0.5 font-semibold ${
          block.trust === 'curated'
            ? 'bg-accent text-space'
            : 'border-line text-ink border'
        }`}
      >
        {CONTEXT_LABELS.trust[block.trust]}
      </span>
      <span className="text-muted min-w-0 font-mono wrap-anywhere">
        {formatBlockSource(block)}
      </span>
      <span className="ml-auto tabular-nums">
        {formatCount(block.chars)} {CONTEXT_LABELS.chars}
        {block.truncated ? `, ${CONTEXT_LABELS.truncated}` : null}
      </span>
    </div>
    <pre className="max-h-64 overflow-y-auto text-sm wrap-anywhere whitespace-pre-wrap">
      {block.text}
    </pre>
  </li>
)
