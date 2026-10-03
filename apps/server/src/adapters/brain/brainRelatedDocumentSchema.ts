import { z } from 'zod'

// `brain graph --json --related --limit N`: the top N pairs, best first.
export const brainRelatedDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  total: z.number().int().nonnegative(),
  pairs: z.array(
    z.object({ left: z.string(), right: z.string(), score: z.number() }),
  ),
})
