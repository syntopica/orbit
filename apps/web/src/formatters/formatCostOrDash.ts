import { formatUsd } from './formatUsd'

// A zero cost is shown as $0.00, never hidden: free executors are the point
// of the ladder. Only an unknown cost is a dash.
export const formatCostOrDash = (costUsd: number | null): string =>
  costUsd === null ? '—' : formatUsd(costUsd)
