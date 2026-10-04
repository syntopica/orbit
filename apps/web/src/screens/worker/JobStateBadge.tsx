import { STATE_DOTS } from '../../charts/stateDots'
import { jobStateTone } from '../../selectors/jobStateTone'
import type { JobStateBadgeProps } from '../../types/JobStateBadgeProps'

// The same dot-and-label badge as the flow states, for a job state.
export const JobStateBadge = ({ state }: JobStateBadgeProps) => (
  <span className="text-ink inline-flex items-center gap-1.5 text-xs">
    <span
      aria-hidden="true"
      className={`size-2 shrink-0 rounded-full ${STATE_DOTS[jobStateTone(state)]}`}
    />
    {state}
  </span>
)
