import { z } from 'zod'

import { countSchema } from './countSchema'
import { identifierSchema } from './identifierSchema'

// GET /api/atrium: counts, epoch-ms instants and identifiers (spec 7.4).
export const atriumViewSchema = z.object({
  now: z.number(),
  writtenAt: z.number(),
  refreshIntervalMs: z.number(),
  records: z.object({
    total: countSchema,
    bySource: z.array(
      z.object({ source: identifierSchema, count: countSchema }),
    ),
  }),
  archiveAt: z.number().nullable(),
  refreshAt: z.number().nullable(),
  contentAt: z.number().nullable(),
  populations: z.array(
    z.object({
      model: identifierSchema,
      intended: countSchema,
      indexed: countSchema,
    }),
  ),
  synthesis: z
    .object({
      finishedAt: z.number(),
      durationMs: z.number(),
      producer: identifierSchema.nullable(),
      conversations: countSchema,
      synthesized: countSchema,
      skipped: countSchema,
      failed: countSchema,
      deferred: countSchema,
    })
    .nullable(),
  // doctor.json, or null until atrium publishes one; codes only (spec 4).
  doctor: z
    .object({
      writtenAt: z.number(),
      stale: z.boolean(),
      ok: z.boolean(),
      checks: z.array(
        z.object({
          name: identifierSchema,
          ok: z.boolean(),
          severity: z.enum(['ok', 'warn', 'broken']),
          code: identifierSchema.nullable(),
        }),
      ),
    })
    .nullable(),
})
