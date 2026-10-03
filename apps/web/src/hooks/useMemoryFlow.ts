import { memoryFlowSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import type { MemoryFlowModel } from '../types/MemoryFlowModel'
import { validateMemorySearch } from '../validators/validateMemorySearch'
import { useMediaQuery } from './useMediaQuery'

export const useMemoryFlow = (): MemoryFlowModel => {
  const { stage } = validateMemorySearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const query = useQuery({
    queryKey: ['memory-flow'],
    queryFn: async () => apiJson('/api/memory/flow', memoryFlowSchema),
    refetchInterval: 60_000,
  })
  const flow = query.data ?? null
  return {
    flow,
    failed: query.isError,
    staleAgeMs:
      query.isError && flow !== null
        ? query.errorUpdatedAt - query.dataUpdatedAt
        : null,
    isPhone,
    animate: !reduced,
    selected: flow?.stages.find((s) => s.id === stage) ?? null,
    select: (id) =>
      void navigate({
        to: '/memory',
        search: id === null ? {} : { stage: id },
      }),
  }
}
