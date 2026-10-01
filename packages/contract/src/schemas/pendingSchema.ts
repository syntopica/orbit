import { z } from 'zod'

import { PENDING_KEYS } from '../pendingKeys'

export const pendingSchema = z
  .object({
    key: z.enum(PENDING_KEYS),
    count: z.number().int().nonnegative(),
    oldestAt: z.iso.datetime().nullable(),
  })
  .strict()
