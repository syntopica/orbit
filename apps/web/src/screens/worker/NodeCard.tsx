import { formatDuration } from '../../formatters/formatDuration'
import { formatPower } from '../../formatters/formatPower'
import { NODE_STATE_LABELS } from '../../labels/nodeStateLabels'
import { WORKER_LABELS } from '../../labels/workerLabels'
import { nodeState } from '../../selectors/nodeState'
import type { NodeCardProps } from '../../types/NodeCardProps'
import { NodeRelease } from './NodeRelease'

export const NodeCard = ({ node }: NodeCardProps) => (
  <li className="border-line bg-panel space-y-2 rounded-xl border p-4 text-sm">
    <div className="flex items-baseline justify-between gap-2">
      <h3 className="font-mono">{node.name}</h3>
      <span
        data-state={nodeState(node)}
        className="text-muted data-[state=blocked]:text-warn data-[state=offline]:text-down data-[state=ready]:text-ok text-xs"
      >
        {NODE_STATE_LABELS[nodeState(node)]}
      </span>
    </div>
    <dl className="text-muted grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
      <dt>{WORKER_LABELS.idleFor}</dt>
      <dd>
        {node.idleMs === null
          ? WORKER_LABELS.unknown
          : formatDuration(node.idleMs)}
      </dd>
      <dt>{WORKER_LABELS.lastReport}</dt>
      <dd>
        {formatDuration(node.reportAgeMs)} {WORKER_LABELS.ago}
      </dd>
      <dt>{WORKER_LABELS.power}</dt>
      <dd>{formatPower(node.onAc)}</dd>
      <dt>{WORKER_LABELS.pressure}</dt>
      <dd className="font-mono">{node.pressure ?? WORKER_LABELS.unknown}</dd>
      <dt>{WORKER_LABELS.resident}</dt>
      <dd className="font-mono">
        {node.resident.length === 0
          ? WORKER_LABELS.none
          : node.resident.join(', ')}
      </dd>
      <dt>{WORKER_LABELS.lastRelease}</dt>
      <NodeRelease release={node.lastRelease} />
    </dl>
  </li>
)
