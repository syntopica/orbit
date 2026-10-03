import { STATE_DOTS } from '../../charts/stateDots'
import { FRESHNESS_LABELS } from '../../labels/freshnessLabels'
import type { StateBadgeProps } from '../../types/StateBadgeProps'

export const StateBadge = ({ state }: StateBadgeProps) => (
  <span className="text-ink inline-flex items-center gap-1.5 text-xs">
    <span
      aria-hidden="true"
      className={`size-2 rounded-full ${STATE_DOTS[state]}`}
    />
    {FRESHNESS_LABELS[state]}
  </span>
)
