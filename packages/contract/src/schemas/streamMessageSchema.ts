import { z } from 'zod'

import { eventSchema } from './eventSchema'
import { snapshotSchema } from './snapshotSchema'

export const streamMessageSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('snapshot'),
      id: z.number().int().nonnegative(),
      snapshot: snapshotSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('event'),
      id: z.number().int().nonnegative(),
      event: eventSchema,
    })
    .strict(),
  z
    .object({ type: z.literal('sync'), id: z.number().int().nonnegative() })
    .strict(),
  z
    .object({ type: z.literal('resync'), id: z.number().int().nonnegative() })
    .strict(),
])
