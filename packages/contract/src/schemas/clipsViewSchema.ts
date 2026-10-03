import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// GET /api/clips: states, days and codes only; no clip id, title or url.
export const clipsViewSchema = z.object({
  now: z.number(),
  total: countSchema,
  states: z.array(
    z.object({
      state: identifierSchema,
      count: countSchema,
      oldestAt: z.number().nullable(),
    }),
  ),
  intake: z.object({
    days: z.array(z.object({ day: z.iso.date(), count: countSchema })),
    undated: countSchema,
  }),
  doctor: z.object({
    ok: z.boolean(),
    checks: z.array(
      z.object({
        name: identifierSchema,
        ok: z.boolean(),
        code: identifierSchema.nullable(),
      }),
    ),
  }),
  capture: z
    .object({ count: countSchema, oldestAt: z.number().nullable() })
    .nullable(),
})
