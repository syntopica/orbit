import { PENDING_GROUP_COLLAPSE_AT } from '../charts/pendingGroupCollapseAt'
import type { validatePendingSearch } from '../validators/validatePendingSearch'

// A search or a source filter opens every group it matched; otherwise only
// small groups start open.
export const defaultGroupOpen = (
  count: number,
  filters: ReturnType<typeof validatePendingSearch>,
): boolean =>
  filters.q !== undefined ||
  filters.source !== undefined ||
  count <= PENDING_GROUP_COLLAPSE_AT
