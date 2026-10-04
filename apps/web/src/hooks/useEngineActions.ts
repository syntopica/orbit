import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import { engineActionsSchema } from '../schemas/engineActionsSchema'

export const useEngineActions = (engine: 'brain' | 'clips') => {
  const query = useQuery({
    queryKey: ['engine-actions', engine],
    queryFn: async () =>
      apiJson(`/api/engines/${engine}/actions`, engineActionsSchema),
  })
  return Object.entries(query.data?.actions ?? {})
}
