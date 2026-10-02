import { WORKER_LABELS } from '../../labels/workerLabels'
import type { NodeSectionProps } from '../../types/NodeSectionProps'
import { NodeCard } from './NodeCard'

export const NodeSection = ({ nodes }: NodeSectionProps) => (
  <section aria-labelledby="nodes-heading" className="space-y-2">
    <h2
      id="nodes-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      {WORKER_LABELS.nodes}
    </h2>
    {nodes.length === 0 ? (
      <p className="text-muted text-sm">{WORKER_LABELS.noNodes}</p>
    ) : (
      <ul className="grid gap-3 md:grid-cols-2">
        {nodes.map((node) => (
          <NodeCard key={node.name} node={node} />
        ))}
      </ul>
    )}
  </section>
)
