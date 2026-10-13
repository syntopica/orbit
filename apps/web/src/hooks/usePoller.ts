import { pollerViewSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import { describePollerRows } from '../selectors/describePollerRows'
import type { PollerState } from '../types/PollerState'

export const usePoller = (): PollerState => {
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
