import { contextQuerySchema } from '@orbit/contract'
import { z } from 'zod'

export const atriumContextBodySchema = z
  .object({ query: contextQuerySchema })
  .strict()
