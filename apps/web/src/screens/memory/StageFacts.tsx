import { formatDuration } from '../../formatters/formatDuration'
import { FLOW_LABELS } from '../../labels/flowLabels'
import type { StagePartProps } from '../../types/StagePartProps'
import { StateBadge } from './StateBadge'

export const StageFacts = ({ stage, now }: StagePartProps) => (
  <dl className="space-y-2 text-sm">
    <div>
      <dt className="text-muted text-xs">{FLOW_LABELS.freshness}</dt>
      <dd className="flex flex-wrap items-center gap-x-2">
        <StateBadge state={stage.state} />
        <span className="tabular-nums">
          {stage.freshAt === null
            ? FLOW_LABELS.noInstant
            : `${formatDuration(now - stage.freshAt)} ${FLOW_LABELS.ago}`}
        </span>
        {stage.policyMs === null ? null : (
          <span className="text-muted text-xs">
            {FLOW_LABELS.policy} {formatDuration(stage.policyMs)}
          </span>
        )}
      </dd>
    </div>
    <div>
      <dt className="text-muted text-xs">{FLOW_LABELS.label}</dt>
      <dd>
        {stage.label === null ? (
          FLOW_LABELS.noLabel
        ) : (
          <>
            <span className="font-mono">{stage.label}</span>{' '}
            <span className="text-muted text-xs">
              {FLOW_LABELS.lastRun}{' '}
              {stage.lastRunAt === null
                ? FLOW_LABELS.noRun
                : `${formatDuration(now - stage.lastRunAt)} ${FLOW_LABELS.ago}`}
            </span>
          </>
        )}
      </dd>
    </div>
  </dl>
)
