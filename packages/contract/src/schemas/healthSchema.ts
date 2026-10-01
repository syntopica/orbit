import { z } from 'zod'

import { REASON_CODES } from '../reasonCodes'

export const healthSchema = z
  .object({
    state: z.enum(['ok', 'warn', 'down']),
    reason: z.enum(REASON_CODES).nullable(),
  })
  .strict()
