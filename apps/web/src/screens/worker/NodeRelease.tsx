import { formatDuration } from '../../formatters/formatDuration'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { NodeReleaseProps } from '../../types/NodeReleaseProps'

export const NodeRelease = ({ release }: NodeReleaseProps) =>
  release === null ? (
    <dd>{WORKER_LABELS.none}</dd>
  ) : (
    <dd>
      <code className="font-mono">{release.code ?? WORKER_LABELS.unknown}</code>{' '}
      {formatDuration(release.ageMs)} {WORKER_LABELS.ago}
    </dd>
  )
