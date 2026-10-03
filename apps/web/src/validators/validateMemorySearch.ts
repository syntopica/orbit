import { FLOW_STAGE_IDS } from '@orbit/contract'
import { z } from 'zod'

import type { MemorySearch } from '../types/MemorySearch'

export const validateMemorySearch = (
  search: Record<string, unknown>,
): MemorySearch => {
  const stage = z.enum(FLOW_STAGE_IDS).safeParse(search['stage'])
  return stage.success ? { stage: stage.data } : {}
}
