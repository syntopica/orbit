import { pollerViewSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import { describePollerRows } from '../selectors/describePollerRows'
import type { PollerLine } from '../types/PollerLine'

export const usePoller = (): {
  lines: PollerLine[] | null
  failed: boolean
} => {
  const query = useQuery({
    queryKey: ['poller'],
    queryFn: async () => apiJson('/api/poller', pollerViewSchema),
    refetchInterval: 15_000,
  })
  return {
    lines: query.data === undefined ? null : describePollerRows(query.data),
    failed: query.isError,
  }
}
